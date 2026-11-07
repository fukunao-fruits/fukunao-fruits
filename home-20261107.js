// 投稿URLが決まったら、https://www.instagram.com/p/…/ または /reel/…/ に差し替えます。
    const instagramPostUrl = 'https://www.instagram.com/fukunao_fruits/';
    const modal = document.getElementById('instagram-modal');
    const modalFrame = modal.querySelector('iframe');
    document.querySelectorAll('[data-instagram-video]').forEach(sourceImage => {
      const originalImage = sourceImage.src;
      const isFeaturedPost = sourceImage.hasAttribute('data-instagram-featured');
      const videoBlock = document.createElement('div');
      if (isFeaturedPost) videoBlock.dataset.instagramFeatured = 'true';
      videoBlock.innerHTML = '<div class="instagram-video"><img src="' + originalImage + '" alt="おすすめフルーツ"></div><div class="instagram-video__actions"><button class="instagram-open" type="button">Instagramの投稿を見る ↗</button></div>';
      sourceImage.replaceWith(videoBlock);
      videoBlock.querySelector('.instagram-open').addEventListener('click', () => {
        const postUrl = videoBlock.dataset.instagramPostUrl || instagramPostUrl;
        const isPost = /instagram\.com\/(p|reel)\//.test(postUrl);
        if (isPost) {
          modal.classList.add('has-post');
          modalFrame.src = postUrl.replace(/\/$/, '') + '/embed/';
        } else {
          modal.classList.remove('has-post');
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      });
    });
    const closeInstagramModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
    modal.querySelector('.instagram-modal__close').addEventListener('click', closeInstagramModal);
    modal.addEventListener('click', event => { if (event.target === modal) closeInstagramModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeInstagramModal(); });

    // 現在の本番と同じ「選択済みInstagram投稿」を、最初の動画枠へ表示します。
    // 投稿の選択は既存の /admin 画面で行えるため、HTMLを書き換えずに更新されます。
    const featuredVideoBlock = document.querySelector('[data-instagram-featured="true"]');
    if (featuredVideoBlock) {
      fetch('/api/featured')
        .then(response => response.ok ? response.json() : null)
        .then(post => {
          if (!post) return;
          const media = featuredVideoBlock.querySelector('.instagram-video img, .instagram-video video');
          const image = post.image_url || media?.src;
          featuredVideoBlock.dataset.instagramPostUrl = post.permalink || instagramPostUrl;
          if (post.video_url) {
            const video = document.createElement('video');
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.poster = image || '';
            // 本番のプロキシを経由し、Instagram側の動画URL変更にも対応します。
            video.src = '/api/featured-video';
            video.addEventListener('error', () => {
              if (image) {
                const fallback = document.createElement('img');
                fallback.src = image;
                fallback.alt = post.caption ? `Instagram投稿：${post.caption.slice(0, 60)}` : '福直フルーツのInstagram投稿';
                video.replaceWith(fallback);
              }
            }, { once: true });
            media?.replaceWith(video);
            video.play().catch(() => {});
          } else if (image && media) {
            media.src = image;
            media.alt = post.caption ? `Instagram投稿：${post.caption.slice(0, 60)}` : '福直フルーツのInstagram投稿';
          }
        })
        .catch(() => {});
    }


const menu = document.querySelector('.mobile-menu');
const menuSummary = menu?.querySelector(':scope > summary');
menu?.addEventListener('toggle', () => menuSummary?.setAttribute('aria-expanded', String(menu.open)));
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu) menu.open = false; });

// Business calendars use the existing store schedules, in Japan time.
(() => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric'
  }).formatToParts(new Date());
  const year = Number(parts.find(part => part.type === 'year').value);
  const month = Number(parts.find(part => part.type === 'month').value);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const monthLabel = `${year}年${month}月`;

  function render(card, index, data = {}) {
    card.querySelector('h4').textContent = monthLabel;
    card.closest('.calendar-toggle').querySelector('.calendar-month').textContent = monthLabel;
    const dates = card.querySelector('.calendar-dates');
    dates.replaceChildren();
    const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let blank = 0; blank < firstDay; blank++) {
      const cell = document.createElement('span');
      cell.className = 'calendar-blank';
      cell.setAttribute('aria-hidden', 'true');
      dates.append(cell);
    }
    for (let day = 1; day <= lastDate; day++) {
      const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      const key = `${monthKey}-${String(day).padStart(2, '0')}`;
      const override = typeof data.hoursByDate?.[key] === 'string' ? data.hoursByDate[key] : '';
      const normalHours = index === 0 ? (weekday === 3 ? '' : ([0, 1].includes(weekday) ? '9:00〜16:00' : '9:00〜18:00')) : '基本営業日';
      const hours = override || normalHours;
      const closed = !override && ((data.closedDates || []).includes(key) || !hours);
      const cell = document.createElement('span');
      cell.className = closed ? 'closed' : (index === 0 ? '' : 'all-open');
      cell.textContent = String(day);
      const label = closed ? '休業日' : (override || index === 0 ? `営業時間 ${hours}` : '基本営業日');
      cell.setAttribute('aria-label', `${month}月${day}日 ${label}`);
      dates.append(cell);
    }
  }

  document.querySelectorAll('.calendar-card').forEach(async (card, index) => {
    render(card, index);
    const status = card.querySelector('.calendar-status');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const shop = index === 0 ? 'fukunao' : 'onomichi-kajitsu';
      const response = await fetch(`/api/calendar?month=${monthKey}&shop=${shop}`, { signal: controller.signal });
      if (!response.ok) throw new Error('calendar_unavailable');
      const data = await response.json();
      if (data?.month !== monthKey || data?.shop !== shop || !Array.isArray(data.closedDates)) throw new Error('calendar_invalid');
      render(card, index, data);
      status.textContent = '';
      status.hidden = true;
    } catch {
      status.textContent = '最新の営業予定を確認できません。ご来店前にお電話でご確認ください。';
    } finally {
      clearTimeout(timeout);
    }
  });
})();
