import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://evready.pk';

function getCanonicalUrl(pathname: string) {
  if (pathname === '/') {
    return `${siteUrl}/`;
  }

  return `${siteUrl}${pathname.replace(/\/+$/, '')}`;
}

function ensureMetaTag(property: string) {
  let metaTag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('property', property);
    document.head.appendChild(metaTag);
  }

  return metaTag;
}

function ensureCanonicalLink() {
  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }

  return canonicalLink;
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalUrl = getCanonicalUrl(pathname);

    ensureCanonicalLink().href = canonicalUrl;
    ensureMetaTag('og:url').content = canonicalUrl;
  }, [pathname]);

  return null;
}
