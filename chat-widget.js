/* Data Vision Tech Solutions — AI chat widget (Claude via Vercel proxy).
 * Self-contained: injects its own styles + markup. No dependencies.
 *
 * SETUP: after deploying the chatbot-api project to Vercel, set the line below
 * to your function URL, e.g. "https://dvts-chatbot-api.vercel.app/api/chat".
 * Until it is set, the widget stays hidden so the live site is unaffected.
 */
(function () {
  var DVTS_CHAT_API = "https://YOUR-VERCEL-PROJECT.vercel.app/api/chat";

  // Stay hidden until configured with a real endpoint.
  if (!DVTS_CHAT_API || DVTS_CHAT_API.indexOf("YOUR-VERCEL-PROJECT") !== -1) return;

  var ACCENT = "#c8842e", DARK = "#0f1923";
  var messages = []; // {role, content}
  var busy = false;

  var css = ""
    + ".dv-chat-launch{position:fixed;right:20px;bottom:88px;z-index:95;width:56px;height:56px;border-radius:50%;background:" + ACCENT + ";border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.22);transition:transform .25s,box-shadow .25s;}"
    + ".dv-chat-launch:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 10px 28px rgba(200,132,46,0.45);}"
    + ".dv-chat-launch svg{width:28px;height:28px;fill:#fff;}"
    + ".dv-chat-panel{position:fixed;right:20px;bottom:88px;z-index:96;width:370px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,0.28);display:none;flex-direction:column;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}"
    + ".dv-chat-panel.open{display:flex;}"
    + ".dv-chat-head{background:" + DARK + ";color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}"
    + ".dv-chat-head h4{margin:0;font-size:0.98rem;font-weight:600;}"
    + ".dv-chat-head .dv-sub{font-size:0.72rem;color:rgba(255,255,255,0.55);margin-top:2px;}"
    + ".dv-chat-close{background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.4rem;line-height:1;cursor:pointer;padding:0 4px;}"
    + ".dv-chat-close:hover{color:#fff;}"
    + ".dv-chat-msgs{flex:1;overflow-y:auto;padding:16px;background:#f8f9fa;display:flex;flex-direction:column;gap:10px;}"
    + ".dv-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:0.86rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;}"
    + ".dv-msg.bot{background:#fff;border:1px solid #e8e9ee;color:#1a1a2e;align-self:flex-start;border-bottom-left-radius:4px;}"
    + ".dv-msg.user{background:" + ACCENT + ";color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}"
    + ".dv-msg.typing{color:#8b90a5;font-style:italic;}"
    + ".dv-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e8e9ee;background:#fff;}"
    + ".dv-chat-form input{flex:1;border:1px solid #e8e9ee;border-radius:10px;padding:10px 12px;font-size:0.88rem;font-family:inherit;outline:none;}"
    + ".dv-chat-form input:focus{border-color:" + ACCENT + ";}"
    + ".dv-chat-form button{background:" + ACCENT + ";border:none;color:#fff;border-radius:10px;padding:0 16px;font-weight:600;cursor:pointer;font-size:0.88rem;}"
    + ".dv-chat-form button:disabled{opacity:0.5;cursor:default;}"
    + ".dv-chat-foot{font-size:0.66rem;color:#8b90a5;text-align:center;padding:0 12px 10px;background:#fff;}"
    + "@media(max-width:768px){.dv-chat-launch{right:16px;bottom:80px;}.dv-chat-panel{right:16px;bottom:80px;}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var wrap = document.createElement("div");
  wrap.innerHTML = ''
    + '<button class="dv-chat-launch" id="dvChatLaunch" aria-label="Open chat assistant">'
    + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 5.9 2 10.7c0 2.5 1.2 4.7 3.2 6.3L4.5 21l4.2-2.1c1 .3 2.1.4 3.3.4 5.5 0 10-3.9 10-8.6S17.5 2 12 2z"/></svg>'
    + '</button>'
    + '<div class="dv-chat-panel" id="dvChatPanel" role="dialog" aria-label="Chat assistant">'
    + '  <div class="dv-chat-head"><div><h4>DV Assistant</h4><div class="dv-sub">Scrap metal &amp; aluminium — ask us anything</div></div>'
    + '  <button class="dv-chat-close" id="dvChatClose" aria-label="Close chat">&times;</button></div>'
    + '  <div class="dv-chat-msgs" id="dvChatMsgs"></div>'
    + '  <form class="dv-chat-form" id="dvChatForm"><input id="dvChatInput" type="text" placeholder="Type your question…" autocomplete="off" maxlength="500" aria-label="Your message"><button type="submit" id="dvChatSend">Send</button></form>'
    + '  <div class="dv-chat-foot">AI assistant — may be inaccurate. For a firm quote, call or WhatsApp us.</div>'
    + '</div>';
  document.body.appendChild(wrap);

  var panel = document.getElementById("dvChatPanel");
  var msgsEl = document.getElementById("dvChatMsgs");
  var input = document.getElementById("dvChatInput");
  var sendBtn = document.getElementById("dvChatSend");
  var greeted = false;

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function addMsg(role, text, cls) {
    var el = document.createElement("div");
    el.className = "dv-msg " + (cls || (role === "user" ? "user" : "bot"));
    el.innerHTML = esc(text);
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add("open");
    if (!greeted) {
      greeted = true;
      addMsg("assistant", "Hi! I'm the Data Vision assistant. Ask me about selling scrap metal, aluminium grades, prices, collection across Birmingham & the West Midlands, or how we work.");
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function closePanel() { panel.classList.remove("open"); }

  document.getElementById("dvChatLaunch").addEventListener("click", function () {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });
  document.getElementById("dvChatClose").addEventListener("click", closePanel);

  document.getElementById("dvChatForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    addMsg("user", text);
    messages.push({ role: "user", content: text });
    busy = true; sendBtn.disabled = true;
    var typing = addMsg("assistant", "Typing…", "bot typing");

    fetch(DVTS_CHAT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        typing.remove();
        if (res.ok && res.d && res.d.reply) {
          addMsg("assistant", res.d.reply);
          messages.push({ role: "assistant", content: res.d.reply });
        } else {
          fallback();
        }
      })
      .catch(function () { typing.remove(); fallback(); })
      .then(function () { busy = false; sendBtn.disabled = false; input.focus(); });
  });

  function fallback() {
    addMsg("assistant", "Sorry, I'm having trouble right now. Please call +44 7442 001088, WhatsApp us, or email info@datavisiontechsolutions.com and we'll help straight away.");
  }
})();
