const imageLoadNote = document.querySelector('.maker-credit-note');
if (imageLoadNote) {
  const imageLoadMessage = imageLoadNote.querySelector('.maker-credit-message');
  const imageUrls = new Set();

  document.querySelectorAll('*').forEach((element) => {
    const background = window.getComputedStyle(element).backgroundImage;
    for (const match of background.matchAll(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/g)) {
      imageUrls.add(new URL(match[1] || match[2] || match[3].trim(), document.baseURI).href);
    }
  });

  const slowLoadingNotice = window.setTimeout(() => {
    imageLoadMessage.textContent = '图片仍在加载，请稍候…';
  }, 5000);

  const imageLoads = [...imageUrls].map((url) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  }));

  Promise.all(imageLoads).then((results) => {
    window.clearTimeout(slowLoadingNotice);
    if (results.every(Boolean)) {
      imageLoadMessage.textContent = '全部图片已加载完成√';
      imageLoadNote.classList.add('is-loaded');
      window.setTimeout(() => {
        imageLoadNote.classList.add('is-fading');
        window.setTimeout(() => {
          imageLoadNote.hidden = true;
          imageLoadNote.closest('.site-header').classList.add('images-loaded');
        }, 1000);
      }, 1400);
    } else {
      imageLoadMessage.textContent = '部分图片加载失败，请刷新重试';
      imageLoadNote.classList.add('is-error');
    }
  });
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => {
    // Keep content already on screen visible, even if this script arrived late.
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
  });
}

document.querySelectorAll('.accordion-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const content = button.nextElementSibling;
    const open = content.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('b').textContent = open ? '−' : '+';
  });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.innerHTML = '已完成 <span>✓</span>';
  });
}

const hero = document.querySelector('[data-cinematic="hero"]');
if (hero) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 600px)');
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smoothstep = (value) => {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
  };

  let sceneTop = 0;
  let sceneDistance = 1;
  let targetScroll = window.scrollY;
  let renderedScroll = targetScroll;
  let frame = 0;

  function measureHero() {
    sceneTop = hero.getBoundingClientRect().top + window.scrollY;
    sceneDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
  }

  function renderHero() {
    frame = 0;
    if (reducedMotion.matches) return;

    const delta = targetScroll - renderedScroll;
    renderedScroll += delta * 0.14;
    if (Math.abs(delta) < 0.1) renderedScroll = targetScroll;

    const progress = clamp((renderedScroll - sceneTop) / sceneDistance);
    const reveal = smoothstep((progress - 0.13) / 0.59);
    const shadeFade = smoothstep((progress - 0.13) / 0.75);
    const copyExit = smoothstep((progress - 0.06) / 0.33);
    const chapterEntry = smoothstep((progress - 0.6) / 0.2);

    hero.style.setProperty('--hero-scale', (1.08 - progress * 0.065).toFixed(4));
    hero.style.setProperty('--hero-exterior-scale', (1.02 - reveal * 0.02).toFixed(4));
    hero.style.setProperty('--hero-reveal', `${Math.max(0.1, reveal * 145).toFixed(2)}%`);
    hero.style.setProperty('--hero-copy-opacity', (1 - copyExit).toFixed(3));
    hero.style.setProperty('--hero-copy-y', `${(mobile.matches ? -25 : -40) - copyExit * 75}%`);
    hero.style.setProperty('--hero-chapter-opacity', chapterEntry.toFixed(3));
    hero.style.setProperty('--hero-chapter-y', `${(1 - chapterEntry) * 45}px`);
    hero.style.setProperty('--hero-shade-opacity', (1 - shadeFade).toFixed(3));
    hero.style.setProperty('--hero-ui-opacity', (1 - smoothstep(progress / 0.24)).toFixed(3));

    if (Math.abs(targetScroll - renderedScroll) >= 0.1) frame = requestAnimationFrame(renderHero);
  }

  function requestHeroRender(immediate = false) {
    targetScroll = window.scrollY;
    if (immediate) renderedScroll = targetScroll;
    if (!frame) frame = requestAnimationFrame(renderHero);
  }

  measureHero();
  requestHeroRender(true);
  window.addEventListener('scroll', () => requestHeroRender(), { passive: true });
  window.addEventListener('load', () => {
    measureHero();
    requestHeroRender(true);
  });
  window.addEventListener('resize', () => {
    measureHero();
    requestHeroRender(true);
  });
  reducedMotion.addEventListener?.('change', () => {
    measureHero();
    requestHeroRender(true);
  });
  mobile.addEventListener?.('change', () => requestHeroRender(true));
}

const historySection = document.querySelector('#history');
if (historySection) {
  const stage = historySection.querySelector('.history-stage');
  const heading = historySection.querySelector('.chapter-heading');
  const panel = historySection.querySelector('.history-reel-panel');
  const track = historySection.querySelector('.timeline');
  const items = [...historySection.querySelectorAll('.timeline-item')];
  const counter = historySection.querySelector('.history-reel-counter b');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width: 900px)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  let enabled = false;
  let sceneTop = 0;
  let travel = 1;
  let slotHeight = 0;
  let targetScroll = window.scrollY;
  let renderedScroll = targetScroll;
  let frame = 0;
  let measureFrame = 0;

  function renderHistory() {
    frame = 0;
    if (!enabled) return;
    renderedScroll += (targetScroll - renderedScroll) * 0.14;
    if (Math.abs(targetScroll - renderedScroll) < 0.1) renderedScroll = targetScroll;

    const progress = clamp((renderedScroll - sceneTop) / travel);
    const position = clamp(progress * items.length - 0.5, 0, items.length - 1);
    const index = Math.floor(position);
    // Hold each introduction still before the next slot rolls into place.
    const phase = index + smoothstep((position - index - 0.25) / 0.5);
    historySection.style.setProperty('--history-track-y', `${(-phase * slotHeight).toFixed(2)}px`);
    historySection.style.setProperty('--history-progress', progress.toFixed(4));
    const current = String(Math.round(phase) + 1).padStart(2, '0');
    if (counter.textContent !== current) counter.textContent = current;

    if (Math.abs(targetScroll - renderedScroll) >= 0.1) frame = requestAnimationFrame(renderHistory);
  }

  function requestHistoryRender(immediate = false) {
    if (!enabled) return;
    targetScroll = window.scrollY;
    if (immediate) renderedScroll = targetScroll;
    if (!frame) frame = requestAnimationFrame(renderHistory);
  }

  function resetHistory() {
    enabled = false;
    historySection.classList.remove('is-reel');
    ['--history-stage-height', '--history-travel', '--history-slot-height', '--history-track-y', '--history-progress'].forEach((name) => historySection.style.removeProperty(name));
    counter.textContent = '01';
  }

  function measureHistory() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches || items.length < 2) {
      resetHistory();
      return;
    }

    historySection.classList.add('is-reel');
    historySection.style.setProperty('--history-stage-height', `${window.innerHeight}px`);
    historySection.style.setProperty('--history-travel', `${window.innerHeight * (items.length - 1) * 0.95}px`);
    historySection.style.setProperty('--history-slot-height', '400px');
    track.style.gridAutoRows = 'auto';
    slotHeight = Math.ceil(Math.max(...items.map((item) => item.getBoundingClientRect().height)));
    track.style.removeProperty('grid-auto-rows');
    historySection.style.setProperty('--history-slot-height', `${slotHeight}px`);

    const layout = window.getComputedStyle(stage);
    const padding = parseFloat(layout.paddingTop) + parseFloat(layout.paddingBottom);
    const requiredHeight = stacked.matches
      ? heading.offsetHeight + panel.offsetHeight + parseFloat(layout.rowGap) + padding
      : Math.max(heading.offsetHeight, panel.offsetHeight) + padding;
    // A short landscape viewport keeps the complete, readable list instead.
    if (requiredHeight > window.innerHeight) {
      resetHistory();
      return;
    }

    enabled = true;
    sceneTop = historySection.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(historySection.offsetHeight - stage.offsetHeight, 1);
    requestHistoryRender(true);
  }

  function requestHistoryMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      measureHistory();
    });
  }

  measureHistory();
  window.addEventListener('scroll', () => requestHistoryRender(), { passive: true });
  window.addEventListener('resize', requestHistoryMeasure);
  window.addEventListener('load', requestHistoryMeasure);
  reducedMotion.addEventListener?.('change', requestHistoryMeasure);
  document.fonts?.ready.then(requestHistoryMeasure);
}
