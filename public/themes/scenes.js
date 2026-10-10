import { projectStar } from '../starfield.js';

const dao = 'https://zh.wikisource.org/wiki/%E8%80%81%E5%AD%90_(%E5%8C%AF%E6%A0%A1%E7%89%88)';
const walden = 'https://www.gutenberg.org/files/205/205-h/205-h.htm';
const poetry = (title) => `https://zh.wikisource.org/wiki/${title.split('/').map(encodeURIComponent).join('/')}`;
const inkVerses = [
  ['致虚极，守静笃。', '《道德经》第十六章'],
  ['为学日益，为道日损。', '《道德经》第四十八章'],
  ['知人者智，自知者明。', '《道德经》第三十三章'],
  ['图难于其易，为大于其细。', '《道德经》第六十三章'],
  ['大巧若拙，大辩若讷。', '《道德经》第四十五章'],
  ['上善若水。水善利万物而不争。', '《道德经》第八章'],
  ['道法自然。', '《道德经》第二十五章'],
  ['合抱之木，生于毫末。', '《道德经》第六十四章'],
  ['千里之行，始于足下。', '《道德经》第六十四章'],
  ['少则得，多则惑。', '《道德经》第二十二章'],
  ['夫物芸芸，各复归其根。', '《道德经》第十六章'],
  ['有无相生，难易相成。', '《道德经》第二章'],
  ['曲则全，枉则直。', '《道德经》第二十二章'],
  ['知足不辱，知止不殆。', '《道德经》第四十四章'],
  ['大音希声，大象无形。', '《道德经》第四十一章'],
  ['不自见，故明；不自是，故彰。', '《道德经》第二十二章'],
  ['以其不自生，故能长生。', '《道德经》第七章 · 节录'],
  ['见素抱朴，少思寡欲。', '《道德经》第十九章'],
];
const cosmosVerses = [
  ['星垂平野阔，月涌大江流。', '杜甫 · 旅夜书怀', '旅夜書懷'],
  ['欲穷千里目，更上一层楼。', '王之涣 · 登鹳雀楼', '登鸛雀樓_(王之渙)'],
  ['江天一色无纤尘，皎皎空中孤月轮。', '张若虚 · 春江花月夜', '春江花月夜_(張若虛)'],
  ['长风破浪会有时，直挂云帆济沧海。', '李白 · 行路难', '行路難_(金樽清酒斗十千)'],
  ['俱怀逸兴壮思飞，欲上青天览明月。', '李白 · 宣州谢朓楼饯别校书叔云', '宣州謝朓樓餞別校書叔雲'],
  ['海上生明月，天涯共此时。', '张九龄 · 望月怀远', '望月懷遠'],
  ['举杯邀明月，对影成三人。', '李白 · 月下独酌', '月下獨酌'],
  ['明月松间照，清泉石上流。', '王维 · 山居秋暝', '山居秋暝'],
  ['野旷天低树，江清月近人。', '孟浩然 · 宿建德江', '宿建德江'],
  ['独坐幽篁里，弹琴复长啸。', '王维 · 竹里馆', '輞川集_(王維)/竹里館'],
  ['今人不见古时月，今月曾经照古人。', '李白 · 把酒问月', '把酒問月'],
  ['行到水穷处，坐看云起时。', '王维 · 终南别业', '終南別業'],
  ['月下飞天镜，云生结海楼。', '李白 · 渡荆门送别', '渡荊門送別'],
  ['云母屏风烛影深，长河渐落晓星沉。', '李商隐 · 嫦娥', '嫦娥'],
  ['春风自绿江南岸，明月何时照我还。', '王安石 · 泊船瓜洲', '泊船瓜洲'],
  ['山随平野尽，江入大荒流。', '李白 · 渡荆门送别', '渡荊門送別'],
  ['落霞与孤鹜齐飞，秋水共长天一色。', '王勃 · 滕王阁序', '滕王閣序'],
  ['会当凌绝顶，一览众山小。', '杜甫 · 望岳', '望嶽_(岱宗夫如何)'],
];
const skyVerses = [
  'The universe is wider than our views of it.',
  'It is never too late to give up our prejudices.',
  'Rather than love, than money, than fame, give me truth.',
  'Our life is frittered away by detail.',
  'I love a broad margin to my life.',
  'I had three chairs in my house; one for solitude, two for friendship, three for society.',
  'To be awake is to be alive.',
  'No way of thinking or doing, however ancient, can be trusted without proof.',
  'Heaven is under our feet as well as over our heads.',
  'Things do not change; we change.',
  'Time is but the stream I go a-fishing in.',
  'Only that day dawns to which we are awake.',
  'I never found the companion that was so companionable as solitude.',
  'The sun is but a morning star.',
  'Books are the treasured wealth of the world and the fit inheritance of generations and nations.',
  'I went to the woods because I wished to live deliberately',
  'What old people say you cannot do you try and find that you can.',
  'How could youths better learn to live than by at once trying the experiment of living?',
];
const inkNames = ['远岫', '听泉', '空山', '溪桥', '云台', '烟渚', '归云', '松风', '行舟', '竹影', '旧山', '山月', '流岚', '晴峦', '汀洲', '雪岭', '暮川', '留白'];
const galaxyNames = ['双臂旋涡', '棒旋星河', '椭圆星岛', '环状星系', '多臂旋涡', '星河侧影'];
const routeSlots = { home: 0, 'ai-learning': 1, philosophy: 2, methods: 3, works: 4, contact: 5, about: 6, 'multi-agent': 7, 'new-zealand': 8, games: 9, 'old-days': 10 };
const aliases = { articles: 'ai-learning', ideas: 'ai-learning', videos: 'ai-learning', gallery: 'works' };
export function hashScene(key) { return [...key].reduce((hash, char) => Math.imul(hash ^ char.codePointAt(0), 16777619) >>> 0, 2166136261); }
export function sceneSlot(key) {
  const route = key.replace(/^\/+|\/+$/g, '') || 'home';
  return routeSlots[aliases[route] || route] ?? 11 + hashScene(route) % 7;
}
export function createGalaxy(seed, kind) {
  const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 >>> 0; return seed / 4294967296; };
  const points = [];
  for (let i = 0; i < 4200; i++) {
    let r = Math.sqrt(random()), angle = random() * Math.PI * 2, z = (random() + random() - 1) * .16;
    if (kind === 0 || kind === 1 || kind === 4) angle = Math.floor(random() * (kind === 4 ? 5 : 2)) * Math.PI * 2 / (kind === 4 ? 5 : 2) + r * 8 + (random() - .5) * (.13 + r * .7);
    if (kind === 3) r = .65 + (random() + random() - 1) * .14;
    if (kind === 2) { r = random() ** .55; z = (random() + random() - 1) * .65; }
    let x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    if (kind === 1 && i % 4 === 0) { x = (random() - .5) * .95; y = (random() - .5) * .12; }
    if (kind === 2) y *= .7;
    if (kind === 5) { y *= .14; z *= 2; }
    const bright = random();
    points.push({ x, y, z, radius: bright < .008 ? 1.25 : bright < .07 ? .8 : .4,
      alpha: bright < .008 ? .9 : bright < .07 ? .56 : .12 + random() * .2, warm: r < .28 || kind === 2 });
  }
  return points;
}

function mountScene(container, verse) {
  const backdrop = document.createElement('div'); backdrop.className = 'theme-scene-art';
  const canvas = document.createElement('canvas'); canvas.className = 'theme-scene-galaxy';
  const technology = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  technology.setAttribute('viewBox', '0 0 1600 800'); technology.classList.add('theme-scene-tech');
  container.append(backdrop, canvas, technology);
  const context = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let theme = '', key = '', stars = [], slot = 0, width = 0, height = 0, frameId = 0, time = 0, last = 0;
  const size = () => {
    width = container.clientWidth; height = container.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  };
  function draw() {
    if (!context || theme !== 'cosmos') return;
    context.clearRect(0, 0, width, height);
    const unit = Math.min(width * (width < 700 ? .35 : .23), height * .26), cx = width < 700 ? width * .7 : width * .78, cy = height * .18;
    const yaw = .18 + Math.sin(time / 60000) * .3, pitch = -.52 + (slot % 4) * .15 + Math.sin(time / 80000) * .1;
    context.globalCompositeOperation = 'lighter';
    for (const star of stars) {
      const p = projectStar(star, yaw, pitch), x = cx + p.x * unit, y = cy + p.y * unit;
      const alpha = star.alpha * Math.min(1.2, p.scale);
      context.fillStyle = star.warm ? `rgba(255,221,171,${alpha})` : `rgba(167,193,255,${alpha})`;
      context.beginPath(); context.arc(x, y, Math.max(.3, star.radius * p.scale), 0, Math.PI * 2); context.fill();
      if (star.radius > 1) {
        const glow = context.createRadialGradient(x, y, 0, x, y, 9 * p.scale);
        glow.addColorStop(0, `rgba(196,217,255,${alpha * .23})`); glow.addColorStop(1, 'rgba(196,217,255,0)');
        context.fillStyle = glow; context.fillRect(x - 12, y - 12, 24, 24);
      }
    }
    for (let i = 0; i < stars.length; i += 53) {
      const star = stars[i], p = projectStar(star, yaw, pitch), x = cx + p.x * unit, y = cy + p.y * unit;
      const radius = unit * .075 * p.scale, glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, star.warm ? 'rgba(247,207,152,.026)' : 'rgba(120,151,232,.035)');
      glow.addColorStop(1, 'rgba(120,151,232,0)'); context.fillStyle = glow; context.fillRect(x-radius, y-radius, radius*2, radius*2);
    }
    context.globalCompositeOperation = 'source-over';
  }
  function animate(now) {
    if (!document.hidden && now - last > 45) { time += Math.min(90, now - last); last = now; draw(); }
    frameId = requestAnimationFrame(animate);
  }
  function motion() {
    cancelAnimationFrame(frameId); frameId = 0; draw();
    if (theme === 'cosmos' && !reduced.matches && !document.hidden) { last = performance.now(); frameId = requestAnimationFrame(animate); }
  }
  function refresh() {
    const nextTheme = document.documentElement.classList.contains('ink') || document.body.classList.contains('ink') ? 'ink' : document.documentElement.classList.contains('cosmos') || document.body.classList.contains('cosmos') ? 'cosmos' : 'sky';
    const nextKey = container.dataset.sceneKey || location.pathname;
    if (nextTheme === theme && nextKey === key) return;
    theme = nextTheme; key = nextKey; slot = sceneSlot(key);
    const seed = hashScene(key), kind = slot % 6;
    container.dataset.sceneTheme = theme; container.dataset.sceneKind = String(kind); container.dataset.sceneSeed = String(seed);
    container.style.setProperty('--scene-crop', `${16 + seed % 68}%`);
    container.style.setProperty('--scene-scale', String(1.02 + (seed % 13) / 100));
    container.style.setProperty('--scene-cloud-crop', `${20 + seed % 60}%`);
    container.style.setProperty('--scene-cloud-image', `url("/${slot % 2 ? 'clouds_b' : 'clouds_a'}.webp")`);
    container.style.setProperty('--scene-hue', String((slot % 4) * 12 - 12));
    technology.innerHTML = `<g fill="none" stroke="currentColor" stroke-width=".7"><path d="M${850 + seed % 130} 0v${110 + slot * 12}l110 110h260l150 150v300"/><path d="M1600 ${130 + slot * 22}h-330l-180 180v350"/><path d="M0 700h400l180-180h180"/><circle cx="${1210 + seed % 100}" cy="${220 + slot * 12}" r="58"/><circle cx="${1210 + seed % 100}" cy="${220 + slot * 12}" r="78" stroke-dasharray="2 14"/></g><g fill="currentColor"><circle cx="760" cy="520" r="3"/><circle cx="1270" cy="${130 + slot * 22}" r="3"/></g>`;
    stars = createGalaxy(seed, kind);
    if (verse) {
      const [text, credit, url] = theme === 'ink' ? [inkVerses[slot][0], inkVerses[slot][1], dao] : theme === 'cosmos' ? [cosmosVerses[slot][0], cosmosVerses[slot][1], poetry(cosmosVerses[slot][2])] : [skyVerses[slot], 'Henry David Thoreau · Walden', walden];
      verse.dataset.verseTheme = theme; verse.lang = theme === 'sky' ? 'en' : 'zh-CN';
      const label = document.createElement('span'); label.className = 'theme-verse-label';
      label.textContent = theme === 'ink' ? `${inkNames[slot]} · 山水卷` : theme === 'cosmos' ? `${galaxyNames[kind]} · 星系意象` : `CLOUD ATLAS / ${String(slot + 1).padStart(2, '0')}`;
      const quote = document.createElement('p'); quote.className = 'theme-verse-text'; quote.textContent = text;
      const citation = document.createElement('a'); citation.className = 'theme-verse-source'; citation.href = url; citation.textContent = credit; citation.target = '_blank'; citation.rel = 'noopener noreferrer';
      verse.replaceChildren(label, quote, citation);
    }
    motion();
  }
  new ResizeObserver(size).observe(container);
  const themeObserver = new MutationObserver(refresh);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  themeObserver.observe(container, { attributes: true, attributeFilter: ['data-scene-key'] });
  addEventListener('theme-scene-refresh', refresh);
  document.addEventListener('visibilitychange', motion); reduced.addEventListener('change', motion);
  refresh(); size();
}
if (typeof document !== 'undefined') {
  const container = document.querySelector('[data-theme-scene]');
  if (container) mountScene(container, document.querySelector('[data-theme-verse]'));
}
