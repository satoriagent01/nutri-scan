import { useState } from 'react';
import { useStore } from '../store';
import { Scanner } from './Scanner';

export function MealPlanner() {
  const { meals, mealItems, products, addMeal, addMealItem, deleteMeal, deleteMealItem, getMealTotal } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [amountGrams, setAmountGrams] = useState('');
  const [mealName, setMealName] = useState('');

  const dayMeals = meals.filter(m => m.date === selectedDate);
  const currentMealItems = selectedMeal ? mealItems.filter(i => i.meal_id === selectedMeal) : [];

  const handleAddMeal = () => {
    if (!mealName.trim()) return;
    const meal = addMeal({ name: mealName.trim(), date: selectedDate });
    setSelectedMeal(meal.id);
    setMealName('');
  };

  const handleAddItem = () => {
    if (!selectedProduct || !amountGrams || !selectedMeal) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const ratio = parseFloat(amountGrams) / (product.serving_grams || 100);
    addMealItem({
      meal_id: selectedMeal,
      product_id: selectedProduct,
      amount_grams: parseFloat(amountGrams),
      calories: product.calories * ratio,
      protein: product.protein * ratio,
      carbs: product.carbs * ratio,
      fat: product.fat * ratio,
      fiber: product.fiber * ratio,
      sugar: product.sugar * ratio,
      sodium: product.sodium * ratio,
      saturated_fat: product.saturated_fat * ratio,
    });
    setSelectedProduct('');
    setAmountGrams('');
  };

  const handleScanComplete = (data: Record<string, string>) => {
    setShowScanner(false);
    // Auto-fill product name if it's new
    const existing = products.find(p => p.name === data['nombre'] || p.name === data['product']);
    if (existing) {
      setSelectedProduct(existing.id);
    }
  };

  const dayTotal = getMealTotal(selectedDate);

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-400 outline-none"
        />
      </div>

      {/* Day totals */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Total del día</h2>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold">{Math.round(dayTotal.calories)}</div>
            <div className="text-xs opacity-80">kcal</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{dayTotal.protein.toFixed(1)}g</div>
            <div className="text-xs opacity-80">Proteína</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{dayTotal.carbs.toFixed(1)}g</div>
            <div className="text-xs opacity-80">Carbs</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{dayTotal.fat.toFixed(1)}g</div>
            <div className="text-xs opacity-80">Grasa</div>
          </div>
        </div>
      </div>

      {/* Meals list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Comidas</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              📷 Escanear
            </button>
            <button
              onClick={handleAddMeal}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              + Nueva
            </button>
          </div>
        </div>

        {showScanner && (
          <div className="animate-fade-in">
            <Scanner onScanComplete={handleScanComplete} />
          </div>
        )}

        {dayMeals.map(meal => (
          <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50"
              onClick={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
            >
              <div>
                <h3 className="font-semibold">{meal.name}</h3>
                {selectedMeal === meal.id && (
                  <p className="text-xs text-slate-500 mt-1">
                    {mealItems.filter(i => i.meal_id === meal.id).length} items
                  </p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMeal(meal.id); }}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>

            {selectedMeal === meal.id && (
              <div className="border-t border-slate-100 p-4 space-y-3">
                {/* Add item form */}
                <div className="flex gap-2">
                  <select
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.calories} kcal/100g)</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Gramos"
                    value={amountGrams}
                    onChange={e => setAmountGrams(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <button
                    onClick={handleAddItem}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Items */}
                {currentMealItems.map(item => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <div>
                        <span className="text-sm font-medium">{product?.name || 'Producto'}</span>
                        <span className="text-xs text-slate-400 ml-2">{item.amount_grams}g</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{Math.round(item.calories)} kcal</span>
                        <button
                          onClick={() => deleteMealItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {dayMeals.length === 0 && (
          <p className="text-center text-slate-400 py-8">No hay comidas registradas</p>
        )}
      </div>
    </div>
  );
}
