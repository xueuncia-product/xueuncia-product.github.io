const base = new URL('.', import.meta.url);
const $ = (selector) => document.querySelector(selector);
const login = $('.vault-login'), library = $('.vault-library'), reader = $('.vault-reader');
const password = $('#vault-password'), status = $('.vault-status'), submit = $('[type=submit]');
const list = $('.vault-list'), search = $('[type=search]'), year = $('#vault-year'), more = $('.vault-more');
const categories = $('.vault-categories'), lock = $('.vault-lock'), prose = $('.vault-prose');
let key = null, archive = null, generation = 0, reading = 0, limit = 80;
let scope = 'featured', category = '', returnFocus = null, returnScroll = 0;
let requests = new AbortController();
let theme;
try { theme = localStorage.getItem('theme'); } catch { /* Browser storage can be unavailable. */ }
const requestedTheme = new URLSearchParams(location.search).get('theme');
const themes = ['sky', 'cosmos', 'ink'];
if (themes.includes(requestedTheme)) theme = requestedTheme;
if (!themes.includes(theme)) theme = 'sky';
try { localStorage.setItem('theme', theme); } catch { /* The selected theme still works for this page. */ }

function safeLink(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) return false;
  if (/^#[\w:.-]*$/.test(value)) return true;
  if (!/^(?:https?:\/\/|mailto:)/i.test(value)) return false;
  try { return ['https:', 'http:', 'mailto:'].includes(new URL(value).protocol); } catch { return false; }
}
function safeImage(value) {
  const match = /^data:image\/(jpeg|png|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(value || '');
  if (!match) return null;
  try {
    const bytes = atob(match[2]);
    if (bytes.length < 12) return null;
    // Some archived .jpg files contain GIF bytes; trust the raster signature, not the old extension.
    const type = bytes.startsWith('\xff\xd8\xff') ? 'jpeg'
      : bytes.startsWith('\x89PNG\r\n\x1a\n') ? 'png'
      : /^(?:GIF87a|GIF89a)/.test(bytes) ? 'gif'
      : bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP' ? 'webp' : null;
    return type ? `data:image/${type};base64,${match[2]}` : null;
  } catch { return null; }
}
function missingImage(alt) {
  return document.createTextNode(alt ? `${alt}（图片暂未保留）` : '图片暂未保留');
}
function sanitizeArticle(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const allowed = new Set('p br hr h1 h2 h3 h4 h5 h6 strong em b i u s del code pre blockquote ul ol li dl dt dd table thead tbody tfoot tr th td caption a img span div sup sub'.split(' '));
  const blocked = new Set('script style iframe frame frameset svg math form input button select textarea option object embed applet link meta base audio video source canvas template noscript'.split(' '));
  const copy = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE || blocked.has(node.localName)) return document.createDocumentFragment();
    const tag = node.localName;
    const imageSource = tag === 'img' ? safeImage(node.getAttribute('src')) : null;
    if (tag === 'img' && !imageSource) return missingImage(node.getAttribute('alt'));
    const element = allowed.has(tag) ? document.createElement(tag) : document.createDocumentFragment();
    if (tag === 'a' && safeLink(node.getAttribute('href'))) {
      element.setAttribute('href', node.getAttribute('href'));
      element.setAttribute('rel', 'noopener noreferrer');
      if (!node.getAttribute('href').startsWith('#')) element.setAttribute('target', '_blank');
    }
    if (tag === 'img') {
      element.addEventListener('load', () => {
        if (element.naturalWidth <= 32 && element.naturalHeight <= 32) element.classList.add('vault-emote');
      }, { once: true });
      element.setAttribute('src', imageSource);
      element.setAttribute('alt', node.getAttribute('alt') || '');
      element.setAttribute('loading', 'lazy'); element.setAttribute('decoding', 'async');
      element.addEventListener('error', () => element.replaceWith(missingImage(element.alt)), { once: true });
    }
    if (allowed.has(tag) && node.hasAttribute('title')) element.setAttribute('title', node.getAttribute('title'));
    for (const child of node.childNodes) element.append(copy(child));
    return element;
  };
  const fragment = document.createDocumentFragment();
  for (const child of template.content.childNodes) fragment.append(copy(child));
  return fragment;
}

function paintTheme() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })), hour = now.getHours() + now.getMinutes() / 60;
  const dark = theme === 'cosmos' || (theme === 'sky' && (hour < 5.5 || hour >= 19.5));
  document.body.classList.toggle('night', dark);
  document.body.classList.toggle('cosmos', theme === 'cosmos');
  document.body.classList.toggle('ink', theme === 'ink');
  document.querySelectorAll('[data-theme]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
}
paintTheme();
setInterval(paintTheme, 60000);
document.querySelectorAll('[data-theme]').forEach((button) => button.addEventListener('click', () => {
  theme = button.dataset.theme;
  try { localStorage.setItem('theme', theme); } catch { /* The theme still works for this page. */ }
  paintTheme();
}));

function clearReader() {
  prose.replaceChildren();
  $('.vault-reader h2').textContent = ''; $('.vault-meta').textContent = '';
}
function reset() {
  generation++; reading++; requests.abort(); requests = new AbortController();
  key = null; archive = null; returnFocus = null; returnScroll = 0;
  document.body.classList.remove('reading');
  login.reset(); login.hidden = false; library.hidden = true; reader.hidden = true; lock.hidden = true;
  status.textContent = ''; submit.disabled = false; submit.textContent = '解锁';
  list.replaceChildren(); categories.replaceChildren(); search.value = '';
  year.replaceChildren(new Option('全部年份', ''));
  $('.vault-count').textContent = ''; $('.vault-results').textContent = '';
  scope = 'featured'; category = ''; limit = 80; clearReader();
  document.querySelectorAll('[data-scope]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scope === scope)));
}
lock.addEventListener('click', () => { reset(); password.focus(); });
addEventListener('pagehide', reset);

async function fetchFile(path, type = 'arrayBuffer', signal = requests.signal) {
  const response = await fetch(new URL(path, base), { cache: 'no-store', signal });
  if (!response.ok) throw new Error('归档暂时无法读取，请稍后重试。');
  return response[type]();
}
async function decrypt(path, sessionKey, signal) {
  const bytes = new Uint8Array(await fetchFile(path, 'arrayBuffer', signal));
  if (bytes.length < 29) throw new Error('归档文件已损坏。');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, sessionKey, bytes.slice(12));
  return JSON.parse(new TextDecoder().decode(plain));
}
function validPost(post) {
  return post && typeof post === 'object' && typeof post.file === 'string' && /^[a-f0-9]{32}\.bin$/.test(post.file)
    && typeof post.title === 'string' && typeof post.date === 'string' && /^\d{4}-\d{2}-\d{2}(?:[ T].*)?$/.test(post.date)
    && (post.category === undefined || typeof post.category === 'string')
    && (post.featured === undefined || typeof post.featured === 'boolean')
    && (post.summary === undefined || typeof post.summary === 'string')
    && (post.metadataOnly === undefined || typeof post.metadataOnly === 'boolean')
    && (post.tags === undefined || (Array.isArray(post.tags) && post.tags.every((tag) => typeof tag === 'string')));
}
login.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  const session = ++generation;
  requests.abort(); requests = new AbortController(); const signal = requests.signal;
  const secret = password.value; password.value = '';
  submit.disabled = true; submit.textContent = '解锁中…'; status.textContent = ''; lock.hidden = false;
  try {
    if (!crypto.subtle) throw new Error('请使用 HTTPS 或本机预览打开归档。');
    const config = await fetchFile('data/config.json', 'json', signal);
    if (config.version !== 1 || config.iterations !== 600000 || typeof config.salt !== 'string') throw new Error('归档格式不受支持。');
    const salt = Uint8Array.from(atob(config.salt), (c) => c.charCodeAt(0));
    if (salt.length !== 16) throw new Error('归档格式不受支持。');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
    const sessionKey = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: config.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    if (session !== generation) return;
    const decoded = await decrypt('data/directory.bin', sessionKey, signal);
    if (session !== generation) return;
    if (!decoded || !Array.isArray(decoded.posts) || decoded.posts.some((post) => !validPost(post))) throw new Error('归档目录损坏。');
    key = sessionKey;
    archive = decoded.posts.map((post) => ({ ...post, category: post.category || '日常记录', featured: post.featured === true, summary: (post.summary || '').slice(0, 100) }));
    const years = [...new Set(archive.map((post) => post.date.slice(0, 4)))].sort().reverse();
    for (const value of years) year.add(new Option(value, value));
    const daily = archive.filter((post) => post.category === '日常记录').length;
    $('.vault-count').textContent = `${archive.length.toLocaleString()} 篇记录 · ${archive.filter((post) => post.featured).length.toLocaleString()} 篇精选 · ${daily.toLocaleString()} 篇日常记录`;
    login.hidden = true; library.hidden = false; limit = 80; renderCategories(); renderList(); search.focus();
  } catch (error) {
    if (session !== generation || error.name === 'AbortError') return;
    status.textContent = error.name === 'OperationError' ? '密码不正确，或归档文件已损坏，请重试。' : error.message;
    lock.hidden = true; password.focus();
  } finally {
    if (session === generation) { submit.disabled = false; submit.textContent = '解锁'; }
  }
});

function scopedPosts() { return scope === 'featured' ? archive.filter((post) => post.featured) : archive; }
function renderCategories() {
  const counts = new Map();
  const posts = scopedPosts();
  for (const post of posts) counts.set(post.category, (counts.get(post.category) || 0) + 1);
  if (category && !counts.has(category)) category = '';
  categories.replaceChildren();
  for (const [name, count] of [['', posts.length], ...counts]) {
    const button = document.createElement('button'); button.type = 'button';
    button.textContent = `${name || '全部分类'} ${count.toLocaleString()}`;
    button.setAttribute('aria-pressed', String(category === name));
    button.addEventListener('click', () => { category = name; limit = 80; renderCategories(); renderList(); });
    categories.append(button);
  }
}
function renderList() {
  const query = search.value.trim().toLocaleLowerCase();
  const posts = scopedPosts().filter((post) => (!category || post.category === category) && (!year.value || post.date.startsWith(year.value)) && post.title.toLocaleLowerCase().includes(query));
  list.replaceChildren();
  for (const post of posts.slice(0, limit)) {
    const item = document.createElement('li'), button = document.createElement('button');
    const time = document.createElement('time'), copy = document.createElement('span'), title = document.createElement('strong'), meta = document.createElement('span');
    button.type = 'button'; time.dateTime = post.date.slice(0, 10); time.textContent = post.date.slice(0, 10); title.textContent = post.title;
    copy.className = 'vault-post-copy'; meta.className = 'vault-post-meta';
    meta.textContent = [post.category, post.featured ? '精选' : '', post.metadataOnly ? '仅存标题与日期' : '', ...(post.tags || []).slice(0, 3)].filter(Boolean).join(' · ');
    copy.append(title, meta);
    if (post.summary) { const summary = document.createElement('span'); summary.className = 'vault-summary'; summary.textContent = post.summary; copy.append(summary); }
    button.append(time, copy); button.addEventListener('click', () => openPost(post, button)); item.append(button); list.append(item);
  }
  $('.vault-results').textContent = posts.length ? `${posts.length.toLocaleString()} 篇 · 显示 ${Math.min(limit, posts.length)} 篇` : '当前筛选下没有记录，试试全部记录或其他年份。';
  more.hidden = posts.length <= limit;
}
document.querySelectorAll('[data-scope]').forEach((button) => button.addEventListener('click', () => {
  scope = button.dataset.scope; limit = 80;
  document.querySelectorAll('[data-scope]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.scope === scope)));
  renderCategories(); renderList();
}));
search.addEventListener('input', () => { limit = 80; renderList(); });
year.addEventListener('change', () => { limit = 80; renderList(); });
more.addEventListener('click', () => { limit += 80; renderList(); });
$('.vault-back').addEventListener('click', () => {
  reading++; reader.hidden = true; library.hidden = false; clearReader();
  document.body.classList.remove('reading');
  returnFocus?.focus({ preventScroll: true }); window.scrollTo({ top: returnScroll });
});
async function openPost(post, button) {
  const session = generation, articleRequest = ++reading, sessionKey = key, signal = requests.signal;
  returnFocus = button; returnScroll = window.scrollY;
  library.hidden = true; reader.hidden = false; clearReader();
  document.body.classList.add('reading'); window.scrollTo({ top: 0 });
  $('.vault-reader h2').textContent = post.title;
  $('.vault-meta').textContent = `${post.date} · ${post.category}${post.metadataOnly ? ' · 仅存标题与日期' : ''} · 正在读取…`;
  $('.vault-back').focus();
  try {
    const content = await decrypt(`data/posts/${post.file}`, sessionKey, signal);
    if (session !== generation || articleRequest !== reading) return;
    if (typeof content.html !== 'string') throw new Error('正文格式错误。');
    prose.replaceChildren(sanitizeArticle(content.html));
    $('.vault-meta').textContent = `${post.date} · ${post.category}${post.metadataOnly ? ' · 仅存标题与日期' : ''}`;
  } catch (error) {
    if (session === generation && articleRequest === reading && error.name !== 'AbortError') $('.vault-meta').textContent = '这篇记录暂时无法读取，请返回目录后重试。';
  }
}
