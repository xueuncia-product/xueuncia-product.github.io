// Each point has depth; the camera moves through the volume instead of rotating a bitmap.
export function createStars() {
  let seed = 20261010;
  const random = () => {
    seed += 0x6D2B79F5;
    let n = Math.imul(seed ^ seed >>> 15, 1 | seed);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
  const points = [];
  while (points.length < 6400) {
    const radius = Math.sqrt(random()), angle = random() * Math.PI * 2;
    // Two loose currents suggest yin and yang without outlining a symbol.
    const current = .5 + .5 * Math.sin(angle * 2 + radius * 3.5);
    if (random() > .3 + .5 * current) continue;
    const z = (random() + random() + random() - 1.5) * .72;
    const brightness = random();
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .72, z,
      radius: brightness < .002 ? 1.7 : brightness < .016 ? 1.05 : brightness < .12 ? .7 : .36,
      alpha: brightness < .016 ? .9 : brightness < .12 ? .48 : .1 + random() * .2,
      color: Math.floor(random() * 4), phase: random() * Math.PI * 2, glow: brightness < .016 });
  }
  return points;
}

export function projectStar(point, yaw, pitch) {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const depth = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  const y = point.y * Math.cos(pitch) - depth * Math.sin(pitch);
  const z = point.y * Math.sin(pitch) + depth * Math.cos(pitch);
  const scale = 2.7 / (2.7 + z);
  return { x: x * scale, y: y * scale, z, scale };
}

export function mountStarfield(canvas) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const stars = createStars(), colors = ['221,231,255', '180,205,255', '255,237,210', '242,244,255'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const glow = document.createElement('canvas'); glow.width = glow.height = 64;
  const light = glow.getContext('2d'), gradient = light.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(160,196,255,.5)'); gradient.addColorStop(.2, 'rgba(126,161,231,.13)'); gradient.addColorStop(1, 'rgba(126,161,231,0)');
  light.fillStyle = gradient; light.fillRect(0, 0, 64, 64);
  let width = 0, height = 0, visible = true, mouseX = 0, mouseY = 0, gazeX = 0, gazeY = 0, last = -100, clock = 0, renderedStatic = false;
  function resize() {
    renderedStatic = false;
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize(); new ResizeObserver(resize).observe(canvas);
  reduced.addEventListener('change', () => { renderedStatic = false; });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);
  document.getElementById('hero').addEventListener('pointermove', (event) => {
    mouseX = event.clientX / innerWidth - .5; mouseY = event.clientY / innerHeight - .5;
  }, { passive: true });
  document.getElementById('hero').addEventListener('pointerleave', () => { mouseX = mouseY = 0; });
  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden || !visible || !document.body.classList.contains('cosmos')) { last = time; return; }
    if (time - last < 40 || (reduced.matches && renderedStatic)) return;
    const elapsed = Math.min(100, Math.max(0, time - last)); last = time;
    if (!reduced.matches) clock += elapsed;
    gazeX += (mouseX - gazeX) * .035; gazeY += (mouseY - gazeY) * .035;
    const yaw = Math.sin(clock / 52000) * .38 + (reduced.matches ? 0 : gazeX * .28);
    const pitch = -.38 + Math.sin(clock / 67000) * .12 + (reduced.matches ? 0 : gazeY * .15);
    context.clearRect(0, 0, width, height);
    const unit = Math.min(width * .4, height * .55);
    context.globalCompositeOperation = 'lighter';
    for (const star of stars) {
      const p = projectStar(star, yaw, pitch), x = width * .5 + p.x * unit, y = height * .48 + p.y * unit;
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;
      const alpha = star.alpha * (.82 + .18 * Math.sin(clock / 5500 + star.phase)) * Math.min(1.15, p.scale);
      if (star.glow) {
        const halo = 15 * p.scale; context.globalAlpha = alpha * .55;
        context.drawImage(glow, x - halo, y - halo, halo * 2, halo * 2);
      }
      context.globalAlpha = alpha; context.fillStyle = `rgb(${colors[star.color]})`;
      const size = Math.max(.35, star.radius * p.scale); context.fillRect(x, y, size, size);
    }
    // Thin diffuse light lives at several depths and shifts independently with the camera.
    for (let i = 0; i < 60; i++) {
      const star = stars[i * 91], p = projectStar(star, yaw, pitch);
      const x = width * .5 + p.x * unit, y = height * .48 + p.y * unit, halo = unit * (.08 + .06 * p.scale);
      context.globalAlpha = .07; context.drawImage(glow, x - halo, y - halo, halo * 2, halo * 2);
    }
    context.globalAlpha = 1; context.globalCompositeOperation = 'source-over';
    renderedStatic = true;
  }
  requestAnimationFrame(frame);
}
