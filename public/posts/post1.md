---
title: H5 页面白屏监控技术设计方案
date: 2023-05-15
excerpt: "在 H5 页面开发与上线过程中，偶尔会遇到页面出现“白屏”问题，即页面加载完成后没有正确渲染出内容，用户看到的仅为空白页面，严重影响用户体验和转化率。为及时发现并定位问题，需设计一套可靠的白屏监控方案，自动捕捉异常情况并上报分析。"
---

# H5 页面白屏监控技术设计方案

## 一、背景

在 H5 页面开发与上线过程中，偶尔会遇到页面出现“白屏”问题，即页面加载完成后没有正确渲染出内容，用户看到的仅为空白页面，严重影响用户体验和转化率。为及时发现并定位问题，需设计一套可靠的白屏监控方案，自动捕捉异常情况并上报分析。

---

## 二、目标

* 自动检测 H5 页面白屏问题
* 收集白屏发生时的环境信息、设备信息、网络状态
* 支持前端主动检测 + 用户被动反馈结合
* 白屏事件能定位到异常资源、脚本错误等根因
* 不增加页面性能负担，兼容主流浏览器

---

## 三、白屏判断逻辑

### 1. DOM 节点判断法（推荐）

通过检查页面关键 DOM 元素是否渲染，结合是否存在有效内容判断是否为白屏。

```js
function isWhiteScreenByDOM() {
  const wrapperSelectors = ['#app', '#root', 'body'];
  return wrapperSelectors.every(selector => {
    const el = document.querySelector(selector);
    return !el || el.clientHeight === 0 || el.innerText.trim() === '';
  });
}
```

### 2. 可视区域打点判断（增强型）

采样页面横向中线 20 个点，统计落到空元素或根节点上的比例。

```js
function isWhiteScreenByElementRatio(threshold = 0.95) {
  const total = 20;
  let emptyCount = 0;
  for (let i = 1; i <= total; i++) {
    const x = (window.innerWidth * i) / (total + 1);
    const y = window.innerHeight / 2;
    const element = document.elementFromPoint(x, y);
    if (!element || ['HTML', 'BODY'].includes(element.tagName)) {
      emptyCount++;
    }
  }
  return emptyCount / total > threshold;
}
```

---

## 四、监控触发时机与执行逻辑

```js
(function setupWhiteScreenMonitor() {
  const startTime = performance.now();
  let domReadyTime = 0;
  let loadTime = 0;

  document.addEventListener('DOMContentLoaded', () => {
    domReadyTime = performance.now() - startTime;
  });

  window.addEventListener('load', () => {
    loadTime = performance.now() - startTime;

    // 延迟 500ms 再检测，避免动画或懒加载误判
    setTimeout(() => {
      const isWhite =
        isWhiteScreenByDOM() && isWhiteScreenByElementRatio();

      if (isWhite) {
        const reportData = buildWhiteScreenReport(domReadyTime, loadTime);
        reportWhiteScreen(reportData);
      }
    }, 500);
  });
})();
```

---

## 五、上报数据结构与收集函数

```js
function buildWhiteScreenReport(domContentLoaded, load) {
  return {
    url: location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    whiteType: 'dom + ratio',
    domContentLoaded,
    load,
    additionalInfo: {
      connection: navigator.connection?.effectiveType || 'unknown',
      referrer: document.referrer,
    },
  };
}
```

---

## 六、上报方式（推荐使用 sendBeacon）

```js
function reportWhiteScreen(data) {
  const endpoint = 'https://yourdomain.com/monitor/white-screen';

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true, // 防止页面卸载时取消请求
    });
  }
}
```

---

## 七、与其他监控系统协同

* JS 错误监控（`window.onerror`, `window.addEventListener('error')`）
* React `ErrorBoundary` + Vue `errorCaptured`
* 首屏性能指标（如 FCP, LCP, TTI）
* 用户点击轨迹埋点（方便回溯交互历史）
* 网络状态感知（`navigator.connection`）

---

## 八、后端数据接收示例（Node.js Express）

```js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/monitor/white-screen', (req, res) => {
  const report = req.body;
  console.log('收到白屏监控数据：', report);

  // 可写入日志、数据库、ELK 等
  res.sendStatus(200);
});

app.listen(3000, () => console.log('监听端口 3000'));
```

---

## 九、优化建议

| 问题点   | 优化建议               |
| ----- | ------------------ |
| 伪白屏   | 使用骨架屏（Skeleton）    |
| 真白屏   | 增强 SSR / 预渲染，首屏静态化 |
| 懒加载延迟 | 限制首屏元素懒加载、加快加载优先级  |
| 首屏阻塞  | 避免大资源阻塞主线程，拆包/按需加载 |
| 脚本异常  | 捕获 JS 错误、资源加载异常    |

---

## 十、示意图：白屏监控流程

```txt
 页面加载流程
 ┌───────────────┐
 │ DOMContentLoaded │
 └─────┬─────────┘
       ▼
┌─────────────────┐
│ 执行白屏检测逻辑 │◄────────────────┐
└──────┬──────────┘                 │
       ▼                            │
 ┌──────────────┐              ┌──────────────┐
 │ window.onload │              │ window.onerror│
 └──────┬────────┘              └──────┬────────┘
        ▼                               ▼
 ┌────────────────────────┐     ┌────────────────────┐
 │   上报白屏事件（sendBeacon） │     │   上报 JS 异常           │
 └────────────────────────┘     └────────────────────┘
```

---