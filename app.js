/* ============================================================
   SYDNEY MAXING — app logic
   ============================================================ */
(function () {
  "use strict";

  // ---------- state (localStorage) ----------
  var KEY = "symax";
  var store = load();
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(store)); }
  function st(id) { return (store.items && store.items[id]) || {}; }
  function setSt(id, patch) {
    store.items = store.items || {};
    store.items[id] = Object.assign({}, store.items[id], patch);
    save();
  }

  // user-added items persist here
  store.custom = store.custom || { explore: [], eats: [], trips: [] };

  // ---------- catalog ----------
  var DATA = window.LIVE_DATA || { updated: "", explore: [], eats: [], trips: [] };
  function listFor(tab) {
    var base = (DATA[tab] || []).slice();
    var extra = (store.custom[tab] || []).slice();
    return extra.concat(base);
  }

  // ---------- icon + filter config ----------
  var ICON = {
    Festival: "ic-festival", Music: "ic-music", Beach: "ic-beach", Nature: "ic-nature",
    Culture: "ic-culture", Nightlife: "ic-nightlife",
    Dinner: "ic-eats", Brunch: "ic-brunch", Casual: "ic-eats", Bar: "ic-nightlife",
    Market: "ic-shopping", Shopping: "ic-shopping",
    Neighbour: "ic-globe", Roadtrip: "ic-car", Island: "ic-island", Weekend: "ic-weekend"
  };
  var FILTERS = {
    explore: ["All", "Festival", "Music", "Beach", "Nature", "Culture", "Nightlife"],
    eats:    ["All", "Dinner", "Brunch", "Casual", "Bar", "Market", "Shopping"],
    trips:   ["All", "Neighbour", "Roadtrip", "Island", "Weekend"]
  };
  var active = { explore: "All", eats: "All", trips: "All" };
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || "") + '"><use href="#' + name + '"/></svg>';
  }

  // ---------- render one card ----------
  function card(it) {
    var s = st(it.id);
    var ic = ICON[it.cat] || "ic-pin";
    var isNew = !!it.live || !!it.addedOn;
    var done = !!s.done;

    var thumb;
    if (it.date) {
      var d = new Date(it.date + "T00:00:00");
      thumb = '<div class="datebadge"><div class="d">' + d.getDate() +
        '</div><div class="m">' + MON[d.getMonth()] + '</div></div>';
    } else {
      thumb = '<div class="ico">' + icon(ic) + '</div>';
    }

    var tags = '<span class="t cat">' + icon(ic) + esc(it.cat) + '</span>';
    if (it.zone) tags += '<span class="t zone">' + icon("ic-pin") + esc(it.zone) + '</span>';
    if (isNew) tags += '<span class="t new"><span class="dotpulse"></span>NEW</span>';

    var stars = "";
    for (var i = 1; i <= 5; i++) {
      stars += '<span class="' + (s.rating >= i ? "on" : "") + '" data-star="' + i +
        '" data-id="' + it.id + '">' + icon("ic-star") + '</span>';
    }

    var go = it.link
      ? '<a class="btn go" href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
        icon("ic-link") + 'Open</a>'
      : '';

    var src = it.source ? '<div class="src">via ' + esc(it.source) + '</div>' : '';

    return '<div class="card' + (done ? " done" : "") + '" data-card="' + it.id + '">' +
        '<div class="top">' + thumb +
          '<div class="body"><h3>' + esc(it.title) + '</h3>' +
            '<div class="tags">' + tags + '</div>' +
          '</div>' +
          '<button class="heart ' + (s.saved ? "on" : "") + '" data-heart="' + it.id + '" aria-label="Save">' +
            icon("ic-heart") + '</button>' +
        '</div>' +
        '<div class="desc">' + esc(it.desc || "") + '</div>' + src +
        '<div class="actions">' + go +
          '<button class="btn seen" data-done="' + it.id + '">' +
            icon("ic-check") + (done ? "Been there" : "Mark done") + '</button>' +
        '</div>' +
        (done
          ? '<div class="stars">' + stars + '</div>' +
            '<textarea class="review" rows="2" placeholder="Leave a quick review..." data-review="' +
              it.id + '">' + esc(s.review || "") + '</textarea>'
          : '') +
      '</div>';
  }

  // ---------- render a tab list ----------
  function renderList(tab) {
    var host = document.getElementById("list-" + tab);
    if (!host) return;
    var items = listFor(tab).filter(function (it) {
      return active[tab] === "All" || it.cat === active[tab];
    });
    host.innerHTML = items.length
      ? items.map(card).join("")
      : '<div class="empty">Nothing here yet. Tap “Add” or Ask Sydney Maxing.</div>';
  }

  function renderFilters(tab) {
    var host = document.querySelector('.filters[data-for="' + tab + '"]');
    if (!host) return;
    host.innerHTML = FILTERS[tab].map(function (f) {
      return '<button class="chip ' + (active[tab] === f ? "active" : "") +
        '" data-filter="' + f + '" data-tab="' + tab + '">' + esc(f) + '</button>';
    }).join("");
  }

  function renderHome() {
    var stamp = document.getElementById("updStamp");
    if (stamp) stamp.textContent = DATA.updated ? "Updated " + DATA.updated : "";

    var all = listFor("explore").concat(listFor("eats")).concat(listFor("trips"));

    var fresh = all.filter(function (it) { return it.live || it.addedOn; }).slice(0, 6);
    var newHost = document.getElementById("home-new");
    if (newHost) newHost.innerHTML = fresh.length
      ? fresh.map(card).join("")
      : '<div class="empty">No new drops yet.</div>';

    var saved = all.filter(function (it) { return st(it.id).saved; });
    var savHost = document.getElementById("home-saved");
    if (savHost) savHost.innerHTML = saved.length
      ? saved.map(card).join("")
      : '<div class="empty">Tap the heart on anything to build your list.</div>';
  }

  function renderAll() {
    ["explore", "eats", "trips"].forEach(function (t) { renderFilters(t); renderList(t); });
    renderHome();
  }

  // ---------- tabs ----------
  function showTab(tab) {
    document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
    var pg = document.getElementById("page-" + tab);
    if (pg) pg.classList.add("active");
    document.querySelectorAll(".tabinner button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    window.scrollTo(0, 0);
    if (tab === "home") renderHome();
  }

  // ---------- global click handling ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab],[data-heart],[data-done],[data-star],[data-filter],[data-add]");
    // tabbar
    var tb = e.target.closest(".tabinner button[data-tab]");
    if (tb) { showTab(tb.getAttribute("data-tab")); return; }
    if (!t) return;

    if (t.hasAttribute("data-heart")) {
      var id = t.getAttribute("data-heart");
      setSt(id, { saved: !st(id).saved });
      renderAll();
      return;
    }
    if (t.hasAttribute("data-done")) {
      var id2 = t.getAttribute("data-done");
      setSt(id2, { done: !st(id2).done });
      renderAll();
      return;
    }
    if (t.hasAttribute("data-star")) {
      var sid = t.getAttribute("data-id");
      setSt(sid, { rating: +t.getAttribute("data-star") });
      renderAll();
      return;
    }
    if (t.hasAttribute("data-filter")) {
      var ftab = t.getAttribute("data-tab");
      active[ftab] = t.getAttribute("data-filter");
      renderFilters(ftab); renderList(ftab);
      return;
    }
    if (t.hasAttribute("data-add")) {
      openModal(t.getAttribute("data-add"));
      return;
    }
  });

  // save reviews on input
  document.addEventListener("input", function (e) {
    var r = e.target.closest("[data-review]");
    if (r) setSt(r.getAttribute("data-review"), { review: r.value });
  });

  // "Add more" on home jumps to explore
  var goExplore = document.getElementById("goExplore");
  if (goExplore) goExplore.addEventListener("click", function () { showTab("explore"); });

  // ---------- add modal ----------
  var modal = document.getElementById("modal");
  var addTab = "explore";
  function openModal(tab) {
    addTab = tab;
    document.getElementById("modalTitle").textContent =
      tab === "eats" ? "Add a spot" : tab === "trips" ? "Add a destination" : "Add a place or event";
    var sel = document.getElementById("fCat");
    sel.innerHTML = FILTERS[tab].filter(function (f) { return f !== "All"; })
      .map(function (f) { return '<option>' + f + '</option>'; }).join("");
    document.getElementById("fName").value = "";
    document.getElementById("fZone").value = "";
    document.getElementById("fLink").value = "";
    document.getElementById("fDesc").value = "";
    modal.classList.add("show");
  }
  function closeModal() { modal.classList.remove("show"); }
  document.getElementById("mCancel").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.getElementById("mSave").addEventListener("click", function () {
    var name = document.getElementById("fName").value.trim();
    if (!name) { document.getElementById("fName").focus(); return; }
    var item = {
      id: "u-" + Date.now(),
      title: name,
      cat: document.getElementById("fCat").value,
      zone: document.getElementById("fZone").value.trim(),
      link: document.getElementById("fLink").value.trim(),
      desc: document.getElementById("fDesc").value.trim(),
      addedOn: new Date().toISOString().slice(0, 10)
    };
    store.custom[addTab].unshift(item);
    save();
    closeModal();
    renderAll();
    showTab(addTab);
  });

  // ============================================================
  //  ASK SYDNEY MAXING
  // ============================================================
  var ask = document.getElementById("ask");
  var feed = document.getElementById("feed");
  var askInput = document.getElementById("askInput");
  var askSend = document.getElementById("askSend");
  var busy = false;

  var QUICK = [
    "What's on this weekend?",
    "Concerts in the next 2 weeks?",
    "Best dinner in Surry Hills right now?",
    "Cheap trip from Sydney in March?",
    "Free things to do this week"
  ];

  function openAsk() {
    ask.classList.add("show");
    if (!feed.children.length) {
      addAI("Hey! Ask me anything about Sydney — what's on, where to eat, or where to go next. " +
        "I search the web live and give you real links.");
    }
    setTimeout(function () { askInput.focus(); }, 250);
  }
  function closeAsk() { ask.classList.remove("show"); }

  document.getElementById("askFab").addEventListener("click", openAsk);
  document.getElementById("askClose").addEventListener("click", closeAsk);
  ask.addEventListener("click", function (e) { if (e.target === ask) closeAsk(); });

  // quick-question chips
  var qchips = document.getElementById("qchips");
  qchips.innerHTML = QUICK.map(function (q) {
    return '<button data-q="' + esc(q) + '">' + esc(q) + '</button>';
  }).join("");
  qchips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]");
    if (b) { askInput.value = b.getAttribute("data-q"); sendAsk(); }
  });

  askSend.addEventListener("click", sendAsk);
  askInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); sendAsk(); }
  });

  function addMe(text) {
    var d = document.createElement("div");
    d.className = "bubble me";
    d.innerHTML = "<span>" + esc(text) + "</span>";
    feed.appendChild(d);
    feed.scrollTop = feed.scrollHeight;
  }
  function addAI(text) {
    var d = document.createElement("div");
    d.className = "bubble ai";
    d.innerHTML = mdToHtml(text);
    feed.appendChild(d);
    feed.scrollTop = feed.scrollHeight;
    return d;
  }
  function addThinking() {
    var d = document.createElement("div");
    d.className = "bubble ai";
    d.innerHTML = '<div class="thinking"><i></i><i></i><i></i></div>';
    feed.appendChild(d);
    feed.scrollTop = feed.scrollHeight;
    return d;
  }

  function sendAsk() {
    var q = askInput.value.trim();
    if (!q || busy) return;
    busy = true; askSend.disabled = true;
    askInput.value = "";
    addMe(q);
    var thinking = addThinking();

    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        thinking.remove();
        if (data && data.answer) addAI(data.answer);
        else addAI(data && data.error ? "⚠️ " + data.error
          : "Hmm, I couldn't get an answer. Try again in a sec.");
      })
      .catch(function () {
        thinking.remove();
        addAI("I can't reach the web right now. This live search only works once the app is " +
          "deployed online (see DEPLOY.md). When you're offline, browse the lists instead.");
      })
      .then(function () {
        busy = false; askSend.disabled = false; askInput.focus();
      });
  }

  // tiny markdown → HTML (links, bold, bullets, paragraphs)
  function mdToHtml(md) {
    var safe = esc(md);
    safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
    safe = safe.replace(/(^|[^"])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    var lines = safe.split("\n");
    var html = "", inList = false;
    lines.forEach(function (ln) {
      var m = ln.match(/^\s*[-*]\s+(.*)/);
      if (m) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + m[1] + "</li>";
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        if (ln.trim()) html += "<p>" + ln + "</p>";
      }
    });
    if (inList) html += "</ul>";
    return html;
  }

  // ---------- boot ----------
  renderAll();
  showTab("home");
})();
