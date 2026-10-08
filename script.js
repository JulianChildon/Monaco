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

window.addEventListener('scroll', () => {
  const photo = document.querySelector('.hero-photo');
  const amount = Math.min(window.scrollY * 0.12, 90);
  photo.style.transform = `scale(1.02) translateY(${amount}px)`;
}, { passive: true });
