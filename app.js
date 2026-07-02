/* ============================================
   PawLang – 核心交互逻辑
   ============================================ */

// 注册 Service Worker（PWA 可安装的前提）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// 创建消息元素
function createMessageElement(text, type) {
  const div = document.createElement('div');
  div.className = `chat-message ${type}`;

  if (type === 'ai') {
    const label = document.createElement('div');
    label.className = 'ai-label';
    label.textContent = 'PawLang';
    div.appendChild(label);
  }

  const content = document.createElement('div');
  content.textContent = text;
  div.appendChild(content);

  return div;
}

// 创建打字动画
function createTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'chat-message ai';
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  div.appendChild(indicator);
  return div;
}

// 调用 AGNES API
async function fetchAIReply(message) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.reply;
  } catch {
    return '服务暂时不可用，请稍后重试。';
  }
}

// 发送消息
async function sendMessage(text) {
  if (!text.trim()) return;

  const welcome = chatArea.querySelector('.chat-welcome');
  if (welcome) {
    chatArea.innerHTML = '';
    chatArea.style.justifyContent = 'flex-start';
  }

  // 显示用户消息
  chatArea.appendChild(createMessageElement(text, 'user'));
  chatArea.scrollTop = chatArea.scrollHeight;

  // 显示打字动画
  const typing = createTypingIndicator();
  chatArea.appendChild(typing);
  chatArea.scrollTop = chatArea.scrollHeight;

  // 调用 AI
  const reply = await fetchAIReply(text);
  typing.remove();
  chatArea.appendChild(createMessageElement(reply, 'ai'));
  chatArea.scrollTop = chatArea.scrollHeight;

  messageInput.value = '';
  messageInput.focus();
}

// 事件监听
sendBtn.addEventListener('click', () => sendMessage(messageInput.value));

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage(messageInput.value);
  }
});

// 示例按钮
document.querySelectorAll('.quick-prompt').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    messageInput.value = prompt;
    sendMessage(prompt);
  });
});
