import React from 'react';
import ReactMarkdown from 'react-markdown';
import 'highlight.js/styles/github.css'; // 选择你喜欢的代码高亮样式

// ... 其他导入保持不变

// MarkdownRenderer.js
const MarkdownRenderer = ({ content }) => {
  // 移除front matter部分
  const pureContent = content.replace(/^---\n[\s\S]+?\n---/, '').trim();
  
  return (
    <div className="markdown-content">
      <ReactMarkdown>
        {pureContent}
      </ReactMarkdown>
    </div>
  );
};
export default MarkdownRenderer;
