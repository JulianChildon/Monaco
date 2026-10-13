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
    const copyExit = smoothstep((progress - 0.06) / 0.33);
    const chapterEntry = smoothstep((progress - 0.6) / 0.2);

    hero.style.setProperty('--hero-scale', (1.08 - progress * 0.065).toFixed(4));
    hero.style.setProperty('--hero-exterior-scale', (1.02 - reveal * 0.02).toFixed(4));
    hero.style.setProperty('--hero-reveal', `${Math.max(0.1, reveal * 145).toFixed(2)}%`);
    hero.style.setProperty('--hero-copy-opacity', (1 - copyExit).toFixed(3));
    hero.style.setProperty('--hero-copy-y', `${(mobile.matches ? -25 : -40) - copyExit * 75}%`);
    hero.style.setProperty('--hero-chapter-opacity', chapterEntry.toFixed(3));
    hero.style.setProperty('--hero-chapter-y', `${(1 - chapterEntry) * 45}px`);
    hero.style.setProperty('--hero-shade-opacity', (1 - reveal * 0.32).toFixed(3));
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
