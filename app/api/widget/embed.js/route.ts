import { NextResponse } from "next/server"

// GET - Serve the embeddable widget JavaScript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get("id")

  if (!chatbotId) {
    return new NextResponse("// Error: Missing chatbot ID", {
      status: 400,
      headers: { "Content-Type": "application/javascript" },
    })
  }

  // Get the base URL from the request
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  const widgetScript = `
(function() {
  // Thorne AI Widget v1.0
  const CHATBOT_ID = "${chatbotId}";
  const API_BASE = "${baseUrl}";
  let sessionId = localStorage.getItem("thorne_widget_session_" + CHATBOT_ID) || null;
  let chatbotConfig = null;
  let isOpen = false;
  let pollInterval = null;
  let lastMessageTime = null;

  // Styles
  const styles = \`
    #thorne-widget-container * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    #thorne-widget-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--thorne-color, #6366f1) 0%, #8b5cf6 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999998;
    }
    #thorne-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
    }
    #thorne-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #thorne-widget-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      color: white;
      font-size: 11px;
      font-weight: 600;
      display: none;
      align-items: center;
      justify-content: center;
    }
    #thorne-widget-panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 520px;
      max-height: calc(100vh - 140px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      animation: thorneFadeIn 0.2s ease-out;
    }
    @keyframes thorneFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #thorne-widget-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--thorne-color, #6366f1) 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #thorne-widget-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #thorne-widget-avatar svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    #thorne-widget-title {
      font-weight: 600;
      font-size: 16px;
    }
    #thorne-widget-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }
    #thorne-widget-close {
      margin-left: auto;
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #thorne-widget-close:hover {
      background: rgba(255,255,255,0.3);
    }
    #thorne-widget-close svg {
      width: 16px;
      height: 16px;
      fill: white;
    }
    #thorne-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }
    .thorne-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      animation: thorneMsgIn 0.2s ease-out;
    }
    @keyframes thorneMsgIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .thorne-message.visitor {
      background: var(--thorne-color, #6366f1);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .thorne-message.agent, .thorne-message.ai {
      background: white;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .thorne-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .thorne-typing span {
      width: 8px;
      height: 8px;
      background: #94a3b8;
      border-radius: 50%;
      animation: thorneBounce 1.4s infinite ease-in-out;
    }
    .thorne-typing span:nth-child(1) { animation-delay: -0.32s; }
    .thorne-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes thorneBounce {
      0%, 80%, 100% { transform: scale(0.6); }
      40% { transform: scale(1); }
    }
    #thorne-widget-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    #thorne-widget-form {
      display: flex;
      gap: 8px;
    }
    #thorne-widget-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #thorne-widget-input:focus {
      border-color: var(--thorne-color, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    #thorne-widget-send {
      width: 44px;
      height: 44px;
      background: var(--thorne-color, #6366f1);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #thorne-widget-send:hover {
      filter: brightness(1.1);
    }
    #thorne-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    #thorne-widget-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }
    #thorne-widget-intro {
      padding: 20px;
      text-align: center;
    }
    #thorne-widget-intro input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
      outline: none;
    }
    #thorne-widget-intro input:focus {
      border-color: var(--thorne-color, #6366f1);
    }
    #thorne-widget-start {
      width: 100%;
      padding: 12px;
      background: var(--thorne-color, #6366f1);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: filter 0.2s;
    }
    #thorne-widget-start:hover {
      filter: brightness(1.1);
    }
    .thorne-powered {
      text-align: center;
      padding: 8px;
      font-size: 11px;
      color: #94a3b8;
      background: white;
      border-top: 1px solid #f1f5f9;
    }
    .thorne-powered a {
      color: var(--thorne-color, #6366f1);
      text-decoration: none;
      font-weight: 500;
    }
  \`;

  // Icons
  const chatIcon = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const sendIcon = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  const botIcon = '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/></svg>';

  // Create widget container
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'thorne-widget-container';
    
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    container.appendChild(styleEl);

    // Create button
    const button = document.createElement('button');
    button.id = 'thorne-widget-button';
    button.innerHTML = chatIcon + '<span id="thorne-widget-badge">0</span>';
    button.onclick = toggleWidget;
    container.appendChild(button);

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'thorne-widget-panel';
    panel.innerHTML = \`
      <div id="thorne-widget-header">
        <div id="thorne-widget-avatar">\${botIcon}</div>
        <div>
          <div id="thorne-widget-title">Chat with us</div>
          <div id="thorne-widget-subtitle">We typically reply within minutes</div>
        </div>
        <button id="thorne-widget-close">\${closeIcon}</button>
      </div>
      <div id="thorne-widget-messages"></div>
      <div id="thorne-widget-input-area">
        <form id="thorne-widget-form">
          <input type="text" id="thorne-widget-input" placeholder="Type a message..." autocomplete="off" />
          <button type="submit" id="thorne-widget-send">\${sendIcon}</button>
        </form>
      </div>
      <div class="thorne-powered">Powered by <a href="${baseUrl}" target="_blank">Thorne AI</a></div>
    \`;
    container.appendChild(panel);

    document.body.appendChild(container);

    // Event listeners
    document.getElementById('thorne-widget-close').onclick = toggleWidget;
    document.getElementById('thorne-widget-form').onsubmit = handleSend;

    // Initialize chat
    initChat();
  }

  async function initChat() {
    // If we have a session, load messages
    if (sessionId) {
      await loadMessages();
      startPolling();
    } else {
      // Show welcome message
      const messagesEl = document.getElementById('thorne-widget-messages');
      messagesEl.innerHTML = '<div class="thorne-message agent">Hi there! How can I help you today?</div>';
    }
  }

  function toggleWidget() {
    isOpen = !isOpen;
    const panel = document.getElementById('thorne-widget-panel');
    const button = document.getElementById('thorne-widget-button');
    
    panel.style.display = isOpen ? 'flex' : 'none';
    button.innerHTML = (isOpen ? closeIcon : chatIcon) + '<span id="thorne-widget-badge">0</span>';
    
    if (isOpen) {
      document.getElementById('thorne-widget-input').focus();
      startPolling();
    } else {
      stopPolling();
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const input = document.getElementById('thorne-widget-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    addMessage(message, 'visitor');

    try {
      const res = await fetch(API_BASE + '/api/widget/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: CHATBOT_ID,
          sessionId: sessionId,
          message: message,
        }),
      });
      
      const data = await res.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('thorne_widget_session_' + CHATBOT_ID, sessionId);
        
        if (!pollInterval) {
          startPolling();
        }
      }
      
      if (data.chatbot) {
        chatbotConfig = data.chatbot;
        updateTheme();
      }
    } catch (err) {
      console.error('Widget send error:', err);
    }
  }

  function addMessage(content, type) {
    const messagesEl = document.getElementById('thorne-widget-messages');
    const msg = document.createElement('div');
    msg.className = 'thorne-message ' + type;
    msg.textContent = content;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function loadMessages() {
    if (!sessionId) return;
    
    try {
      const url = API_BASE + '/api/widget/message?sessionId=' + sessionId + 
        (lastMessageTime ? '&since=' + encodeURIComponent(lastMessageTime) : '');
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.messages && data.messages.length > 0) {
        const messagesEl = document.getElementById('thorne-widget-messages');
        
        // If this is initial load (no lastMessageTime), clear default message
        if (!lastMessageTime) {
          messagesEl.innerHTML = '';
        }
        
        data.messages.forEach(msg => {
          addMessage(msg.content, msg.sender_type);
          lastMessageTime = msg.created_at;
        });
      }
    } catch (err) {
      console.error('Widget load error:', err);
    }
  }

  function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(loadMessages, 2000); // Poll every 2 seconds
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function updateTheme() {
    if (chatbotConfig && chatbotConfig.themeColor) {
      document.documentElement.style.setProperty('--thorne-color', chatbotConfig.themeColor);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
`;

  return new NextResponse(widgetScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
