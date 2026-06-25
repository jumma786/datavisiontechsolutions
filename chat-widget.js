/* Data Vision Tech Solutions — built-in chat assistant (no API, no server).
 * Self-contained: injects its own styles + markup. No dependencies, no cost.
 * Answers common questions from a local knowledge base and routes anything
 * else to phone / WhatsApp / email. Always visible on load.
 */
(function () {
  var ACCENT = "#c8842e", DARK = "#0f1923";
  var PHONE_DISPLAY = "+44 7442 001088";
  var PHONE_TEL = "+447442001088";
  var WA = "https://wa.me/447442001088";
  var EMAIL = "info@datavisiontechsolutions.com";

  // Reusable trusted-HTML snippet for contact actions.
  var CONTACT = 'You can reach us any time: '
    + '<a href="tel:' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a> · '
    + '<a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a> · '
    + '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';

  var QUOTE = 'Scrap prices move daily with the LME and depend on the grade, '
    + 'cleanliness and quantity, so we don’t quote a fixed price online. '
    + 'Tell us your <b>material/grade</b>, <b>rough quantity</b> and <b>location</b> and we’ll give you a current quote. '
    + CONTACT;

  // Intent rules — first match wins, so list specific intents before general ones.
  var RULES = [
    { k: ["price", "prices", "rate", "rates", "how much", "per kg", "per tonne", "per ton", "cost", "value", "worth", "quote", "quotation"],
      a: QUOTE },
    { k: ["aluminium", "aluminum", "alloy", "extrusion", "ubc", "taint", "tabor", "litho", "wheels"],
      a: 'Aluminium is our speciality. We buy UBC cans, alloy wheels, extrusion (6063), taint/tabor, litho, cast and turnings/swarf. '
        + 'Send your grade and rough quantity for a current price. ' + CONTACT },
    { k: ["copper", "brass", "lead", "stainless", "cable", "wire", "ferrous", "non-ferrous", "non ferrous", "steel", "iron", "what do you buy", "what metals", "materials", "grades", "buy"],
      a: 'We buy <b>all grades of ferrous &amp; non-ferrous metal</b> — steel &amp; cast iron, copper, brass, aluminium, stainless (304/316), lead and cable — plus full factory clearances, end-of-life vehicles and redundant plant &amp; machinery. '
        + 'Which material did you have in mind?' },
    { k: ["factory", "clearance", "site clearance", "demolition", "decommission"],
      a: 'Yes — we handle complete <b>factory and site clearances</b>: production scrap, offcuts and all mixed metals, cleared and fully documented. '
        + 'Tell us the site location and rough scale and we’ll arrange it. ' + CONTACT },
    { k: ["car", "vehicle", "elv", "end of life", "end-of-life", "van", "scrap my car"],
      a: 'We take <b>end-of-life vehicles</b> — cars, vans and light commercials — for depollution and dismantling, with a Certificate of Destruction issued. '
        + CONTACT },
    { k: ["plant", "machinery", "machine", "equipment", "motor", "transformer", "switchgear"],
      a: 'We buy redundant <b>plant &amp; machinery</b> — industrial machines, electric motors, transformers and switchgear. Send a few photos and the location for a valuation. '
        + CONTACT },
    { k: ["collect", "collection", "pickup", "pick up", "pick-up", "area", "region", "birmingham", "west midlands", "do you cover", "come to"],
      a: 'We offer <b>free collection</b> for trade and larger loads across <b>Birmingham and the West Midlands</b>, and you’re welcome to deliver to us too. '
        + 'Where are you based? ' + CONTACT },
    { k: ["pay", "paid", "payment", "cash", "bank", "transfer", "how do i get paid", "money"],
      a: 'Payment is by <b>bank transfer only</b> — paying cash for scrap is illegal in England &amp; Wales under the Scrap Metal Dealers Act 2013. '
        + 'You’ll need valid photo ID, and we issue a waste transfer note on every collection.' },
    { k: ["id", "identification", "photo id", "documents", "paperwork", "licence to sell", "what do i need"],
      a: 'To sell scrap you’ll need <b>valid photo ID</b> (the law requires it). We pay by <b>bank transfer only</b> and issue a waste transfer note on every collection.' },
    { k: ["how to sell", "sell scrap", "want to sell", "selling", "process", "how does it work", "how do you work", "steps"],
      a: 'Selling to us is simple: 1) tell us your <b>material/grade</b>, <b>rough quantity</b> and <b>location</b>; 2) we give you a current quote; 3) we arrange free collection (trade/larger loads) or you deliver; 4) you’re paid by <b>bank transfer</b> with full documentation. '
        + CONTACT },
    { k: ["export", "india", "foundry", "process", "sell to", "buy from you", "buyer", "container"],
      a: 'We run a closed-loop chain: UK-sourced metal is processed at our ISO 9001:2015 partner facility (RA Recycle Service, Rajasthan, India) and supplied export-ready to foundries and industrial buyers worldwide. '
        + 'For purchasing enquiries, ' + CONTACT },
    { k: ["licence", "license", "registered", "waste carrier", "legal", "certified", "iso", "accreditation", "vat", "eori", "company number", "regulated"],
      a: 'We’re a UK company (Companies House No. 16681514) and an Environment Agency upper-tier registered <b>waste carrier, broker &amp; dealer (CBDU622654)</b>. '
        + 'VAT GB 502 4728 17 · EORI GB502472817000 · processing is ISO 9001:2015 certified.' },
    { k: ["where are you", "address", "office", "location of", "based", "find you"],
      a: 'Our office is at <b>1082 Stratford Road, Hall Green, Birmingham, B28 8AD</b>. ' + CONTACT },
    { k: ["hours", "open", "opening", "time", "when are you", "available"],
      a: 'Reach us during normal business hours, Monday to Saturday. The quickest way is WhatsApp or a call. ' + CONTACT },
    { k: ["contact", "phone", "number", "whatsapp", "email", "call", "reach", "get in touch", "speak"],
      a: CONTACT },
    { k: ["who are you", "about", "company", "what is data vision", "tell me about"],
      a: 'Data Vision Tech Solutions is a licensed UK scrap metal buyer and exporter, focused on aluminium. We source ferrous &amp; non-ferrous metal across the UK and supply processed, export-ready material to industrial buyers worldwide.' },
    { k: ["thanks", "thank you", "cheers", "ta ", "great", "perfect", "ok thanks"],
      a: 'You’re welcome! Anything else I can help with? For a firm quote, ' + CONTACT },
    { k: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "hiya"],
      a: 'Hello! How can I help — selling scrap, aluminium grades, collection, or a quote?' }
  ];

  var CHIPS = ["What do you buy?", "Get a quote", "Do you collect?", "How do I get paid?", "Contact details"];

  function reply(text) {
    var q = " " + text.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";
    for (var i = 0; i < RULES.length; i++) {
      var ks = RULES[i].k;
      for (var j = 0; j < ks.length; j++) {
        if (q.indexOf(ks[j]) !== -1) return RULES[i].a;
      }
    }
    return 'Good question — I’m not certain on that one, and I’d rather not guess. '
      + 'The team can answer straight away: ' + CONTACT;
  }

  var css = ""
    + ".dv-chat-launch{position:fixed;right:20px;bottom:88px;z-index:95;width:56px;height:56px;border-radius:50%;background:" + ACCENT + ";border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.22);transition:transform .25s,box-shadow .25s;}"
    + ".dv-chat-launch:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 10px 28px rgba(200,132,46,0.45);}"
    + ".dv-chat-launch svg{width:28px;height:28px;fill:#fff;}"
    + ".dv-chat-panel{position:fixed;right:20px;bottom:88px;z-index:96;width:370px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,0.28);display:none;flex-direction:column;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}"
    + ".dv-chat-panel.open{display:flex;}"
    + ".dv-chat-head{background:" + DARK + ";color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}"
    + ".dv-chat-head h4{margin:0;font-size:0.98rem;font-weight:600;}"
    + ".dv-chat-head .dv-sub{font-size:0.72rem;color:rgba(255,255,255,0.55);margin-top:2px;}"
    + ".dv-chat-close{background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.4rem;line-height:1;cursor:pointer;padding:0 4px;}"
    + ".dv-chat-close:hover{color:#fff;}"
    + ".dv-chat-msgs{flex:1;overflow-y:auto;padding:16px;background:#f8f9fa;display:flex;flex-direction:column;gap:10px;}"
    + ".dv-msg{max-width:85%;padding:10px 13px;border-radius:14px;font-size:0.86rem;line-height:1.5;word-wrap:break-word;}"
    + ".dv-msg.bot{background:#fff;border:1px solid #e8e9ee;color:#1a1a2e;align-self:flex-start;border-bottom-left-radius:4px;}"
    + ".dv-msg.user{background:" + ACCENT + ";color:#fff;align-self:flex-end;border-bottom-right-radius:4px;white-space:pre-wrap;}"
    + ".dv-msg.bot a{color:" + ACCENT + ";font-weight:600;text-decoration:none;}"
    + ".dv-msg.bot a:hover{text-decoration:underline;}"
    + ".dv-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;background:#f8f9fa;}"
    + ".dv-chip{background:#fff;border:1px solid #e0d4c2;color:" + DARK + ";border-radius:999px;padding:6px 11px;font-size:0.76rem;cursor:pointer;font-family:inherit;transition:background .15s,border-color .15s;}"
    + ".dv-chip:hover{background:#fdf6ec;border-color:" + ACCENT + ";}"
    + ".dv-chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e8e9ee;background:#fff;}"
    + ".dv-chat-form input{flex:1;border:1px solid #e8e9ee;border-radius:10px;padding:10px 12px;font-size:0.88rem;font-family:inherit;outline:none;}"
    + ".dv-chat-form input:focus{border-color:" + ACCENT + ";}"
    + ".dv-chat-form button{background:" + ACCENT + ";border:none;color:#fff;border-radius:10px;padding:0 16px;font-weight:600;cursor:pointer;font-size:0.88rem;}"
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
    + '  <div class="dv-chips" id="dvChips"></div>'
    + '  <form class="dv-chat-form" id="dvChatForm"><input id="dvChatInput" type="text" placeholder="Type your question…" autocomplete="off" maxlength="500" aria-label="Your message"><button type="submit">Send</button></form>'
    + '  <div class="dv-chat-foot">For a firm quote, call or WhatsApp us — prices change daily.</div>'
    + '</div>';
  document.body.appendChild(wrap);

  var panel = document.getElementById("dvChatPanel");
  var msgsEl = document.getElementById("dvChatMsgs");
  var chipsEl = document.getElementById("dvChips");
  var input = document.getElementById("dvChatInput");
  var greeted = false;

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  // role "user" => escaped plain text; role "bot" => trusted author HTML (links, <b>).
  function addMsg(role, html) {
    var el = document.createElement("div");
    el.className = "dv-msg " + (role === "user" ? "user" : "bot");
    el.innerHTML = role === "user" ? esc(html) : html;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    CHIPS.forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "dv-chip"; b.textContent = label;
      b.addEventListener("click", function () { send(label); });
      chipsEl.appendChild(b);
    });
  }

  function send(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("user", text);
    // tiny human-like delay so it doesn't feel instant/robotic
    setTimeout(function () { addMsg("bot", reply(text)); }, 250);
  }

  function openPanel() {
    panel.classList.add("open");
    if (!greeted) {
      greeted = true;
      addMsg("bot", "Hi! I’m the Data Vision assistant. I can help with what we buy, aluminium grades, collection across Birmingham &amp; the West Midlands, payment &amp; ID rules, or getting a quote. What can I help with?");
      renderChips();
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
    if (!text) return;
    input.value = "";
    send(text);
  });
})();
