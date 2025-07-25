---
title: DeepSeek AI 接入技术方案
date: 2025-06-28
excerpt: "自己的网页中接入 DeepSeek 模型。"
---

# DeepSeek AI 接入技术方案

## 一、接入目标

在自己的网页中接入 DeepSeek 模型，实现以下功能：

* 用户在网页中输入文本；
* 请求发送到 DeepSeek 的 API；
* 实时展示返回的回复内容；
* 支持流式响应（如 DeepSeek 支持 SSE）。

---

## 二、接入前准备

1. 注册并获取 DeepSeek API Key；
2. 阅读官方文档：[https://platform.deepseek.com/docs；](https://platform.deepseek.com/docs；)
3. 搭建一个前端网页（推荐 React/Vite，但此方案将以原生 HTML + JS 实现）。

---

## 三、技术选型

* 语言：HTML + JavaScript（ES6+）
* 请求方式：`fetch`，支持 `stream`（SSE）
* 安全性：API Key 不可暴露在前端，生产环境需通过服务端代理

---

## 四、目录结构（前端示例）

```
/deepseek-web-demo
├── index.html
├── main.js
├── style.css
```

---

## 五、详细实现代码

### 1. `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>DeepSeek Chat</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <h1>💬 DeepSeek AI Chat</h1>
    <div id="chat-box"></div>
    <textarea id="user-input" placeholder="输入你的问题..."></textarea>
    <button id="send-btn">发送</button>
  </div>

  <script type="module" src="main.js"></script>
</body>
</html>
```

---

### 2. `style.css`（简单样式）

```css
body {
  font-family: sans-serif;
  background-color: #f4f4f4;
}

.container {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

#chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 400px;
  overflow-y: scroll;
  background: #f9f9f9;
  margin-bottom: 10px;
  white-space: pre-wrap;
}

textarea {
  width: 100%;
  height: 80px;
  font-size: 16px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
```

---

### 3. `main.js`

```js
const API_KEY = "your-deepseek-api-key"; // ⚠️请勿在生产环境暴露

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.onclick = async () => {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("用户", userMessage);
  input.value = "";

  await streamAnswer(userMessage);
};

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.textContent = `${role}: ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function streamAnswer(userMessage) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个有用的助手。" },
        { role: "user", content: userMessage }
      ],
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let fullText = "";
  appendMessage("DeepSeek", "");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter(line => line.trim().startsWith("data:"));

    for (const line of lines) {
      const jsonStr = line.replace(/^data:\s*/, "");
      if (jsonStr === "[DONE]") break;

      try {
        const data = JSON.parse(jsonStr);
        const delta = data.choices?.[0]?.delta?.content || "";
        fullText += delta;
        updateLastMessage(fullText);
      } catch (e) {
        console.warn("解析失败:", line);
      }
    }
  }
}

function updateLastMessage(text) {
  const lastMsg = chatBox.lastChild;
  if (lastMsg) {
    lastMsg.textContent = `DeepSeek: ${text}`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
```

---

## 六、安全性建议

* 不要在前端暴露 API Key（此方案仅供本地测试）；
* 实际部署请通过中间层服务器代理请求（例如 Node.js、Python 等）；
* 可使用 Cloudflare Workers、Vercel Edge Functions 实现安全代理。

---

## 七、后续拓展建议

* 支持上下文记忆（记录聊天历史）；
* 支持 Markdown 渲染；
* 支持语音输入或 TTS 输出；
* 加入模型选择器，如支持 `deepseek-coder`。

---

## 八、示意图（可选）

```
[用户输入] → [发送请求] → [DeepSeek 返回响应] → [流式展示]
```

---