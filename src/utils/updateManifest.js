const THEME_COLORS = {
  green: '#3dff6e',
  blue: '#3db8ff',
  red: '#ff3d5c',
  orange: '#ffaa33',
  purple: '#c03dff',
};

function buildIconSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="96" fill="#050805"/><rect x="96" y="240" width="320" height="32" rx="8" fill="${color}"/><rect x="72" y="192" width="48" height="128" rx="10" fill="${color}"/><rect x="48" y="212" width="32" height="88" rx="8" fill="${color}"/><rect x="392" y="192" width="48" height="128" rx="10" fill="${color}"/><rect x="432" y="212" width="32" height="88" rx="8" fill="${color}"/></svg>`;
}

export function updateManifestTheme(theme) {
  const color = THEME_COLORS[theme] || THEME_COLORS.green;
  const iconDataUrl = `data:image/svg+xml,${encodeURIComponent(buildIconSvg(color))}`;

  const manifest = {
    name: 'Lift Log',
    short_name: 'Lift Log',
    description: 'Track your workouts and progress',
    start_url: '/',
    display: 'standalone',
    background_color: '#050805',
    theme_color: '#050805',
    orientation: 'portrait',
    icons: [{ src: iconDataUrl, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const newUrl = URL.createObjectURL(blob);

  let link = document.querySelector('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  const oldUrl = link.href;
  link.href = newUrl;

  // Revoke the previous blob URL after the browser has picked up the new one
  if (oldUrl && oldUrl.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(oldUrl), 1000);
  }
}
