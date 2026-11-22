const launcher = document.querySelector('#chat-launcher');
const panel = document.querySelector('#chat-panel');
const messages = document.querySelector('#chat-messages');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const sendButton = document.querySelector('.send-button');
const history = [];
let waiting = false;

function setOpen(open) {
  launcher.setAttribute('aria-expanded', String(open));
  panel.setAttribute('aria-hidden', String(!open));
  panel.classList.toggle('open', open);
  if (open) setTimeout(() => input.focus(), 180);
}
launcher.addEventListener('click', () => setOpen(launcher.getAttribute('aria-expanded') !== 'true'));
document.querySelector('.minimize-chat').addEventListener('click', () => setOpen(false));
document.querySelector('#open-chat').addEventListener('click', () => setOpen(true));
document.querySelector('#below-chat').addEventListener('click', () => setOpen(true));
document.querySelector('.new-chat').addEventListener('click', () => {
  history.length = 0;
  messages.innerHTML = '<div class="date-divider"><span>TODAY</span></div>';
  addMessage('bot', 'Fresh start! What would you like help with?');
  input.focus();
});

function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }
function addMessage(role, text) {
  const row = document.createElement('article');
  row.className = `message-row ${role === 'bot' ? 'bot-row' : 'user-row'}`;
  if (role === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'mini-avatar'; avatar.textContent = 'r'; row.append(avatar);
  }
  const content = document.createElement('div'); content.className = 'message-content';
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role === 'bot' ? 'bot-bubble' : 'user-bubble'}`;
  bubble.textContent = text;
  content.append(bubble);
  const time = document.createElement('time');
  time.textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
  content.append(time); row.append(content); messages.append(row); scrollToBottom();
}
function showTyping() {
  const row = document.createElement('article'); row.className = 'message-row bot-row'; row.id = 'typing-indicator';
  const avatar = document.createElement('div'); avatar.className = 'mini-avatar'; avatar.textContent = 'r';
  const bubble = document.createElement('div'); bubble.className = 'bubble bot-bubble typing';
  bubble.setAttribute('aria-label', 'Roomie is typing');
  for (let i = 0; i < 3; i++) bubble.append(document.createElement('span'));
  row.append(avatar, bubble); messages.append(row); scrollToBottom();
}
function setWaiting(value) { waiting = value; sendButton.disabled = value || !input.value.trim(); input.disabled = value; }

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || waiting) return;
  addMessage('user', clean);
  const previousHistory = history.slice(-20);
  history.push({ role: 'user', text: clean });
  input.value = ''; input.style.height = 'auto'; setWaiting(true); showTyping();
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: clean, history: previousHistory })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    history.push({ role: 'model', text: data.reply });
    addMessage('bot', data.reply);
  } catch (error) {
    history.pop();
    addMessage('bot', error.message || 'I couldn’t connect just now. Please try again.');
  } finally {
    document.querySelector('#typing-indicator')?.remove(); setWaiting(false); input.focus();
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('input', () => {
  input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 88)}px`;
  sendButton.disabled = waiting || !input.value.trim();
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
});
document.querySelectorAll('.suggestions button').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && launcher.getAttribute('aria-expanded') === 'true') setOpen(false); });
