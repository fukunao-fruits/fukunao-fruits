(() => {
  const roots = [...document.querySelectorAll('[data-top-account]')];
  if (!roots.length) return;
  let generation = 0, controller;
  const link = (href, label) => {
    const element = document.createElement('a');
    element.href = href;
    element.textContent = label;
    return element;
  };
  const guest = root => {
    if (root.dataset.accountState === 'guest') return;
    const next = root.dataset.accountReturn === '/meguri/' ? '/meguri/' : '/';
    root.replaceChildren(
      link('/checkout/account/register?next=' + encodeURIComponent(next), '新規登録'),
      link('/checkout/account/login?next=' + encodeURIComponent(next), 'ログイン')
    );
    root.dataset.accountState = 'guest';
  };
  const clear = () => {
    generation++;
    controller?.abort();
    roots.forEach(guest);
  };
  async function refresh() {
    clear();
    const current = generation;
    const active = new AbortController();
    controller = active;
    const timeout = setTimeout(() => active.abort(), 8000);
    try {
      const response = await fetch('/checkout/account/session', {
        credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: active.signal
      });
      if (!response.ok) return;
      const member = await response.json();
      if (current !== generation || member.authenticated !== true ||
          typeof member.name !== 'string' || !member.name.trim() || member.name.length > 80) return;
      for (const root of roots) {
        const profile = link('/checkout/account', member.name.trim() + '様マイページ');
        if (root.dataset.accountLayout === 'compact') {
          const name = document.createElement('span'), label = document.createElement('span');
          name.className = 'top-account-name'; name.textContent = member.name.trim();
          label.className = 'top-account-label'; label.textContent = '様マイページ';
          profile.replaceChildren(name, label);
        }
        root.replaceChildren(profile);
        root.dataset.accountState = 'member';
      }
    } catch {
      // Keep usable registration/login links when the session cannot be checked.
    } finally {
      clearTimeout(timeout);
    }
  }
  addEventListener('pageshow', refresh);
  addEventListener('pagehide', clear);
  addEventListener('focus', refresh);
  addEventListener('storage', event => {
    if (event.key === 'fukunao-member-state') refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh(); else clear();
  });
  setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60000);
  refresh();
})();
