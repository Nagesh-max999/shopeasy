import { useEffect } from 'react';

export const SITE_NAME = 'ShopEasy';
export const DEFAULT_TITLE = 'ShopEasy | Groceries, Gadgets & Fashion with Free Delivery';
export const DEFAULT_DESCRIPTION =
  'Shop groceries, kitchen essentials, phones, laptops, beauty, fashion and more at ShopEasy. Free delivery on every order and Cash on Delivery across India.';

const setMeta = (selector, attr, key, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

/**
 * Sets the page title, description, canonical URL and robots for the current page.
 * title: page-specific part ("Cart"); null keeps the default home title.
 * noindex: true for private pages (cart, checkout, account, admin).
 */
export default function usePageMeta({ title, description, noindex = false, canonicalPath } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 160);
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    const path = canonicalPath ?? window.location.pathname;
    setCanonical(window.location.origin + path);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.origin + path);
  }, [title, description, noindex, canonicalPath]);
}
