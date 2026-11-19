import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import { SearchIcon, XIcon, ArrowRightIcon } from '../components/Icons.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ sort });
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    const t = setTimeout(() => {
      setLoading(true);
      api(`/products?${params}`)
        .then((data) => {
          setProducts(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250); // debounce typing
    return () => clearTimeout(t);
  }, [search, category, sort]);

  const reset = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="hero-pill">✨ New arrivals every week</span>
          <h1>Everyday essentials,<br />delivered free.</h1>
          <p>Quality products at fair prices. Order in a minute, pay cash when it reaches your door.</p>
          <a href="#shop" className="btn btn-light">Shop now <ArrowRightIcon size="1em" /></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span>🎧</span><span>👟</span><span>🪴</span><span>⌚</span>
        </div>
      </section>

      <section id="shop" className="toolbar">
        <div className="search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button className="icon-btn" onClick={() => setSearch('')} aria-label="Clear search">
              <XIcon size="1em" />
            </button>
          )}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </section>

      <div className="chips" role="tablist" aria-label="Categories">
        {['', ...categories].map((c) => (
          <button
            key={c || 'all'}
            role="tab"
            aria-selected={category === c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c || 'All'}
          </button>
        ))}
      </div>

      {!loading && !error && (
        <p className="muted small result-count">
          {products.length} {products.length === 1 ? 'product' : 'products'}
          {category && <> in <strong>{category}</strong></>}
          {search.trim() && <> matching “{search.trim()}”</>}
        </p>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🔍</div>
          <h2>No products found</h2>
          <p className="muted">Try a different search or category.</p>
          <button className="btn btn-outline" onClick={reset}>Clear filters</button>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </>
  );
}
