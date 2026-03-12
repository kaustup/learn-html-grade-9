/* ═══════════════════════════════════════════════════
   WEBDEV SPACE ACADEMY — app.js
   All content · Game logic · Quiz · XP · Stars
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   STAR CANVAS
───────────────────────────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeStars() {
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: 0.003 + Math.random() * 0.006
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = 0.2 + 0.8 * Math.abs(Math.sin(s.a));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,210,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); makeStars(); });
  resize(); makeStars(); draw();
})();


/* ─────────────────────────────────────────────────
   XP & PROGRESS STATE
───────────────────────────────────────────────── */
const STATE = {
  xp:   parseInt(localStorage.getItem('sa_xp')   || '0'),
  done: JSON.parse(localStorage.getItem('sa_done') || '[]'),

  save() {
    localStorage.setItem('sa_xp',   this.xp);
    localStorage.setItem('sa_done', JSON.stringify(this.done));
  },

  addXP(n) {
    this.xp = Math.min(500, this.xp + n);
    this.save();
    App.updateXPBar();
  },

  markDone(id) {
    if (!this.done.includes(id)) {
      this.done.push(id);
      this.save();
      this.addXP(15);
      return true;
    }
    return false;
  }
};

const LEVELS = [
  { min:   0, label: '🌍 Cadet — Level 1'     },
  { min:  80, label: '🌙 Explorer — Level 2'   },
  { min: 160, label: '☄️ Navigator — Level 3'  },
  { min: 260, label: '🪐 Pilot — Level 4'      },
  { min: 360, label: '⭐ Astronaut — Level 5'   },
  { min: 460, label: '🚀 Commander — Level 6'  },
];

function getLevel(xp) {
  let lv = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) lv = l; }
  return lv;
}


/* ─────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}


/* ─────────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────────── */
function launchConfetti() {
  const colors = ['#ff6b35','#ffd700','#00e5c0','#ff4da6','#4db8ff','#00e676'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.8 + Math.random() * 2) + 's';
    el.style.animationDelay    = (Math.random() * 1) + 's';
    el.style.top = '-10px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}


/* ─────────────────────────────────────────────────
   SCREEN ROUTER
───────────────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}


/* ─────────────────────────────────────────────────
   HTML TOPIC DATA
   Each topic: { id, icon, title, html() }
───────────────────────────────────────────────── */
const HTML_TOPICS = [

  { id: 'html-1', icon: '🌐', title: 'What is HTML?',
    html: () => `
      <p class="topic-title html-c">What is HTML?</p>
      <span class="source-tag">W3Schools + Grade 9 Textbook</span>
      <div class="explain">
        <strong>HTML</strong> stands for <em>HyperText Markup Language</em>.<br><br>
        It is the <strong>standard language</strong> for creating web pages. Every website you visit is built with HTML.<br><br>
        🧠 Think of HTML as the <strong>skeleton</strong> of a webpage — it gives structure. CSS adds style, JavaScript adds actions.
      </div>
      <div class="tip-box"><span class="tip-icon">💡</span><div class="tip-text"><strong>HyperText</strong> = text with links. <strong>Markup</strong> = tags that label content. HTML was created by <strong>Tim Berners-Lee</strong> in 1991. Latest version: <strong>HTML5</strong>.</div></div>
      <div class="tip-box"><span class="tip-icon">🎯</span><div class="tip-text">HTML is <strong>NOT</strong> a programming language. It is a <strong>markup language</strong>. It tells the browser what content to show and how to structure it.</div></div>
    `
  },

  { id: 'html-2', icon: '🏷️', title: 'HTML Tags',
    html: () => `
      <p class="topic-title html-c">HTML Tags</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">
        HTML uses <strong>tags</strong> to mark up content. Tags are written inside <em>angle brackets</em> <code>&lt; &gt;</code>. There are two types:
      </div>
      <table class="info-table">
        <tr><th>Type</th><th>Description</th><th>Example</th></tr>
        <tr>
          <td class="tc">Container Tag</td>
          <td class="dc">Has an <strong>opening</strong> and <strong>closing</strong> tag. Content goes between them.</td>
          <td class="tc">&lt;p&gt;...&lt;/p&gt;</td>
        </tr>
        <tr>
          <td class="tc">Empty Tag</td>
          <td class="dc">No closing tag. No content inside. Stands alone.</td>
          <td class="tc">&lt;br&gt; &lt;hr&gt; &lt;img&gt;</td>
        </tr>
      </table>
      <div class="code-wrap">
        <div class="code-lbl">Container Tag Syntax</div>
        <div class="code-box"><span class="t">&lt;tagname&gt;</span> Your content here <span class="t">&lt;/tagname&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Empty Tag Syntax</div>
        <div class="code-box"><span class="t">&lt;tagname&gt;</span>   <span class="cm">← no closing tag needed</span></div>
      </div>
      <div class="tip-box"><span class="tip-icon">📌</span><div class="tip-text">Closing tags always have a <strong>/</strong> before the tag name: <code>&lt;/p&gt;</code>, <code>&lt;/h1&gt;</code>, <code>&lt;/div&gt;</code></div></div>
    `
  },

  { id: 'html-3', icon: '⚙️', title: 'HTML Attributes',
    html: () => `
      <p class="topic-title html-c">HTML Attributes</p>
      <span class="source-tag">W3Schools</span>
      <div class="explain">
        Attributes give <strong>extra information</strong> to HTML tags. They are written inside the <em>opening tag</em> as <code>name="value"</code> pairs.
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Attribute Syntax</div>
        <div class="code-box"><span class="t">&lt;tagname</span> <span class="a">attribute</span>=<span class="v">"value"</span><span class="t">&gt;</span>Content<span class="t">&lt;/tagname&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Examples</div>
        <div class="code-box"><span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"https://google.com"</span><span class="t">&gt;</span>Google<span class="t">&lt;/a&gt;</span>
<span class="t">&lt;img</span> <span class="a">src</span>=<span class="v">"photo.jpg"</span> <span class="a">width</span>=<span class="v">"200"</span><span class="t">&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Centered text<span class="t">&lt;/p&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Attribute</th><th>Tag</th><th>What it does</th></tr>
        <tr><td class="ac">href</td><td class="tc">&lt;a&gt;</td><td class="dc">Link destination URL</td></tr>
        <tr><td class="ac">src</td><td class="tc">&lt;img&gt;</td><td class="dc">Image file path</td></tr>
        <tr><td class="ac">align</td><td class="tc">many tags</td><td class="dc">left / center / right</td></tr>
        <tr><td class="ac">color</td><td class="tc">&lt;font&gt;</td><td class="dc">Text color (name or hex)</td></tr>
        <tr><td class="ac">width / height</td><td class="tc">&lt;img&gt; &lt;table&gt;</td><td class="dc">Size in px or %</td></tr>
        <tr><td class="ac">size</td><td class="tc">&lt;font&gt; &lt;hr&gt;</td><td class="dc">Font size or line thickness</td></tr>
      </table>
    `
  },

  { id: 'html-4', icon: '🏗️', title: 'Basic HTML Structure',
    html: () => `
      <p class="topic-title html-c">Basic HTML Structure</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">
        Every HTML file follows a standard structure. This is like the <strong>blueprint</strong> every webpage must follow.
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Complete Template</div>
        <div class="code-box"><span class="t">&lt;!DOCTYPE html&gt;</span>   <span class="cm">← Declares HTML5</span>
<span class="t">&lt;html&gt;</span>            <span class="cm">← Root element</span>

  <span class="t">&lt;head&gt;</span>          <span class="cm">← Not visible to user</span>
    <span class="t">&lt;title&gt;</span>My Page<span class="t">&lt;/title&gt;</span>  <span class="cm">← Browser tab name</span>
  <span class="t">&lt;/head&gt;</span>

  <span class="t">&lt;body&gt;</span>          <span class="cm">← Everything user SEES</span>
    <span class="t">&lt;h1&gt;</span>Hello World!<span class="t">&lt;/h1&gt;</span>
    <span class="t">&lt;p&gt;</span>My first page.<span class="t">&lt;/p&gt;</span>
  <span class="t">&lt;/body&gt;</span>

<span class="t">&lt;/html&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Tag</th><th>Purpose</th></tr>
        <tr><td class="tc">&lt;!DOCTYPE html&gt;</td><td class="dc">Tells browser to use HTML5. Always write this FIRST.</td></tr>
        <tr><td class="tc">&lt;html&gt;</td><td class="dc">The root/container of the whole page.</td></tr>
        <tr><td class="tc">&lt;head&gt;</td><td class="dc">Holds metadata (title, links to CSS, etc.) — not visible.</td></tr>
        <tr><td class="tc">&lt;title&gt;</td><td class="dc">Shows as the browser tab title.</td></tr>
        <tr><td class="tc">&lt;body&gt;</td><td class="dc">Everything the user sees goes inside here.</td></tr>
      </table>
    `
  },

  { id: 'html-5', icon: '💬', title: 'Comment, BR & HR',
    html: () => `
      <p class="topic-title html-c">Comment, &lt;br&gt; and &lt;hr&gt;</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="code-wrap">
        <div class="code-lbl">HTML Comment — browser ignores this!</div>
        <div class="code-box"><span class="cm">&lt;!-- This is a comment --&gt;</span>
<span class="cm">&lt;!-- Used to leave notes for yourself in code --&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">&lt;br&gt; — Line Break (Empty Tag)</div>
        <div class="code-box"><span class="t">&lt;p&gt;</span>Line one.<span class="t">&lt;br&gt;</span>Line two starts here.<span class="t">&lt;/p&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Browser Output</div>
        <div class="preview-box">Line one.<br>Line two starts here.</div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">&lt;hr&gt; — Horizontal Rule (Empty Tag)</div>
        <div class="code-box"><span class="t">&lt;p&gt;</span>Section One<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;hr&gt;</span>
<span class="t">&lt;p&gt;</span>Section Two<span class="t">&lt;/p&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Browser Output</div>
        <div class="preview-box">Section One<hr style="border-color:#aaa;margin:6px 0">Section Two</div>
      </div>
      <div class="tip-box"><span class="tip-icon">⚡</span><div class="tip-text"><code>&lt;br&gt;</code> and <code>&lt;hr&gt;</code> are <strong>empty tags</strong> — they have NO closing tag!</div></div>
    `
  },

  { id: 'html-6', icon: '📝', title: 'Paragraphs & Headings',
    html: () => `
      <p class="topic-title html-c">Paragraphs &amp; Headings</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="code-wrap">
        <div class="code-lbl">Paragraph — &lt;p&gt; with align attribute</div>
        <div class="code-box"><span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"left"</span><span class="t">&gt;</span>Left aligned (default)<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Centered paragraph<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"right"</span><span class="t">&gt;</span>Right aligned<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;p</span> <span class="a">align</span>=<span class="v">"justify"</span><span class="t">&gt;</span>Justified text<span class="t">&lt;/p&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Heading Tags — h1 (biggest) to h6 (smallest)</div>
        <div class="code-box"><span class="t">&lt;h1</span> <span class="a">align</span>=<span class="v">"center"</span><span class="t">&gt;</span>Main Heading<span class="t">&lt;/h1&gt;</span>
<span class="t">&lt;h2&gt;</span>Sub Heading<span class="t">&lt;/h2&gt;</span>
<span class="t">&lt;h3&gt;</span>Section Title<span class="t">&lt;/h3&gt;</span>
<span class="cm">/* h4, h5, h6 → getting smaller */</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Browser Output</div>
        <div class="preview-box">
          <h1 style="font-size:1.6rem;margin:0">h1 — Biggest</h1>
          <h2 style="font-size:1.3rem;margin:2px 0">h2 — Big</h2>
          <h3 style="font-size:1.05rem;margin:2px 0">h3 — Medium</h3>
          <h4 style="font-size:0.9rem;margin:2px 0">h4 — Small</h4>
          <h5 style="font-size:0.8rem;margin:2px 0">h5 — Smaller</h5>
          <h6 style="font-size:0.72rem;margin:2px 0">h6 — Smallest</h6>
        </div>
      </div>
      <div class="tip-box"><span class="tip-icon">🧠</span><div class="tip-text">Use only <strong>one &lt;h1&gt;</strong> per page — it's the main title. Use h2, h3 for sections. Important for SEO!</div></div>
    `
  },

  { id: 'html-7', icon: '✍️', title: 'Text Styles: sup sub U i',
    html: () => `
      <p class="topic-title html-c">Text Style Tags</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <table class="info-table">
        <tr><th>Tag</th><th>Name</th><th>Effect</th></tr>
        <tr><td class="tc">&lt;sup&gt;</td><td>Superscript</td><td class="dc">Raises text UP — like x²</td></tr>
        <tr><td class="tc">&lt;sub&gt;</td><td>Subscript</td><td class="dc">Lowers text DOWN — like H₂O</td></tr>
        <tr><td class="tc">&lt;u&gt;</td><td>Underline</td><td class="dc">Underlines the text</td></tr>
        <tr><td class="tc">&lt;i&gt;</td><td>Italic</td><td class="dc">Slants text to the right</td></tr>
        <tr><td class="tc">&lt;b&gt;</td><td>Bold</td><td class="dc">Makes text thick/heavy</td></tr>
        <tr><td class="tc">&lt;strong&gt;</td><td>Strong</td><td class="dc">Bold + tells browser it's important</td></tr>
        <tr><td class="tc">&lt;em&gt;</td><td>Emphasis</td><td class="dc">Italic + tells browser it's emphasized</td></tr>
      </table>
      <div class="code-wrap">
        <div class="code-lbl">Examples</div>
        <div class="code-box">H<span class="t">&lt;sub&gt;</span>2<span class="t">&lt;/sub&gt;</span>O     <span class="cm">→ H₂O (water formula)</span>
x<span class="t">&lt;sup&gt;</span>2<span class="t">&lt;/sup&gt;</span>      <span class="cm">→ x² (x squared)</span>
<span class="t">&lt;u&gt;</span>Underlined<span class="t">&lt;/u&gt;</span>  <span class="cm">→ underlined text</span>
<span class="t">&lt;i&gt;</span>Italic<span class="t">&lt;/i&gt;</span>       <span class="cm">→ italic text</span>
<span class="t">&lt;b&gt;</span>Bold<span class="t">&lt;/b&gt;</span>         <span class="cm">→ bold text</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Output</div>
        <div class="preview-box">H<sub>2</sub>O &nbsp;|&nbsp; x<sup>2</sup> &nbsp;|&nbsp; <u>Underline</u> &nbsp;|&nbsp; <i>Italic</i> &nbsp;|&nbsp; <b>Bold</b></div>
      </div>
    `
  },

  { id: 'html-8', icon: '🌈', title: 'Colour Codes',
    html: () => `
      <p class="topic-title html-c">Basic Colour Codes</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">In HTML, colours can be written in <strong>3 ways</strong>:</div>
      <table class="info-table">
        <tr><th>Method</th><th>Example</th><th>Notes</th></tr>
        <tr><td>Colour Name</td><td class="tc">red, blue, green</td><td class="dc">147 named colours in HTML</td></tr>
        <tr><td>Hex Code</td><td class="tc">#FF0000</td><td class="dc"># + 6 hex digits (RRGGBB)</td></tr>
        <tr><td>RGB Value</td><td class="tc">rgb(255,0,0)</td><td class="dc">Red, Green, Blue each 0–255</td></tr>
      </table>
      <div class="swatch-row">
        <div class="swatch"><div class="swatch-box" style="background:#FF0000"></div><div class="swatch-txt">#FF0000<br>Red</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#00FF00"></div><div class="swatch-txt">#00FF00<br>Green</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#0000FF"></div><div class="swatch-txt">#0000FF<br>Blue</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#FFFF00"></div><div class="swatch-txt">#FFFF00<br>Yellow</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#FF00FF"></div><div class="swatch-txt">#FF00FF<br>Magenta</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#00FFFF"></div><div class="swatch-txt">#00FFFF<br>Cyan</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#000000;border:1px solid #555"></div><div class="swatch-txt">#000000<br>Black</div></div>
        <div class="swatch"><div class="swatch-box" style="background:#FFFFFF;border:1px solid #999"></div><div class="swatch-txt">#FFFFFF<br>White</div></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Using colours in HTML</div>
        <div class="code-box"><span class="t">&lt;font</span> <span class="a">color</span>=<span class="v">"red"</span><span class="t">&gt;</span>Red text<span class="t">&lt;/font&gt;</span>
<span class="t">&lt;font</span> <span class="a">color</span>=<span class="v">"#FF6B35"</span><span class="t">&gt;</span>Orange text (hex)<span class="t">&lt;/font&gt;</span>
<span class="t">&lt;body</span> <span class="a">bgcolor</span>=<span class="v">"#000000"</span><span class="t">&gt;</span>  <span class="cm">← black background</span></div>
      </div>
    `
  },

  { id: 'html-9', icon: '📺', title: 'Marquee Tag',
    html: () => `
      <p class="topic-title html-c">Marquee Tag</p>
      <span class="source-tag">Grade 9 Textbook</span>
      <div class="explain">The <strong>&lt;marquee&gt;</strong> tag makes text <em>scroll automatically</em> across the screen. Popular in old-school websites!</div>
      <div class="code-wrap">
        <div class="code-lbl">Basic Marquee</div>
        <div class="code-box"><span class="t">&lt;marquee&gt;</span>I scroll left automatically!<span class="t">&lt;/marquee&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Marquee with Attributes</div>
        <div class="code-box"><span class="t">&lt;marquee</span> <span class="a">direction</span>=<span class="v">"right"</span>
         <span class="a">behavior</span>=<span class="v">"bounce"</span>
         <span class="a">scrollamount</span>=<span class="v">"5"</span>
         <span class="a">bgcolor</span>=<span class="v">"yellow"</span><span class="t">&gt;</span>
  Bouncing Text!
<span class="t">&lt;/marquee&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Live Demo</div>
        <div class="preview-box"><marquee style="color:#d44;font-weight:bold;">⚡ Scrolling text — old school style! ⚡</marquee></div>
      </div>
      <table class="info-table">
        <tr><th>Attribute</th><th>Values</th><th>What it does</th></tr>
        <tr><td class="ac">direction</td><td class="tc">left, right, up, down</td><td class="dc">Direction of scroll</td></tr>
        <tr><td class="ac">behavior</td><td class="tc">scroll, slide, bounce</td><td class="dc">How it moves (bounce = back &amp; forth)</td></tr>
        <tr><td class="ac">scrollamount</td><td class="tc">1–20 (number)</td><td class="dc">Speed — higher = faster</td></tr>
        <tr><td class="ac">bgcolor</td><td class="tc">color or #hex</td><td class="dc">Background colour of marquee</td></tr>
        <tr><td class="ac">width / height</td><td class="tc">px or %</td><td class="dc">Size of the marquee box</td></tr>
        <tr><td class="ac">loop</td><td class="tc">number or -1</td><td class="dc">How many times it loops (-1 = forever)</td></tr>
      </table>
    `
  },

  { id: 'html-10', icon: '🔗', title: 'Anchor Tag &lt;a&gt;',
    html: () => `
      <p class="topic-title html-c">Anchor Tag &lt;a&gt;</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">The <strong>&lt;a&gt;</strong> tag creates <em>hyperlinks</em> — clickable text that takes you to another page, file, or section.</div>
      <div class="code-wrap">
        <div class="code-lbl">Types of Links</div>
        <div class="code-box"><span class="cm"><!-- External website --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"https://google.com"</span><span class="t">&gt;</span>Visit Google<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- Open in new tab --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"page.html"</span> <span class="a">target</span>=<span class="v">"_blank"</span><span class="t">&gt;</span>New Tab<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- Email link --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"mailto:you@email.com"</span><span class="t">&gt;</span>Email Me<span class="t">&lt;/a&gt;</span>

<span class="cm"><!-- Same page anchor --></span>
<span class="t">&lt;a</span> <span class="a">href</span>=<span class="v">"#section2"</span><span class="t">&gt;</span>Jump to Section 2<span class="t">&lt;/a&gt;</span>
<span class="t">&lt;h2</span> <span class="a">id</span>=<span class="v">"section2"</span><span class="t">&gt;</span>Section 2<span class="t">&lt;/h2&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Attribute</th><th>Values</th><th>What it does</th></tr>
        <tr><td class="ac">href</td><td class="tc">URL / #id / mailto:</td><td class="dc">The destination of the link</td></tr>
        <tr><td class="ac">target</td><td class="tc">_blank, _self, _parent</td><td class="dc">_blank = new tab, _self = same tab</td></tr>
        <tr><td class="ac">title</td><td class="tc">any text</td><td class="dc">Tooltip shown on hover</td></tr>
        <tr><td class="ac">name</td><td class="tc">any text</td><td class="dc">Creates a bookmark on the page</td></tr>
      </table>
    `
  },

  { id: 'html-11', icon: '📋', title: 'Lists: ul and ol',
    html: () => `
      <p class="topic-title html-c">HTML Lists</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="code-wrap">
        <div class="code-lbl">&lt;ul&gt; — Unordered List (bullet points)</div>
        <div class="code-box"><span class="t">&lt;ul</span> <span class="a">type</span>=<span class="v">"disc"</span><span class="t">&gt;</span>   <span class="cm">← disc / circle / square</span>
  <span class="t">&lt;li&gt;</span>HTML<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>CSS<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>JavaScript<span class="t">&lt;/li&gt;</span>
<span class="t">&lt;/ul&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">&lt;ol&gt; — Ordered List (numbered)</div>
        <div class="code-box"><span class="t">&lt;ol</span> <span class="a">type</span>=<span class="v">"1"</span> <span class="a">start</span>=<span class="v">"1"</span><span class="t">&gt;</span>  <span class="cm">← 1 / A / a / I / i</span>
  <span class="t">&lt;li&gt;</span>First item<span class="t">&lt;/li&gt;</span>
  <span class="t">&lt;li&gt;</span>Second item<span class="t">&lt;/li&gt;</span>
<span class="t">&lt;/ol&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Output</div>
        <div class="preview-box" style="display:flex;gap:2rem;flex-wrap:wrap">
          <div><strong>UL (disc):</strong><ul style="margin:4px 0 0 18px"><li>HTML</li><li>CSS</li><li>JS</li></ul></div>
          <div><strong>OL (1.):</strong><ol style="margin:4px 0 0 18px"><li>First</li><li>Second</li></ol></div>
          <div><strong>OL (A.):</strong><ol type="A" style="margin:4px 0 0 18px"><li>First</li><li>Second</li></ol></div>
        </div>
      </div>
      <table class="info-table">
        <tr><th>ul type</th><th>ol type</th></tr>
        <tr><td class="tc">disc ● &nbsp; circle ○ &nbsp; square ■</td><td class="tc">1 &nbsp; A &nbsp; a &nbsp; I (Roman) &nbsp; i</td></tr>
      </table>
      <div class="tip-box"><span class="tip-icon">📌</span><div class="tip-text">The <strong>start</strong> attribute on &lt;ol&gt; lets you begin counting from any number, e.g. <code>start="5"</code> begins at 5.</div></div>
    `
  },

  { id: 'html-12', icon: '🖼️', title: 'Image Tag &lt;img&gt;',
    html: () => `
      <p class="topic-title html-c">Image Tag &lt;img&gt;</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">The <strong>&lt;img&gt;</strong> tag is an <em>empty tag</em> that displays an image. No closing tag!</div>
      <div class="code-wrap">
        <div class="code-lbl">Syntax</div>
        <div class="code-box"><span class="t">&lt;img</span> <span class="a">src</span>=<span class="v">"photo.jpg"</span>
     <span class="a">alt</span>=<span class="v">"A beautiful photo"</span>
     <span class="a">width</span>=<span class="v">"300"</span>
     <span class="a">height</span>=<span class="v">"200"</span>
     <span class="a">align</span>=<span class="v">"center"</span>
     <span class="a">border</span>=<span class="v">"2"</span><span class="t">&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Attribute</th><th>Purpose</th><th>Required?</th></tr>
        <tr><td class="ac">src</td><td class="dc">Path to the image file</td><td>✅ Yes</td></tr>
        <tr><td class="ac">alt</td><td class="dc">Text shown if image fails to load. Helps screen readers.</td><td>✅ Yes</td></tr>
        <tr><td class="ac">width</td><td class="dc">Width in pixels or %</td><td>Optional</td></tr>
        <tr><td class="ac">height</td><td class="dc">Height in pixels or %</td><td>Optional</td></tr>
        <tr><td class="ac">align</td><td class="dc">left / right / middle / top / bottom</td><td>Optional</td></tr>
        <tr><td class="ac">border</td><td class="dc">Border thickness in px</td><td>Optional</td></tr>
        <tr><td class="ac">title</td><td class="dc">Tooltip text on hover</td><td>Optional</td></tr>
      </table>
      <div class="tip-box"><span class="tip-icon">♿</span><div class="tip-text">Always include <strong>alt</strong>! Screen readers (for visually impaired users) read this text. Also shown when image fails to load.</div></div>
    `
  },

  { id: 'html-13', icon: '📊', title: 'Tables (All Tags)',
    html: () => `
      <p class="topic-title html-c">HTML Tables</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="code-wrap">
        <div class="code-lbl">Full Table Example</div>
        <div class="code-box"><span class="t">&lt;table</span> <span class="a">border</span>=<span class="v">"1"</span> <span class="a">width</span>=<span class="v">"100%"</span> <span class="a">cellpadding</span>=<span class="v">"5"</span> <span class="a">cellspacing</span>=<span class="v">"0"</span><span class="t">&gt;</span>

  <span class="t">&lt;caption&gt;</span>Student Results<span class="t">&lt;/caption&gt;</span>  <span class="cm">← table title</span>

  <span class="t">&lt;tr&gt;</span>                        <span class="cm">← Row 1 (header)</span>
    <span class="t">&lt;th&gt;</span>Name<span class="t">&lt;/th&gt;</span>
    <span class="t">&lt;th&gt;</span>Subject<span class="t">&lt;/th&gt;</span>
    <span class="t">&lt;th&gt;</span>Marks<span class="t">&lt;/th&gt;</span>
  <span class="t">&lt;/tr&gt;</span>

  <span class="t">&lt;tr&gt;</span>                        <span class="cm">← Row 2 (data)</span>
    <span class="t">&lt;td&gt;</span>Kaustup<span class="t">&lt;/td&gt;</span>
    <span class="t">&lt;td&gt;</span>Computer<span class="t">&lt;/td&gt;</span>
    <span class="t">&lt;td&gt;</span>98<span class="t">&lt;/td&gt;</span>
  <span class="t">&lt;/tr&gt;</span>

<span class="t">&lt;/table&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Tag</th><th>Stands For</th><th>Purpose</th></tr>
        <tr><td class="tc">&lt;table&gt;</td><td>Table</td><td class="dc">Container for the whole table</td></tr>
        <tr><td class="tc">&lt;caption&gt;</td><td>Caption</td><td class="dc">Title shown above the table</td></tr>
        <tr><td class="tc">&lt;tr&gt;</td><td>Table Row</td><td class="dc">Creates a horizontal row</td></tr>
        <tr><td class="tc">&lt;th&gt;</td><td>Table Header</td><td class="dc">Header cell — bold &amp; centered by default</td></tr>
        <tr><td class="tc">&lt;td&gt;</td><td>Table Data</td><td class="dc">Regular data cell</td></tr>
      </table>
      <table class="info-table">
        <tr><th>Attribute</th><th>Used On</th><th>Effect</th></tr>
        <tr><td class="ac">border</td><td class="tc">&lt;table&gt;</td><td class="dc">Border thickness in px</td></tr>
        <tr><td class="ac">cellpadding</td><td class="tc">&lt;table&gt;</td><td class="dc">Space INSIDE each cell</td></tr>
        <tr><td class="ac">cellspacing</td><td class="tc">&lt;table&gt;</td><td class="dc">Space BETWEEN cells</td></tr>
        <tr><td class="ac">bgcolor</td><td class="tc">&lt;table&gt;/&lt;tr&gt;/&lt;td&gt;</td><td class="dc">Background colour</td></tr>
        <tr><td class="ac">align</td><td class="tc">most tags</td><td class="dc">Alignment: left/center/right</td></tr>
        <tr><td class="ac">width / height</td><td class="tc">&lt;table&gt; &lt;td&gt;</td><td class="dc">Size in px or %</td></tr>
      </table>
    `
  },

  { id: 'html-14', icon: '🔀', title: 'Colspan & Rowspan',
    html: () => `
      <p class="topic-title html-c">Colspan &amp; Rowspan</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">
        <strong>colspan</strong> merges cells <em>horizontally</em> (across columns).<br>
        <strong>rowspan</strong> merges cells <em>vertically</em> (across rows).
      </div>
      <div class="code-wrap">
        <div class="code-lbl">colspan Example</div>
        <div class="code-box"><span class="t">&lt;tr&gt;</span>
  <span class="t">&lt;td</span> <span class="a">colspan</span>=<span class="v">"3"</span><span class="t">&gt;</span>This spans 3 columns<span class="t">&lt;/td&gt;</span>
<span class="t">&lt;/tr&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">rowspan Example</div>
        <div class="code-box"><span class="t">&lt;tr&gt;</span>
  <span class="t">&lt;td</span> <span class="a">rowspan</span>=<span class="v">"2"</span><span class="t">&gt;</span>This spans 2 rows<span class="t">&lt;/td&gt;</span>
  <span class="t">&lt;td&gt;</span>Row 1, Col 2<span class="t">&lt;/td&gt;</span>
<span class="t">&lt;/tr&gt;</span>
<span class="t">&lt;tr&gt;</span>
  <span class="t">&lt;td&gt;</span>Row 2, Col 2<span class="t">&lt;/td&gt;</span>
<span class="t">&lt;/tr&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 colspan demo</div>
        <div class="preview-box">
          <table border="1" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:0.82rem;color:#222">
            <tr><td colspan="3" style="background:#ffe0d0;text-align:center;font-weight:bold">Merged — colspan="3"</td></tr>
            <tr><td>A</td><td>B</td><td>C</td></tr>
          </table>
        </div>
      </div>
      <div class="tip-box"><span class="tip-icon">⚠️</span><div class="tip-text">When you use <code>colspan="2"</code> in a row, that row must have <strong>one fewer &lt;td&gt;</strong>. Same rule applies for rowspan in following rows!</div></div>
    `
  },

  { id: 'html-15', icon: '📋', title: 'Forms (Full)',
    html: () => `
      <p class="topic-title html-c">HTML Forms</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">Forms collect <strong>user input</strong> and send it to a server. The <strong>&lt;form&gt;</strong> tag wraps all form elements.</div>
      <div class="code-wrap">
        <div class="code-lbl">Complete Form Example</div>
        <div class="code-box"><span class="t">&lt;form</span> <span class="a">action</span>=<span class="v">"submit.php"</span> <span class="a">method</span>=<span class="v">"post"</span><span class="t">&gt;</span>

  <span class="cm"><!-- Text Field --></span>
  Name: <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"text"</span> <span class="a">name</span>=<span class="v">"uname"</span> <span class="a">size</span>=<span class="v">"30"</span><span class="t">&gt;</span>

  <span class="cm"><!-- Password --></span>
  Pass: <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"password"</span> <span class="a">name</span>=<span class="v">"pass"</span><span class="t">&gt;</span>

  <span class="cm"><!-- Textarea --></span>
  Message:
  <span class="t">&lt;textarea</span> <span class="a">name</span>=<span class="v">"msg"</span> <span class="a">rows</span>=<span class="v">"4"</span> <span class="a">cols</span>=<span class="v">"30"</span><span class="t">&gt;&lt;/textarea&gt;</span>

  <span class="cm"><!-- Radio Buttons (same name = one choice) --></span>
  Gender:
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"radio"</span> <span class="a">name</span>=<span class="v">"gender"</span> <span class="a">value</span>=<span class="v">"male"</span><span class="t">&gt;</span> Male
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"radio"</span> <span class="a">name</span>=<span class="v">"gender"</span> <span class="a">value</span>=<span class="v">"female"</span><span class="t">&gt;</span> Female

  <span class="cm"><!-- Checkboxes (different names = multiple choice) --></span>
  Hobbies:
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"checkbox"</span> <span class="a">name</span>=<span class="v">"chess"</span><span class="t">&gt;</span> Chess
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"checkbox"</span> <span class="a">name</span>=<span class="v">"coding"</span><span class="t">&gt;</span> Coding

  <span class="cm"><!-- Select / Dropdown --></span>
  Country:
  <span class="t">&lt;select</span> <span class="a">name</span>=<span class="v">"country"</span><span class="t">&gt;</span>
    <span class="t">&lt;option</span> <span class="a">value</span>=<span class="v">"np"</span><span class="t">&gt;</span>Nepal<span class="t">&lt;/option&gt;</span>
    <span class="t">&lt;option</span> <span class="a">value</span>=<span class="v">"in"</span><span class="t">&gt;</span>India<span class="t">&lt;/option&gt;</span>
  <span class="t">&lt;/select&gt;</span>

  <span class="cm"><!-- Buttons --></span>
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"submit"</span> <span class="a">value</span>=<span class="v">"Submit"</span><span class="t">&gt;</span>
  <span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"reset"</span>  <span class="a">value</span>=<span class="v">"Clear"</span><span class="t">&gt;</span>

<span class="t">&lt;/form&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>Element</th><th>What it creates</th></tr>
        <tr><td class="tc">input type="text"</td><td class="dc">Single-line text box</td></tr>
        <tr><td class="tc">input type="password"</td><td class="dc">Text box that hides characters</td></tr>
        <tr><td class="tc">textarea</td><td class="dc">Multi-line text area</td></tr>
        <tr><td class="tc">input type="radio"</td><td class="dc">Circle button — pick ONE from a group</td></tr>
        <tr><td class="tc">input type="checkbox"</td><td class="dc">Square box — pick MULTIPLE</td></tr>
        <tr><td class="tc">select + option</td><td class="dc">Dropdown menu</td></tr>
        <tr><td class="tc">input type="submit"</td><td class="dc">Submit button — sends form</td></tr>
        <tr><td class="tc">input type="reset"</td><td class="dc">Reset button — clears form</td></tr>
        <tr><td class="tc">input type="file"</td><td class="dc">File upload button</td></tr>
      </table>
      <div class="tip-box"><span class="tip-icon">💡</span><div class="tip-text">Radio buttons in the same group <strong>must have the same name</strong>. This allows only one to be selected at a time. Checkboxes can have different names since multiple can be selected.</div></div>
    `
  },

  { id: 'html-16', icon: '📦', title: 'Div Tag',
    html: () => `
      <p class="topic-title html-c">The &lt;div&gt; Tag</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">
        The <strong>&lt;div&gt;</strong> tag is a <em>block-level container</em>. It groups HTML elements together so you can style or position them as one unit.<br><br>
        <strong>div = division</strong> — it divides the page into sections.
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Basic div usage</div>
        <div class="code-box"><span class="t">&lt;div</span> <span class="a">style</span>=<span class="v">"background:lightblue; padding:10px;"</span><span class="t">&gt;</span>
  <span class="t">&lt;h2&gt;</span>I am inside a div!<span class="t">&lt;/h2&gt;</span>
  <span class="t">&lt;p&gt;</span>Divs are like invisible boxes 📦<span class="t">&lt;/p&gt;</span>
<span class="t">&lt;/div&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Common use — page layout</div>
        <div class="code-box"><span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"header"</span><span class="t">&gt;</span>   Header area   <span class="t">&lt;/div&gt;</span>
<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"content"</span><span class="t">&gt;</span>  Main content  <span class="t">&lt;/div&gt;</span>
<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"sidebar"</span><span class="t">&gt;</span>  Sidebar area  <span class="t">&lt;/div&gt;</span>
<span class="t">&lt;div</span> <span class="a">id</span>=<span class="v">"footer"</span><span class="t">&gt;</span>   Footer area   <span class="t">&lt;/div&gt;</span></div>
      </div>
      <div class="preview-wrap">
        <div class="preview-lbl">🔍 Output</div>
        <div class="preview-box">
          <div style="background:lightblue;padding:8px;border-radius:5px;font-size:0.85rem;color:#222">
            <strong>I am inside a div!</strong><br>Divs are like invisible boxes 📦
          </div>
        </div>
      </div>
      <div class="tip-box"><span class="tip-icon">🧠</span><div class="tip-text">&lt;div&gt; on its own does nothing special — it's <strong>invisible</strong>. But once you add CSS (width, colour, position), it becomes the building block of every webpage layout!</div></div>
    `
  },

  { id: 'html-17', icon: '⌨️', title: 'Input Tag & Types',
    html: () => `
      <p class="topic-title html-c">Input Tag &amp; All Types</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">The <strong>&lt;input&gt;</strong> is an <em>empty tag</em> used in forms. The <code>type</code> attribute controls what kind of input it becomes.</div>
      <div class="code-wrap">
        <div class="code-lbl">Syntax</div>
        <div class="code-box"><span class="t">&lt;input</span> <span class="a">type</span>=<span class="v">"text"</span> <span class="a">name</span>=<span class="v">"fieldname"</span> <span class="a">value</span>=<span class="v">"default"</span><span class="t">&gt;</span></div>
      </div>
      <table class="info-table">
        <tr><th>type value</th><th>What it creates</th></tr>
        <tr><td class="tc">text</td><td class="dc">Single-line text box</td></tr>
        <tr><td class="tc">password</td><td class="dc">Text box — hides characters as ●●●</td></tr>
        <tr><td class="tc">radio</td><td class="dc">Round button — pick ONE from a group</td></tr>
        <tr><td class="tc">checkbox</td><td class="dc">Square box — can tick MULTIPLE</td></tr>
        <tr><td class="tc">submit</td><td class="dc">Button that submits the form</td></tr>
        <tr><td class="tc">reset</td><td class="dc">Button that clears all fields</td></tr>
        <tr><td class="tc">button</td><td class="dc">General clickable button</td></tr>
        <tr><td class="tc">file</td><td class="dc">Upload button — opens file picker</td></tr>
        <tr><td class="tc">image</td><td class="dc">Image as a submit button</td></tr>
        <tr><td class="tc">hidden</td><td class="dc">Not shown but sends data to server</td></tr>
        <tr><td class="tc">email</td><td class="dc">Email input (HTML5) — validates @</td></tr>
        <tr><td class="tc">number</td><td class="dc">Number input with up/down arrows</td></tr>
        <tr><td class="tc">date</td><td class="dc">Date picker (HTML5)</td></tr>
      </table>
    `
  },
];


/* ─────────────────────────────────────────────────
   CSS TOPIC DATA
───────────────────────────────────────────────── */
const CSS_TOPICS = [

  { id: 'css-1', icon: '🎨', title: 'What is CSS?',
    html: () => `
      <p class="topic-title css-c">What is CSS?</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">
        <strong>CSS</strong> stands for <em>Cascading Style Sheets</em>.<br><br>
        It is used to <strong>style and design</strong> HTML web pages — controlling colours, fonts, spacing, sizes, layouts, and animations.<br><br>
        🎨 If HTML is the <strong>skeleton</strong>, CSS is the <strong>clothes and makeup</strong>!
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Basic CSS Syntax</div>
        <div class="code-box"><span class="p">selector</span> {
  <span class="a">property</span>: <span class="v">value</span>;
  <span class="a">property</span>: <span class="v">value</span>;
}

<span class="cm">/* Example */</span>
<span class="p">h1</span> {
  <span class="a">color</span>: <span class="v">red</span>;
  <span class="a">font-size</span>: <span class="v">24px</span>;
  <span class="a">text-align</span>: <span class="v">center</span>;
}</div>
      </div>
      <div class="tip-box"><span class="tip-icon">💡</span><div class="tip-text">CSS was created by <strong>Håkon Wium Lie</strong> in 1994. The word <strong>Cascading</strong> means that styles "flow down" from parent elements to child elements.</div></div>
      <div class="tip-box"><span class="tip-icon">🔑</span><div class="tip-text">CSS rules have 3 parts: <strong>Selector</strong> (who to style), <strong>Property</strong> (what to change), and <strong>Value</strong> (what to set it to). Each rule ends with a <strong>semicolon ;</strong></div></div>
    `
  },

  { id: 'css-2', icon: '📂', title: 'Types of CSS',
    html: () => `
      <p class="topic-title css-c">Types of CSS</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <table class="info-table">
        <tr><th>Type</th><th>Where it goes</th><th>Best for</th></tr>
        <tr><td style="color:#ff8c69">Inline CSS</td><td class="dc">Inside the HTML tag using <code>style</code> attribute</td><td class="dc">Quick one-off changes</td></tr>
        <tr><td style="color:#ffd700">Internal CSS</td><td class="dc">Inside &lt;style&gt; tag in &lt;head&gt;</td><td class="dc">Single page styling</td></tr>
        <tr><td style="color:#00e5c0">External CSS</td><td class="dc">Separate <code>.css</code> file, linked with &lt;link&gt;</td><td class="dc">Whole website (BEST!)</td></tr>
      </table>
      <div class="code-wrap">
        <div class="code-lbl">1. Inline CSS</div>
        <div class="code-box"><span class="t">&lt;p</span> <span class="a">style</span>=<span class="v">"color:red; font-size:20px;"</span><span class="t">&gt;</span>Red text<span class="t">&lt;/p&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">2. Internal CSS (in &lt;head&gt;)</div>
        <div class="code-box"><span class="t">&lt;style&gt;</span>
  <span class="p">p</span> { <span class="a">color</span>: <span class="v">blue</span>; <span class="a">font-size</span>: <span class="v">18px</span>; }
<span class="t">&lt;/style&gt;</span></div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">3. External CSS (recommended!)</div>
        <div class="code-box"><span class="cm">/* In your HTML file: */</span>
<span class="t">&lt;link</span> <span class="a">rel</span>=<span class="v">"stylesheet"</span> <span class="a">href</span>=<span class="v">"style.css"</span><span class="t">&gt;</span>

<span class="cm">/* In style.css file: */</span>
<span class="p">body</span> { <span class="a">background</span>: <span class="v">white</span>; }
<span class="p">p</span>    { <span class="a">color</span>: <span class="v">black</span>; }</div>
      </div>
      <div class="tip-box"><span class="tip-icon">⭐</span><div class="tip-text">External CSS is always best practice. You write styles <strong>once</strong> and they apply to the <strong>whole website</strong>. Change the .css file → every page updates instantly!</div></div>
    `
  },

  { id: 'css-3', icon: '🎯', title: 'Selectors & Types',
    html: () => `
      <p class="topic-title css-c">CSS Selectors</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">A <strong>selector</strong> tells CSS <em>which HTML element</em> to style.</div>
      <table class="info-table">
        <tr><th>Selector</th><th>Symbol</th><th>What it targets</th></tr>
        <tr><td>Universal</td><td class="tc">*</td><td class="dc">ALL elements on the page</td></tr>
        <tr><td>Element</td><td class="tc">p, h1, div</td><td class="dc">All tags of that type</td></tr>
        <tr><td>Class</td><td class="tc">.classname</td><td class="dc">Elements with that class (reusable)</td></tr>
        <tr><td>ID</td><td class="tc">#idname</td><td class="dc">ONE specific element (unique)</td></tr>
        <tr><td>Descendant</td><td class="tc">div p</td><td class="dc">All &lt;p&gt; inside a &lt;div&gt;</td></tr>
        <tr><td>Grouping</td><td class="tc">h1, h2, p</td><td class="dc">Multiple elements, same style</td></tr>
        <tr><td>Pseudo-class</td><td class="tc">a:hover</td><td class="dc">Element in a specific state</td></tr>
      </table>
      <div class="code-wrap">
        <div class="code-lbl">All Selector Types in Action</div>
        <div class="code-box"><span class="p">*</span>       { <span class="a">margin</span>: <span class="v">0</span>; }             <span class="cm">/* all */</span>
<span class="p">p</span>       { <span class="a">color</span>: <span class="v">blue</span>; }          <span class="cm">/* element */</span>
<span class="p">.card</span>   { <span class="a">background</span>: <span class="v">white</span>; }    <span class="cm">/* class */</span>
<span class="p">#header</span> { <span class="a">font-size</span>: <span class="v">2rem</span>; }     <span class="cm">/* id */</span>
<span class="p">div p</span>   { <span class="a">color</span>: <span class="v">green</span>; }          <span class="cm">/* descendant */</span>
<span class="p">h1, h2</span>  { <span class="a">font-weight</span>: <span class="v">bold</span>; }    <span class="cm">/* grouping */</span>
<span class="p">a:hover</span> { <span class="a">color</span>: <span class="v">red</span>; }            <span class="cm">/* pseudo */</span></div>
      </div>
      <div class="tip-box"><span class="tip-icon">🧠</span><div class="tip-text"><strong>Specificity order</strong> (strongest first): Inline style → ID (#) → Class (.) → Element. If two rules conflict, the more specific one wins!</div></div>
    `
  },

  { id: 'css-4', icon: '🔧', title: 'CSS Properties',
    html: () => `
      <p class="topic-title css-c">Common CSS Properties</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="code-wrap">
        <div class="code-lbl">Text Properties</div>
        <div class="code-box"><span class="p">p</span> {
  <span class="a">color</span>: <span class="v">red</span>;                    <span class="cm">/* text colour */</span>
  <span class="a">font-size</span>: <span class="v">18px</span>;              <span class="cm">/* text size */</span>
  <span class="a">font-family</span>: <span class="v">Arial, sans-serif</span>; <span class="cm">/* font type */</span>
  <span class="a">font-weight</span>: <span class="v">bold</span>;             <span class="cm">/* bold / normal */</span>
  <span class="a">font-style</span>: <span class="v">italic</span>;           <span class="cm">/* italic */</span>
  <span class="a">text-align</span>: <span class="v">center</span>;          <span class="cm">/* left/right/center/justify */</span>
  <span class="a">text-decoration</span>: <span class="v">underline</span>;   <span class="cm">/* underline/none/line-through */</span>
  <span class="a">line-height</span>: <span class="v">1.6</span>;             <span class="cm">/* space between lines */</span>
  <span class="a">letter-spacing</span>: <span class="v">2px</span>;         <span class="cm">/* space between letters */</span>
}</div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Background Properties</div>
        <div class="code-box"><span class="p">body</span> {
  <span class="a">background-color</span>: <span class="v">#f0f0f0</span>;     <span class="cm">/* solid colour */</span>
  <span class="a">background-image</span>: <span class="v">url(bg.jpg)</span>;  <span class="cm">/* image */</span>
  <span class="a">background-repeat</span>: <span class="v">no-repeat</span>;  <span class="cm">/* don't tile */</span>
  <span class="a">background-size</span>: <span class="v">cover</span>;        <span class="cm">/* fill screen */</span>
}</div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Border Properties</div>
        <div class="code-box"><span class="p">div</span> {
  <span class="a">border</span>: <span class="v">2px solid black</span>;       <span class="cm">/* width style colour */</span>
  <span class="a">border-radius</span>: <span class="v">10px</span>;           <span class="cm">/* rounded corners */</span>
  <span class="a">border-top</span>: <span class="v">3px dashed red</span>;   <span class="cm">/* one side only */</span>
}</div>
      </div>
      <table class="info-table">
        <tr><th>Border Style Values</th></tr>
        <tr><td class="dc">solid, dashed, dotted, double, groove, none</td></tr>
      </table>
    `
  },

  { id: 'css-5', icon: '📦', title: 'CSS Box Model',
    html: () => `
      <p class="topic-title css-c">CSS Box Model</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <div class="explain">Every HTML element is a <strong>rectangular box</strong>. The CSS Box Model describes the 4 layers around it.</div>
      <div class="box-model">
        <div class="bm-margin">MARGIN — space OUTSIDE the border
          <div class="bm-border">BORDER — the visible outline
            <div class="bm-padding">PADDING — space INSIDE the border
              <div class="bm-content">CONTENT — text / image / etc.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="code-wrap">
        <div class="code-lbl">Box Model in CSS</div>
        <div class="code-box"><span class="p">div</span> {
  <span class="a">width</span>: <span class="v">200px</span>;            <span class="cm">← content width</span>
  <span class="a">padding</span>: <span class="v">20px</span>;          <span class="cm">← space inside border</span>
  <span class="a">border</span>: <span class="v">5px solid red</span>;  <span class="cm">← the border</span>
  <span class="a">margin</span>: <span class="v">10px</span>;           <span class="cm">← space outside border</span>
}
<span class="cm">/* Total width = 200 + 20 + 20 + 5 + 5 = 250px */</span></div>
      </div>
      <table class="info-table">
        <tr><th>Layer</th><th>Property</th><th>What it does</th></tr>
        <tr><td class="tc">Content</td><td class="ac">width / height</td><td class="dc">The actual content size</td></tr>
        <tr><td class="tc">Padding</td><td class="ac">padding</td><td class="dc">Space between content and border</td></tr>
        <tr><td class="tc">Border</td><td class="ac">border</td><td class="dc">The outline around the element</td></tr>
        <tr><td class="tc">Margin</td><td class="ac">margin</td><td class="dc">Space between this element and others</td></tr>
      </table>
      <div class="tip-box"><span class="tip-icon">💡</span><div class="tip-text">Pro tip: Add <code>box-sizing: border-box</code> to your CSS. This makes the width <strong>include</strong> padding and border — no more maths surprises!</div></div>
    `
  },

  { id: 'css-6', icon: '📏', title: 'CSS Measurement Units',
    html: () => `
      <p class="topic-title css-c">CSS Measurement Units</p>
      <span class="source-tag">W3Schools + Grade 9</span>
      <table class="info-table">
        <tr><th>Unit</th><th>Type</th><th>Meaning</th><th>Example</th></tr>
        <tr><td class="tc">px</td><td>Absolute</td><td class="dc">Pixels — fixed screen size</td><td class="ac">font-size: 16px</td></tr>
        <tr><td class="tc">%</td><td>Relative</td><td class="dc">% of parent element</td><td class="ac">width: 50%</td></tr>
        <tr><td class="tc">em</td><td>Relative</td><td class="dc">Relative to parent font-size</td><td class="ac">padding: 1em</td></tr>
        <tr><td class="tc">rem</td><td>Relative</td><td class="dc">Relative to root (html) font-size</td><td class="ac">font-size: 1.2rem</td></tr>
        <tr><td class="tc">vw</td><td>Relative</td><td class="dc">1% of viewport width</td><td class="ac">width: 100vw</td></tr>
        <tr><td class="tc">vh</td><td>Relative</td><td class="dc">1% of viewport height</td><td class="ac">height: 100vh</td></tr>
        <tr><td class="tc">pt</td><td>Absolute</td><td class="dc">Points (1pt = 1/72 inch)</td><td class="ac">font-size: 12pt</td></tr>
        <tr><td class="tc">cm / mm</td><td>Absolute</td><td class="dc">Centimetres / Millimetres</td><td class="ac">width: 5cm</td></tr>
      </table>
      <div class="tip-box"><span class="tip-icon">🎯</span><div class="tip-text">
        For beginners: Use <strong>px</strong> for precise fixed sizes.<br>
        Use <strong>%</strong> to make things responsive (stretch/shrink with screen).<br>
        Use <strong>rem</strong> for consistent font sizes across a whole website.
      </div></div>
    `
  },

  { id: 'css-7', icon: '💻', title: 'Basic CSS Code',
    html: () => `
      <p class="topic-title css-c">Basic CSS Code — Full Example</p>
      <span class="source-tag">W3Schools + Grade 9 Textbook</span>
      <div class="explain">Here's a complete <code>style.css</code> file written for Grade 9 level — covering all the key things your book expects you to know:</div>
      <div class="code-wrap">
        <div class="code-lbl">style.css — Complete Beginner File</div>
        <div class="code-box"><span class="cm">/* ── RESET ── */</span>
<span class="p">*</span> {
  <span class="a">margin</span>: <span class="v">0</span>;
  <span class="a">padding</span>: <span class="v">0</span>;
  <span class="a">box-sizing</span>: <span class="v">border-box</span>;
}

<span class="cm">/* ── BODY ── */</span>
<span class="p">body</span> {
  <span class="a">background-color</span>: <span class="v">#f5f5f5</span>;
  <span class="a">font-family</span>: <span class="v">Arial, sans-serif</span>;
  <span class="a">color</span>: <span class="v">#333333</span>;
}

<span class="cm">/* ── HEADINGS ── */</span>
<span class="p">h1</span> {
  <span class="a">color</span>: <span class="v">#ff6b35</span>;
  <span class="a">text-align</span>: <span class="v">center</span>;
  <span class="a">font-size</span>: <span class="v">36px</span>;
  <span class="a">text-decoration</span>: <span class="v">underline</span>;
}

<span class="p">h2</span> {
  <span class="a">color</span>: <span class="v">#0055aa</span>;
  <span class="a">font-size</span>: <span class="v">24px</span>;
}

<span class="cm">/* ── PARAGRAPH ── */</span>
<span class="p">p</span> {
  <span class="a">font-size</span>: <span class="v">16px</span>;
  <span class="a">line-height</span>: <span class="v">1.6</span>;
  <span class="a">margin-bottom</span>: <span class="v">12px</span>;
  <span class="a">color</span>: <span class="v">#555</span>;
}

<span class="cm">/* ── DIV BOX ── */</span>
<span class="p">.box</span> {
  <span class="a">width</span>: <span class="v">300px</span>;
  <span class="a">height</span>: <span class="v">150px</span>;
  <span class="a">background-color</span>: <span class="v">lightblue</span>;
  <span class="a">border</span>: <span class="v">2px solid navy</span>;
  <span class="a">padding</span>: <span class="v">20px</span>;
  <span class="a">margin</span>: <span class="v">10px auto</span>;  <span class="cm">/* centred */</span>
  <span class="a">border-radius</span>: <span class="v">8px</span>;
}

<span class="cm">/* ── LINKS ── */</span>
<span class="p">a</span> {
  <span class="a">color</span>: <span class="v">blue</span>;
  <span class="a">text-decoration</span>: <span class="v">none</span>;
}
<span class="p">a:hover</span> {
  <span class="a">color</span>: <span class="v">red</span>;
  <span class="a">text-decoration</span>: <span class="v">underline</span>;
}

<span class="cm">/* ── TABLE ── */</span>
<span class="p">table</span> {
  <span class="a">border-collapse</span>: <span class="v">collapse</span>;
  <span class="a">width</span>: <span class="v">100%</span>;
}
<span class="p">th, td</span> {
  <span class="a">border</span>: <span class="v">1px solid black</span>;
  <span class="a">padding</span>: <span class="v">8px</span>;
  <span class="a">text-align</span>: <span class="v">left</span>;
}
<span class="p">th</span> {
  <span class="a">background-color</span>: <span class="v">#ff6b35</span>;
  <span class="a">color</span>: <span class="v">white</span>;
}

<span class="cm">/* ── FORM INPUT ── */</span>
<span class="p">input[type="text"]</span>,
<span class="p">input[type="email"]</span>,
<span class="p">textarea</span> {
  <span class="a">width</span>: <span class="v">100%</span>;
  <span class="a">padding</span>: <span class="v">8px</span>;
  <span class="a">border</span>: <span class="v">1px solid #ccc</span>;
  <span class="a">border-radius</span>: <span class="v">4px</span>;
  <span class="a">font-size</span>: <span class="v">14px</span>;
}

<span class="p">input[type="submit"]</span> {
  <span class="a">background-color</span>: <span class="v">green</span>;
  <span class="a">color</span>: <span class="v">white</span>;
  <span class="a">padding</span>: <span class="v">10px 20px</span>;
  <span class="a">border</span>: <span class="v">none</span>;
  <span class="a">border-radius</span>: <span class="v">4px</span>;
  <span class="a">cursor</span>: <span class="v">pointer</span>;
  <span class="a">font-size</span>: <span class="v">16px</span>;
}

<span class="p">input[type="submit"]:hover</span> {
  <span class="a">background-color</span>: <span class="v">darkgreen</span>;
}</div>
      </div>
    `
  },
];


/* ─────────────────────────────────────────────────
   QUIZ DATA (20 randomized questions)
   Sources: W3Schools concepts, Grade 9 syllabus
───────────────────────────────────────────────── */
const ALL_QUIZ = [
  // HTML
  { q: "What does HTML stand for?", sub: "html",
    opts: ["HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Markup Links", "Home Tool Markup Language"],
    ans: 0, exp: "HTML = HyperText Markup Language. Created by Tim Berners-Lee in 1991 to structure web pages." },

  { q: "Which tag is used to create a line break?", sub: "html",
    opts: ["&lt;lb&gt;", "&lt;newline&gt;", "&lt;br&gt;", "&lt;break&gt;"],
    ans: 2, exp: "&lt;br&gt; is an empty tag that inserts a line break. No closing tag needed!" },

  { q: "What type of tag is &lt;br&gt;?", sub: "html",
    opts: ["Container tag", "Empty tag", "Block tag", "Pair tag"],
    ans: 1, exp: "&lt;br&gt; is an empty tag — it doesn't wrap any content and has NO closing tag." },

  { q: "The &lt;!DOCTYPE html&gt; declaration tells the browser to use which version of HTML?", sub: "html",
    opts: ["HTML 4", "XHTML", "HTML5", "HTML 3.2"],
    ans: 2, exp: "&lt;!DOCTYPE html&gt; tells the browser to use HTML5. It must be the very first line of your HTML file." },

  { q: "Which HTML tag creates the LARGEST heading?", sub: "html",
    opts: ["&lt;h6&gt;", "&lt;heading&gt;", "&lt;h1&gt;", "&lt;big&gt;"],
    ans: 2, exp: "Headings go from &lt;h1&gt; (biggest) to &lt;h6&gt; (smallest). Always use only ONE &lt;h1&gt; per page." },

  { q: "What does the 'alt' attribute in an &lt;img&gt; tag do?", sub: "html",
    opts: ["Changes image size", "Adds animation", "Provides alternative text if image fails", "Aligns the image"],
    ans: 2, exp: "alt='text' provides alternative text for screen readers and shows when the image cannot be loaded. Always include it!" },

  { q: "Which attribute in an anchor tag opens the link in a new tab?", sub: "html",
    opts: ["href='new'", "target='_blank'", "open='tab'", "link='new'"],
    ans: 1, exp: "target='_blank' opens the linked page in a brand new browser tab or window." },

  { q: "What does 'colspan' do in a table?", sub: "html",
    opts: ["Adds a new column", "Merges cells horizontally across columns", "Merges cells vertically across rows", "Sets column width"],
    ans: 1, exp: "colspan merges cells HORIZONTALLY. colspan='3' makes one cell span across 3 columns." },

  { q: "Which HTML list type shows bullet points by default?", sub: "html",
    opts: ["&lt;ol&gt;", "&lt;dl&gt;", "&lt;ul&gt;", "&lt;list&gt;"],
    ans: 2, exp: "&lt;ul&gt; = Unordered List = bullet points. &lt;ol&gt; = Ordered List = numbers." },

  { q: "In a form, which input type lets you pick ONLY one option from a group?", sub: "html",
    opts: ["checkbox", "select", "radio", "option"],
    ans: 2, exp: "Radio buttons let you pick ONE option. All radios in the same group must have the SAME 'name' attribute." },

  { q: "Which tag creates a horizontal dividing line on the page?", sub: "html",
    opts: ["&lt;line&gt;", "&lt;divider&gt;", "&lt;br&gt;", "&lt;hr&gt;"],
    ans: 3, exp: "&lt;hr&gt; (Horizontal Rule) draws a horizontal line. It's an empty tag — no closing tag needed." },

  { q: "The &lt;marquee&gt; 'behavior' attribute set to 'bounce' makes text:", sub: "html",
    opts: ["Scroll left only", "Scroll right only", "Go back and forth", "Spin in circles"],
    ans: 2, exp: "behavior='bounce' makes the marquee text bounce back and forth between the edges of the marquee area." },

  { q: "Which tag makes text appear ABOVE the normal line (like x²)?", sub: "html",
    opts: ["&lt;sub&gt;", "&lt;up&gt;", "&lt;sup&gt;", "&lt;raise&gt;"],
    ans: 2, exp: "&lt;sup&gt; = Superscript — raises text above the normal line. Use it for powers like x² or footnotes." },

  { q: "What is the correct HTML for an internal page link (bookmark)?", sub: "html",
    opts: ["&lt;a href='page.html'&gt;", "&lt;a href='#section'&gt;", "&lt;a link='#section'&gt;", "&lt;a to='section'&gt;"],
    ans: 1, exp: "To link to a section on the same page, use href='#id'. Then add id='section' to the target element." },

  // CSS
  { q: "What does CSS stand for?", sub: "css",
    opts: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Styling Syntax"],
    ans: 1, exp: "CSS = Cascading Style Sheets. 'Cascading' means styles flow from parent elements to children." },

  { q: "Which CSS selector targets elements with class='box'?", sub: "css",
    opts: ["#box", "box", ".box", "*box"],
    ans: 2, exp: "Classes use a dot (.) prefix. .box targets ALL elements with class='box'. Classes are reusable!" },

  { q: "What is the correct CSS Box Model order, from inside to outside?", sub: "css",
    opts: ["Content → Margin → Padding → Border", "Content → Padding → Border → Margin", "Border → Content → Padding → Margin", "Padding → Border → Content → Margin"],
    ans: 1, exp: "Content → Padding → Border → Margin. Remember: 'Cool People Buy Merchandise'" },

  { q: "Which CSS property changes TEXT colour?", sub: "css",
    opts: ["font-color", "text-color", "background-color", "color"],
    ans: 3, exp: "The 'color' property changes text colour. 'background-color' changes the background." },

  { q: "In CSS, 'margin' controls space on which side of the border?", sub: "css",
    opts: ["Inside the border", "Outside the border", "On the border itself", "Between text and border"],
    ans: 1, exp: "Margin is OUTSIDE the border — it pushes other elements away. Padding is INSIDE the border — it pushes content from the edge." },

  { q: "Which type of CSS is considered BEST practice for websites?", sub: "css",
    opts: ["Inline CSS", "Internal CSS", "External CSS", "All are equally good"],
    ans: 2, exp: "External CSS is best! One .css file styles ALL pages of your site. Change one file → whole website updates!" },

  { q: "What CSS unit is a percentage of the VIEWPORT (screen) width?", sub: "css",
    opts: ["px", "%", "vh", "vw"],
    ans: 3, exp: "vw = viewport width. 100vw = the full width of the browser window. Great for full-width layouts!" },

  { q: "Which CSS property rounds the corners of a border?", sub: "css",
    opts: ["corner-radius", "border-curve", "border-radius", "round-border"],
    ans: 2, exp: "border-radius rounds the corners of an element. border-radius: 50% makes a perfect circle!" },

  { q: "The CSS selector 'div p' means:", sub: "css",
    opts: ["All divs AND all p tags", "All p tags directly next to a div", "All p tags INSIDE a div", "A tag called 'div p'"],
    ans: 2, exp: "'div p' is a descendant selector — it targets all &lt;p&gt; elements that are INSIDE a &lt;div&gt;, at any depth." },

  { q: "Which CSS property controls the space INSIDE an element, between content and border?", sub: "css",
    opts: ["margin", "spacing", "padding", "gap"],
    ans: 2, exp: "Padding is the space INSIDE the border. Margin is the space OUTSIDE. Think: padding = cushion inside the box." },
];


/* ─────────────────────────────────────────────────
   MAIN APP OBJECT
───────────────────────────────────────────────── */
const App = {

  currentChapter: 'html',
  currentIndex: 0,
  quizQueue: [],
  quizIndex: 0,
  quizScore: 0,

  /* ── XP BAR ── */
  updateXPBar() {
    const xp  = STATE.xp;
    const pct = Math.min(100, (xp / 500) * 100);
    const lv  = getLevel(xp);
    document.getElementById('homeXP').textContent    = xp;
    document.getElementById('homeXPBar').style.width = pct + '%';
    document.getElementById('levelTag').textContent  = lv.label;
    this.updateProgressCounts();
  },

  updateProgressCounts() {
    const hDone = HTML_TOPICS.filter(t => STATE.done.includes(t.id)).length;
    const cDone = CSS_TOPICS.filter(t  => STATE.done.includes(t.id)).length;
    document.getElementById('htmlProgress').textContent = `${hDone} / ${HTML_TOPICS.length} topics done`;
    document.getElementById('cssProgress').textContent  = `${cDone} / ${CSS_TOPICS.length} topics done`;
  },

  /* ── NAVIGATION ── */
  goHome() {
    showScreen('screen-home');
    this.updateXPBar();
  },

  /* ── OPEN LESSON ── */
  openLesson(chapter) {
    this.currentChapter = chapter;
    this.currentIndex   = 0;
    const topics = chapter === 'html' ? HTML_TOPICS : CSS_TOPICS;
    const isHtml = chapter === 'html';

    // Topbar
    document.getElementById('lessonTitle').textContent  = isHtml ? '🌐 HTML Mission' : '🎨 CSS Mission';
    document.getElementById('lessonTitle').style.color  = isHtml ? 'var(--html)' : 'var(--css)';

    // Build sidebar
    const list = document.getElementById('topicList');
    list.innerHTML = '';
    topics.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'topic-item' + (!isHtml ? ' css-t' : '') + (STATE.done.includes(t.id) ? ' done' : '');
      div.id = 'ti-' + i;
      div.innerHTML = `<span class="t-num">${i + 1}</span><span class="t-lbl">${t.icon} ${t.title}</span>`;
      div.addEventListener('click', () => this.loadTopic(i));
      list.appendChild(div);
    });

    showScreen('screen-lesson');
    this.loadTopic(0);
  },

  loadTopic(index) {
    const topics = this.currentChapter === 'html' ? HTML_TOPICS : CSS_TOPICS;
    if (index < 0 || index >= topics.length) return;
    this.currentIndex = index;

    // Sidebar highlight
    document.querySelectorAll('.topic-item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    // Mobile bar
    const mtbLabel = document.getElementById('mtbLabel');
    if (mtbLabel) mtbLabel.textContent = `${index + 1} / ${topics.length} — ${topics[index].title}`;

    // Build content
    const t     = topics[index];
    const isHtml = this.currentChapter === 'html';
    const nextCls = isHtml ? 'tn-next-html' : 'tn-next-css';
    const isLast  = index === topics.length - 1;

    const prevBtn = index > 0
      ? `<button class="tn-prev" onclick="App.loadTopic(${index - 1})">&#8592; Prev</button>`
      : '<span></span>';

    const nextBtn = isLast
      ? `<button class="tn-finish" onclick="App.markAndQuiz(${index})">🏆 Go to Quiz!</button>`
      : `<button class="${nextCls}" onclick="App.markAndNext(${index})">Next &#8594;</button>`;

    document.getElementById('contentPane').innerHTML = `
      ${t.html()}
      <div class="topic-nav">
        ${prevBtn}
        ${nextBtn}
      </div>
    `;

    // Scroll to top of content
    document.getElementById('contentPane').scrollTo(0, 0);
    window.scrollTo(0, 0);
  },

  prevTopic() { this.loadTopic(this.currentIndex - 1); },
  nextTopic() { this.loadTopic(this.currentIndex + 1); },

  markAndNext(index) {
    const topics = this.currentChapter === 'html' ? HTML_TOPICS : CSS_TOPICS;
    const t = topics[index];
    if (STATE.markDone(t.id)) {
      showToast('⚡ +15 XP — Topic Cleared!');
      document.getElementById('ti-' + index)?.classList.add('done');
    }
    this.loadTopic(index + 1);
  },

  markAndQuiz(index) {
    const topics = this.currentChapter === 'html' ? HTML_TOPICS : CSS_TOPICS;
    const t = topics[index];
    if (STATE.markDone(t.id)) {
      showToast('⚡ +15 XP — Chapter Complete!');
    }
    setTimeout(() => this.openQuiz(), 300);
  },

  /* ── QUIZ ── */
  openQuiz() {
    this.quizQueue  = [...ALL_QUIZ].sort(() => Math.random() - 0.5).slice(0, 20);
    this.quizIndex  = 0;
    this.quizScore  = 0;

    document.getElementById('scoreScreen').classList.add('hidden');
    document.getElementById('quizArea').style.display = 'block';

    showScreen('screen-quiz');
    this.showQuestion();
  },

  showQuestion() {
    const q   = this.quizQueue[this.quizIndex];
    const pct = ((this.quizIndex + 1) / this.quizQueue.length) * 100;

    document.getElementById('quizCounter').textContent  = `${this.quizIndex + 1} / ${this.quizQueue.length}`;
    document.getElementById('quizProgFill').style.width = pct + '%';

    // Shuffle options
    const opts = q.opts
      .map((o, i) => ({ text: o, correct: i === q.ans }))
      .sort(() => Math.random() - 0.5);

    const optsHTML = opts.map(o =>
      `<button class="qz-opt" onclick="App.answerQ(this, ${o.correct}, \`${q.exp.replace(/`/g,'\\`')}\`)">${o.text}</button>`
    ).join('');

    document.getElementById('quizArea').innerHTML = `
      <div class="quiz-card">
        <span class="qz-badge ${q.sub}-b">${q.sub.toUpperCase()}</span>
        <div class="qz-text">${q.q}</div>
        <div class="qz-options">${optsHTML}</div>
        <div class="qz-explain" id="qzExplain"></div>
        <button class="qz-next" id="qzNext" onclick="App.nextQuestion()">
          ${this.quizIndex < this.quizQueue.length - 1 ? 'Next Question &#8594;' : 'See My Score 🏆'}
        </button>
      </div>
    `;
  },

  answerQ(btn, correct, exp) {
    if (btn.disabled) return;
    document.querySelectorAll('.qz-opt').forEach(b => b.disabled = true);
    btn.classList.add(correct ? 'correct' : 'wrong');
    document.getElementById('qzExplain').textContent   = exp;
    document.getElementById('qzExplain').style.display = 'block';
    document.getElementById('qzNext').style.display    = 'block';
    if (correct) {
      this.quizScore++;
      STATE.addXP(5);
      showToast('✅ Correct! +5 XP');
    } else {
      showToast('❌ Wrong — read the explanation!');
    }
  },

  nextQuestion() {
    this.quizIndex++;
    if (this.quizIndex < this.quizQueue.length) {
      this.showQuestion();
    } else {
      this.showScore();
    }
  },

  showScore() {
    document.getElementById('quizArea').style.display = 'none';
    const ss  = document.getElementById('scoreScreen');
    ss.classList.remove('hidden');

    const total = this.quizQueue.length;
    const pct   = this.quizScore / total;
    const xpEarned = this.quizScore * 5;

    const msg = pct === 1   ? '🏆 PERFECT! You are a Web Dev legend!'
              : pct >= 0.8  ? '🔥 Excellent! Almost perfect!'
              : pct >= 0.6  ? '👍 Good work! Keep studying!'
              : pct >= 0.4  ? '📚 Keep practising — you can do it!'
              :               '🌱 Go back and re-read the topics!';

    document.getElementById('ssScore').textContent = `${this.quizScore} / ${total}`;
    document.getElementById('ssMsg').textContent   = msg;
    document.getElementById('ssXP').textContent    = `+${xpEarned} XP earned this quiz!`;

    if (pct >= 0.6) launchConfetti();
  }
};


/* ─────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────── */
App.updateXPBar();
