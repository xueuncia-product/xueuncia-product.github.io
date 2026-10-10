const hero = document.querySelector('#hero');
const pet = document.createElement('aside');
pet.className = 'companion';
pet.setAttribute('aria-label', '雪豹陪伴');
pet.innerHTML = `<div class="companion-stage">
  <p class="companion-speech" role="status" aria-live="polite" hidden></p>
  <button class="companion-hide" type="button" aria-label="隐藏雪豹" title="隐藏雪豹">×</button>
  <button class="companion-greet" type="button" aria-label="点一下，和雪豹打个招呼" title="点一下，和雪豹打个招呼"><span class="companion-rig"><img alt="" /><img alt="" /></span><span class="companion-caption">雪豹陪你逛</span></button>
</div><button class="companion-restore" type="button" hidden><svg aria-hidden="true" viewBox="0 0 24 24"><ellipse cx="5.7" cy="8.4" rx="2" ry="2.7"/><ellipse cx="10" cy="5.7" rx="2" ry="2.7"/><ellipse cx="14.6" cy="5.7" rx="2" ry="2.7"/><ellipse cx="18.8" cy="8.4" rx="2" ry="2.7"/><path d="M6.7 17.6c0-2 2.8-6 5.5-6s5.5 4 5.5 6c0 3-2.6 2.3-5.5 2.3s-5.5.7-5.5-2.3Z"/></svg><span>显示雪豹</span></button>`;
document.body.append(pet);

const stage = pet.querySelector('.companion-stage');
const restore = pet.querySelector('.companion-restore');
const speech = pet.querySelector('.companion-speech');
const frames = [...pet.querySelectorAll('img')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const poses = ['sit', 'look', 'groom', 'yawn', 'lie', 'stretch'];
const duration = [4000, 4400, 5400, 3400, 8200, 4200];
const images = new Map();
const preference = 'uncia-companion-hidden';
let hidden = false, heroVisible = !!hero, covered = false, suspended = false;
let pose = 0, version = 0, timer, responseTimer, scrollFrame, videoOffset = 0;
let theme;
try { hidden = localStorage.getItem(preference) === '1'; } catch {}

function clearTimers() {
  clearTimeout(timer); clearTimeout(responseTimer); cancelAnimationFrame(scrollFrame);
  timer = responseTimer = scrollFrame = undefined;
  version += 1;
}

function currentTheme() {
  const classes = document.documentElement.classList;
  const body = document.body.classList;
  return classes.contains('ink') || body.contains('ink') ? 'ink'
    : classes.contains('cosmos') || body.contains('cosmos') ? 'cosmos'
      : classes.contains('night') || body.contains('night') ? 'night' : 'sky';
}

async function imageFor(name, ink) {
  const path = ink ? `ink/leopard${name === 'groom' ? '-groom' : ''}.png` : `leo_${name}.webp`;
  if (!images.has(path)) {
    const image = new Image(); image.src = new URL(path, import.meta.url).href;
    images.set(path, image);
  }
  const image = images.get(path);
  await image.decode();
  return image;
}

async function showPose(index) {
  const token = ++version;
  const ink = theme === 'ink';
  let name = ink ? index % 2 ? 'groom' : 'sit' : poses[index % poses.length];
  let image;
  try { image = await imageFor(name, ink); }
  catch {
    name = 'sit';
    try { image = await imageFor(name, ink); }
    catch { try { image = await imageFor(name, false); } catch { return; } }
  }
  if (token !== version || suspended) return;
  pet.dataset.pose = name;
  const active = frames.find((frame) => frame.classList.contains('is-current'));
  if (active?.src === image.src) return;
  const next = frames.find((frame) => frame !== active);
  next.src = image.src; next.classList.add('is-current');
  active?.classList.remove('is-current');
}

function nextPose(index = pose) {
  clearTimeout(timer); timer = undefined;
  pose = reduced.matches ? 0 : index % (theme === 'ink' ? 2 : poses.length);
  showPose(pose);
  if (!reduced.matches && !hidden && !heroVisible && !covered && !suspended && !document.hidden) {
    timer = setTimeout(() => nextPose(pose + 1), theme === 'ink' ? pose ? 4800 : 5200 : duration[pose]);
  }
}

function render() {
  clearTimers(); speech.hidden = true;
  pet.hidden = suspended || heroVisible || !!document.fullscreenElement;
  stage.hidden = hidden || covered;
  restore.hidden = !hidden && !covered;
  restore.querySelector('span').textContent = hidden ? '显示雪豹' : '隐藏雪豹';
  restore.setAttribute('aria-label', hidden ? '显示雪豹' : '雪豹暂时收起，避免挡住视频；点击隐藏雪豹');
  pet.dataset.theme = theme = currentTheme();
  pet.classList.toggle('is-paused', document.hidden || reduced.matches);
  if (!hidden && !heroVisible && !covered && !suspended && !document.hidden) nextPose(pose);
}

function setHidden(value) {
  hidden = value;
  try { if (value) localStorage.setItem(preference, '1'); else localStorage.removeItem(preference); } catch {}
  render();
}

pet.querySelector('.companion-hide').addEventListener('click', () => {
  setHidden(true); restore.focus();
});
restore.addEventListener('click', () => {
  if (covered && !hidden) {
    setHidden(true); restore.focus();
    return;
  }
  setHidden(false);
  if (!covered) pet.querySelector('.companion-greet').focus();
});
pet.querySelector('.companion-greet').addEventListener('click', () => {
  nextPose(pose + 1);
  speech.textContent = theme === 'ink' ? '山水之间，与你同游。' : '慢慢逛，我陪你。';
  speech.hidden = false;
  clearTimeout(responseTimer);
  responseTimer = setTimeout(() => { speech.hidden = true; responseTimer = undefined; }, 3500);
});

// 检测完整姿态的固定区域，折叠后的尺寸不能触发反复开合。
function protectVideo() {
  scrollFrame = undefined;
  const box = pet.getBoundingClientRect();
  const size = parseFloat(getComputedStyle(pet).getPropertyValue('--companion-size'));
  const bottom = innerHeight - parseFloat(getComputedStyle(pet).bottom) + videoOffset;
  const intersecting = [...document.querySelectorAll('video')].map((video) => video.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.right > box.left && rect.left < box.right && rect.top < bottom && rect.bottom > bottom - size - 40);
  videoOffset = intersecting.length ? Math.max(0, bottom - Math.min(...intersecting.map((rect) => rect.bottom)) + 72) : 0;
  pet.style.setProperty('--companion-video-offset', `${videoOffset}px`);
  const next = intersecting.length > 0;
  if (next !== covered) { covered = next; render(); }
}
function scheduleVideoCheck() {
  if (!suspended && scrollFrame === undefined) scrollFrame = requestAnimationFrame(protectVideo);
}

const themes = new MutationObserver(() => { if (theme !== currentTheme()) { pose = 0; render(); } });
const mediaSize = new ResizeObserver(scheduleVideoCheck);
const heroObserver = hero ? new IntersectionObserver(([entry]) => {
  if (heroVisible !== entry.isIntersecting) { heroVisible = entry.isIntersecting; render(); scheduleVideoCheck(); }
}) : null;
function observe() {
  themes.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  themes.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.querySelectorAll('video').forEach((video) => mediaSize.observe(video));
  if (hero) heroObserver.observe(hero);
}
addEventListener('scroll', scheduleVideoCheck, { passive: true });
addEventListener('resize', scheduleVideoCheck);
document.addEventListener('fullscreenchange', render);
document.addEventListener('visibilitychange', render);
reduced.addEventListener('change', () => { pose = 0; render(); });
addEventListener('storage', (event) => { if (event.key === preference) { hidden = event.newValue === '1'; render(); } });
addEventListener('pagehide', () => {
  suspended = true; clearTimers(); themes.disconnect(); mediaSize.disconnect(); heroObserver?.disconnect(); pet.hidden = true;
});
addEventListener('pageshow', () => { suspended = false; observe(); render(); scheduleVideoCheck(); });
observe(); render(); scheduleVideoCheck();
