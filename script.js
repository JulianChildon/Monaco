const loader = document.querySelector('.loader');
const progressBar = document.querySelector('.scroll-progress span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopMotion = window.matchMedia('(min-width: 901px)');

window.addEventListener('load', () => {
  setTimeout(() => loader?.classList.add('is-hidden'), 350);
  measureScenes();
  requestRender(true);

  if (window.location.hash) {
    const hashTarget = document.querySelector(window.location.hash);
    requestAnimationFrame(() => {
      hashTarget?.scrollIntoView();
      measureScenes();
      requestRender(true);
    });
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const hero = document.querySelector('[data-cinematic="hero"]');
const history = document.querySelector('[data-cinematic="history"]');
const historyItems = [...document.querySelectorAll('.timeline-item')];
const historyMeter = document.querySelector('.timeline-meter');
const historyCounter = document.querySelector('.timeline-meter b');
const preservation = document.querySelector('[data-cinematic="preservation"]');
const parallaxElements = [...document.querySelectorAll('[data-parallax]')];

const sceneMetrics = new Map();
let targetScroll = window.scrollY;
let renderedScroll = targetScroll;
let frame = 0;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value) => {
  const progress = clamp(value);
  return progress * progress * (3 - (2 * progress));
};

function pageTop(element) {
  return element.getBoundingClientRect().top + window.scrollY;
}

function measureScenes() {
  [hero, history, preservation].forEach((element) => {
    if (!element) return;
    sceneMetrics.set(element, {
      top: pageTop(element),
      distance: Math.max(element.offsetHeight - window.innerHeight, 1),
    });
  });

  parallaxElements.forEach((element) => {
    element._parallaxMetric = {
      top: pageTop(element),
      height: element.offsetHeight,
    };
  });
}

function sceneProgress(element, scrollPosition) {
  const metric = sceneMetrics.get(element);
  if (!metric) return 0;
  return clamp((scrollPosition - metric.top) / metric.distance);
}

function renderHero(scrollPosition) {
  if (!hero || reducedMotion.matches) return;

  const progress = sceneProgress(hero, scrollPosition);
  const reveal = smoothstep((progress - 0.13) / 0.59);
  const copyExit = smoothstep((progress - 0.06) / 0.33);
  const chapterEntry = smoothstep((progress - 0.6) / 0.2);

  hero.style.setProperty('--hero-scale', (1.08 - (progress * 0.065)).toFixed(4));
  hero.style.setProperty('--hero-exterior-scale', (1.02 - (reveal * 0.02)).toFixed(4));
  hero.style.setProperty('--hero-reveal', `${Math.max(0.1, reveal * 145).toFixed(2)}%`);
  hero.style.setProperty('--hero-copy-opacity', (1 - copyExit).toFixed(3));
  hero.style.setProperty('--hero-copy-y', `${-40 - (copyExit * 75)}%`);
  hero.style.setProperty('--hero-chapter-opacity', chapterEntry.toFixed(3));
  hero.style.setProperty('--hero-chapter-y', `${(1 - chapterEntry) * 45}px`);
  hero.style.setProperty('--hero-shade-opacity', (1 - (reveal * 0.32)).toFixed(3));
  hero.style.setProperty('--hero-ui-opacity', (1 - smoothstep(progress / 0.24)).toFixed(3));
}

function resetHistory() {
  historyItems.forEach((item, index) => {
    item.style.removeProperty('opacity');
    item.style.removeProperty('transform');
    item.classList.toggle('is-active', index === 0);
  });
  historyMeter?.style.removeProperty('--history-progress');
  if (historyCounter) historyCounter.textContent = '01';
}

function renderHistory(scrollPosition) {
  if (!history || reducedMotion.matches || !desktopMotion.matches) {
    resetHistory();
    return;
  }

  const progress = sceneProgress(history, scrollPosition);
  const phase = progress * (historyItems.length - 1);
  const activeIndex = Math.min(historyItems.length - 1, Math.round(phase));

  historyItems.forEach((item, index) => {
    const distance = index - phase;
    const visibility = smoothstep(1 - Math.abs(distance));
    const translate = distance * 300;
    const scale = 0.97 + (visibility * 0.03);

    item.style.opacity = visibility.toFixed(3);
    item.style.transform = `translate3d(0, calc(-50% + ${translate.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;
    item.classList.toggle('is-active', index === activeIndex);
  });

  historyMeter?.style.setProperty('--history-progress', progress.toFixed(4));
  if (historyCounter) historyCounter.textContent = String(activeIndex + 1).padStart(2, '0');
}

function renderPreservation(scrollPosition) {
  if (!preservation || reducedMotion.matches || !desktopMotion.matches) return;

  const progress = sceneProgress(preservation, scrollPosition);
  const reveal = smoothstep((progress - 0.08) / 0.5);

  preservation.style.setProperty('--preservation-scale', (1.1 - (progress * 0.08)).toFixed(4));
  preservation.style.setProperty('--preservation-clip', `${((1 - reveal) * 100).toFixed(2)}%`);
  preservation.style.setProperty('--preservation-panel-x', `${((1 - reveal) * 8).toFixed(2)}vw`);
  preservation.style.setProperty('--preservation-vignette', (0.2 + (reveal * 0.55)).toFixed(3));
}

function renderParallax(scrollPosition) {
  if (reducedMotion.matches) return;

  const viewportCenter = scrollPosition + (window.innerHeight / 2);
  parallaxElements.forEach((element) => {
    const metric = element._parallaxMetric;
    if (!metric) return;

    const elementCenter = metric.top + (metric.height / 2);
    const distance = clamp((viewportCenter - elementCenter) / window.innerHeight, -1.25, 1.25);
    const depth = Number(element.dataset.parallax || 0.1);
    element.style.setProperty('--parallax-y', `${(distance * depth * 90).toFixed(2)}px`);
  });
}

function render() {
  frame = 0;
  const delta = targetScroll - renderedScroll;
  renderedScroll += delta * (reducedMotion.matches ? 1 : 0.14);
  if (Math.abs(delta) < 0.1) renderedScroll = targetScroll;

  const maximumScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  progressBar?.style.setProperty('transform', `scaleX(${clamp(renderedScroll / maximumScroll).toFixed(5)})`);

  renderHero(renderedScroll);
  renderHistory(renderedScroll);
  renderPreservation(renderedScroll);
  renderParallax(renderedScroll);

  if (Math.abs(targetScroll - renderedScroll) >= 0.1) frame = requestAnimationFrame(render);
}

function requestRender(immediate = false) {
  targetScroll = window.scrollY;
  if (immediate) renderedScroll = targetScroll;
  if (!frame) frame = requestAnimationFrame(render);
}

window.addEventListener('scroll', () => requestRender(), { passive: true });
window.addEventListener('resize', () => {
  measureScenes();
  requestRender(true);
});
reducedMotion.addEventListener?.('change', () => {
  measureScenes();
  requestRender(true);
});
desktopMotion.addEventListener?.('change', () => {
  measureScenes();
  requestRender(true);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
});
