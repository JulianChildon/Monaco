const loader = document.querySelector('.loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('is-hidden'), 350));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

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
