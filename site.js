/* NMS · interações do site (sem bibliotecas, sem atraso) */
(function () {
  var doc = document.documentElement;
  var header = document.getElementById("topo");
  var nav = document.getElementById("menu");
  var menuBtn = document.querySelector(".menu-btn");
  var barra = document.getElementById("progresso");
  var wa = document.querySelector(".wa-float");
  var hero = document.getElementById("inicio");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var secoes = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  // altura real do topo, para a primeira tela ocupar exatamente o resto da tela
  function medirTopo() { doc.style.setProperty("--hdr", header.offsetHeight + "px"); }
  medirTopo();
  window.addEventListener("resize", medirTopo);

  // menu do celular
  function fecharMenu() { nav.classList.remove("aberto"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Abrir menu"); }
  menuBtn.addEventListener("click", function () {
    var abrir = !nav.classList.contains("aberto");
    nav.classList.toggle("aberto", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
    menuBtn.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });
  document.addEventListener("click", function (e) { if (!header.contains(e.target)) fecharMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { fecharMenu(); fecharZoom(); } });

  // abas e links internos: pulo instantâneo, sem rolagem lenta
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    var alvo = id === "#inicio" ? null : document.querySelector(id);
    e.preventDefault();
    fecharMenu();
    if (alvo) {
      window.scrollTo({ top: alvo.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight + 1, behavior: "instant" });
      alvo.classList.remove("chegou"); void alvo.offsetWidth; alvo.classList.add("chegou");
      history.replaceState(null, "", id);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", location.pathname + location.search);
    }
    atualizar();
  });

  // efeito de onda no toque dos botões (não segura a navegação)
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn");
    if (!b) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    var o = document.createElement("span");
    o.className = "onda";
    o.style.width = o.style.height = s + "px";
    o.style.left = (e.clientX - r.left - s / 2) + "px";
    o.style.top = (e.clientY - r.top - s / 2) + "px";
    b.appendChild(o);
    setTimeout(function () { o.remove(); }, 500);
  });

  // perguntas: abrir uma fecha as outras
  var faqs = document.querySelectorAll(".faq");
  Array.prototype.forEach.call(faqs, function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      Array.prototype.forEach.call(faqs, function (o) { if (o !== d) o.open = false; });
    });
  });

  // telas do sistema: tocar para ampliar
  var lb = document.querySelector(".lightbox"), lbImg = lb.querySelector("img");
  function fecharZoom() { if (!lb.hidden) { lb.hidden = true; doc.style.overflow = ""; } }
  Array.prototype.forEach.call(document.querySelectorAll("img.zoom"), function (img) {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    function abrir() { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.hidden = false; doc.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); }
    img.addEventListener("click", abrir);
    img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
  lb.addEventListener("click", fecharZoom);

  // aba ativa, sombra do topo, barra de progresso e botão do WhatsApp
  var pendente = false;
  function atualizar() {
    pendente = false;
    var y = window.pageYOffset, max = doc.scrollHeight - window.innerHeight;
    barra.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    header.classList.toggle("rolou", y > 4);
    wa.classList.toggle("visivel", y > hero.offsetHeight * 0.6);
    var linha = header.offsetHeight + window.innerHeight * 0.3, atual = -1;
    secoes.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= linha && s.getBoundingClientRect().bottom > linha) atual = i; });
    links.forEach(function (a, i) { a.classList.toggle("ativo", i === atual); if (i === atual) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  }
  window.addEventListener("scroll", function () { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
  window.addEventListener("resize", atualizar);
  atualizar();
})();
