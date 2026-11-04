(() => {
  const menu = document.querySelector('.journal-header .menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const close = () => { menu.open = false; };
  menu.addEventListener('toggle', () => {
    summary.setAttribute('aria-label', menu.open ? 'メニューを閉じる' : 'メニューを開く');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('click', event => { if (!menu.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { close(); summary.focus(); }
  });
  matchMedia('(max-width: 1100px)').addEventListener('change', close);
})();
