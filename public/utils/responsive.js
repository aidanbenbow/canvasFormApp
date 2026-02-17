export function isSmallScreen() {
  return typeof window !== 'undefined' && window.innerWidth < 1024;
}

export function getResponsiveViewport() {
  if (typeof window === 'undefined') return 600;

  const screenHeight = window.innerHeight || 800;
  if (screenHeight < 700) {
    return Math.max(360, Math.floor(screenHeight * 0.62));
  }

  if (screenHeight < 1000) {
    return Math.max(460, Math.floor(screenHeight * 0.7));
  }

  return Math.max(560, Math.floor(screenHeight * 0.76));
}