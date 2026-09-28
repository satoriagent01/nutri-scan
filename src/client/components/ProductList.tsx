import { useState } from 'react';
import { useStore } from '../store';

export function ProductList() {
  const { products, deleteProduct } = useStore();
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
      />
      
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                {product.brand && <p className="text-sm text-slate-500">{product.brand}</p>}
                {product.serving_size && <p className="text-xs text-slate-400">Porción: {product.serving_size}</p>}
              </div>
              <button
                onClick={() => deleteProduct(product.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="font-semibold text-orange-700">{product.calories}</div>
                <div className="text-orange-500">kcal</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="font-semibold text-blue-700">{product.protein}g</div>
                <div className="text-blue-500">Proteína</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="font-semibold text-yellow-700">{product.carbs}g</div>
                <div className="text-yellow-500">Carbs</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <div className="font-semibold text-red-700">{product.fat}g</div>
                <div className="text-red-500">Grasa</div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-8">No hay productos guardados</p>
        )}
      </div>
    </div>
  );
}
