import { getResponsiveViewport, isSmallScreen } from '../../utils/responsive.js';

export { getResponsiveViewport, isSmallScreen };

export function getCompactToolbarButtonStyle() {
  return isSmallScreen()
    ? { fillWidth: false, font: '24px sans-serif', paddingX: 16, paddingY: 10 }
    : { fillWidth: false, font: '18px sans-serif', paddingX: 12, paddingY: 7 };
}

export function getDeleteButtonStyle() {
  return isSmallScreen()
    ? {
        font: '28px sans-serif',
        minHeight: 52,
        width: 52,
        radius: 10
      }
    : {
        font: '18px sans-serif',
        minHeight: 24,
        width: 24,
        radius: 4
      };
}

export function getCompactSubmitStyle() {
  return isSmallScreen()
    ? {
        fillWidth: false,
        font: '28px sans-serif',
        paddingX: 26,
        paddingY: 14,
        minHeight: 64,
        radius: 8
      }
    : {
        fillWidth: false,
        font: '18px sans-serif',
        paddingX: 16,
        paddingY: 8,
        minHeight: 38,
        radius: 6
      };
}

export function getCopyButtonStyle() {
  return isSmallScreen()
    ? {
        fillWidth: false,
        font: '24px sans-serif',
        paddingX: 18,
        paddingY: 10,
        minHeight: 54,
        radius: 8
      }
    : {
        fillWidth: false,
        font: '16px sans-serif',
        paddingX: 12,
        paddingY: 6,
        minHeight: 34,
        radius: 6
      };
}