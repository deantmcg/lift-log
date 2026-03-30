const VALID_THEMES = new Set(['green', 'blue', 'red', 'orange', 'purple']);

export function updateManifestTheme(theme) {
  const safeTheme = VALID_THEMES.has(theme) ? theme : 'green';
  const manifestUrl = `/manifest-${safeTheme}.json`;
  const iconUrl = `/icon-${safeTheme}.svg`;

  // Update <link rel="manifest"> — remove and re-append so Chrome re-evaluates
  // installability with the new manifest (a simple href swap is not always detected).
  let link = document.querySelector('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
  } else {
    link.parentNode.removeChild(link);
  }
  link.href = manifestUrl;
  document.head.appendChild(link);

  // Keep apple-touch-icon in sync for iOS Add-to-Home-Screen
  let touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (!touchIcon) {
    touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    document.head.appendChild(touchIcon);
  }
  touchIcon.href = iconUrl;
}

