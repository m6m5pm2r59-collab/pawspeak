/* ============================================
   PawSpeak App – 聊天逻辑 & PWA 注册
   ============================================ */

(function () {
  'use strict';

  // ───── DOM 引用 ─────
  const chatArea   = document.getElementById('chat-area');
  const inputEl    = document.getElementById('message-input');
  const sendBtn    = document.getElementById('send-btn');
  const micBtn     = document.getElementById('mic-btn');
  const a2hsBanner = document.getElementById('a2hs-banner');
  const a2hsDismiss = document.getElementById('a2hs-dismiss');
  const pricingBar = document.querySelector('.pricing-bar');

  // ───── 模拟 AI 回复 ─────
  const petReplies = [
    '你摸我肚子的时候我翻过来，不是要你停，是信任你。继续摸。',
    '我对着门叫不是饿了，是外面有只鸟在挑衅我。',
    '我咬你手不是真咬，这是玩耍信号，力度已经很轻了。',
    '我盯着你上厕所不是变态，在猫的世界里，这是互相放哨。',
    '我用头蹭你是把我的气味留在你身上，这是在标记你是我的人。',
    '我追自己尾巴不是傻，有时候尾巴就是最好的玩具，而且追到了有成就感。',
    '我半夜跑酷是因为猫是晨昏性动物，日出日落是我们最活跃的时候。',
    '我把桌上的东西推下去不是捣乱，是在测试重力——物理学家的严谨。',
    '我对着窗外咯咯叫，那是看到猎物太激动了，本能反应，不是我嗓子坏了。',
    '我睡你键盘上不是捣乱，是因为暖，而且你这样就会摸我。'
  ];

  let isTyping = false;

  function getRandomReply() {
    return petReplies[Math.floor(Math.random() * petReplies.length)];
  }

  // ───── 消息渲染 ─────
  function addMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = `message ${sender}`;
    msgEl.textContent = text;
    chatArea.appendChild(msgEl);
    scrollToBottom();
  }

  function addTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'message ai typing';
    el.id = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(el);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    });
  }

  // ───── 发送消息 ─────
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Remove welcome section if present
    const welcome = chatArea.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // User bubble
    addMessage(text, 'user');
    inputEl.value = '';
    isTyping = true;

    // Typing indicator
    addTypingIndicator();

    // Simulate AI delay
    const delay = 800 + Math.random() * 1400;
    setTimeout(() => {
      removeTypingIndicator();
      addMessage(getRandomReply(), 'ai');
      isTyping = false;
    }, delay);
  }

  // ───── 事件监听 ─────
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  micBtn.addEventListener('click', () => {
    // Visual feedback only – real STT would go here
    micBtn.classList.add('recording');
    setTimeout(() => {
      micBtn.classList.remove('recording');
      inputEl.placeholder = '语音功能即将上线...';
      setTimeout(() => {
        inputEl.placeholder = '描述宠物的行为...';
      }, 2000);
    }, 1500);
  });

  // Quick prompts
  chatArea.addEventListener('click', (e) => {
    const promptBtn = e.target.closest('.quick-prompt');
    if (promptBtn) {
      inputEl.value = promptBtn.dataset.prompt;
      sendMessage();
    }
  });

  // Pricing bar click
  pricingBar.addEventListener('click', () => {
    addMessage('无限对话 $2.99/月，功能即将上线，敬请期待！', 'ai');
    const welcome = chatArea.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
  });

  // ───── A2HS 提示逻辑 ─────
  const A2HS_KEY = 'pawspeak_a2hs_dismissed';

  function shouldShowA2HS() {
    if (localStorage.getItem(A2HS_KEY)) return false;
    // Don't show in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) return false;
    // Show on iOS Safari or Android Chrome
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isAndroid = /android/.test(navigator.userAgent.toLowerCase());
    return isIOS || isAndroid;
  }

  function showA2HSBanner() {
    if (!shouldShowA2HS()) return;
    a2hsBanner.classList.remove('hidden');
  }

  a2hsDismiss.addEventListener('click', () => {
    a2hsBanner.classList.add('hidden');
    localStorage.setItem(A2HS_KEY, '1');
  });

  // ───── Service Worker 注册 ─────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('SW registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('SW registration failed:', err);
        });
    });
  }

  // ───── 初始化 ─────
  showA2HSBanner();

})();
