(function () {
"use strict";
var $ = function (s) { return document.querySelector(s); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

var DB = window.CHARDB;
var BASE = DB.base;
var SETS = { hair: "Peinado", outfit: "Atuendo", pose: "Pose", build: "Armar" };
var S = { set: "hair", q: "", cat: { hair: "", outfit: "", pose: "" }, favOnly: false };
var QUALITY = {
  illustrious: "masterpiece, best quality, amazing quality, very aesthetic, absurdres, newest",
  anima: "masterpiece, best quality, score_7, safe",
  novelai: "best quality, amazing quality, very aesthetic, absurdres",
  pony: "score_9, score_8_up, score_7_up, source_anime",
  none: ""
};
var EXPR = [
  ["Sin especificar", ""], ["Sonrisa", "smile"], ["Sonrisa leve", "light smile"], ["Sonrisa amplia", "grin"],
  ["Boca cerrada", "closed mouth"], ["Boca abierta", "open mouth"], ["Rubor", "blush"],
  ["Vergüenza", "embarrassed"], ["Sin expresión", "expressionless"], ["Seria", "serious"],
  ["Enfadada", "angry"], ["Mueca", "pout"], ["Llorando", "crying"], ["Sorprendida", "surprised"],
  ["Mirada de soslayo con sonrisa", "jitome, smirk"], ["Guiño", "wink"], ["Sacando la lengua", "tongue out"],
  ["Sonrisa sugerente", "seductive smile"]
];
var COMPO = [
  ["Sin especificar", ""], ["Cuerpo completo", "full body"], ["Hasta los muslos", "cowboy shot"], ["Medio cuerpo", "upper body"],
  ["Primer plano de cara", "portrait"], ["Desde arriba", "from above"], ["Desde abajo", "from below"], ["De lado", "from side"],
  ["Desde atrás, mirando hacia atrás", "from behind, looking back"], ["En diagonal", "dutch angle"]
];
var BG = [
  ["Sin especificar", ""], ["Fondo blanco", "white background"], ["Fondo gris", "grey background"],
  ["Aula", "classroom"], ["Dormitorio", "bedroom"], ["Sala de estar", "living room"], ["Ciudad", "city"],
  ["Playa", "beach"], ["Parque", "park"], ["Ciudad de noche", "cityscape, night"], ["Cafetería", "cafe"],
  ["Baño", "bathroom"], ["Oficina", "office"], ["Santuario", "shrine"], ["Bosque", "forest"], ["Azotea", "rooftop"]
];

var SEL = { style: null, bangs: null, color: null, acc: null, eye: null, outfit: null, pose: null };
var OPT = { quality: "illustrious", expr: "Sonrisa", compo: "Cuerpo completo", bg: "Fondo blanco", extra: "", sep: "comma", body: "" };
var FAV = {};
try { FAV = JSON.parse(window.localStorage.getItem("charFav") || "{}"); } catch (e) { FAV = {}; }
function saveFav() { try { window.localStorage.setItem("charFav", JSON.stringify(FAV)); } catch (e) { } }
try {
  var saved = JSON.parse(window.localStorage.getItem("charSel") || "null");
  if (saved) { Object.keys(SEL).forEach(function (k) { if (saved[k]) SEL[k] = saved[k]; }); }
  var so = JSON.parse(window.localStorage.getItem("charOpt") || "null");
  if (so) { Object.keys(OPT).forEach(function (k) { if (so[k] !== undefined) OPT[k] = so[k]; }); }
} catch (e) { }
function saveSel() { try { window.localStorage.setItem("charSel", JSON.stringify(SEL)); window.localStorage.setItem("charOpt", JSON.stringify(OPT)); } catch (e) { } }

var byId = {};
DB.items.forEach(function (i) { byId[i.id] = i; });

function thumbUrl(id) { return "thumbs/" + id + ".webp"; }
/* Originales locales (solo al abrir con file://; en un sitio web se ignoran) */
function localBase(kind) {
  if (location.protocol !== "file:") return null;
  var L = window.LOCAL_ORIGINALS;
  return (L && L[kind]) || null;
}
function hasLocal(kind) { return !!localBase(kind); }
function fullUrl(id) { return BASE + "img/" + id + ".jpg"; }
function lineUrl(id) { return BASE + "line/" + id + ".png"; }

/* ---------- Tarjetas ---------- */
function cardHTML(it) {
  var isPose = it.set === "pose";
  var vw = it._v || "img";
  var src = isPose && vw === "line" && it.line ? lineUrl(it.id) : thumbUrl(it.id);
  var ratio = isPose ? "p34" : "sq";
  var fav = FAV[it.id] ? " on" : "";
  var added = isAdded(it.id) ? " on" : "";
  var vwHtml = (isPose && it.line)
    ? '<div class="vw"><button data-vw="img" class="' + (vw === "img" ? "on" : "") + '">Imagen</button><button data-vw="line" class="' + (vw === "line" ? "on" : "") + '">Lineart</button></div>'
    : "";
  return '<article class="card" data-id="' + it.id + '">'
    + '<div class="ph ' + ratio + '"><img loading="lazy" decoding="async" src="' + src + '" alt="' + esc(it.es) + '">'
    + '<div class="badge">' + it.id + '</div><button class="fav' + fav + '" data-fav="' + it.id + '" title="Favorito">★</button>' + vwHtml + '</div>'
    + '<div class="meta"><h3>' + esc(it.es) + '</h3><p class="jp">' + esc(it.jp) + '</p><p class="tg">' + esc(it.tags) + '</p></div>'
    + '<div class="acts2"><button data-copy="' + it.id + '">Copiar etiquetas</button>'
    + '<button data-add="' + it.id + '" class="' + (added ? "on" : "") + '">' + (added ? "Ya añadido ✓" : "Añadir al armado") + '</button></div>'
    + '</article>';
}
function isAdded(id) { return Object.keys(SEL).some(function (k) { return SEL[k] === id; }); }

/* ---------- Filtros ---------- */
function match(it) {
  if (it.set !== S.set) return false;
  if (S.favOnly && !FAV[it.id]) return false;
  if (S.cat[S.set] && it.catEs !== S.cat[S.set]) return false;
  if (S.q) {
    var q = S.q.toLowerCase();
    var hay = (it.es + " " + it.jp + " " + it.tags + " " + it.id + " " + it.catEs).toLowerCase();
    if (hay.indexOf(q) < 0) return false;
  }
  return true;
}

/* ---------- Barra de herramientas ---------- */
function renderToolbar() {
  if (S.set === "build") { $("#toolbar").innerHTML = ""; return; }
  var tabs = '<button class="tab' + (!S.cat[S.set] ? " on" : "") + '" data-cat="">Todas<b>' + DB.counts[S.set] + "</b></button>";
  DB.cats[S.set].forEach(function (c) {
    tabs += '<button class="tab' + (S.cat[S.set] === c.name ? " on" : "") + '" data-cat="' + esc(c.name) + '">' + esc(c.name) + "<b>" + c.n + "</b></button>";
  });
  $("#toolbar").innerHTML = '<div class="tabs">' + tabs + "</div>"
    + '<div class="row"><input id="q" type="search" placeholder="Buscar: español / japonés / etiqueta (coletas, serafuku, twintails)" autocomplete="off">'
    + '<button class="rndbtn" id="favBtn" style="margin-left:0">★ Solo favoritos</button>'
    + '<button class="rndbtn" id="rnd2">🎲 Una al azar</button><span id="count"></span></div>';
  $("#toolbar").querySelectorAll("[data-cat]").forEach(function (b) {
    b.onclick = function () { S.cat[S.set] = b.dataset.cat; render(); };
  });
  $("#q").value = S.q;
  $("#q").oninput = function (e) { S.q = e.target.value.trim(); renderGrid(); };
  $("#favBtn").classList.toggle("on", S.favOnly);
  $("#favBtn").onclick = function () { S.favOnly = !S.favOnly; render(); };
  $("#rnd2").onclick = function () {
    var list = DB.items.filter(match); if (!list.length) return;
    openModal(list[Math.floor(Math.random() * list.length)].id);
  };
}

function renderGrid() {
  if (S.set === "build") return;
  var list = DB.items.filter(match);
  $("#grid").className = "grid " + S.set;
  $("#grid").innerHTML = list.map(cardHTML).join("");
  $("#count").textContent = "Coincidencias: " + list.length;
  $("#grid").querySelectorAll(".card").forEach(function (c) {
    var id = c.dataset.id;
    c.querySelector("img").onclick = function () { openModal(id); };
    var f = c.querySelector("[data-fav]");
    if (f) f.onclick = function (e) { e.stopPropagation(); FAV[id] ? delete FAV[id] : FAV[id] = 1; saveFav(); f.classList.toggle("on"); };
    var cp = c.querySelector("[data-copy]");
    if (cp) cp.onclick = function (e) { e.stopPropagation(); copyText(tagsOf(byId[id]), cp); };
    var ad = c.querySelector("[data-add]");
    if (ad) ad.onclick = function (e) { e.stopPropagation(); toggleAdd(byId[id]); };
    c.querySelectorAll("[data-vw]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        byId[id]._v = b.dataset.vw;
        c.outerHTML = cardHTML(byId[id]);
        renderGrid();
      };
    });
  });
}

function render() { renderToolbar(); if (S.set === "build") renderBuild(); else renderGrid(); }

/* ---------- Etiquetas y armado ---------- */
function colorTag(it) {
  if (it.set !== "hair" || it.sub !== "style_color") return "";
  var map = { black: "black hair", blonde: "blonde hair", pink: "pink hair", silver: "silver hair", brown: "" };
  var k = (it.id.split("-")[1] || "");
  return map[k] || "";
}
function tagsOf(it) {
  var t = it.tags || "";
  var c = colorTag(it);
  return c ? (t + ", " + c) : t;
}

function toggleAdd(it) {
  var k = slotKey(it);
  if (!k) return;
  if (SEL[k] === it.id) { SEL[k] = null; }
  else {
    SEL[k] = it.id;
    if (it.parent) {
      // Variante de color: reemplaza el peinado base
      SEL.style = it.parent;
    }
  }
  saveSel(); render();
}
function slotKey(it) {
  if (it.set === "outfit") return "outfit";
  if (it.set === "pose") return "pose";
  if (it.sub) return it.sub;   // style / bangs / color / acc / eye
  return null;
}

var QUAL_LABELS = [
  ["illustrious", "Illustrious / Noob"], ["anima", "Anima"],
  ["novelai", "NovelAI"], ["pony", "SDXL / Pony"], ["none", "Sin prefijo (escribir el mío)"]
];
function qualOpts() {
  return QUAL_LABELS.map(function (o) {
    return '<option value="' + o[0] + '"' + (OPT.quality === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
  }).join("");
}
var SLOT_LABEL = { style: "Peinado", bangs: "Flequillo", color: "Color de pelo", acc: "Accesorio", eye: "Ojos", outfit: "Atuendo", pose: "Pose" };

function buildPrompt() {
  var q = QUALITY[OPT.quality] || "";
  var hair = SEL.style ? byId[SEL.style] : null;
  var bangs = SEL.bangs ? byId[SEL.bangs] : null;
  var color = SEL.color ? byId[SEL.color] : null;
  var acc = SEL.acc ? byId[SEL.acc] : null;
  var eye = SEL.eye ? byId[SEL.eye] : null;
  var outfit = SEL.outfit ? byId[SEL.outfit] : null;
  var pose = SEL.pose ? byId[SEL.pose] : null;

  var fixed = [];
  if (hair) fixed.push(hair.tags);
  if (color) fixed.push(color.tags);
  if (bangs) fixed.push(bangs.tags);
  if (acc) fixed.push(acc.tags);
  if (eye) fixed.push(eye.tags);
  if (OPT.body) fixed.push(OPT.body);

  var expr = (EXPR.filter(function (x) { return x[0] === OPT.expr; })[0] || ["", ""])[1];
  var compo = (COMPO.filter(function (x) { return x[0] === OPT.compo; })[0] || ["", ""])[1];
  var bg = (BG.filter(function (x) { return x[0] === OPT.bg; })[0] || ["", ""])[1];

  var base = (pose && /2girls/.test(pose.tags)) ? ["2girls, multiple girls"] : ["1girl, solo"];
  var parts = [];
  if (q) parts.push(q);
  parts = parts.concat(base);
  if (fixed.length) parts.push(fixed.join(", "));
  if (expr) parts.push(expr);
  if (outfit) parts.push(outfit.tags);
  if (pose) parts.push(pose.tags);
  if (compo) parts.push(compo);
  if (bg) parts.push(bg);
  if (OPT.extra) parts.push(OPT.extra);
  var line = parts.join(", ").replace(/,\s*,/g, ", ").replace(/\s+/g, " ").trim();
  if (OPT.sep === "line") line = line.split(",").map(function (s) { return s.trim(); }).filter(Boolean).join(", ");
  return line;
}
var NEG = "lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, missing fingers, text, watermark, signature, jpeg artifacts, multiple views";

function renderBuild() {
  var slots = "";
  Object.keys(SLOT_LABEL).forEach(function (k) {
    var it = SEL[k] ? byId[SEL[k]] : null;
    slots += '<div class="slot2' + (it ? "" : " empty") + '">'
      + (it ? '<img src="' + thumbUrl(it.id) + '" alt="">' : '<span class="ph0"></span>')
      + '<div class="t"><div class="k">' + SLOT_LABEL[k] + "</div><div class=\"v\">" + (it ? esc(it.es) : "Sin elegir") + "</div></div>"
      + (it ? '<button class="x" data-clear="' + k + '">×</button>' : "")
      + "</div>";
  });
  function opts(list, cur) {
    return list.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (cur === o[0] ? " selected" : "") + ">" + o[0] + "</option>"; }).join("");
  }
  var html = '<div class="build">'
    + '<div class="box"><h3>① Piezas elegidas</h3><div class="slots">' + slots + "</div>"
    + '<div class="build-btns"><button id="randAll">🎲 Todo al azar</button><button id="clearAll">Vaciar todo</button></div>'
    + '<p class="mini-hint">En las páginas «Peinado / Atuendo / Pose», pulsa «Añadir al armado» en una tarjeta para colocarla; una tarjeta de peinado con color reemplaza automáticamente el peinado base.</p></div>'
    + '<div class="box"><h3>② Ajustes de generación</h3><div class="fields">'
    + "<label>Prefijo de calidad</label><select id=\"optQuality\">" + qualOpts() + "</select>"
    + "<label>Expresión</label><select id=\"optExpr\">" + opts(EXPR, OPT.expr) + "</select>"
    + "<label>Encuadre</label><select id=\"optCompo\">" + opts(COMPO, OPT.compo) + "</select>"
    + "<label>Fondo</label><select id=\"optBg\">" + opts(BG, OPT.bg) + "</select>"
    + '<label>Complexión</label><input id="optBody" type="text" placeholder="p. ej. slim, medium breasts (opcional, fila fija)" value="' + esc(OPT.body) + '">'
    + '<label>Etiquetas adicionales</label><input id="optExtra" type="text" placeholder="p. ej. looking at viewer, sitting" value="' + esc(OPT.extra) + '">'
    + '</div><p class="mini-hint">Prefijo de calidad: hay un conjunto para Illustrious / Noob, Anima, NovelAI y SDXL · Pony; elige según el modelo que uses.</p></div>'
    + '<div class="box" style="grid-column:1/-1"><h3>③ Prompt</h3>'
    + '<textarea class="out" id="outPos" readonly></textarea>'
    + '<div class="mini-hint">Prompt negativo</div><textarea class="out neg" id="outNeg" readonly></textarea>'
    + '<div class="build-btns"><button class="primary" id="copyPos">Copiar positivo</button><button id="copyNeg">Copiar negativo</button><button id="copyBoth">Copiar ambos</button></div>'
    + '<p class="mini-hint">Si solo quieres texto, copia el prompt de arriba; si el atuendo o la pose deben parecerse más, exporta además una hoja de referencia y envíala junto con el prompt.</p>'
    + '<div class="build-btns"><button id="sheetSave">Exportar hoja de referencia</button><button id="sheetCopy">Copiar hoja de referencia</button></div></div></div>';
  $("#grid").className = "grid";
  $("#grid").innerHTML = html;
  $("#outPos").value = buildPrompt();
  $("#outNeg").value = NEG;
  $("#grid").querySelectorAll("[data-clear]").forEach(function (b) {
    b.onclick = function () { SEL[b.dataset.clear] = null; saveSel(); render(); };
  });
  ["optQuality", "optExpr", "optCompo", "optBg"].forEach(function (id) {
    var el = $("#" + id);
    if (!el) return;
    el.onchange = function () {
      if (id === "optQuality") OPT.quality = el.value;
      if (id === "optExpr") OPT.expr = el.value;
      if (id === "optCompo") OPT.compo = el.value;
      if (id === "optBg") OPT.bg = el.value;
      saveSel(); $("#outPos").value = buildPrompt();
    };
  });
  $("#optBody").oninput = function (e) { OPT.body = e.target.value.trim(); saveSel(); $("#outPos").value = buildPrompt(); };
  $("#optExtra").oninput = function (e) { OPT.extra = e.target.value.trim(); saveSel(); $("#outPos").value = buildPrompt(); };
  $("#copyPos").onclick = function () { copyText($("#outPos").value, this); };
  $("#copyNeg").onclick = function () { copyText($("#outNeg").value, this); };
  $("#copyBoth").onclick = function () { copyText("POSITIVE:\n" + $("#outPos").value + "\n\nNEGATIVE:\n" + $("#outNeg").value, this); };
  $("#sheetSave").onclick = function () { exportSheet(this, false); };
  $("#sheetCopy").onclick = function () { exportSheet(this, true); };
  $("#randAll").onclick = function () {
    ["style", "bangs", "color", "acc", "eye", "outfit", "pose"].forEach(function (k) {
      var pool = DB.items.filter(function (i) { return slotKey(i) === k; });
      if (pool.length) SEL[k] = pool[Math.floor(Math.random() * pool.length)].id;
    });
    saveSel(); render();
  };
  $("#clearAll").onclick = function () { Object.keys(SEL).forEach(function (k) { SEL[k] = null; }); saveSel(); render(); };
}

/* ---------- Copiar ---------- */
function copyText(text, btn) {
  var label = btn ? btn.textContent : "";
  var done = function () { if (btn) { btn.textContent = "Copiado ✓"; setTimeout(function () { btn.textContent = label; }, 1500); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
  } else fallback(text, done);
}
function fallback(text, done) {
  var t = document.createElement("textarea");
  t.value = text; t.style.position = "fixed"; t.style.top = "-1000px";
  document.body.appendChild(t); t.select();
  try { document.execCommand("copy"); done(); } catch (e) { }
  t.remove();
}

/* ---------- Hoja de referencia ---------- */
function loadImg(url, cors) {
  return new Promise(function (resolve, reject) {
    var im = new Image();
    if (cors) im.crossOrigin = "anonymous";
    im.onload = function () { resolve(im); };
    im.onerror = function () { reject(new Error("load failed")); };
    im.src = url;
  });
}
var SHEET_ORDER = ["style", "bangs", "color", "acc", "eye", "outfit", "pose"];
function sheetItems() {
  var out = [];
  SHEET_ORDER.forEach(function (k) {
    if (SEL[k] && byId[SEL[k]]) out.push({ key: k, it: byId[SEL[k]], label: SLOT_LABEL[k] });
  });
  return out;
}
function buildSheet() {
  return new Promise(function (resolve, reject) {
    var list = sheetItems();
    if (!list.length) { reject(new Error("empty")); return; }
    var loaded = [];
    var i = 0;
    function next() {
      if (i >= list.length) { draw(); return; }
      var o = list[i++];
      loadImg(fullUrl(o.it.id), true).then(function (im) {
        loaded.push({ img: im, item: o }); next();
      }).catch(function () {
        loadImg(thumbUrl(o.it.id), true).then(function (im) {
          loaded.push({ img: im, item: o }); next();
        }).catch(function () {
          loaded.push({ img: null, item: o }); next();
        });
      });
    }
    function draw() {
      try {
        var cols = loaded.length <= 3 ? Math.max(loaded.length, 1) : 4;
        var CW = 512, CH = 680, GAP = 18, PAD = 36, LAB = 56;
        var ROWH = CH + LAB;
        var rows = Math.ceil(loaded.length / cols);
        var W = PAD * 2 + CW * cols + GAP * (cols - 1);
        var H = PAD * 2 + ROWH * rows + GAP * (rows - 1);
        var c = document.createElement("canvas");
        c.width = W; c.height = H;
        var g = c.getContext("2d");
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
        loaded.forEach(function (o, k) {
          var row = Math.floor(k / cols), col = k % cols;
          var x = PAD + col * (CW + GAP);
          var y = PAD + row * (ROWH + GAP);
          g.fillStyle = "#f6f6f8"; g.fillRect(x, y, CW, CH);
          if (o.img) {
            var im = o.img;
            var sc = Math.min((CW - 8) / im.width, (CH - 8) / im.height);
            var w = im.width * sc, h = im.height * sc;
            g.drawImage(im, x + (CW - w) / 2, y + (CH - h) / 2, w, h);
          }
          var mark = "①②③④⑤⑥⑦".charAt(k);
          g.fillStyle = "#1b1b1f";
          g.font = "600 34px sans-serif";
          g.fillText(mark + " " + o.item.label + " · " + o.item.it.es, x + 4, y + CH + 44);
        });
        c.toBlob(function (b) {
          if (b) resolve(b); else reject(new Error("toBlob"));
        }, "image/png");
      } catch (e) { reject(e); }
    }
    next();
  });
}
function saveBlob(blob, name) {
  var u = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 3000);
}
function sheetName() {
  return "chardb_" + sheetItems().map(function (o) { return o.it.id; }).join("_") + ".png";
}
function exportSheet(btn, asCopy) {
  var label = btn.textContent;
  btn.textContent = "Generando…";
  buildSheet().then(function (blob) {
    if (asCopy && navigator.clipboard && window.ClipboardItem) {
      return navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(function () {
        btn.textContent = "Imagen copiada ✓";
        setTimeout(function () { btn.textContent = label; }, 1600);
      });
    }
    saveBlob(blob, sheetName());
    btn.textContent = "Descargada ✓";
    setTimeout(function () { btn.textContent = label; }, 1600);
  }).catch(function () {
    btn.textContent = "Elige al menos una pieza";
    setTimeout(function () { btn.textContent = label; }, 2200);
  });
}

/* ---------- Ventana emergente ---------- */
var curId = null;
function openModal(id) {
  curId = id;
  var it = byId[id];
  var chain = hasLocal("img")
    ? [localBase("img") + id + ".jpg", fullUrl(id), thumbUrl(id)]
    : [fullUrl(id), thumbUrl(id)];
  var step = 0;
  $("#mimg").onerror = function () {
    step++;
    if (step < chain.length) $("#mimg").src = chain[step];
    else $("#mimg").onerror = null;
  };
  $("#mimg").src = chain[0];
  $("#mtitle").textContent = it.es;
  $("#mfields").innerHTML = "<dt>Número</dt><dd>" + it.id + "</dd><dt>Categoría</dt><dd>" + esc(it.catEs) + "</dd>"
    + "<dt>Japonés</dt><dd>" + esc(it.jp) + "</dd>";
  $("#mtags").innerHTML = it.tags.split(",").map(function (t) { return '<span class="chip en">' + esc(t.trim()) + "</span>"; }).join("");
  var full = $("#mfull");
  if (hasLocal("img")) {
    full.href = localBase("img") + id + ".jpg";
    full.setAttribute("download", id + ".jpg");
    full.removeAttribute("target");
    full.textContent = "Descargar original (local · 1024×1536)";
  } else {
    full.href = fullUrl(id);
    full.removeAttribute("download");
    full.setAttribute("target", "_blank");
    full.textContent = "Abrir original (sitio original) ↗";
  }
  var ln = $("#mline");
  if (it.set === "pose" && it.line) {
    ln.hidden = false;
    if (hasLocal("line")) {
      ln.href = localBase("line") + id + ".png";
      ln.setAttribute("download", id + ".png");
      ln.removeAttribute("target");
      ln.textContent = "Descargar lineart (local · PNG)";
    } else {
      ln.href = lineUrl(id);
      ln.removeAttribute("download");
      ln.setAttribute("target", "_blank");
      ln.textContent = "Abrir lineart (sitio original) ↗";
    }
  } else { ln.hidden = true; }
  $("#madd").textContent = isAdded(id) ? "Ya añadido ✓" : "Añadir al armado";
  $("#modal").classList.add("on");
}
function closeModal() { $("#modal").classList.remove("on"); }

$("#mclose").onclick = closeModal;
$("#modal").onclick = function (e) { if (e.target.id === "modal") closeModal(); };
$("#mcopy").onclick = function () { copyText(tagsOf(byId[curId]), this); };
$("#madd").onclick = function () { toggleAdd(byId[curId]); this.textContent = isAdded(curId) ? "Ya añadido ✓" : "Añadir al armado"; };
$("#mprev").onclick = function () { stepModal(-1); };
$("#mnext").onclick = function () { stepModal(1); };
function stepModal(d) {
  var list = DB.items.filter(match);
  if (!list.length) return;
  var i = list.findIndex(function (x) { return x.id === curId; });
  i = i < 0 ? 0 : (i + d + list.length) % list.length;
  openModal(list[i].id);
}
document.addEventListener("keydown", function (e) {
  if ($("#modal").classList.contains("on")) {
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft") { e.preventDefault(); stepModal(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); stepModal(1); }
  }
});

/* ---------- Panel de ayuda (hover) ---------- */
(function () {
  var pairs = [["tipsHover", "tipsTrigger"]];
  var wraps = [];
  pairs.forEach(function (pair) {
    var wrap = document.getElementById(pair[0]);
    var btn = document.getElementById(pair[1]);
    if (!wrap || !btn) return;
    wraps.push(wrap);
    btn.onclick = function (e) {
      e.stopPropagation();
      var open = !wrap.classList.contains("open");
      wraps.forEach(function (w) { w.classList.remove("open"); });
      wrap.classList.toggle("open", open);
    };
  });
  document.addEventListener("click", function (e) {
    if (!wraps.some(function (w) { return w.contains(e.target); })) {
      wraps.forEach(function (w) { w.classList.remove("open"); });
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") wraps.forEach(function (w) { w.classList.remove("open"); });
  });
})();

/* ---------- Navegación ---------- */
document.querySelectorAll(".nav button").forEach(function (b) {
  b.onclick = function () {
    S.set = b.dataset.set;
    document.querySelectorAll(".nav button").forEach(function (x) { x.classList.toggle("on", x === b); });
    render();
  };
});
// Por defecto se abre la página «Armar»
S.set = "build";
document.querySelectorAll(".nav button").forEach(function (x) {
  x.classList.toggle("on", x.dataset.set === "build");
});
render();
})();
