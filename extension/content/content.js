const ALE_ICON_ID = 'ale-bottle-cap';
const CURRENT_URL = window.location.href;

function getVideoId() {
  const host = window.location.hostname;
  if (host === 'www.youtube.com') {
    return new URLSearchParams(window.location.search).get('v');
  }
  if (host === 'x.com' || host === 'twitter.com') {
    const m = window.location.pathname.match(/\/status\/(\d+)/);
    return m ? m[1] : null;
  }
  return null;
}

function buildCap() {
  const cap = document.createElement('div');
  cap.id = ALE_ICON_ID;
  cap.title = 'ALE — Click to verify this content';
  cap.innerHTML = `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#C8860A" stroke="#8B5E0A" stroke-width="2"/>
      <circle cx="16" cy="16" r="10" fill="#E8A020" stroke="#C8860A" stroke-width="1"/>
      <text x="16" y="20" text-anchor="middle" font-family="serif" font-size="11"
            font-weight="bold" fill="white">ALE</text>
    </svg>
  `;

  cap.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (cap.classList.contains('ale-analyzing')) return;
    cap.classList.add('ale-analyzing');
    chrome.runtime.sendMessage({
      type: 'QUICK_ANALYZE',
      url: CURRENT_URL,
      videoId: getVideoId()
    });
  });

  return cap;
}

function injectBottleCap(player) {
  if (document.getElementById(ALE_ICON_ID)) return;
  player.style.position = 'relative';
  player.appendChild(buildCap());
}

function tryInject() {
  if (window.location.hostname === 'www.youtube.com') {
    const player = document.querySelector('#movie_player, ytd-player');
    if (player) injectBottleCap(player);
  } else {
    document.querySelectorAll('[data-testid="videoPlayer"]').forEach(injectBottleCap);
  }
}

tryInject();

// YouTube and X are SPAs — watch for player mounts after navigation
const observer = new MutationObserver(() => {
  if (!document.getElementById(ALE_ICON_ID)) tryInject();
});
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'ANALYZE_RESULT') return;
  const cap = document.getElementById(ALE_ICON_ID);
  if (!cap) return;
  cap.classList.remove('ale-analyzing');
  const isReal = msg.score >= 70;
  cap.classList.add(isReal ? 'ale-real' : 'ale-skunked');
  cap.title = `ALE Score: ${msg.score}% — ${msg.label}`;
});
