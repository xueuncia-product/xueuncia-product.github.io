const base = new URL('.', import.meta.url);
const $ = (selector) => document.querySelector(selector);
const library = $('.vault-library'), reader = $('.vault-reader');
const status = $('.vault-status'), retry = $('.vault-retry');
const list = $('.vault-list'), search = $('[type=search]'), year = $('#vault-year'), more = $('.vault-more');
const categories = $('.vault-categories'), prose = $('.vault-prose'), scene = $('[data-theme-scene]');
let key = null, archive = null, generation = 0, reading = 0, limit = 80;
let scope = 'featured', category = '', returnFocus = null, returnScroll = 0, activeFile = null;
let requests = new AbortController();
const verse = $('[data-theme-verse]'), initialScrollRestoration = history.scrollRestoration;
history.scrollRestoration = 'manual';
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
  document.documentElement.classList.toggle('night', dark);
  document.documentElement.classList.toggle('cosmos', theme === 'cosmos');
  document.documentElement.classList.toggle('ink', theme === 'ink');
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
  $('.vault-toc-items').replaceChildren(); $('.vault-toc').hidden = true;
  $('.vault-mobile-toc-items').replaceChildren(); $('.mobile-article-toc').hidden = true; $('.mobile-article-toc').open = false;
  $('.vault-related-items').replaceChildren(); $('.vault-memory-copy').textContent = ''; $('.vault-tags').replaceChildren();
  $('.vault-reader .reading-aside-sticky').classList.remove('vault-long-rail');
  for (const selector of ['[data-vault-date]', '[data-vault-category]', '[data-vault-duration]']) $(selector).textContent = '';
  $('[data-reading-progress]').value = 0; $('[data-reading-percent]').textContent = '0%';
}
function setPage(post) {
  document.body.classList.toggle('reading', !!post);
  document.body.dataset.pageKind = post ? 'article' : 'section';
  $('[data-vault-current]').hidden = !post; $('[data-vault-current]').textContent = post?.title || '';
  $('[data-vault-crumb-divider]').hidden = !post;
  post ? $('[data-vault-directory]').removeAttribute('aria-current') : $('[data-vault-directory]').setAttribute('aria-current', 'page');
  $('.vault-home-parent').hidden = !!post; $('.page-toolbar .vault-back').hidden = !post;
  document.title = post ? `${post.title} · 旧时光 · 雪豹 Uncia` : '旧时光 · 雪豹 Uncia';
  verse.classList.toggle('page-motto', !post);
  (post ? $('.vault-reader-verse') : $('.vault-verse-intro')).append(verse);
  scene.dataset.sceneKey = post ? `old-days/${post.file}` : 'old-days';
}
function reset() {
  generation++; reading++; requests.abort(); requests = new AbortController();
  key = null; archive = null; returnFocus = null; returnScroll = 0; activeFile = null;
  setPage(null);
  library.hidden = true; reader.hidden = true;
  status.textContent = ''; retry.hidden = true; retry.disabled = false;
  list.replaceChildren(); categories.replaceChildren(); search.value = '';
  year.replaceChildren(new Option('全部年份', ''));
  $('.vault-count').textContent = ''; $('.vault-results').textContent = '';
  scope = 'featured'; category = ''; limit = 80; clearReader();
  document.querySelectorAll('[data-scope]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scope === scope)));
}
addEventListener('pagehide', () => { rememberLibrary(); reset(); history.scrollRestoration = initialScrollRestoration; });
addEventListener('pageshow', (event) => { history.scrollRestoration = 'manual'; if (event.persisted && !archive) loadArchive(); });
retry.addEventListener('click', loadArchive);

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
function postInLocation() { return /^#post=([a-f0-9]{32}\.bin)$/.exec(location.hash)?.[1] || null; }
function archiveURL(file) {
  const url = new URL(location.href); url.hash = file ? `post=${file}` : ''; return url;
}
function savedFilters(state = history.state) {
  if (state?.archiveNavigation !== 1 || !state.filters || typeof state.filters !== 'object') return null;
  const value = state.filters;
  return {
    scope: value.scope === 'all' ? 'all' : 'featured',
    category: typeof value.category === 'string' ? value.category.slice(0, 100) : '',
    year: typeof value.year === 'string' && /^\d{4}$/.test(value.year) ? value.year : '',
    search: typeof value.search === 'string' ? value.search.slice(0, 200) : '',
    limit: Number.isInteger(value.limit) && value.limit >= 80 ? Math.min(value.limit, 100000) : 80,
    scroll: Number.isFinite(value.scroll) && value.scroll >= 0 ? value.scroll : 0,
    focusFile: typeof value.focusFile === 'string' && /^[a-f0-9]{32}\.bin$/.test(value.focusFile) ? value.focusFile : null,
  };
}
function filtersSnapshot(focusFile = null) {
  return { scope, category, year: year.value, search: search.value.slice(0, 200), limit, scroll: window.scrollY, focusFile };
}
function libraryState(filters) { return { archiveNavigation: 1, view: 'library', filters }; }
function articleState(file, filters, fromLibrary) { return { archiveNavigation: 1, view: 'article', file, filters, fromLibrary }; }
function rememberLibrary() {
  if (archive && !library.hidden && !activeFile) history.replaceState(libraryState(filtersSnapshot()), '', archiveURL());
}
function restoreFilters(filters) {
  scope = filters?.scope || 'featured'; category = filters?.category || ''; limit = filters?.limit || 80;
  search.value = filters?.search || ''; year.value = filters?.year || '';
  document.querySelectorAll('[data-scope]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.scope === scope)));
  renderCategories(); renderList();
}
function showLibrary(filters = savedFilters()) {
  reading++; activeFile = null; reader.hidden = true; library.hidden = false; clearReader(); setPage(null);
  restoreFilters(filters);
  const focus = filters?.focusFile ? list.querySelector(`[data-post="${filters.focusFile}"]`) : null;
  (focus || (returnFocus?.isConnected ? returnFocus : null))?.focus({ preventScroll: true });
  window.scrollTo({ top: filters?.scroll ?? returnScroll, behavior: 'instant' });
  dispatchEvent(new Event('article-rendered'));
}
function returnToLibrary() {
  const state = history.state, filters = savedFilters() || filtersSnapshot();
  const hasParent = state?.archiveNavigation === 1 && state.view === 'article' && state.file === activeFile && state.fromLibrary === true;
  showLibrary(filters);
  if (hasParent) history.back();
  else history.replaceState(libraryState(filters), '', archiveURL());
}
function syncLocation() {
  if (!archive) return;
  const file = postInLocation(), filters = savedFilters();
  if (!file) { showLibrary(filters); return; }
  if (file === activeFile && !reader.hidden) return;
  const post = archive.find((item) => item.file === file);
  if (post) { restoreFilters(filters); openPost(post, null, false); }
  else {
    showLibrary(filters); history.replaceState(libraryState(filters || filtersSnapshot()), '', archiveURL());
    status.textContent = '没有找到这篇记录，可以从目录继续浏览。';
  }
}
addEventListener('popstate', syncLocation);
addEventListener('hashchange', syncLocation);
async function loadArchive() {
  if (retry.disabled) return;
  const session = ++generation;
  requests.abort(); requests = new AbortController(); const signal = requests.signal;
  retry.disabled = true; retry.hidden = true; status.textContent = '正在整理书架…';
  try {
    if (!crypto.subtle) throw new Error('请使用 HTTPS 或本机预览打开归档。');
    const config = await fetchFile('data/access.json', 'json', signal);
    if (config.version !== 1 || typeof config.key !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(config.key)) throw new Error('归档格式不受支持。');
    const bytes = Uint8Array.from(atob(config.key), (c) => c.charCodeAt(0));
    if (bytes.length !== 32) throw new Error('归档格式不受支持。');
    // The key is public: this file packaging provides no access restriction.
    const sessionKey = await crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['decrypt']);
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
    status.textContent = ''; library.hidden = false; restoreFilters(savedFilters());
    if (postInLocation()) syncLocation();
    else { history.replaceState(libraryState(savedFilters() || filtersSnapshot()), '', archiveURL()); showLibrary(savedFilters()); }
  } catch (error) {
    if (session !== generation || error.name === 'AbortError') return;
    status.textContent = error.name === 'OperationError' ? '归档文件已损坏，请稍后重试。' : error.message;
    retry.hidden = false;
  } finally {
    if (session === generation) retry.disabled = false;
  }
}

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
    button.addEventListener('click', () => { category = name; limit = 80; renderCategories(); renderList(); rememberLibrary(); });
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
    button.type = 'button'; button.dataset.post = post.file; time.dateTime = post.date.slice(0, 10); time.textContent = post.date.slice(0, 10); title.textContent = post.title;
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
  renderCategories(); renderList(); rememberLibrary();
}));
search.addEventListener('input', () => { limit = 80; renderList(); rememberLibrary(); });
year.addEventListener('change', () => { limit = 80; renderList(); rememberLibrary(); });
more.addEventListener('click', () => { limit += 80; renderList(); rememberLibrary(); });
document.querySelectorAll('.vault-back').forEach((button) => button.addEventListener('click', returnToLibrary));
$('[data-vault-directory]').addEventListener('click', (event) => { if (!reader.hidden) { event.preventDefault(); returnToLibrary(); } });

function decorateArticle(post) {
  const toc = $('.vault-toc-items'), mobile = $('.vault-mobile-toc-items');
  toc.replaceChildren(); mobile.replaceChildren();
  prose.querySelectorAll('h1,h2,h3').forEach((heading, index) => {
    heading.id = `vault-section-${index + 1}`;
    for (const container of [toc, mobile]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.heading = heading.id;
      button.textContent = heading.textContent.trim().slice(0, 100) || `段落 ${index + 1}`;
      if (heading.localName === 'h3') button.className = 'subheading';
      button.addEventListener('click', () => heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
      container.append(button);
    }
  });
  $('.vault-toc').hidden = !toc.children.length;
  $('.mobile-article-toc').hidden = !mobile.children.length;
  $('.vault-reader .reading-aside-sticky').classList.toggle('vault-long-rail', toc.children.length > 8);
  $('[data-vault-duration]').textContent = post.metadataOnly ? '仅存标题与日期' : `约 ${Math.max(1, Math.ceil(prose.textContent.replace(/\s/g, '').length / 450))} 分钟`;
  dispatchEvent(new Event('article-rendered'));
}
$('.mobile-article-toc').addEventListener('toggle', () => dispatchEvent(new Event('article-rendered')));
function readerContext(post) {
  $('[data-vault-date]').textContent = post.date.slice(0, 10);
  $('[data-vault-category]').textContent = post.category;
  $('[data-vault-duration]').textContent = '正在读取…';
  $('.vault-memory-copy').textContent = post.summary || (post.metadataOnly ? '这篇记录目前仅保留标题与日期。' : '保留当时写下的原文。');
  for (const tag of [post.category, ...(post.tags || []).slice(0, 3)]) {
    const chip = document.createElement('span'); chip.textContent = tag; $('.vault-tags').append(chip);
  }
  const related = archive.filter((item) => item.category === post.category && item.file !== post.file).slice(0, 3);
  $('.vault-related').hidden = !related.length;
  for (const item of related) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = `${item.title} ↗`;
    button.addEventListener('click', () => openPost(item, button)); $('.vault-related-items').append(button);
  }
}
prose.addEventListener('click', (event) => {
  const anchor = event.target.closest?.('a[href^="#"]');
  if (!anchor) return;
  event.preventDefault();
  const heading = document.getElementById(anchor.getAttribute('href').slice(1));
  if (heading && prose.contains(heading)) heading.scrollIntoView({ block: 'start' });
});
async function openPost(post, button, navigate = true) {
  const wasLibrary = reader.hidden, current = history.state;
  let filters = savedFilters() || filtersSnapshot();
  if (navigate && wasLibrary) {
    returnFocus = button; returnScroll = window.scrollY;
    filters = filtersSnapshot(button?.dataset.post || post.file);
    history.replaceState(libraryState(filters), '', archiveURL());
    history.pushState(articleState(post.file, filters, true), '', archiveURL(post.file));
  } else if (navigate) history.replaceState(articleState(post.file, filters, current?.archiveNavigation === 1 && current.fromLibrary === true), '', archiveURL(post.file));
  else if (current?.archiveNavigation !== 1 || current.view !== 'article' || current.file !== post.file) history.replaceState(articleState(post.file, filters, false), '', archiveURL(post.file));
  const session = generation, articleRequest = ++reading, sessionKey = key, signal = requests.signal;
  activeFile = post.file;
  library.hidden = true; reader.hidden = false; clearReader();
  setPage(post); readerContext(post); window.scrollTo({ top: 0, behavior: 'instant' });
  $('.vault-reader h2').textContent = post.title;
  $('.vault-meta').textContent = `${post.date} · ${post.category}${post.metadataOnly ? ' · 仅存标题与日期' : ''} · 正在读取…`;
  $('.vault-back').focus();
  try {
    const content = await decrypt(`data/posts/${post.file}`, sessionKey, signal);
    if (session !== generation || articleRequest !== reading) return;
    if (typeof content.html !== 'string') throw new Error('正文格式错误。');
    prose.replaceChildren(sanitizeArticle(content.html));
    $('.vault-meta').textContent = `${post.date} · ${post.category}${post.metadataOnly ? ' · 仅存标题与日期' : ''}`;
    decorateArticle(post);
  } catch (error) {
    if (session === generation && articleRequest === reading && error.name !== 'AbortError') $('.vault-meta').textContent = '这篇记录暂时无法读取，请返回目录后重试。';
  }
}
loadArchive();
