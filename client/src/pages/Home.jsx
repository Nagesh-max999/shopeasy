import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import { ChevronRightIcon } from '../components/Icons.jsx';

const RAIL_SIZE = 12; // products per category row on the home page

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() || '';
  const cat = params.get('cat') || '';
  const sort = params.get('sort') || 'newest';
  const browsing = !q && !cat;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams({ sort: browsing ? 'newest' : sort });
    if (q) query.set('search', q);
    if (cat) query.set('category', cat);
    let live = true;
    setLoading(true);
    api(`/products?${query}`)
      .then((data) => {
        if (!live) return;
        setProducts(data);
        setError('');
      })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [q, cat, sort, browsing]);

  const setSort = (value) => {
    const next = new URLSearchParams(params);
    value === 'newest' ? next.delete('sort') : next.set('sort', value);
    setParams(next, { replace: true });
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (browsing) return <Browse products={products} loading={loading} />;

  return (
    <>
      <div className="results-head">
        <div>
          <h1>{cat || 'Search results'}</h1>
          {!loading && (
            <p className="muted small">
              {products.length} {products.length === 1 ? 'product' : 'products'}
              {q && <> matching “{q}”</>}
              {q && cat && <> in {cat}</>}
            </p>
          )}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🔍</div>
          <h2>No products found</h2>
          <p className="muted">Try a different search or category.</p>
          <Link to="/" className="btn btn-outline">Browse all products</Link>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </>
  );
}

function Browse({ products, loading }) {
  // Group products by category, keeping the order categories first appear in
  const groups = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    }
    return [...map.entries()];
  }, [products]);

  const slides = useMemo(() => {
    const inStock = (p) => p.stock > 0;
    // Slide 1: one product from each of the first few categories
    const essentials = groups.map(([, items]) => items.find(inStock)).filter(Boolean).slice(0, 3);
    // Slide 2: gadgets from the tech categories
    const tech = groups.filter(([name]) => /electronic|mobile|phone|laptop|tablet/i.test(name));
    const gadgets = [0, 1, 2]
      .map((n) => tech[n % tech.length]?.[1].filter(inStock)[Math.floor(n / tech.length)])
      .filter(Boolean);
    const techCat = tech[0]?.[0];
    // Slide 3: one item each from fashion, footwear and accessories
    const style = groups.filter(([name]) => /fashion|cloth|foot|shoe|accessor/i.test(name));
    const outfits = style.map(([, items]) => items.find(inStock)).filter(Boolean).slice(0, 3);
    const fashionCat = groups.find(([name]) => /fashion|cloth/i.test(name))?.[0];

    return [
      {
        title: 'EVERYDAY ESSENTIALS',
        text: 'Groceries, gadgets, fashion and more, delivered free to your door.',
        cta: 'Order now',
        to: '#categories',
        theme: 'teal',
        images: essentials.map((p) => p.image),
      },
      {
        title: 'LATEST GADGETS',
        text: 'Phones, laptops, earbuds and more at great prices, with Cash on Delivery.',
        cta: 'Shop gadgets',
        to: techCat ? `/?cat=${encodeURIComponent(techCat)}` : '#categories',
        theme: 'violet',
        images: gadgets.map((p) => p.image),
      },
      {
        title: 'FRESH FASHION',
        text: 'Shirts, dresses, shoes and accessories for every day and every occasion.',
        cta: 'Shop fashion',
        to: fashionCat ? `/?cat=${encodeURIComponent(fashionCat)}` : '#categories',
        theme: 'rose',
        images: outfits.map((p) => p.image),
      },
    ];
  }, [groups]);

  return (
    <>
      <HeroSlider slides={slides} />

      <section id="categories" className="section">
        <div className="section-head">
          <h2>Shop by Category</h2>
        </div>
        <div className="cat-grid">
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="cat-tile">
                  <div className="cat-tile-img skeleton" />
                  <div className="skeleton line" style={{ width: '70%', margin: '0 auto' }} />
                </div>
              ))
            : groups.map(([name, items]) => (
                <Link key={name} to={`/?cat=${encodeURIComponent(name)}`} className="cat-tile">
                  <div className="cat-tile-img">
                    {items.slice(0, 4).map((p) => <img key={p._id} src={p.image} alt="" loading="lazy" />)}
                  </div>
                  <span>{name}</span>
                </Link>
              ))}
        </div>
      </section>

      {groups.map(([name, items]) => (
        <section key={name} className="section">
          <div className="section-head">
            <h2>{name}</h2>
            <Link to={`/?cat=${encodeURIComponent(name)}`} className="see-all">
              See All <ChevronRightIcon size="1em" />
            </Link>
          </div>
          <div className="rail">
            {items.slice(0, RAIL_SIZE).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      ))}
    </>
  );
}
