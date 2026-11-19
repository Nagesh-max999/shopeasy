import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {
      /* storage unavailable (private mode) — cart still works for this session */
    }
  }, [items]);

  const addToCart = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i
        );
      }
      const { _id, name, price, image, stock } = product;
      return [...prev, { _id, name, price, image, stock, qty: Math.min(qty, stock) }];
    });

  const updateQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clearCart = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
