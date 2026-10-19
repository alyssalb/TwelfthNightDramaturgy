/* Concept map as a side-by-side page: Illyria on the left, our Key West on the right.
   I edit the words in data/conceptmap.json, not this file. Everything shows at once; nothing needs a click. */
(function(){
  var BASIS_DRAFT='Draft, please check';
  var GROUPS=[
    ['character','Characters',[
      ['The arrivals',['viola','sebastian','antonio']],
      ['Orsino’s side',['orsino']],
      ['Olivia’s house',['olivia','malvolio','maria','feste','toby','andrew','fabian']]]],
    ['action','What happens',null],
    ['theme','Themes',null],
    ['place','Places and culture',null]];
  var root=document.getElementById('cmap'), byId={}, data;
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}}
  function sceneLabel(id){var m=/^a(\d)s(\d)$/.exec(id);return m?['I','II','III','IV','V'][m[1]-1]+'.'+m[2]:id;}

  fetch('data/conceptmap.json').then(function(r){return r.json();}).then(function(d){
    data=d; d.nodes.forEach(function(n){byId[n.id]=n;}); build();
  }).catch(function(){root.textContent='The map data did not load. I need to run a local server (python3 -m http.server) for this page.';});

  function relations(id){ // sentences from labeled character-to-character edges
    var out=[]; data.edges.forEach(function(e){ if(!e.label)return; if(e.a!==id&&e.b!==id)return;
      out.push(byId[e.a].keys.label.split(' / ')[0]+' '+e.label+' '+byId[e.b].keys.label.split(' / ')[0]+'.'); }); return out;}

  function row(n){
    var r=el('article','cm-row'); r.id=n.id; r.dataset.type=n.type;
    var head=el('div','cm-head'); head.appendChild(el('h4',null,n.keys.label===n.illyria.label?n.keys.label:n.illyria.label+'  →  '+n.keys.label));
    var tags=el('span','cm-tags'); if(n.keys.basis==='draft'){var t=el('span','tag draft',BASIS_DRAFT); tags.appendChild(t);} head.appendChild(tags); r.appendChild(head);
    var cols=el('div','cm-cols');
    var a=el('div','cm-col il'); a.appendChild(el('p','cm-label','Illyria')); a.appendChild(el('p',null,n.illyria.note));
    var b=el('div','cm-col ks'); b.appendChild(el('p','cm-label','Our Key West')); b.appendChild(el('p',null,n.keys.note));
    cols.appendChild(a); cols.appendChild(b); r.appendChild(cols);
    var foot=el('div','cm-foot');
    if(n.type==='character'){var rel=relations(n.id); if(rel.length){var p=el('p','cm-rel'); p.appendChild(el('strong',null,'Relationships: ')); p.appendChild(document.createTextNode(rel.join(' '))); foot.appendChild(p);}}
    if(n.context&&n.context.length){var d=document.createElement('details'); d.appendChild(el('summary',null,'Shakespeare and period context'));
      var ul=el('ul'); n.context.forEach(function(c){var li=el('li'); li.appendChild(document.createTextNode(c.t+' ')); if(c.u){var l=el('a',null,'Packet page'); l.href=c.u; li.appendChild(l);} ul.appendChild(li);});
      d.appendChild(ul); foot.appendChild(d);}
    var links=el('p','cm-links');
    if(n.page){var l=el('a',null,'Read more in the packet'); l.href=n.page; links.appendChild(l);}
    if(n.scenes&&n.scenes.length){links.appendChild(document.createTextNode(n.page?'  ·  Scenes: ':'Scenes: '));
      n.scenes.forEach(function(s,i){var l=el('a',null,sceneLabel(s)); l.href='script.html#'+s; links.appendChild(l); if(i<n.scenes.length-1)links.appendChild(document.createTextNode(', '));});}
    if(links.childNodes.length)foot.appendChild(links);
    if(foot.childNodes.length)r.appendChild(foot);
    return r;}

  function build(){
    root.textContent='';
    var bar=el('div','cm-bar');
    var view=el('div','cm-view'); view.setAttribute('role','group'); view.setAttribute('aria-label','Show');
    [['both','Side by side'],['illyria','Illyria only'],['keys','Key West only']].forEach(function(p){
      var b=el('button',null,p[1]); b.type='button'; b.dataset.v=p[0];
      b.addEventListener('click',function(){setView(p[0]);}); view.appendChild(b);});
    var nav=el('nav','cm-nav'); nav.setAttribute('aria-label','Sections');
    GROUPS.forEach(function(g){var a=el('a',null,g[1]); a.href='#sec-'+g[0]; nav.appendChild(a);});
    bar.appendChild(view); bar.appendChild(nav); root.appendChild(bar);
    GROUPS.forEach(function(g){
      var sec=el('section','cm-sec'); sec.id='sec-'+g[0]; sec.appendChild(el('h3',null,g[1]));
      if(g[2]){g[2].forEach(function(sub){sec.appendChild(el('h5','cm-sub',sub[0])); sub[1].forEach(function(id){sec.appendChild(row(byId[id]));});});}
      else data.nodes.filter(function(n){return n.type===g[0];}).forEach(function(n){sec.appendChild(row(n));});
      root.appendChild(sec);});
    root.appendChild(el('p','cm-legend muted','A dashed tag marks a draft I still need to check.'));
    var v=store('tn-cm-view'); setView(v==='illyria'||v==='keys'?v:'both');
    if(location.hash){var t=document.getElementById(location.hash.slice(1)); if(t)t.scrollIntoView();}
  }
  function setView(v){ root.dataset.view=v; store('tn-cm-view',v);
    Array.prototype.forEach.call(root.querySelectorAll('.cm-view button'),function(b){b.setAttribute('aria-pressed',b.dataset.v===v);}); }
})();
