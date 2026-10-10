const quiet = matchMedia('(prefers-reduced-motion: reduce)');
function updateWorkReturn() {
  const anchor = location.pathname.includes('/new-zealand/') ? (/^#(?:films|fjord-original-sound|waterfall-moments)/.test(location.hash) ? 'videos' : 'travel-tools') : /\/(?:multi-agent|games)\//.test(location.pathname) ? 'interactive' : location.pathname.includes('/p/jian-zhouqi/') ? 'videos' : '';
  if (anchor) document.querySelectorAll('.page-toolbar a[href^="/works/"]').forEach((link) => { link.href = `/works/#${anchor}`; });
}
updateWorkReturn(); addEventListener('hashchange', updateWorkReturn);
const menus = [...document.querySelectorAll('.mobile-navigation, .home-menu')];
addEventListener('click', (event) => menus.forEach((menu) => { if (menu.open && !menu.contains(event.target)) menu.open = false; }));
addEventListener('keydown', (event) => { if (event.key === 'Escape') menus.forEach((menu) => { if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); } }); });
document.querySelectorAll('[data-back-to-top]').forEach((button) => button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: quiet.matches ? 'instant' : 'smooth' })));
const body = document.querySelector('[data-reading-body]');
const progress = document.querySelector('[data-reading-progress]');
let frame = 0;
function updateReading() {
  frame = 0;
  if (!body || body.closest('[hidden]')) return;
  const rect = body.getBoundingClientRect(), start = rect.top + scrollY;
  const value = Math.round(Math.max(0, Math.min(1, (scrollY - start + innerHeight * .25) / Math.max(1, rect.height - innerHeight * .65))) * 100);
  if (progress) progress.value = value;
  const label = document.querySelector('[data-reading-percent]');
  if (label) label.textContent = `${value}%`;
  const links = [...document.querySelectorAll('[data-article-toc] a, [data-article-toc] button')].filter((link) => link.getClientRects().length);
  let selected = links[0];
  for (const link of links) { const heading = document.getElementById(link.dataset.heading || decodeURIComponent(link.hash.slice(1))); if (heading && heading.getBoundingClientRect().top < innerHeight * .35) selected = link; }
  for (const link of links) { link.classList.toggle('is-current', link === selected); link === selected ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'); }
}
const schedule = () => { if (!frame) frame = requestAnimationFrame(updateReading); };
addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule);
addEventListener('article-rendered', schedule); addEventListener('pageshow', schedule);
addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
updateReading();
