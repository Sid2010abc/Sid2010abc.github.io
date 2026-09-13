document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // On mobile, tapping a parent item with a submenu should expand it first
  document.querySelectorAll('.has-sub > a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 880) {
        const parent = link.parentElement;
        const alreadyOpen = parent.classList.contains('open');
        if (!alreadyOpen) {
          e.preventDefault();
          document.querySelectorAll('.has-sub.open').forEach(el => el.classList.remove('open'));
          parent.classList.add('open');
        }
      }
    });
  });

  // Mark current page link as active based on pathname
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary-nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
});
