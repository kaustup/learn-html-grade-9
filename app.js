/* ══════════════════════════════════════════════
   WEBDEV SPACE ACADEMY — app.js
   Full game logic · All content · Grade 9
══════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   STAR CANVAS
──────────────────────────────────────────── */
(function(){
  const c = document.getElementById('bgCanvas');
  const x = c.getContext('2d');
  let S = [];
  function resize(){ c.width = innerWidth; c.height = innerHeight; }
  function make(){
    S = [];
    for(let i=0;i<180;i++) S.push({
      x:Math.random()*c.width, y:Math.random()*c.height,
      r:Math.random()*1.5+0.3, a:Math.random(),
      sp:0.003+Math.random()*0.007,
      col:Math.random()<0.1?'255,107,53':Math.random()<0.15?'0,229,192':'200,210,255'
    });
  }
  function draw(){
    x.clearRect(0,0,c.width,c.height);
    S.forEach(s=>{ s.a+=s.sp; const al=0.15+0.85*Math.abs(Math.sin(s.a));
      x.beginPath(); x.arc(s.x,s.y,s.r,0,Math.PI*2);
      x.fillStyle=`rgba(${s.col},${al})`; x.fill(); });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{ resize(); make(); });
  resize(); make(); draw();
})();

/* ────────────────────────────────────────────
   AUDIO (Web Audio API — no files)
──────────────────────────────────────────── */
const SFX = (function(){
  let ctx;
  function get(){ if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
  function beep(freq,dur,type='square',vol=0.15){
    try{
      const c=get(), o=c.createOscillator(), g=c.createGain();
      o.connect(g); g.connect(c.destination);
      o.frequency.value=freq; o.type=type;
      g.gain.setValueAtTime(vol,c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);
      o.start(c.currentTime); o.stop(c.currentTime+dur);
    }catch(e){}
  }
  return {
    correct(){ beep(523,0.1,'sine',0.1); setTimeout(()=>beep(659,0.12,'sine',0.12),100); },
    wrong()  { beep(200,0.3,'sawtooth',0.12); },
    click()  { beep(440,0.05,'sine',0.08); },
    boss()   { beep(110,0.4,'square',0.15); setTimeout(()=>beep(90,0.3,'square',0.12),200); },
    victory(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.2,'sine',0.15),i*150)); },
    levelup(){ [392,494,587,784].forEach((f,i)=>setTimeout(()=>beep(f,0.15,'triangle',0.13),i*120)); },
  };
})();

/* ────────────────────────────────────────────
   TOAST
──────────────────────────────────────────── */
let _toastT;
function toast(msg, type=''){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(_toastT);
  _toastT = setTimeout(()=> el.classList.remove('show'), 2200);
}

/* ────────────────────────────────────────────
   XP POP
──────────────────────────────────────────── */
function xpPop(msg){
  const el = document.getElementById('xpPop');
  el.textContent = msg;
  el.classList.remove('burst');
  void el.offsetWidth;
  el.classList.add('burst');
}

/* ────────────────────────────────────────────
   CONFETTI
──────────────────────────────────────────── */
function confetti(n=60){
  const cols=['#ff6b35','#ffd700','#00e5c0','#ff3fa4','#3db8ff','#00e676'];
  for(let i=0;i<n;i++){
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random()*100+'vw';
    el.style.top = '-12px';
    el.style.background = cols[Math.floor(Math.random()*cols.length)];
    el.style.animationDuration = (1.8+Math.random()*2)+'s';
    el.style.animationDelay = (Math.random()*0.8)+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 4000);
  }
}

/* ────────────────────────────────────────────
   SCREEN ROUTER
──────────────────────────────────────────── */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

/* ────────────────────────────────────────────
   GAME STATE
──────────────────────────────────────────── */
const S = {
  name:    localStorage.getItem('sa_name') || 'Cadet',
  xp:      parseInt(localStorage.getItem('sa_xp') || '0'),
  cleared: JSON.parse(localStorage.getItem('sa_cleared') || '[]'), // level ids beaten
  stars:   JSON.parse(localStorage.getItem('sa_stars') || '{}'),   // levelId -> stars
  lives: 3,
  currentLevel: null,
  topicIndex: 0,
  quizScore: 0,
  quizQ: 0,
  streak: 0,
  sessionXP: 0,

  save(){
    localStorage.setItem('sa_name', this.name);
    localStorage.setItem('sa_xp', this.xp);
    localStorage.setItem('sa_cleared', JSON.stringify(this.cleared));
    localStorage.setItem('sa_stars', JSON.stringify(this.stars));
  },
  addXP(n){
    this.xp = Math.min(9999, this.xp + n);
    this.sessionXP += n;
    this.save();
    xpPop('+' + n + ' XP!');
    refreshMapXP();
  },
  isCleared(id){ return this.cleared.includes(id); },
  clearLevel(id, stars=3){
    if(!this.cleared.includes(id)) this.cleared.push(id);
    if((this.stars[id]||0) < stars) this.stars[id] = stars;
    this.save();
  },
  loseLife(){
    this.lives = Math.max(0, this.lives - 1);
    refreshHearts();
    if(this.lives <= 0) return true;
    return false;
  },
  resetLives(){ this.lives = 3; refreshHearts(); }
};

function refreshHearts(){
  const h = '❤️'.repeat(S.lives) + '🖤'.repeat(Math.max(0,3-S.lives));
  document.querySelectorAll('.tb-hearts, #mapHearts').forEach(el=>el.textContent = h);
}
function refreshMapXP(){
  const pct = Math.min(100, (S.xp/1000)*100);
  const fill = document.getElementById('mapXpFill');
  const lbl  = document.getElementById('mapXpLabel');
  if(fill) fill.style.width = pct + '%';
  if(lbl)  lbl.textContent  = S.xp + ' XP';
}

/* ────────────────────────────────────────────
   LEVELS DATA
──────────────────────────────────────────── */
const LEVELS = [
  /* ─── HTML LEVELS ─── */
  {
    id:'h1', type:'html', num:1,
    title:'What is HTML?',
    sub:'Intro · Structure · Basic Tags',
    tags:['intro','structure'],
    topics:[
      { title:'What is HTML?', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lesson 1</p>
          <p class="tc-title html-c">What is HTML?</p>
          <p class="tc-explain">
            <strong>HTML</strong> stands for <em>HyperText Markup Language</em>.<br/><br/>
            It is the <strong>standard language</strong> for building web pages. Every website you open in a browser is made with HTML.<br/><br/>
            🧠 Think of HTML as the <strong>skeleton</strong> of a webpage — it gives it structure and shape. CSS adds style. JavaScript adds behaviour.
          </p>
          <div class="tc-tip"><span class="tc-tip-icon">💡</span><div class="tc-tip-text"><strong>HyperText</strong> = text that links to other text. <strong>Markup</strong> = using tags to label/structure content. HTML was invented by <strong>Tim Berners-Lee</strong> in 1991. Latest version: <strong>HTML5</strong>.</div></div>
          <div class="tc-tip"><span class="tc-tip-icon">🎯</span><div class="tc-tip-text">HTML is <strong>NOT</strong> a programming language — it cannot do calculations or logic. It is a <strong>markup language</strong> — it tells the browser what content to show and how to structure it.</div></div>
        `
      },
      { title:'HTML Tags', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lesson 2</p>
          <p class="tc-title html-c">HTML Tags</p>
          <p class="tc-explain">
            HTML uses <strong>tags</strong> to label content. Tags go inside <em>angle brackets</em> <code>&lt; &gt;</code>.
          </p>
          <p class="tc-code-label">Tag Syntax</p>
          <div class="tc-code"><span class="t">&lt;tagname&gt;</span> content <span class="t">&lt;/tagname&gt;</span></div>
          <table class="tc-table">
            <tr><th>Type</th><th>Description</th><th>Example</th></tr>
            <tr><td class="tc">Container Tag</td><td class="dc">Has opening AND closing tag</td><td class="tc">&lt;p&gt;...&lt;/p&gt;</td></tr>
            <tr><td class="tc">Empty Tag</td><td class="dc">No closing tag needed</td><td class="tc">&lt;br&gt; &lt;hr&gt; &lt;img&gt;</td></tr>
          </table>
          <div class="tc-tip"><span class="tc-tip-icon">📌</span><div class="tc-tip-text">Closing tags have a <strong>/</strong> before the name: <code>&lt;/p&gt;</code>, <code>&lt;/h1&gt;</code>. Empty tags like <code>&lt;br&gt;</code> and <code>&lt;img&gt;</code> have NO closing tag.</div></div>
        `
      },
      { title:'HTML Attributes', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lesson 3</p>
          <p class="tc-title html-c">HTML Attributes</p>
          <p class="tc-explain">Attributes give <strong>extra information</strong> to tags. Always inside the opening tag as <code>name="value"</code>.</p>
          <p class="tc-code-label">Syntax</p>
          <div class="tc-code"><span class="t">&lt;tagname</span> <span class="a">attribute</span>=<span class="v">"value"</span><span class="t">&gt;</span>content<span class="t">&lt;/tagname&gt;</span></div>
          <p class="tc-code-label">Examples</p>
          <div class="tc-code"><span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"https://google.com"</span><span class="t">&gt;</span>Google<span class="t">&lt;/a&gt;</span>
<span class="t">&lt;img</span> <span class="a">src</span>=<span class="v">"photo.jpg"</span> <span class="a">width</span>=<span class="v">"200"</span><span class="t">&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Centred text<span class="t">&lt;/p&gt;</span></div>
          <table class="tc-table">
            <tr><th>Attribute</th><th>Used on</th><th>Effect</th></tr>
            <tr><td class="ac">href</td><td class="tc">&lt;a&gt;</td><td class="dc">Link URL</td></tr>
            <tr><td class="ac">src</td><td class="tc">&lt;img&gt;</td><td class="dc">Image path</td></tr>
            <tr><td class="ac">align</td><td class="tc">many</td><td class="dc">left / center / right</td></tr>
            <tr><td class="ac">color</td><td class="tc">&lt;font&gt;</td><td class="dc">Text colour</td></tr>
            <tr><td class="ac">width/height</td><td class="tc">&lt;img&gt; &lt;table&gt;</td><td class="dc">Size in px or %</td></tr>
          </table>
        `
      },
      { title:'Basic HTML Structure', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lesson 4</p>
          <p class="tc-title html-c">Basic HTML Structure</p>
          <p class="tc-explain">Every HTML file must follow this <strong>standard template</strong>:</p>
          <p class="tc-code-label">Complete Template</p>
          <div class="tc-code"><span class="t">&lt;!DOCTYPE html&gt;</span>   <span class="cm">← declares HTML5</span>
<span class="t">&lt;html&gt;</span>            <span class="cm">← root element</span>

  <span class="t">&lt;head&gt;</span>          <span class="cm">← NOT visible to user</span>
    <span class="t">&lt;title&gt;</span>My Page<span class="t">&lt;/title&gt;</span>  <span class="cm">← browser tab name</span>
  <span class="t">&lt;/head&gt;</span>

  <span class="t">&lt;body&gt;</span>          <span class="cm">← everything user SEES</span>
    <span class="t">&lt;h1&gt;</span>Hello World!<span class="t">&lt;/h1&gt;</span>
    <span class="t">&lt;p&gt;</span>My first page.<span class="t">&lt;/p&gt;</span>
  <span class="t">&lt;/body&gt;</span>

<span class="t">&lt;/html&gt;</span></div>
          <div class="tc-tip"><span class="tc-tip-icon">🧠</span><div class="tc-tip-text"><code>&lt;!DOCTYPE html&gt;</code> must ALWAYS be the first line. <code>&lt;head&gt;</code> = hidden info. <code>&lt;body&gt;</code> = everything the user sees.</div></div>
        `
      },
    ],
    quiz:[
      { q:"What does HTML stand for?", sub:"html",
        opts:["HyperText Markup Language","High Tech Modern Language","HyperTransfer Markup Links","Home Tool Markup Language"],
        ans:0, exp:"HTML = HyperText Markup Language. Invented by Tim Berners-Lee in 1991." },
      { q:"Which tag is used to make a line break?", sub:"html",
        opts:["&lt;lb&gt;","&lt;br&gt;","&lt;newline&gt;","&lt;break&gt;"],
        ans:1, exp:"&lt;br&gt; is an empty tag that inserts a line break. No closing tag!" },
      { q:"What type of tag is &lt;img&gt;?", sub:"html",
        opts:["Container tag","Pair tag","Empty tag","Block tag"],
        ans:2, exp:"&lt;img&gt; is an empty tag — no closing tag, no content inside." },
      { q:"Where does visible content go in HTML?", sub:"html",
        opts:["&lt;head&gt;","&lt;title&gt;","&lt;meta&gt;","&lt;body&gt;"],
        ans:3, exp:"The &lt;body&gt; tag holds everything the user sees on the page." },
      { q:"What must be the FIRST line of every HTML5 document?", sub:"html",
        opts:["&lt;html&gt;","&lt;head&gt;","&lt;!DOCTYPE html&gt;","&lt;title&gt;"],
        ans:2, exp:"&lt;!DOCTYPE html&gt; tells the browser to use HTML5. Always write it first!" },
    ],
    boss:{
      emoji:'👾',
      task:'Write a basic HTML page with the correct structure. It must have: DOCTYPE declaration, html tag, head with a title tag, and a body with one h1 heading.',
      hints:['Start with &lt;!DOCTYPE html&gt;','Then &lt;html&gt;, &lt;head&gt;, &lt;body&gt;','Put &lt;title&gt; inside &lt;head&gt;','Put &lt;h1&gt; inside &lt;body&gt;'],
      checks:[
        { label:'DOCTYPE declared',  test: c => /<!DOCTYPE\s+html>/i.test(c) },
        { label:'<html> tag',        test: c => /<html[\s>]/i.test(c) && /<\/html>/i.test(c) },
        { label:'<head> with title', test: c => /<head[\s>]/i.test(c) && /<title>[\s\S]+<\/title>/i.test(c) },
        { label:'<body> tag',        test: c => /<body[\s>]/i.test(c) && /<\/body>/i.test(c) },
        { label:'<h1> heading',      test: c => /<h1[\s>]/i.test(c) && /<\/h1>/i.test(c) },
      ]
    }
  },

  {
    id:'h2', type:'html', num:2,
    title:'Paragraphs & Text',
    sub:'&lt;p&gt; · Headings · Text styles · Comments',
    tags:['p','h1-h6','br','hr','sup','sub'],
    topics:[
      { title:'Paragraphs & Headings', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Text</p>
          <p class="tc-title html-c">Paragraphs &amp; Headings</p>
          <p class="tc-code-label">Paragraph &lt;p&gt;</p>
          <div class="tc-code"><span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Centred paragraph.<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"right"</span><span class="t">&gt;</span>Right aligned.<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"justify"</span><span class="t">&gt;</span>Justified text.<span class="t">&lt;/p&gt;</span></div>
          <p class="tc-code-label">Headings — h1 (biggest) to h6 (smallest)</p>
          <div class="tc-code"><span class="t">&lt;h1</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Main Title<span class="t">&lt;/h1&gt;</span>
<span class="t">&lt;h2&gt;</span>Section Title<span class="t">&lt;/h2&gt;</span>
<span class="t">&lt;h3&gt;</span>Sub-section<span class="t">&lt;/h3&gt;</span>
<span class="cm">/* h4, h5, h6 — getting smaller */</span></div>
          <p class="tc-preview-label">🔍 Browser Output</p>
          <div class="tc-preview"><h1 style="font-size:1.5rem;margin:0">h1 — Biggest</h1><h2 style="font-size:1.2rem;margin:2px 0">h2</h2><h3 style="font-size:1rem;margin:2px 0">h3</h3><h4 style="font-size:0.85rem;margin:2px 0">h4</h4></div>
          <div class="tc-tip"><span class="tc-tip-icon">🧠</span><div class="tc-tip-text">Use only <strong>one &lt;h1&gt;</strong> per page — it's the main title. Use h2, h3 for sections. Headings help search engines (SEO)!</div></div>
        `
      },
      { title:'Comment, BR & HR', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lesson</p>
          <p class="tc-title html-c">Comment, &lt;br&gt; and &lt;hr&gt;</p>
          <p class="tc-code-label">HTML Comment</p>
          <div class="tc-code"><span class="cm">&lt;!-- This is a comment. Browser ignores it! --&gt;
&lt;!-- Used to write notes in your code --&gt;</span></div>
          <p class="tc-code-label">&lt;br&gt; — Line Break (empty tag)</p>
          <div class="tc-code"><span class="t">&lt;p&gt;</span>Line one.<span class="t">&lt;br&gt;</span>Line two here.<span class="t">&lt;/p&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview">Line one.<br/>Line two here.</div>
          <p class="tc-code-label">&lt;hr&gt; — Horizontal Rule (empty tag)</p>
          <div class="tc-code"><span class="t">&lt;p&gt;</span>Above the line<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;hr&gt;</span>
<span class="t">&lt;p&gt;</span>Below the line<span class="t">&lt;/p&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview">Above the line<hr style="border-color:#aaa;margin:5px 0"/>Below the line</div>
        `
      },
      { title:'Text Style Tags', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Text Styles</p>
          <p class="tc-title html-c">Text Style Tags</p>
          <table class="tc-table">
            <tr><th>Tag</th><th>Name</th><th>Effect</th></tr>
            <tr><td class="tc">&lt;sup&gt;</td><td>Superscript</td><td class="dc">Raises text UP — like x²</td></tr>
            <tr><td class="tc">&lt;sub&gt;</td><td>Subscript</td><td class="dc">Lowers text DOWN — like H₂O</td></tr>
            <tr><td class="tc">&lt;u&gt;</td><td>Underline</td><td class="dc">Underlines the text</td></tr>
            <tr><td class="tc">&lt;i&gt;</td><td>Italic</td><td class="dc">Slants text right</td></tr>
            <tr><td class="tc">&lt;b&gt;</td><td>Bold</td><td class="dc">Makes text thick</td></tr>
            <tr><td class="tc">&lt;strong&gt;</td><td>Strong/Bold</td><td class="dc">Bold + semantic importance</td></tr>
          </table>
          <p class="tc-code-label">Code Examples</p>
          <div class="tc-code">H<span class="t">&lt;sub&gt;</span>2<span class="t">&lt;/sub&gt;</span>O    <span class="cm">→ H₂O</span>
x<span class="t">&lt;sup&gt;</span>2<span class="t">&lt;/sup&gt;</span>     <span class="cm">→ x²</span>
<span class="t">&lt;u&gt;</span>Underline<span class="t">&lt;/u&gt;</span>
<span class="t">&lt;i&gt;</span>Italic<span class="t">&lt;/i&gt;</span>
<span class="t">&lt;b&gt;</span>Bold<span class="t">&lt;/b&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview">H<sub>2</sub>O &nbsp;|&nbsp; x<sup>2</sup> &nbsp;|&nbsp; <u>Underline</u> &nbsp;|&nbsp; <i>Italic</i> &nbsp;|&nbsp; <b>Bold</b></div>
        `
      },
    ],
    quiz:[
      { q:"Which tag makes text appear ABOVE the normal line (like x²)?", sub:"html",
        opts:["&lt;sub&gt;","&lt;up&gt;","&lt;sup&gt;","&lt;raise&gt;"],
        ans:2, exp:"&lt;sup&gt; = Superscript. It raises text up. Use for powers, footnotes, etc." },
      { q:"Which tag makes text appear BELOW the normal line (like H₂O)?", sub:"html",
        opts:["&lt;sup&gt;","&lt;down&gt;","&lt;low&gt;","&lt;sub&gt;"],
        ans:3, exp:"&lt;sub&gt; = Subscript. It lowers text. Use for chemical formulas like H₂O." },
      { q:"What does &lt;hr&gt; create?", sub:"html",
        opts:["A heading row","A hyperlink reference","A horizontal line","A header"],
        ans:2, exp:"&lt;hr&gt; = Horizontal Rule. It draws a horizontal dividing line across the page." },
      { q:"How do you write a comment in HTML?", sub:"html",
        opts:["// comment","/* comment */","&lt;!-- comment --&gt;","# comment"],
        ans:2, exp:"HTML comments use &lt;!-- --&gt;. The browser completely ignores them." },
      { q:"Which attribute aligns a paragraph to the center?", sub:"html",
        opts:["position='center'","text='center'","align='center'","placement='center'"],
        ans:2, exp:"The align attribute controls text alignment: left, center, right, or justify." },
    ],
    boss:{
      emoji:'👾',
      task:'Write HTML that shows: a centred h1 heading with your name, a paragraph below it, a horizontal rule, and text showing the water formula H₂O using the correct subscript tag.',
      hints:['Use &lt;h1 align="center"&gt;','&lt;p&gt; for paragraph','&lt;hr&gt; for the line','H&lt;sub&gt;2&lt;/sub&gt;O for water formula'],
      checks:[
        { label:'&lt;h1&gt; with align', test: c => /<h1[^>]*align/i.test(c) },
        { label:'&lt;p&gt; paragraph',   test: c => /<p[\s>]/i.test(c) },
        { label:'&lt;hr&gt; line',       test: c => /<hr[\s/>]/i.test(c) },
        { label:'&lt;sub&gt; for H₂O',  test: c => /<sub>/i.test(c) },
      ]
    }
  },

  {
    id:'h3', type:'html', num:3,
    title:'Colours & Marquee',
    sub:'Colour codes · &lt;marquee&gt; · &lt;font&gt;',
    tags:['color','hex','rgb','marquee'],
    topics:[
      { title:'Colour Codes', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Colours</p>
          <p class="tc-title html-c">Basic Colour Codes</p>
          <p class="tc-explain">Colours in HTML can be written in <strong>3 ways</strong>:</p>
          <table class="tc-table">
            <tr><th>Method</th><th>Example</th><th>Notes</th></tr>
            <tr><td>Name</td><td class="tc">red, blue, green</td><td class="dc">147 named colours</td></tr>
            <tr><td>Hex</td><td class="tc">#FF0000</td><td class="dc"># + 6 hex digits (RRGGBB)</td></tr>
            <tr><td>RGB</td><td class="tc">rgb(255,0,0)</td><td class="dc">R,G,B each 0–255</td></tr>
          </table>
          <div class="swatch-row">
            <div class="swatch"><div class="swatch-box" style="background:#FF0000"></div><div class="swatch-txt">#FF0000<br/>Red</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#00FF00"></div><div class="swatch-txt">#00FF00<br/>Green</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#0000FF"></div><div class="swatch-txt">#0000FF<br/>Blue</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#FFFF00"></div><div class="swatch-txt">#FFFF00<br/>Yellow</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#FF00FF"></div><div class="swatch-txt">#FF00FF<br/>Magenta</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#00FFFF"></div><div class="swatch-txt">#00FFFF<br/>Cyan</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#000000;border:1px solid #444"></div><div class="swatch-txt">#000000<br/>Black</div></div>
            <div class="swatch"><div class="swatch-box" style="background:#FFFFFF;border:1px solid #ccc"></div><div class="swatch-txt">#FFFFFF<br/>White</div></div>
          </div>
          <p class="tc-code-label">Using Colours</p>
          <div class="tc-code"><span class="t">&lt;font</span> <span class="a">color</span>=<span class="v">"red"</span><span class="t">&gt;</span>Red text<span class="t">&lt;/font&gt;</span>
<span class="t">&lt;font</span> <span class="a">color</span>=<span class="v">"#FF6B35"</span><span class="t">&gt;</span>Orange (hex)<span class="t">&lt;/font&gt;</span>
<span class="t">&lt;body</span> <span class="a">bgcolor</span>=<span class="v">"#000000"</span><span class="t">&gt;</span>  <span class="cm">← black bg</span></div>
        `
      },
      { title:'Marquee Tag', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Marquee</p>
          <p class="tc-title html-c">Marquee Tag</p>
          <p class="tc-explain">The <strong>&lt;marquee&gt;</strong> tag makes text <em>scroll automatically</em> across the screen.</p>
          <p class="tc-preview-label">🔍 Live Demo</p>
          <div class="tc-preview"><marquee style="color:#d44;font-weight:bold">⚡ Scrolling text — old school style! ⚡</marquee></div>
          <p class="tc-code-label">With Attributes</p>
          <div class="tc-code"><span class="t">&lt;marquee</span> <span class="a">direction</span>=<span class="v">"right"</span>
         <span class="a">behavior</span>=<span class="v">"bounce"</span>
         <span class="a">scrollamount</span>=<span class="v">"5"</span>
         <span class="a">bgcolor</span>=<span class="v">"yellow"</span><span class="t">&gt;</span>
  Bouncing Text!
<span class="t">&lt;/marquee&gt;</span></div>
          <table class="tc-table">
            <tr><th>Attribute</th><th>Values</th><th>Effect</th></tr>
            <tr><td class="ac">direction</td><td class="tc">left, right, up, down</td><td class="dc">Scroll direction</td></tr>
            <tr><td class="ac">behavior</td><td class="tc">scroll, slide, bounce</td><td class="dc">bounce = back and forth</td></tr>
            <tr><td class="ac">scrollamount</td><td class="tc">number (1–20)</td><td class="dc">Speed — higher = faster</td></tr>
            <tr><td class="ac">bgcolor</td><td class="tc">colour / #hex</td><td class="dc">Background colour</td></tr>
            <tr><td class="ac">width/height</td><td class="tc">px or %</td><td class="dc">Size of marquee box</td></tr>
            <tr><td class="ac">loop</td><td class="tc">number or -1</td><td class="dc">-1 = loop forever</td></tr>
          </table>
        `
      },
    ],
    quiz:[
      { q:"Which colour code represents pure RED in hex?", sub:"html",
        opts:["#00FF00","#0000FF","#FF0000","#FFFF00"],
        ans:2, exp:"#FF0000 = pure red. Hex codes are RRGGBB — FF=255, 00=0. So FF0000 = max red, no green, no blue." },
      { q:"What does the marquee attribute 'behavior=bounce' do?", sub:"html",
        opts:["Scrolls left only","Makes text bounce up and down","Text goes back and forth","Spins the text"],
        ans:2, exp:"behavior='bounce' makes the marquee text bounce back and forth between the edges." },
      { q:"Which HTML attribute sets the background colour of a page?", sub:"html",
        opts:["background","bgcolor","color","pagecolor"],
        ans:1, exp:"bgcolor sets the background colour: &lt;body bgcolor='yellow'&gt;. It also works on &lt;table&gt;, &lt;tr&gt;, &lt;td&gt;." },
      { q:"In RGB, what colour is rgb(0,0,255)?", sub:"html",
        opts:["Red","Green","Blue","Yellow"],
        ans:2, exp:"RGB(0,0,255) = pure Blue. R=0 (no red), G=0 (no green), B=255 (max blue)." },
      { q:"What does the marquee 'scrollamount' attribute control?", sub:"html",
        opts:["The number of scrollbars","The scroll direction","The speed of scrolling","The loop count"],
        ans:2, exp:"scrollamount controls the speed. Higher number = faster scrolling." },
    ],
    boss:{
      emoji:'👾',
      task:'Write HTML with: a body that has a yellow background, a red h1 heading using the font color attribute, and a marquee that bounces with scrollamount of 3.',
      hints:['&lt;body bgcolor="yellow"&gt;','&lt;font color="red"&gt;heading&lt;/font&gt;','&lt;marquee behavior="bounce" scrollamount="3"&gt;'],
      checks:[
        { label:'bgcolor on body',     test: c => /<body[^>]*bgcolor/i.test(c) },
        { label:'font color attribute', test: c => /<font[^>]*color/i.test(c) },
        { label:'&lt;marquee&gt; tag', test: c => /<marquee/i.test(c) },
        { label:'behavior=bounce',      test: c => /behavior\s*=\s*["']bounce["']/i.test(c) },
        { label:'scrollamount set',     test: c => /scrollamount/i.test(c) },
      ]
    }
  },

  {
    id:'h4', type:'html', num:4,
    title:'Links & Images',
    sub:'&lt;a&gt; anchor tag · &lt;img&gt; tag',
    tags:['a','href','img','src','alt'],
    topics:[
      { title:'Anchor Tag', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Links</p>
          <p class="tc-title html-c">Anchor Tag &lt;a&gt;</p>
          <p class="tc-explain">The <strong>&lt;a&gt;</strong> tag creates <em>hyperlinks</em> — clickable text that takes you to another page, file, or section.</p>
          <p class="tc-code-label">Types of Links</p>
          <div class="tc-code"><span class="cm"><!-- External website --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"https://google.com"</span><span class="t">&gt;</span>Google<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- New tab --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"page.html"</span> <span class="a">target</span>=<span class="v">"_blank"</span><span class="t">&gt;</span>New Tab<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- Email link --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"mailto:me@mail.com"</span><span class="t">&gt;</span>Email Me<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- Same-page anchor --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"#section2"</span><span class="t">&gt;</span>Jump to Section 2<span class="t">&lt;/a&gt;</span>
<span class="t">&lt;h2</span> <span class="a">id</span>=<span class="v">"section2"</span><span class="t">&gt;</span>Section 2<span class="t">&lt;/h2&gt;</span></div>
          <table class="tc-table">
            <tr><th>Attribute</th><th>Values</th><th>Purpose</th></tr>
            <tr><td class="ac">href</td><td class="tc">URL / #id / mailto:</td><td class="dc">The destination</td></tr>
            <tr><td class="ac">target</td><td class="tc">_blank, _self</td><td class="dc">_blank = new tab</td></tr>
            <tr><td class="ac">title</td><td class="tc">any text</td><td class="dc">Tooltip on hover</td></tr>
            <tr><td class="ac">name</td><td class="tc">any text</td><td class="dc">Creates a bookmark</td></tr>
          </table>
        `
      },
      { title:'Image Tag', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Images</p>
          <p class="tc-title html-c">Image Tag &lt;img&gt;</p>
          <p class="tc-explain">The <strong>&lt;img&gt;</strong> tag is an <em>empty tag</em> that displays an image. No closing tag!</p>
          <p class="tc-code-label">Syntax</p>
          <div class="tc-code"><span class="t">&lt;img</span> <span class="a">src</span>=<span class="v">"photo.jpg"</span>
     <span class="a">alt</span>=<span class="v">"A photo"</span>
     <span class="a">width</span>=<span class="v">"300"</span>
     <span class="a">height</span>=<span class="v">"200"</span>
     <span class="a">align</span>=<span class="v">"center"</span>
     <span class="a">border</span>=<span class="v">"2"</span><span class="t">&gt;</span></div>
          <table class="tc-table">
            <tr><th>Attribute</th><th>Required?</th><th>Purpose</th></tr>
            <tr><td class="ac">src</td><td>✅ Yes</td><td class="dc">Path to image file</td></tr>
            <tr><td class="ac">alt</td><td>✅ Yes</td><td class="dc">Text if image fails to load</td></tr>
            <tr><td class="ac">width</td><td>Optional</td><td class="dc">Width in px or %</td></tr>
            <tr><td class="ac">height</td><td>Optional</td><td class="dc">Height in px or %</td></tr>
            <tr><td class="ac">align</td><td>Optional</td><td class="dc">left/right/middle/top/bottom</td></tr>
            <tr><td class="ac">border</td><td>Optional</td><td class="dc">Border thickness in px</td></tr>
          </table>
          <div class="tc-tip"><span class="tc-tip-icon">♿</span><div class="tc-tip-text">Always include <strong>alt</strong>! Screen readers for visually impaired users read this text. Also shown when image fails to load.</div></div>
        `
      },
    ],
    quiz:[
      { q:"Which attribute in &lt;a&gt; specifies the link destination?", sub:"html",
        opts:["src","link","href","url"],
        ans:2, exp:"href (HyperText Reference) holds the URL/destination. It's the most important attribute of &lt;a&gt;." },
      { q:"What does target='_blank' do in a link?", sub:"html",
        opts:["Opens in same tab","Downloads the file","Opens in new tab","Creates a bookmark"],
        ans:2, exp:"target='_blank' opens the linked page in a brand new browser tab." },
      { q:"Which attribute provides alternative text for an image?", sub:"html",
        opts:["title","src","text","alt"],
        ans:3, exp:"alt provides alternative text. It's read by screen readers and shown when the image fails to load." },
      { q:"How do you create a link to open an email client?", sub:"html",
        opts:["href='email:me@mail.com'","href='mail:me@mail.com'","href='mailto:me@mail.com'","href='send:me@mail.com'"],
        ans:2, exp:"Use mailto: in the href. Example: href='mailto:you@email.com' — opens the user's email app." },
      { q:"&lt;img&gt; is an example of which type of tag?", sub:"html",
        opts:["Container tag","Semantic tag","Empty tag","Block tag"],
        ans:2, exp:"&lt;img&gt; is an empty tag. It has no closing tag and no content between tags." },
    ],
    boss:{
      emoji:'👾',
      task:'Write HTML with: an image tag (any src, with alt text, width 200), and two links — one opening google.com in a new tab, and one email link.',
      hints:['&lt;img src="..." alt="..." width="200"&gt;','&lt;a href="https://google.com" target="_blank"&gt;','&lt;a href="mailto:your@email.com"&gt;'],
      checks:[
        { label:'&lt;img&gt; with src',    test: c => /<img[^>]+src/i.test(c) },
        { label:'img has alt text',        test: c => /<img[^>]+alt\s*=/i.test(c) },
        { label:'&lt;a&gt; with href',     test: c => /<a[^>]+href/i.test(c) },
        { label:'target="_blank"',         test: c => /target\s*=\s*["']_blank["']/i.test(c) },
        { label:'mailto: link',            test: c => /href\s*=\s*["']mailto:/i.test(c) },
      ]
    }
  },

  {
    id:'h5', type:'html', num:5,
    title:'Lists',
    sub:'&lt;ul&gt; · &lt;ol&gt; · &lt;li&gt; · type &amp; start',
    tags:['ul','ol','li'],
    topics:[
      { title:'HTML Lists', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Lists</p>
          <p class="tc-title html-c">HTML Lists</p>
          <p class="tc-code-label">&lt;ul&gt; — Unordered List (bullet points)</p>
          <div class="tc-code"><span class="t">&lt;ul</span> <span class="a">type</span>=<span class="v">"disc"</span><span class="t">&gt;</span>   <span class="cm">← disc / circle / square</span>
  <span class="t">&lt;li&gt;</span>HTML<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>CSS<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>JavaScript<span class="t">&lt;/li&gt;</span>
<span class="t">&lt;/ul&gt;</span></div>
          <p class="tc-code-label">&lt;ol&gt; — Ordered List (numbered)</p>
          <div class="tc-code"><span class="t">&lt;ol</span> <span class="a">type</span>=<span class="v">"1"</span> <span class="a">start</span>=<span class="v">"1"</span><span class="t">&gt;</span>  <span class="cm">← 1/A/a/I/i</span>
  <span class="t">&lt;li&gt;</span>First<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>Second<span class="t">&lt;/li&gt;</span>
<span class="t">&lt;/ol&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview" style="display:flex;gap:2rem;flex-wrap:wrap">
            <div><strong>UL:</strong><ul style="margin:4px 0 0 18px"><li>HTML</li><li>CSS</li></ul></div>
            <div><strong>OL(1):</strong><ol style="margin:4px 0 0 18px"><li>First</li><li>Second</li></ol></div>
            <div><strong>OL(A):</strong><ol type="A" style="margin:4px 0 0 18px"><li>One</li><li>Two</li></ol></div>
          </div>
          <table class="tc-table">
            <tr><th>ul type</th><th>ol type</th></tr>
            <tr><td class="tc">disc ● &nbsp; circle ○ &nbsp; square ■</td><td class="tc">1 &nbsp; A &nbsp; a &nbsp; I (Roman) &nbsp; i</td></tr>
          </table>
          <div class="tc-tip"><span class="tc-tip-icon">📌</span><div class="tc-tip-text">The <strong>start</strong> attribute on &lt;ol&gt; lets you start from any number. <code>&lt;ol start="5"&gt;</code> begins at 5, 6, 7...</div></div>
        `
      },
    ],
    quiz:[
      { q:"Which tag creates an unordered (bullet point) list?", sub:"html",
        opts:["&lt;ol&gt;","&lt;list&gt;","&lt;ul&gt;","&lt;bl&gt;"],
        ans:2, exp:"&lt;ul&gt; = Unordered List. Items appear with bullet points. &lt;ol&gt; = Ordered (numbered) List." },
      { q:"Which tag defines each item in a list?", sub:"html",
        opts:["&lt;item&gt;","&lt;li&gt;","&lt;list-item&gt;","&lt;point&gt;"],
        ans:1, exp:"&lt;li&gt; = List Item. It goes inside both &lt;ul&gt; and &lt;ol&gt;." },
      { q:"What does type='A' do on an &lt;ol&gt; list?", sub:"html",
        opts:["Makes bullets appear","Numbers with Arabic numerals","Numbers with capital letters (A,B,C...)","Uses Roman numerals"],
        ans:2, exp:"type='A' uses capital letters (A, B, C...). type='a' uses lowercase. type='I' uses Roman numerals." },
      { q:"Which attribute makes an ordered list start from number 5?", sub:"html",
        opts:["begin='5'","from='5'","first='5'","start='5'"],
        ans:3, exp:"The start attribute sets the starting number. &lt;ol start='5'&gt; begins counting at 5." },
      { q:"What does type='disc' mean on a &lt;ul&gt;?", sub:"html",
        opts:["Numbered list","Filled circle bullets ●","Empty circle bullets ○","Square bullets ■"],
        ans:1, exp:"type='disc' = filled circle bullets ●. type='circle' = empty ○. type='square' = squares ■." },
    ],
    boss:{
      emoji:'👾',
      task:'Write HTML with TWO lists: (1) an unordered list with type="square" showing 3 subjects you study, (2) an ordered list with type="A" starting at 2, showing 3 your favourite foods.',
      hints:['&lt;ul type="square"&gt; ... &lt;/ul&gt;','&lt;ol type="A" start="2"&gt; ... &lt;/ol&gt;','Each item needs &lt;li&gt;...&lt;/li&gt;'],
      checks:[
        { label:'&lt;ul&gt; present',       test: c => /<ul[\s>]/i.test(c) },
        { label:'ul type="square"',        test: c => /<ul[^>]*type\s*=\s*["']square["']/i.test(c) },
        { label:'&lt;ol&gt; present',       test: c => /<ol[\s>]/i.test(c) },
        { label:'ol type="A"',             test: c => /<ol[^>]*type\s*=\s*["']A["']/i.test(c) },
        { label:'start="2" on ol',         test: c => /start\s*=\s*["']2["']/i.test(c) },
        { label:'3+ &lt;li&gt; items',     test: c => (c.match(/<li[\s>]/gi)||[]).length >= 3 },
      ]
    }
  },

  {
    id:'h6', type:'html', num:6,
    title:'Tables',
    sub:'&lt;table&gt; · &lt;tr&gt; &lt;td&gt; &lt;th&gt; · colspan · rowspan',
    tags:['table','tr','td','th','colspan','rowspan'],
    topics:[
      { title:'HTML Tables', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Tables</p>
          <p class="tc-title html-c">HTML Tables</p>
          <p class="tc-code-label">Full Table Example</p>
          <div class="tc-code"><span class="t">&lt;table</span> <span class="a">border</span>=<span class="v">"1"</span> <span class="a">width</span>=<span class="v">"100%"</span> <span class="a">cellpadding</span>=<span class="v">"5"</span><span class="t">&gt;</span>
  <span class="t">&lt;caption&gt;</span>Student Results<span class="t">&lt;/caption&gt;</span>
  <span class="t">&lt;tr&gt;</span>
    <span class="t">&lt;th&gt;</span>Name<span class="t">&lt;/th&gt;</span>
    <span class="t">&lt;th&gt;</span>Marks<span class="t">&lt;/th&gt;</span>
  <span class="t">&lt;/tr&gt;</span>
  <span class="t">&lt;tr&gt;</span>
    <span class="t">&lt;td&gt;</span>Kaustup<span class="t">&lt;/td&gt;</span>
    <span class="t">&lt;td&gt;</span>98<span class="t">&lt;/td&gt;</span>
  <span class="t">&lt;/tr&gt;</span>
<span class="t">&lt;/table&gt;</span></div>
          <table class="tc-table">
            <tr><th>Tag</th><th>Meaning</th><th>Purpose</th></tr>
            <tr><td class="tc">&lt;table&gt;</td><td>Table</td><td class="dc">Container for whole table</td></tr>
            <tr><td class="tc">&lt;caption&gt;</td><td>Caption</td><td class="dc">Title shown above table</td></tr>
            <tr><td class="tc">&lt;tr&gt;</td><td>Table Row</td><td class="dc">A horizontal row</td></tr>
            <tr><td class="tc">&lt;th&gt;</td><td>Table Header</td><td class="dc">Header cell — bold &amp; centred</td></tr>
            <tr><td class="tc">&lt;td&gt;</td><td>Table Data</td><td class="dc">Regular data cell</td></tr>
          </table>
          <table class="tc-table">
            <tr><th>Attribute</th><th>On tag</th><th>Effect</th></tr>
            <tr><td class="ac">border</td><td class="tc">&lt;table&gt;</td><td class="dc">Border thickness</td></tr>
            <tr><td class="ac">cellpadding</td><td class="tc">&lt;table&gt;</td><td class="dc">Space inside cells</td></tr>
            <tr><td class="ac">cellspacing</td><td class="tc">&lt;table&gt;</td><td class="dc">Space between cells</td></tr>
            <tr><td class="ac">bgcolor</td><td class="tc">table/tr/td</td><td class="dc">Background colour</td></tr>
            <tr><td class="ac">colspan</td><td class="tc">&lt;td&gt;/&lt;th&gt;</td><td class="dc">Merge columns →</td></tr>
            <tr><td class="ac">rowspan</td><td class="tc">&lt;td&gt;/&lt;th&gt;</td><td class="dc">Merge rows ↓</td></tr>
          </table>
        `
      },
      { title:'Colspan & Rowspan', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Tables</p>
          <p class="tc-title html-c">Colspan &amp; Rowspan</p>
          <p class="tc-explain"><strong>colspan</strong> merges cells <em>horizontally</em>. <strong>rowspan</strong> merges cells <em>vertically</em>.</p>
          <p class="tc-code-label">colspan Example</p>
          <div class="tc-code"><span class="t">&lt;td</span> <span class="a">colspan</span>=<span class="v">"3"</span><span class="t">&gt;</span>Spans 3 columns<span class="t">&lt;/td&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview"><table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:0.82rem;color:#222"><tr><td colspan="3" style="background:#ffe0d0;text-align:center;font-weight:bold">Merged — colspan="3"</td></tr><tr><td>A</td><td>B</td><td>C</td></tr></table></div>
          <p class="tc-code-label">rowspan Example</p>
          <div class="tc-code"><span class="t">&lt;td</span> <span class="a">rowspan</span>=<span class="v">"2"</span><span class="t">&gt;</span>Spans 2 rows<span class="t">&lt;/td&gt;</span></div>
          <div class="tc-tip"><span class="tc-tip-icon">⚠️</span><div class="tc-tip-text">When using colspan="2", that row needs <strong>one fewer &lt;td&gt;</strong>. Same rule for rowspan — the next row needs one fewer cell too!</div></div>
        `
      },
    ],
    quiz:[
      { q:"Which tag creates a table header cell (bold and centred by default)?", sub:"html",
        opts:["&lt;td&gt;","&lt;tr&gt;","&lt;th&gt;","&lt;header&gt;"],
        ans:2, exp:"&lt;th&gt; = Table Header. Bold and centred by default. &lt;td&gt; = Table Data — regular cells." },
      { q:"What does 'colspan=2' do in a table cell?", sub:"html",
        opts:["Creates 2 extra rows","Merges the cell across 2 columns","Sets cell width to 2px","Adds 2 borders"],
        ans:1, exp:"colspan merges cells HORIZONTALLY. colspan='2' makes one cell span across 2 columns." },
      { q:"Which attribute adds space INSIDE table cells?", sub:"html",
        opts:["cellspacing","padding","cellpadding","margin"],
        ans:2, exp:"cellpadding adds space between the cell content and the cell border (space inside). cellspacing adds space between cells." },
      { q:"What does &lt;caption&gt; do in a table?", sub:"html",
        opts:["Creates a table header row","Adds a title above the table","Makes all cells bold","Merges the first row"],
        ans:1, exp:"&lt;caption&gt; adds a visible title above (or below) the table. It goes right after the &lt;table&gt; tag." },
      { q:"Which tag represents a single horizontal row in a table?", sub:"html",
        opts:["&lt;td&gt;","&lt;row&gt;","&lt;th&gt;","&lt;tr&gt;"],
        ans:3, exp:"&lt;tr&gt; = Table Row. It wraps all the cells (&lt;td&gt; and &lt;th&gt;) in one row." },
    ],
    boss:{
      emoji:'👾',
      task:'Write a table about 3 students with columns: Name, Subject, Marks. Include: border, caption, th headers, 3 data rows, and make the first header span 2 columns using colspan.',
      hints:['&lt;table border="1"&gt;','&lt;caption&gt;Student Results&lt;/caption&gt;','&lt;th colspan="2"&gt; for merged header','3 rows of &lt;tr&gt;&lt;td&gt;...&lt;/td&gt;&lt;/tr&gt;'],
      checks:[
        { label:'&lt;table&gt; with border',  test: c => /<table[^>]*border/i.test(c) },
        { label:'&lt;caption&gt; present',    test: c => /<caption>/i.test(c) },
        { label:'&lt;th&gt; headers',         test: c => /<th[\s>]/i.test(c) },
        { label:'colspan used',              test: c => /colspan/i.test(c) },
        { label:'3+ &lt;tr&gt; data rows',   test: c => (c.match(/<tr[\s>]/gi)||[]).length >= 4 },
        { label:'&lt;td&gt; cells present',  test: c => /<td[\s>]/i.test(c) },
      ]
    }
  },

  {
    id:'h7', type:'html', num:7,
    title:'Forms',
    sub:'&lt;form&gt; · input types · textarea · select · buttons',
    tags:['form','input','textarea','select','radio','checkbox'],
    topics:[
      { title:'HTML Forms', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Forms</p>
          <p class="tc-title html-c">HTML Forms — Full</p>
          <p class="tc-explain">Forms collect <strong>user input</strong> and send it to a server. The <strong>&lt;form&gt;</strong> wraps all form elements.</p>
          <p class="tc-code-label">Complete Form</p>
          <div class="tc-code"><span class="t">&lt;form</span> <span class="a">action</span>=<span class="v">"submit.php"</span> <span class="a">method</span>=<span class="v">"post"</span><span class="t">&gt;</span>

  Name: <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"text"</span> <span class="a">name</span>=<span class="v">"uname"</span><span class="t">&gt;</span>
  Pass: <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"password"</span> <span class="a">name</span>=<span class="v">"pass"</span><span class="t">&gt;</span>

  Message:
  <span class="t">&lt;textarea</span> <span class="a">rows</span>=<span class="v">"4"</span> <span class="a">cols</span>=<span class="v">"30"</span><span class="t">&gt;&lt;/textarea&gt;</span>

  Gender:
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"radio"</span> <span class="a">name</span>=<span class="v">"gender"</span><span class="t">&gt;</span> Male
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"radio"</span> <span class="a">name</span>=<span class="v">"gender"</span><span class="t">&gt;</span> Female

  Hobbies:
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"checkbox"</span> <span class="a">name</span>=<span class="v">"chess"</span><span class="t">&gt;</span> Chess
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"checkbox"</span> <span class="a">name</span>=<span class="v">"code"</span><span class="t">&gt;</span>  Coding

  Country:
  <span class="t">&lt;select</span> <span class="a">name</span>=<span class="v">"country"</span><span class="t">&gt;</span>
    <span class="t">&lt;option</span> <span class="a">value</span>=<span class="v">"np"</span><span class="t">&gt;</span>Nepal<span class="t">&lt;/option&gt;</span>
    <span class="t">&lt;option</span> <span class="a">value</span>=<span class="v">"in"</span><span class="t">&gt;</span>India<span class="t">&lt;/option&gt;</span>
  <span class="t">&lt;/select&gt;</span>

  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"submit"</span> <span class="a">value</span>=<span class="v">"Submit"</span><span class="t">&gt;</span>
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"reset"</span>  <span class="a">value</span>=<span class="v">"Clear"</span><span class="t">&gt;</span>

<span class="t">&lt;/form&gt;</span></div>
          <table class="tc-table">
            <tr><th>Element</th><th>What it creates</th></tr>
            <tr><td class="tc">input type="text"</td><td class="dc">Single-line text box</td></tr>
            <tr><td class="tc">input type="password"</td><td class="dc">Password — hides characters</td></tr>
            <tr><td class="tc">textarea</td><td class="dc">Multi-line text area</td></tr>
            <tr><td class="tc">input type="radio"</td><td class="dc">Round button — pick ONE only</td></tr>
            <tr><td class="tc">input type="checkbox"</td><td class="dc">Square box — pick MULTIPLE</td></tr>
            <tr><td class="tc">select + option</td><td class="dc">Dropdown menu</td></tr>
            <tr><td class="tc">input type="submit"</td><td class="dc">Button — sends form</td></tr>
            <tr><td class="tc">input type="reset"</td><td class="dc">Button — clears form</td></tr>
          </table>
          <div class="tc-tip"><span class="tc-tip-icon">💡</span><div class="tc-tip-text">Radio buttons in the same group must have the <strong>same name</strong>. This ensures only ONE can be selected. Checkboxes can have different names — you can tick multiple!</div></div>
        `
      },
      { title:'Div Tag', badge:'html',
        content:`
          <p class="tc-badge html-b">HTML · Div</p>
          <p class="tc-title html-c">The &lt;div&gt; Tag</p>
          <p class="tc-explain">The <strong>&lt;div&gt;</strong> is a <em>block-level container</em>. It groups HTML elements together. <strong>div = division</strong>.</p>
          <p class="tc-code-label">Example</p>
          <div class="tc-code"><span class="t">&lt;div</span> <span class="a">style</span>=<span class="v">"background:lightblue; padding:10px;"</span><span class="t">&gt;</span>
  <span class="t">&lt;h2&gt;</span>I am inside a div!<span class="t">&lt;/h2&gt;</span>
  <span class="t">&lt;p&gt;</span>Divs group elements together 📦<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;/div&gt;</span>

<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"header"</span><span class="t">&gt;</span>  Page Header  <span class="t">&lt;/div&gt;</span>
<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"content"</span><span class="t">&gt;</span> Main Content <span class="t">&lt;/div&gt;</span>
<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"footer"</span><span class="t">&gt;</span>  Page Footer  <span class="t">&lt;/div&gt;</span></div>
          <p class="tc-preview-label">🔍 Output</p>
          <div class="tc-preview"><div style="background:lightblue;padding:8px;border-radius:5px;font-size:0.85rem;color:#222"><strong>I am inside a div!</strong><br/>Divs group elements together 📦</div></div>
          <div class="tc-tip"><span class="tc-tip-icon">🧠</span><div class="tc-tip-text">&lt;div&gt; is invisible on its own. It becomes powerful when you add CSS to it. It's the <strong>most used tag</strong> in modern web design for creating layouts!</div></div>
        `
      },
    ],
    quiz:[
      { q:"Which form element lets you pick ONLY ONE option from a group?", sub:"html",
        opts:["checkbox","select","textarea","radio"],
        ans:3, exp:"Radio buttons allow only ONE selection. All radio buttons in a group must share the same 'name' attribute." },
      { q:"What does a &lt;textarea&gt; create?", sub:"html",
        opts:["A single line text box","A dropdown menu","A multi-line text input area","A checkbox"],
        ans:2, exp:"&lt;textarea&gt; creates a multi-line text area. You can resize it. Attributes: rows and cols control size." },
      { q:"Which input type hides characters as the user types?", sub:"html",
        opts:["type='hidden'","type='secret'","type='password'","type='text'"],
        ans:2, exp:"type='password' hides characters (shows ● or *). type='hidden' hides the whole input from view." },
      { q:"Which element creates a dropdown menu in a form?", sub:"html",
        opts:["&lt;input type='dropdown'&gt;","&lt;menu&gt;","&lt;select&gt;","&lt;option&gt;"],
        ans:2, exp:"&lt;select&gt; creates the dropdown container. &lt;option&gt; tags inside define each choice." },
      { q:"What does the 'action' attribute on a form do?", sub:"html",
        opts:["Styles the form","Specifies where to send form data","Sets the form method","Validates the inputs"],
        ans:1, exp:"The action attribute is the URL where form data is sent when submitted. Example: action='submit.php'." },
    ],
    boss:{
      emoji:'👹',
      task:'Write a complete student registration form with: a text input for name, password input, a textarea for address, radio buttons for gender (Male/Female with same name), checkboxes for 2 subjects, a select dropdown with 3 options, and submit + reset buttons.',
      hints:['&lt;form action="#" method="post"&gt;','Radio buttons need same name="gender"','&lt;select&gt; needs &lt;option&gt; inside','End with submit and reset buttons'],
      checks:[
        { label:'&lt;form&gt; tag',           test: c => /<form[\s>]/i.test(c) },
        { label:'input type="text"',          test: c => /type\s*=\s*["']text["']/i.test(c) },
        { label:'input type="password"',      test: c => /type\s*=\s*["']password["']/i.test(c) },
        { label:'&lt;textarea&gt;',            test: c => /<textarea/i.test(c) },
        { label:'radio buttons',              test: c => /type\s*=\s*["']radio["']/i.test(c) },
        { label:'radio same name',            test: c => {
          const m = c.match(/type\s*=\s*["']radio["'][^>]*name\s*=\s*["']([^"']+)["']/gi) ||
                    c.match(/name\s*=\s*["']([^"']+)["'][^>]*type\s*=\s*["']radio["']/gi);
          return m && m.length >= 2;
        }},
        { label:'checkboxes',                 test: c => /type\s*=\s*["']checkbox["']/i.test(c) },
        { label:'&lt;select&gt; dropdown',    test: c => /<select/i.test(c) && /<option/i.test(c) },
        { label:'submit button',              test: c => /type\s*=\s*["']submit["']/i.test(c) },
        { label:'reset button',               test: c => /type\s*=\s*["']reset["']/i.test(c) },
      ]
    }
  },

  /* ─── CSS LEVELS ─── */
  {
    id:'c1', type:'css', num:8,
    title:'CSS Intro & Syntax',
    sub:'What is CSS · Types · Syntax · Selectors',
    tags:['css','syntax','selectors'],
    topics:[
      { title:'What is CSS?', badge:'css',
        content:`
          <p class="tc-badge css-b">CSS · Intro</p>
          <p class="tc-title css-c">What is CSS?</p>
          <p class="tc-explain">
            <strong>CSS</strong> = <em>Cascading Style Sheets</em>.<br/><br/>
            It controls the <strong>visual appearance</strong> of HTML — colours, fonts, sizes, spacing, layout.<br/><br/>
            🎨 HTML = skeleton. CSS = clothes and makeup!
          </p>
          <p class="tc-code-label">CSS Syntax</p>
          <div class="tc-code"><span class="p">selector</span> {
  <span class="a">property</span>: <span class="v">value</span>;
  <span class="a">property</span>: <span class="v">value</span>;
}

<span class="cm">/* Real example */</span>
<span class="p">h1</span> {
  <span class="a">color</span>: <span class="v">red</span>;
  <span class="a">font-size</span>: <span class="v">24px</span>;
  <span class="a">text-align</span>: <span class="v">center</span>;
}</div>
          <div class="tc-tip"><span class="tc-tip-icon">🔑</span><div class="tc-tip-text">Every CSS rule has 3 parts: <strong>Selector</strong> (who to style) → <strong>Property</strong> (what to change) → <strong>Value</strong> (what to set). Each line ends with a <strong>semicolon ;</strong></div></div>
        `
      },
      { title:'Types of CSS', badge:'css',
        content:`
          <p class="tc-badge css-b">CSS · Types</p>
          <p class="tc-title css-c">Types of CSS</p>
          <table class="tc-table">
            <tr><th>Type</th><th>Where</th><th>Best for</th></tr>
            <tr><td style="color:#ff8c69">Inline</td><td class="dc">Inside HTML tag — style attribute</td><td class="dc">Quick one-off changes</td></tr>
            <tr><td style="color:#ffd700">Internal</td><td class="dc">&lt;style&gt; tag in &lt;head&gt;</td><td class="dc">Single page</td></tr>
            <tr><td style="color:#00e5c0">External</td><td class="dc">Separate .css file + &lt;link&gt;</td><td class="dc">Whole website ✅ BEST!</td></tr>
          </table>
          <p class="tc-code-label">1. Inline</p>
          <div class="tc-code"><span class="t">&lt;p</span> <span class="a">style</span>=<span class="v">"color:red; font-size:18px;"</span><span class="t">&gt;</span>Red text<span class="t">&lt;/p&gt;</span></div>
          <p class="tc-code-label">2. Internal (in &lt;head&gt;)</p>
          <div class="tc-code"><span class="t">&lt;style&gt;</span>
  <span class="p">p</span> { <span class="a">color</span>: <span class="v">blue</span>; }
<span class="t">&lt;/style&gt;</span></div>
          <p class="tc-code-label">3. External (best practice)</p>
          <div class="tc-code"><span class="t">&lt;link</span> <span class="a">rel</span>=<span class="v">"stylesheet"</span> <span class="a">href</span>=<span class="v">"style.css"</span><span class="t">&gt;</span></div>
          <div class="tc-tip"><span class="tc-tip-icon">⭐</span><div class="tc-tip-text">External CSS is the <strong>best practice</strong>. One .css file can style ALL pages of a website. Change it once → whole site updates!</div></div>
        `
      },
      { title:'CSS Selectors', badge:'css',
        content:`
          <p class="tc-badge css-b">CSS · Selectors</p>
          <p class="tc-title css-c">CSS Selectors</p>
          <p class="tc-explain">A <strong>selector</strong> tells CSS <em>which HTML element</em> to style.</p>
          <table class="tc-table">
            <tr><th>Selector</th><th>Symbol</th><th>Targets</th></tr>
            <tr><td>Universal</td><td class="tc">*</td><td class="dc">ALL elements</td></tr>
            <tr><td>Element</td><td class="tc">p, h1</td><td class="dc">All of that tag type</td></tr>
            <tr><td>Class</td><td class="tc">.classname</td><td class="dc">Elements with that class</td></tr>
            <tr><td>ID</td><td class="tc">#idname</td><td class="dc">ONE specific element</td></tr>
            <tr><td>Descendant</td><td class="tc">div p</td><td class="dc">All &lt;p&gt; inside &lt;div&gt;</td></tr>
            <tr><td>Grouping</td><td class="tc">h1, h2</td><td class="dc">Multiple elements, same style</td></tr>
            <tr><td>Pseudo</td><td class="tc">a:hover</td><td class="dc">Element in specific state</td></tr>
          </table>
          <p class="tc-code-label">Examples</p>
          <div class="tc-code"><span class="p">*</span>       { <span class="a">margin</span>: <span class="v">0</span>; }
<span class="p">p</span>       { <span class="a">color</span>: <span class="v">blue</span>; }
<span class="p">.card</span>   { <span class="a">background</span>: <span class="v">white</span>; }
<span class="p">#header</span> { <span class="a">font-size</span>: <span class="v">2rem</span>; }
<span class="p">div p</span>   { <span class="a">color</span>: <span class="v">green</span>; }
<span class="p">h1, h2</span>  { <span class="a">font-weight</span>: <span class="v">bold</span>; }
<span class="p">a:hover</span> { <span class="a">color</span>: <span class="v">red</span>; }</div>
          <div class="tc-tip"><span class="tc-tip-icon">🧠</span><div class="tc-tip-text"><strong>Specificity:</strong> Inline style &gt; ID (#) &gt; Class (.) &gt; Element. Higher specificity wins when rules conflict!</div></div>
        `
      },
    ],
    quiz:[
      { q:"What does CSS stand for?", sub:"css",
        opts:["Computer Style Sheets","Cascading Style Sheets","Creative Styling Syntax","Colorful Sheet System"],
        ans:1, exp:"CSS = Cascading Style Sheets. 'Cascading' means styles flow from parent to child elements." },
      { q:"Which CSS selector targets elements with class='box'?", sub:"css",
        opts:["#box","box",".box","*box"],
        ans:2, exp:"Classes use a dot (.) prefix. .box targets ALL elements with class='box'." },
      { q:"Which type of CSS is considered best practice?", sub:"css",
        opts:["Inline CSS","Internal CSS","External CSS","All equal"],
        ans:2, exp:"External CSS — one file styles the whole website. Change once, update everywhere!" },
      { q:"What symbol is used for the CSS ID selector?", sub:"css",
        opts:[".","*","#","@"],
        ans:2, exp:"# is for ID selectors. #header targets the element with id='header'." },
      { q:"What does a:hover target?", sub:"css",
        opts:["All anchor tags","An anchor when clicked","An anchor when mouse hovers over it","An anchor with href"],
        ans:2, exp:"a:hover is a pseudo-class — it targets &lt;a&gt; elements when the user's mouse is hovering over them." },
    ],
    boss:{
      emoji:'🤖',
      task:'Write a CSS file (style.css) that: resets margin and padding for all elements (*), styles body with a light background and Arial font, styles h1 with orange color and centered alignment, styles p with font-size 16px and line-height 1.6, and adds a red color on a:hover.',
      hints:['* { margin: 0; padding: 0; }','body { background: #f5f5f5; font-family: Arial; }','h1 { color: orange; text-align: center; }','a:hover { color: red; }'],
      checks:[
        { label:'* reset',                test: c => /\*\s*{[^}]*margin\s*:\s*0/i.test(c) },
        { label:'body background',        test: c => /body\s*{[^}]*background/i.test(c) },
        { label:'h1 styled',              test: c => /h1\s*{/i.test(c) },
        { label:'h1 color',               test: c => /h1\s*{[^}]*color/i.test(c) },
        { label:'p font-size',            test: c => /p\s*{[^}]*font-size/i.test(c) },
        { label:'a:hover rule',           test: c => /a\s*:\s*hover\s*{/i.test(c) },
      ]
    }
  },

  {
    id:'c2', type:'css', num:9,
    title:'CSS Properties',
    sub:'Text · Background · Border · Sizing',
    tags:['color','font','background','border','padding','margin'],
    topics:[
      { title:'CSS Text & Font Properties', badge:'css',
        content:`
          <p class="tc-badge css-b">CSS · Properties</p>
          <p class="tc-title css-c">Text &amp; Font Properties</p>
          <p class="tc-code-label">All Main Text Properties</p>
          <div class="tc-code"><span class="p">p</span> {
  <span class="a">color</span>: <span class="v">red</span>;                    <span class="cm">/* text colour */</span>
  <span class="a">font-size</span>: <span class="v">18px</span>;              <span class="cm">/* text size */</span>
  <span class="a">font-family</span>: <span class="v">Arial, sans-serif</span>;
  <span class="a">font-weight</span>: <span class="v">bold</span>;             <span class="cm">/* bold/normal/100-900 */</span>
  <span class="a">font-style</span>: <span class="v">italic</span>;
  <span class="a">text-align</span>: <span class="v">center</span>;          <span class="cm">/* left/right/justify */</span>
  <span class="a">text-decoration</span>: <span class="v">underline</span>;   <span class="cm">/* none/line-through */</span>
  <span class="a">line-height</span>: <span class="v">1.6</span>;
  <span class="a">letter-spacing</span>: <span class="v">2px</span>;
  <span class="a">text-transform</span>: <span class="v">uppercase</span>;   <span class="cm">/* lowercase/capitalize */</span>
}</div>
          <p class="tc-code-label">Background Properties</p>
          <div class="tc-code"><span class="p">body</span> {
  <span class="a">background-color</span>: <span class="v">#f0f0f0</span>;
  <span class="a">background-image</span>: <span class="v">url(bg.jpg)</span>;
  <span class="a">background-repeat</span>: <span class="v">no-repeat</span>;
  <span class="a">background-size</span>: <span class="v">cover</span>;
}</div>
          <p class="tc-code-label">Border Properties</p>
          <div class="tc-code"><span class="p">div</span> {
  <span class="a">border</span>: <span class="v">2px solid black</span>;     <span class="cm">/* width style color */</span>
  <span class="a">border-radius</span>: <span class="v">10px</span>;          <span class="cm">/* rounded corners */</span>
  <span class="a">border-top</span>: <span class="v">3px dashed red</span>;  <span class="cm">/* one side only */</span>
}
<span class="cm">/* Border styles: solid dashed dotted double none */</span></div>
        `
      },
      { title:'Box Model & Units', badge:'css',
        content:`
          <p class="tc-badge css-b">CSS · Box Model</p>
          <p class="tc-title css-c">CSS Box Model</p>
          <p class="tc-explain">Every HTML element is a <strong>rectangular box</strong>. 4 layers around it:</p>
          <div class="box-model">
            <div class="bm-margin">MARGIN — space OUTSIDE border
              <div class="bm-border">BORDER — visible outline
                <div class="bm-padding">PADDING — space INSIDE border
                  <div class="bm-content">CONTENT — your text/image</div>
                </div>
              </div>
            </div>
          </div>
          <p class="tc-code-label">Box Model in CSS</p>
          <div class="tc-code"><span class="p">div</span> {
  <span class="a">width</span>: <span class="v">200px</span>;           <span class="cm">← content width</span>
  <span class="a">padding</span>: <span class="v">20px</span>;         <span class="cm">← inside space</span>
  <span class="a">border</span>: <span class="v">5px solid red</span>; <span class="cm">← the border</span>
  <span class="a">margin</span>: <span class="v">10px</span>;          <span class="cm">← outside space</span>
}
<span class="cm">/* Total = 200+20+20+5+5 = 250px */</span></div>
          <p class="tc-code-label">CSS Measurement Units</p>
          <table class="tc-table">
            <tr><th>Unit</th><th>Type</th><th>Meaning</th></tr>
            <tr><td class="tc">px</td><td>Absolute</td><td class="dc">Pixels — fixed size</td></tr>
            <tr><td class="tc">%</td><td>Relative</td><td class="dc">% of parent element</td></tr>
            <tr><td class="tc">em</td><td>Relative</td><td class="dc">Relative to parent font-size</td></tr>
            <tr><td class="tc">rem</td><td>Relative</td><td class="dc">Relative to root font-size</td></tr>
            <tr><td class="tc">vw / vh</td><td>Relative</td><td class="dc">1% of screen width / height</td></tr>
            <tr><td class="tc">pt</td><td>Absolute</td><td class="dc">Points (1pt = 1/72 inch)</td></tr>
          </table>
          <div class="tc-tip"><span class="tc-tip-icon">💡</span><div class="tc-tip-text">Add <code>box-sizing: border-box</code> so padding &amp; border are <strong>included</strong> in the element's width — no surprise extra size!</div></div>
        `
      },
    ],
    quiz:[
      { q:"What is the correct CSS Box Model order from inside to outside?", sub:"css",
        opts:["Content→Margin→Padding→Border","Content→Padding→Border→Margin","Border→Content→Padding→Margin","Padding→Border→Content→Margin"],
        ans:1, exp:"Content → Padding → Border → Margin. Remember: 'Cool Penguins Build Mansions'" },
      { q:"Which CSS property changes text colour?", sub:"css",
        opts:["font-color","text-color","background-color","color"],
        ans:3, exp:"The 'color' property sets text colour. 'background-color' sets background." },
      { q:"Which CSS property controls space OUTSIDE the border?", sub:"css",
        opts:["padding","spacing","border-gap","margin"],
        ans:3, exp:"Margin = space OUTSIDE the border (pushes other elements away). Padding = space INSIDE." },
      { q:"What does border-radius do in CSS?", sub:"css",
        opts:["Adds shadow to border","Rounds the corners of an element","Changes border colour","Makes border dashed"],
        ans:1, exp:"border-radius rounds the corners. border-radius:50% makes a perfect circle!" },
      { q:"Which CSS unit represents 1% of the viewport (screen) WIDTH?", sub:"css",
        opts:["vh","px","%","vw"],
        ans:3, exp:"vw = viewport width. 100vw = full screen width. vh = viewport height." },
    ],
    boss:{
      emoji:'🤖',
      task:'Write CSS for a styled card: a div.card with width 300px, light blue background, 2px solid navy border, border-radius 10px, 20px padding, and 10px margin auto (to centre it). Also style h2 inside the card with orange color.',
      hints:['.card { width: 300px; background: lightblue; }','border: 2px solid navy;','border-radius: 10px;','margin: 10px auto; (centres a block element)','.card h2 { color: orange; }'],
      checks:[
        { label:'.card selector',        test: c => /\.card\s*{/i.test(c) },
        { label:'width set',             test: c => /\.card[^}]*width\s*:/i.test(c) },
        { label:'background-color',      test: c => /\.card[^}]*background/i.test(c) },
        { label:'border set',            test: c => /\.card[^}]*border\s*:/i.test(c) },
        { label:'border-radius',         test: c => /border-radius/i.test(c) },
        { label:'padding set',           test: c => /\.card[^}]*padding\s*:/i.test(c) },
        { label:'margin: auto',          test: c => /margin[^:]*:\s*[^;]*auto/i.test(c) },
      ]
    }
  },
];

/* ────────────────────────────────────────────
   FINAL BOSS CHECKLIST ITEMS
──────────────────────────────────────────── */
const FINAL_CHECKLIST = [
  { id:'doctype', label:'&lt;!DOCTYPE html&gt;', test: c => /<!DOCTYPE\s+html>/i.test(c) },
  { id:'html',    label:'&lt;html&gt; tag',      test: c => /<html[\s>]/i.test(c) },
  { id:'head',    label:'&lt;head&gt; + &lt;title&gt;', test: c => /<head[\s>]/i.test(c) && /<title>/i.test(c) },
  { id:'body',    label:'&lt;body&gt; tag',      test: c => /<body[\s>]/i.test(c) },
  { id:'h1',      label:'&lt;h1&gt; heading',    test: c => /<h1[\s>]/i.test(c) },
  { id:'p',       label:'&lt;p&gt; paragraph',   test: c => /<p[\s>]/i.test(c) },
  { id:'list',    label:'&lt;ul&gt; or &lt;ol&gt; list', test: c => /<ul[\s>]/i.test(c) || /<ol[\s>]/i.test(c) },
  { id:'li',      label:'&lt;li&gt; list items', test: c => /<li[\s>]/i.test(c) },
  { id:'table',   label:'&lt;table&gt; tag',     test: c => /<table[\s>]/i.test(c) },
  { id:'tr_td',   label:'&lt;tr&gt; and &lt;td&gt;', test: c => /<tr[\s>]/i.test(c) && /<td[\s>]/i.test(c) },
  { id:'form',    label:'&lt;form&gt; tag',      test: c => /<form[\s>]/i.test(c) },
  { id:'input',   label:'&lt;input&gt; tag',     test: c => /<input[\s/]/i.test(c) },
  { id:'img',     label:'&lt;img&gt; with alt',  test: c => /<img[^>]+alt/i.test(c) },
  { id:'a',       label:'&lt;a&gt; link',        test: c => /<a[\s]/i.test(c) && /href/i.test(c) },
  { id:'div',     label:'&lt;div&gt; tag',       test: c => /<div[\s>]/i.test(c) },
  { id:'10tags',  label:'10+ unique tags used',  test: c => {
    const tags = (c.match(/<([a-z][a-z0-9]*)/gi)||[]).map(t=>t.slice(1).toLowerCase());
    return new Set(tags).size >= 10;
  }},
];

/* ────────────────────────────────────────────
   TIMER
──────────────────────────────────────────── */
let timerInterval = null;
let timeLeft = 20;

function startTimer(secs, onTick, onEnd){
  clearInterval(timerInterval);
  timeLeft = secs;
  onTick(timeLeft);
  timerInterval = setInterval(()=>{
    timeLeft--;
    onTick(timeLeft);
    if(timeLeft <= 0){ clearInterval(timerInterval); onEnd(); }
  }, 1000);
}
function stopTimer(){ clearInterval(timerInterval); }

/* ────────────────────────────────────────────
   MAIN GAME OBJECT
──────────────────────────────────────────── */
const Game = {

  /* ── launch ── */
  launch(){
    const nm = (document.getElementById('nameInput').value.trim()) || 'Cadet';
    S.name = nm;
    S.save();
    SFX.click();
    showScreen('s-map');
    this.buildMap();
    refreshMapXP();
    refreshHearts();
    document.getElementById('mapPlayer').textContent = nm;
  },

  /* ── build galaxy map ── */
  buildMap(){
    const scroll = document.getElementById('levelScroll');
    scroll.innerHTML = '';
    let htmlDiv = null, cssDiv = null;

    LEVELS.forEach((lv, idx)=>{
      // chapter dividers
      if(lv.type === 'html' && !htmlDiv){
        htmlDiv = document.createElement('div');
        htmlDiv.className = 'chapter-divider';
        htmlDiv.innerHTML = '🌐 HTML GALAXY';
        scroll.appendChild(htmlDiv);
      }
      if(lv.type === 'css' && !cssDiv){
        cssDiv = document.createElement('div');
        cssDiv.className = 'chapter-divider';
        cssDiv.innerHTML = '🎨 CSS NEBULA';
        scroll.appendChild(cssDiv);
      }

      const cleared  = S.isCleared(lv.id);
      const locked   = idx > 0 && !S.isCleared(LEVELS[idx-1].id);
      const stars    = S.stars[lv.id] || 0;
      const starStr  = '⭐'.repeat(stars) + '☆'.repeat(3-stars);

      const card = document.createElement('div');
      card.className = `level-card ${lv.type}-lv ${locked?'locked':''} ${cleared?'done':''}`;
      card.innerHTML = `
        <div class="lv-num">${lv.num}</div>
        <div class="lv-info">
          <div class="lv-title">${locked?'🔒 LOCKED':lv.title}</div>
          <div class="lv-sub">${locked?'Complete previous level':lv.sub}</div>
          <div class="lv-tags">${lv.tags.slice(0,4).map(t=>`<span class="lv-tag">&lt;${t}&gt;</span>`).join('')}</div>
        </div>
        <div class="lv-status">
          ${cleared ? '✅' : locked ? '🔒' : '▶'}
          <span class="lv-stars">${cleared ? starStr : ''}</span>
        </div>
      `;
      if(!locked) card.addEventListener('click', ()=>{ SFX.click(); this.startLevel(lv); });
      scroll.appendChild(card);
    });

    // Final boss button
    const allHtmlDone = LEVELS.filter(l=>l.type==='html').every(l=>S.isCleared(l.id));
    const allCssDone  = LEVELS.filter(l=>l.type==='css').every(l=>S.isCleared(l.id));
    const fbBtn = document.getElementById('btnFinalBoss');
    if(allHtmlDone && allCssDone){
      fbBtn.disabled = false;
    } else {
      fbBtn.disabled = true;
    }
  },

  goMap(){
    stopTimer();
    S.resetLives();
    showScreen('s-map');
    this.buildMap();
    refreshMapXP();
  },

  /* ── start level (study phase) ── */
  startLevel(lv){
    S.currentLevel = lv;
    S.topicIndex = 0;
    S.resetLives();
    document.getElementById('studyLevelName').textContent = `LV${lv.num}: ${lv.title}`;
    document.getElementById(`studyLevelName`).style.color = lv.type==='html' ? 'var(--html)' : 'var(--css)';
    this.loadTopic(0);
    showScreen('s-study');
  },

  loadTopic(idx){
    const lv     = S.currentLevel;
    const topics = lv.topics;
    S.topicIndex = idx;

    const pct = ((idx+1)/topics.length)*100;
    document.getElementById('studyProgress').style.width = pct+'%';
    document.getElementById('studyTopicCounter').textContent = `${idx+1} / ${topics.length}`;

    // build card
    const area = document.getElementById('studyArea');
    area.innerHTML = `<div class="topic-card visible">${topics[idx].content}</div>`;
    area.scrollTop = 0;

    // prev button
    const prev = document.getElementById('btnPrevTopic');
    prev.style.visibility = idx > 0 ? 'visible' : 'hidden';

    // next button
    const next = document.getElementById('btnNextTopic');
    if(idx < topics.length - 1){
      next.textContent = 'Next ›';
      next.className = `btn-next-topic ${lv.type==='css'?'css-next':''}`;
      next.onclick = ()=> this.nextTopic();
    } else {
      next.textContent = '⚔️ Start Quiz →';
      next.className = `btn-goto-quiz`;
      next.onclick = ()=> this.startQuiz();
    }
    refreshHearts();
  },

  prevTopic(){ if(S.topicIndex > 0) this.loadTopic(S.topicIndex-1); },
  nextTopic(){
    const lv = S.currentLevel;
    if(S.topicIndex < lv.topics.length - 1) this.loadTopic(S.topicIndex+1);
    else this.startQuiz();
  },

  /* ── quiz phase ── */
  startQuiz(){
    const lv = S.currentLevel;
    S.quizScore = 0;
    S.quizQ = 0;
    S.streak = 0;
    // shuffle quiz questions
    S.quizPool = [...lv.quiz].sort(()=>Math.random()-0.5);

    document.getElementById('quizLevelName').textContent = `LV${lv.num}: ${lv.title}`;
    document.getElementById('quizLevelName').style.color = lv.type==='html'?'var(--html)':'var(--css)';
    showScreen('s-quiz');
    this.showQuestion();
    refreshHearts();
  },

  showQuestion(){
    const lv = S.currentLevel;
    const q  = S.quizPool[S.quizQ];
    const total = S.quizPool.length;

    document.getElementById('quizQNum').textContent   = `${S.quizQ+1}/${total}`;
    document.getElementById('quizScore').textContent  = S.quizScore;
    document.getElementById('quizStreak').textContent = `🔥 x${S.streak}`;
    document.getElementById('quizTime').textContent   = '20';
    document.getElementById('quizTimerBar').style.width = '100%';
    document.getElementById('quizTimerBar').style.transition = 'none';

    // shuffle options
    const opts = q.opts.map((o,i)=>({text:o,correct:i===q.ans})).sort(()=>Math.random()-0.5);

    document.getElementById('quizArea').innerHTML = `
      <div class="q-card">
        <span class="q-topic-badge ${q.sub}-b">${q.sub.toUpperCase()}</span>
        <div class="q-text">${q.q}</div>
        <div class="q-options">
          ${opts.map(o=>`<button class="q-opt" onclick="Game.answerQ(this,${o.correct},\`${q.exp.replace(/`/g,"'")}\`)">${o.text}</button>`).join('')}
        </div>
        <div class="q-explain" id="qExplain"></div>
        <button class="q-next" id="qNext" onclick="Game.nextQuestion()">
          ${S.quizQ < total-1 ? 'Next ›' : '⚔️ BOSS FIGHT!'}
        </button>
      </div>
    `;

    // start timer
    requestAnimationFrame(()=>{
      document.getElementById('quizTimerBar').style.transition = 'width 20s linear';
      document.getElementById('quizTimerBar').style.width = '0%';
    });

    startTimer(20,
      t => { document.getElementById('quizTime').textContent = t; },
      () => {
        toast('⏱️ Time\'s up!','bad');
        SFX.wrong();
        this._handleWrong();
        this._showExplain(q.exp);
        document.getElementById('qNext').style.display = 'block';
        document.querySelectorAll('.q-opt').forEach(b=>b.disabled=true);
      }
    );
  },

  answerQ(btn, correct, exp){
    stopTimer();
    document.querySelectorAll('.q-opt').forEach(b=>b.disabled=true);
    if(correct){
      btn.classList.add('correct');
      S.streak++;
      const bonus = S.streak >= 3 ? 20 : 10;
      S.quizScore += bonus;
      S.addXP(bonus);
      document.getElementById('quizScore').textContent = S.quizScore;
      document.getElementById('quizStreak').textContent = `🔥 x${S.streak}`;
      SFX.correct();
      if(S.streak === 3) toast(`🔥 3 STREAK! Bonus XP!`,'good');
      else toast('✅ Correct!','good');
    } else {
      btn.classList.add('wrong');
      this._handleWrong();
      SFX.wrong();
    }
    this._showExplain(exp);
    document.getElementById('qNext').style.display = 'block';
  },

  _handleWrong(){
    S.streak = 0;
    document.getElementById('quizStreak').textContent = `🔥 x0`;
    if(S.loseLife()){
      setTimeout(()=>this.gameOver('No lives left! 💔'), 800);
    } else {
      toast(`💔 Wrong! ${S.lives} lives left`,'bad');
    }
  },

  _showExplain(exp){
    const el = document.getElementById('qExplain');
    if(el){ el.textContent = exp; el.style.display = 'block'; }
  },

  nextQuestion(){
    S.quizQ++;
    if(S.quizQ >= S.quizPool.length){
      this.startBoss();
    } else {
      this.showQuestion();
    }
  },

  /* ── mini boss ── */
  startBoss(){
    const lv = S.currentLevel;
    const b  = lv.boss;
    stopTimer();
    SFX.boss();

    document.getElementById('bossLevelName').textContent = `LV${lv.num} BOSS`;
    document.getElementById('bossHpBar').style.width = '100%';
    document.getElementById('bossHpLabel').textContent = 'BOSS HP: 100%';
    document.getElementById('bossSprite').textContent = b.emoji;
    document.getElementById('bossTask').innerHTML = b.task;

    // hints
    document.getElementById('bossHints').innerHTML = b.hints.map(h=>
      `<div class="boss-hint"><span class="boss-hint-icon">💡</span>${h}</div>`
    ).join('');

    // clear editor
    document.getElementById('codeEditor').value = '';
    document.getElementById('bossResult').style.display = 'none';

    // line numbers
    this._updateGutter('codeEditor','editorGutter');
    document.getElementById('codeEditor').addEventListener('input',()=>
      this._updateGutter('codeEditor','editorGutter'));

    showScreen('s-boss');
    refreshHearts();
  },

  _updateGutter(editorId, gutterId){
    const ed = document.getElementById(editorId);
    const gu = document.getElementById(gutterId);
    if(!ed||!gu) return;
    const lines = ed.value.split('\n').length;
    gu.innerHTML = Array.from({length:lines},(_,i)=>i+1).join('\n');
    gu.scrollTop = ed.scrollTop;
  },

  runBossCode(){
    const code    = document.getElementById('codeEditor').value.trim();
    const lv      = S.currentLevel;
    const checks  = lv.boss.checks;
    const result  = document.getElementById('bossResult');
    const hpBar   = document.getElementById('bossHpBar');
    const hpLbl   = document.getElementById('bossHpLabel');

    if(!code){ toast('Write some code first! 📝','bad'); return; }

    const results = checks.map(ch=>({ label:ch.label, pass: ch.test(code) }));
    const passed  = results.filter(r=>r.pass).length;
    const total   = results.length;
    const pct     = Math.round((passed/total)*100);

    // update HP
    const remain = 100 - pct;
    hpBar.style.width = remain + '%';
    hpLbl.textContent = `BOSS HP: ${remain}%`;

    if(passed === total){
      // WIN
      result.className = 'boss-result success';
      result.innerHTML = `
        <strong>✅ BOSS DEFEATED! All ${total} checks passed!</strong>
        <ul>${results.map(r=>`<li>✅ ${r.label}</li>`).join('')}</ul>
      `;
      result.style.display = 'block';
      SFX.levelup();
      confetti(50);

      // calculate stars by quiz score
      const maxQ = S.quizPool.length * 20;
      const stars = S.quizScore >= maxQ*0.9 ? 3 : S.quizScore >= maxQ*0.6 ? 2 : 1;
      S.clearLevel(lv.id, stars);
      const xpEarned = passed * 10 + stars * 20;
      S.addXP(xpEarned);

      setTimeout(()=> this.showLevelComplete(stars, xpEarned), 1200);
    } else {
      result.className = 'boss-result fail';
      result.innerHTML = `
        <strong>❌ ${passed}/${total} checks passed — keep going!</strong>
        <ul>${results.map(r=>`<li>${r.pass?'✅':'❌'} ${r.label}</li>`).join('')}</ul>
      `;
      result.style.display = 'block';
      SFX.wrong();
      if(S.loseLife()){
        setTimeout(()=> this.gameOver('Boss defeated you! 💀'), 1000);
      } else {
        toast(`💔 ${S.lives} lives left. Fix your code!`,'bad');
      }
    }
  },

  /* ── level complete ── */
  showLevelComplete(stars, xpEarned){
    const lv = S.currentLevel;
    const idx = LEVELS.indexOf(lv);

    document.getElementById('levelupIcon').textContent = lv.type==='html' ? '🌐' : '🎨';
    document.getElementById('levelupTitle').textContent = `${lv.title.toUpperCase()} CLEARED!`;
    document.getElementById('levelupStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3-stars);
    document.getElementById('levelupScore').textContent = `Quiz Score: ${S.quizScore} pts`;
    document.getElementById('levelupXP').textContent    = `+${xpEarned} XP earned!`;

    const nextLv = LEVELS[idx+1];
    const btn    = document.getElementById('btnNextLevel');
    if(nextLv){
      btn.textContent = `${nextLv.title} ›`;
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }

    showScreen('s-levelup');
  },

  goNextLevel(){
    const lv  = S.currentLevel;
    const idx = LEVELS.indexOf(lv);
    const next = LEVELS[idx+1];
    if(next) this.startLevel(next);
    else this.goMap();
  },

  /* ── game over ── */
  gameOver(msg){
    stopTimer();
    document.getElementById('gameoverMsg').textContent = msg + ' — Keep practising!';
    showScreen('s-gameover');
    SFX.wrong();
  },

  retryLevel(){
    if(S.currentLevel) this.startLevel(S.currentLevel);
    else this.goMap();
  },

  /* ── final boss ── */
  startFinalBoss(){
    SFX.boss();
    S.resetLives();

    // build checklist
    const grid = document.getElementById('checklistGrid');
    grid.innerHTML = FINAL_CHECKLIST.map(item=>`
      <div class="cl-item" id="cl-${item.id}">
        <div class="cl-check" id="clc-${item.id}"></div>
        <span>${item.label}</span>
      </div>
    `).join('');

    document.getElementById('finalEditor').value = '';
    document.getElementById('finalResult').style.display = 'none';
    document.getElementById('finalHpBar').style.width = '100%';

    this._updateGutter('finalEditor','finalGutter');
    document.getElementById('finalEditor').addEventListener('input',()=>{
      this._updateGutter('finalEditor','finalGutter');
      this._liveCheckFinal();
    });

    showScreen('s-final');
    refreshHearts();
  },

  _liveCheckFinal(){
    const code = document.getElementById('finalEditor').value;
    FINAL_CHECKLIST.forEach(item=>{
      const el  = document.getElementById(`cl-${item.id}`);
      const chk = document.getElementById(`clc-${item.id}`);
      if(!el) return;
      if(item.test(code)){
        el.classList.add('checked');
        chk.textContent = '✓';
      } else {
        el.classList.remove('checked');
        chk.textContent = '';
      }
    });
  },

  runFinalBoss(){
    const code    = document.getElementById('finalEditor').value.trim();
    const result  = document.getElementById('finalResult');
    const hpBar   = document.getElementById('finalHpBar');

    if(!code){ toast('Write your HTML page first! 📝','bad'); return; }

    this._liveCheckFinal();
    const results = FINAL_CHECKLIST.map(item=>({ label:item.label, pass:item.test(code) }));
    const passed  = results.filter(r=>r.pass).length;
    const total   = results.length;
    const pct     = Math.round((passed/total)*100);
    const remain  = 100 - pct;
    hpBar.style.width = remain + '%';

    const needed = Math.ceil(total * 0.75); // need 75% to win

    if(passed >= needed){
      result.className = 'boss-result success';
      result.innerHTML = `
        <strong>🏆 GALACTIC OVERLORD DEFEATED! ${passed}/${total} checks passed!</strong>
        <ul>${results.map(r=>`<li>${r.pass?'✅':'❌'} ${r.label}</li>`).join('')}</ul>
      `;
      result.style.display = 'block';
      SFX.victory();
      confetti(100);
      S.addXP(200);

      const stats = document.getElementById('victoryStats');
      stats.innerHTML = `
        Total XP: <span>${S.xp}</span><br/>
        Levels Cleared: <span>${S.cleared.length} / ${LEVELS.length}</span><br/>
        Final Boss: <span>DEFEATED ✅</span>
      `;
      setTimeout(()=> showScreen('s-victory'), 2000);
    } else {
      result.className = 'boss-result fail';
      result.innerHTML = `
        <strong>❌ ${passed}/${total} — need at least ${needed} to win!</strong>
        <ul>${results.map(r=>`<li>${r.pass?'✅':'❌'} ${r.label}</li>`).join('')}</ul>
        <p style="margin-top:0.5rem">Go back and review the topics you missed!</p>
      `;
      result.style.display = 'block';
      SFX.wrong();
      if(S.loseLife()){
        setTimeout(()=> this.gameOver('Final Boss was too strong! 💀'), 1000);
      } else {
        toast(`💔 ${S.lives} lives left. Add more tags!`,'bad');
      }
    }
  },
};

// Tab key in editors → insert spaces
['codeEditor','finalEditor'].forEach(id=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('keydown', e=>{
    if(e.key==='Tab'){
      e.preventDefault();
      const s=el.selectionStart, en=el.selectionEnd;
      el.value = el.value.substring(0,s)+'  '+el.value.substring(en);
      el.selectionStart = el.selectionEnd = s+2;
    }
  });
});

// Sync editor scroll with gutter
['codeEditor','finalEditor'].forEach(id=>{
  const el = document.getElementById(id);
  const gutId = id==='codeEditor' ? 'editorGutter' : 'finalGutter';
  if(!el) return;
  el.addEventListener('scroll', ()=>{
    const gu = document.getElementById(gutId);
    if(gu) gu.scrollTop = el.scrollTop;
  });
});
