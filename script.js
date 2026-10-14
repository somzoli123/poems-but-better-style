/* ====== ITT TUDOD EGYSZERŰEN HOZZÁADNI A KÖLTŐKET ÉS VERSEKET ======
   Új költő: írj be egy új sort  "Név": [ ... ],
   Új vers:  {title:"Cím", tags:["téma"], text:`a vers szövege`}              */
const KOLTOK = {
  // "Petőfi Sándor": [
  //   {title:"Vers címe", tags:["szerelem"], text:`a vers szövege`},
  // ],
};
const VERSEK = Object.entries(KOLTOK).flatMap(([author,list]) => list.map(v => ({...v, author})));

let extra = [];
try { extra = JSON.parse(localStorage.getItem("extraVersek") || "[]"); } catch(e) { extra = []; }
let hidden = [], hiddenPoets = [];
try { const d = JSON.parse(localStorage.getItem("torolt") || "{}"); hidden = d.h || []; hiddenPoets = d.p || []; } catch(e) {}
const pid = v => v.author + "|" + v.title;
const all = () => VERSEK.concat(extra).filter(v => !hidden.includes(pid(v)) && !hiddenPoets.includes(v.author));
const persist = () => { try { localStorage.setItem("extraVersek", JSON.stringify(extra)); localStorage.setItem("torolt", JSON.stringify({h:hidden,p:hiddenPoets})); } catch(e) {} };
function delPoem(v){ extra = extra.filter(e => pid(e) !== pid(v)); if(!hidden.includes(pid(v))) hidden.push(pid(v)); persist(); }
function delPoet(n){ extra = extra.filter(e => e.author !== n); if(!hiddenPoets.includes(n)) hiddenPoets.push(n); activePoet = "mind"; persist(); }

const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ő/g,"o").replace(/ű/g,"u");
let activePoet = "mind", sort = "abc";

const isLove = v => v.tags.some(t => /szerel|romant/.test(norm(t)));
function burst(x, y){
  for(let n = 0; n < 12; n++){
    const h = document.createElement("span");
    h.className = "fly"; h.textContent = "♥";
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
    h.style.left = x + "px"; h.style.top = y + "px";
    h.style.fontSize = (10 + Math.random() * 14) + "px";
    h.style.setProperty("--dx", Math.cos(a) * d + "px");
    h.style.setProperty("--dy", Math.sin(a) * d - 30 + "px");
    h.style.setProperty("--r", (Math.random() * 60 - 30) + "deg");
    h.addEventListener("animationend", () => h.remove());
    document.body.appendChild(h);
  }
}
function rise(r){
  for(let n = 0; n < 14; n++){
    const h = document.createElement("span");
    h.className = "rise"; h.textContent = "♥";
    h.style.left = (r.left + 12 + Math.random() * (r.width - 24)) + "px";
    h.style.top = (r.bottom - 14 - Math.random() * r.height * .5) + "px";
    h.style.fontSize = (11 + Math.random() * 14) + "px";
    h.style.setProperty("--up", (90 + Math.random() * 130) + "px");
    h.style.setProperty("--sx", (Math.random() * 50 - 25) + "px");
    h.style.setProperty("--t", (1 + Math.random() * .6) + "s");
    h.style.animationDelay = (Math.random() * .3) + "s";
    h.addEventListener("animationend", () => h.remove());
    document.body.appendChild(h);
  }
}
function hl(text, q){
  const e = esc(text);
  if(!q) return e;
  const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")","gi");
  return e.replace(re,"<mark>$1</mark>");
}

function renderFilters(){
  const names = [...new Set([...Object.keys(KOLTOK), ...all().map(v=>v.author)])].filter(n => !hiddenPoets.includes(n));
  const cnt = n => all().filter(v=>v.author===n).length;
  $("filters").innerHTML = `<button class="chip ${activePoet==="mind"?"on":""}" data-t="mind">Minden költő</button>`
    + names.map(n => `<button class="chip ${n===activePoet?"on":""}" data-t="${esc(n)}">${esc(n)} <small>${cnt(n)}</small></button>`).join("")
    + `<select id="sort"><option value="abc">A–Z</option><option value="zyx">Z–A</option></select>`;
  $("sort").value = sort;
  $("sort").onchange = e => { sort = e.target.value; render(); };
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { activePoet = b.dataset.t; renderFilters(); render(); });
  $("poets").innerHTML = names.map(n => `<option value="${esc(n)}">`).join("");
}

function render(){
  const q = $("q").value.trim();
  const nq = norm(q);
  let list = all().map((v,i)=>({...v,i})).filter(v =>
    (activePoet==="mind" || v.author===activePoet) &&
    (!nq || norm(v.title+" "+v.author+" "+v.tags.join(" ")+" "+v.text).includes(nq)));
  list.sort((a,b)=> a.title.localeCompare(b.title,"hu") * (sort==="abc"?1:-1));
  $("count").innerHTML = list.length + " vers" + (activePoet !== "mind" ? ` <button class="del" id="delPoet">Költő törlése</button>` : "");
  if($("delPoet")) $("delPoet").onclick = function(){
    if(this.dataset.s){ delPoet(activePoet); renderFilters(); render(); }
    else { this.dataset.s = 1; this.textContent = "Biztosan törlöd az összes versével?"; this.classList.add("sure"); }
  };
  if(!list.length){ $("grid").innerHTML = `<div class="empty" style="grid-column:1/-1">${all().length ? "Nincs találat." : "Még nincs egyetlen vers sem.<br>Kattints az „+ Új vers” gombra, és add hozzá az elsőt."}</div>`; return; }
  $("grid").innerHTML = list.map(v => `
    <button class="card${isLove(v)?" love":""}" data-i="${v.i}">${isLove(v)?'<span class="hearts" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></span>':""}
      <h2>${hl(v.title,q)}</h2>
      <span class="author">${esc(v.author)}</span>
      <p>${v.text ? hl(v.text.split("\n").slice(0,3).join("\n"),q) : "A vers szövege még hiányzik."}</p>
      <div class="tags">${v.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    </button>`).join("");
  document.querySelectorAll(".card").forEach(c => c.onclick = e => {
    const i = +c.dataset.i;
    if(isLove(all()[i])){
      let x = e.clientX, y = e.clientY;
      if(!x && !y){ const r = c.getBoundingClientRect(); x = r.left + r.width/2; y = r.top + r.height/2; }
      burst(x, y);
      rise(c.getBoundingClientRect());
      const calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
      setTimeout(() => openPoem(i), calm ? 0 : 650);
      return;
    }
    openPoem(i);
  });
}

function openPoem(i){
  const v = all()[i];
  $("viewBody").innerHTML = `<h2>${esc(v.title)}</h2><div class="hint">${esc(v.author)}</div>
    <div class="poem">${v.text ? esc(v.text) : "<span class='hint'>A vers szövege még hiányzik. Add hozzá a VERSEK listában vagy az „Új vers” gombbal.</span>"}</div>
    <div class="tags" style="margin-bottom:18px">${v.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="row"><button class="del" id="delPoem">Vers törlése</button><button class="btn ghost" id="closeView">Bezár</button></div>`;
  $("closeView").onclick = () => $("view").close();
  $("delPoem").onclick = function(){
    if(this.dataset.s){ delPoem(v); $("view").close(); renderFilters(); render(); }
    else { this.dataset.s = 1; this.textContent = "Biztosan törlöd?"; this.classList.add("sure"); }
  };
  $("view").showModal();
}

$("q").addEventListener("input", render);
$("addBtn").onclick = () => $("add").showModal();
$("cancelAdd").onclick = () => $("add").close();
$("saveAdd").onclick = () => {
  const title = $("nTitle").value.trim();
  if(!title){ $("nTitle").focus(); return; }
  const v = {
    title, author: $("nAuthor").value.trim() || "Ismeretlen",
    tags: $("nTags").value.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean),
    text: $("nText").value.trim()
  };
  hiddenPoets = hiddenPoets.filter(p => p !== v.author);
  hidden = hidden.filter(h => h !== pid(v));
  extra = extra.filter(e => pid(e) !== pid(v));
  extra.push(v);
  persist();
  ["nTitle","nTags","nText"].forEach(id => $(id).value = "");
  $("add").close(); renderFilters(); render();
};
[$("view"),$("add")].forEach(d => d.addEventListener("click", e => { if(e.target===d) d.close(); }));

renderFilters(); render();