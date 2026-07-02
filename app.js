/* ============================================
   PawLang – 核心交互逻辑
   ============================================ */

const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// 预设回复库
const responses = [
  '猫咪盯着你上厕所是信任和好奇的表现。在野外，排泄是最脆弱的时刻，它在帮你放哨。同时，封闭空间+你在固定位置=它的注意力天然会指向你。建议：不要驱赶，这其实是一种亲密行为。',
  '追尾巴偶尔为之是正常的玩耍行为。但如果每天超过5分钟、伴随啃咬或暴躁，可能是焦虑、皮肤病或肛门腺问题。建议增加互动玩具，分散注意力；持续一周无改善建议就医。',
  '半夜跑酷是猫的捕猎本能——黄昏和黎明是它们的活跃期。如果白天精力没消耗完，晚上就会爆发。建议：睡前陪玩15分钟（逗猫棒等模拟捕猎），玩到猫喘气再喂食，它会进入"捕猎→进食→睡觉"的自然循环。',
  '狗狗歪头可能是试图更好地听到或看到你。长鼻子狗歪头避免视线被鼻子遮挡，扁平脸狗可能是耳道问题。频繁歪头伴随抓耳，建议检查耳朵。',
  '猫咪踩奶是幼年吸奶时用爪子按压母猫乳腺的本能残留。成年后踩奶通常表示极度放松和安全，它把你当成"猫妈妈"。不用干预，享受这份信任。',
  '狗狗吃草通常是正常的。可能原因：帮助消化、补充纤维、缓解胃部不适。只要草坪无农药、吃完不频繁呕吐就没事。如果每天吃+吐，建议换高纤维狗粮。'
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

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

// 发送消息
function sendMessage(text) {
  if (!text.trim()) return;

  // 切换到聊天模式
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

  // 模拟延迟后显示回复
  setTimeout(() => {
    typing.remove();
    chatArea.appendChild(createMessageElement(getRandomResponse(), 'ai'));
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 1200 + Math.random() * 800);

  messageInput.value = '';
  messageInput.focus();
}

// 事件监听
sendBtn.addEventListener('click', () => {
  sendMessage(messageInput.value);
});

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
