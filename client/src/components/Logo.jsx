import { useId } from 'react';

// ShopEasy mark: a shopping bag with a lightning bolt (fast delivery).
// Same artwork as public/favicon.svg.
export function LogoMark({ size = 36, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={`logo-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#lg-${id})`} />
      <path d="M18.5 17v-2.2a5.5 5.5 0 0 1 11 0V17" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12.5 17.5h23l-1.7 18.6a3.2 3.2 0 0 1-3.2 2.9H17.4a3.2 3.2 0 0 1-3.2-2.9z" fill="#fff" />
      <path d="M25.9 21.5 19.6 29.6h4.3l-1.3 6.4 6.4-8.4h-4.4z" fill={`url(#lg-${id})`} />
    </svg>
  );
}

export default function Logo({ size = 36, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMark size={size} />
      <span className="logo-word">
        Shop<span>Easy</span>
      </span>
    </span>
  );
}
