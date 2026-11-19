import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons.jsx';

const INTERVAL = 5000; // ms between automatic slide changes

// slides: [{ title, text, cta, to, theme, images: [url] }]
// `to` starting with "#" scrolls on the page; otherwise it's a route.
export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  const go = (i) => setIndex((i + count) % count);

  // Auto-advance; restarts the timer whenever the slide changes (so a manual
  // click gets a full interval) and stops while hovered/focused or the tab is hidden
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section
      className="hero-slider"
      aria-roledescription="carousel"
      aria-label="Offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => {
          const active = i === index;
          const cta = (
            <>
              {s.cta} <ChevronRightIcon size="1.1em" />
            </>
          );
          return (
            <div
              key={s.title}
              className={`promo promo-${s.theme}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={active ? undefined : ''}
            >
              <div className="promo-text">
                <h1>{s.title}</h1>
                <p>{s.text}</p>
                {s.to.startsWith('#') ? (
                  <a href={s.to} className="btn btn-dark btn-lg">{cta}</a>
                ) : (
                  <Link to={s.to} className="btn btn-dark btn-lg">{cta}</Link>
                )}
              </div>
              <div className="promo-art" aria-hidden="true">
                {s.images.map((src) => <img key={src} src={src} alt="" />)}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button className="hero-arrow prev" onClick={() => go(index - 1)} aria-label="Previous slide">
            <ArrowLeftIcon />
          </button>
          <button className="hero-arrow next" onClick={() => go(index + 1)} aria-label="Next slide">
            <ArrowRightIcon />
          </button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                key={s.title}
                className={i === index ? 'active' : ''}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
