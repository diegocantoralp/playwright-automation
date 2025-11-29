/**
 * Utility para parsear props desde query string
 * Permite pasar props dinámicos a componentes HTML vía URL
 */
export function parseProps() {
  try {
    const url = new URL(location.href);
    const propsParam = url.searchParams.get('props');
    return propsParam ? JSON.parse(propsParam) : {};
  } catch (error) {
    console.warn('Failed to parse props from URL:', error);
    return {};
  }
}

/**
 * Helper para renderizar texto de manera segura
 */
export function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Helper para formatear moneda
 */
export function formatCurrency(amount, currency = 'PEN', locale = 'es-PE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
