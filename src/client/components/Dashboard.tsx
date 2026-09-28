import { useState } from 'react';
import { useStore } from '../store';

export function Dashboard() {
  const { dailyTotals, products, mealItems } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const totals = dailyTotals.find(t => t.date === selectedDate) || {
    date: selectedDate,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    saturated_fat: 0,
  };

  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
    saturated_fat: 20,
  };

  const nutrients = [
    { key: 'calories', label: 'Calorías', unit: 'kcal', color: 'orange', icon: '🔥' },
    { key: 'protein', label: 'Proteína', unit: 'g', color: 'blue', icon: '💪' },
    { key: 'carbs', label: 'Carbohidratos', unit: 'g', color: 'yellow', icon: '⚡' },
    { key: 'fat', label: 'Grasa', unit: 'g', color: 'red', icon: '🧈' },
    { key: 'fiber', label: 'Fibra', unit: 'g', color: 'green', icon: '🌿' },
    { key: 'sugar', label: 'Azúcar', unit: 'g', color: 'pink', icon: '🍬' },
    { key: 'sodium', label: 'Sodio', unit: 'mg', color: 'purple', icon: '🧂' },
    { key: 'saturated_fat', label: 'Grasa Sat.', unit: 'g', color: 'indigo', icon: '🥓' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resumen diario</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1 rounded-lg border border-slate-200 text-sm"
          />
        </div>

        <div className="space-y-4">
          {nutrients.map(({ key, label, unit, color, icon }) => {
            const value = totals[key as keyof typeof totals] || 0;
            const goal = goals[key as keyof typeof goals];
            const percentage = goal ? Math.min((value / goal) * 100, 100) : 0;
            const overGoal = goal && value > goal;

            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <span>{icon}</span>
                    <span className="font-medium">{label}</span>
                  </span>
                  <span className={overGoal ? 'text-red-500 font-semibold' : 'text-slate-600'}>
                    {typeof value === 'number' ? value.toFixed(1) : value}{unit} {goal && `/ ${goal}${unit}`}
                  </span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`nutrient-bar ${overGoal ? 'bg-red-500' : `bg-${color}-500`}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-3xl font-bold text-emerald-500">{products.length}</div>
          <div className="text-sm text-slate-500">Productos guardados</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="text-3xl font-bold text-blue-500">{mealItems.length}</div>
          <div className="text-sm text-slate-500">Items registrados</div>
        </div>
      </div>
    </div>
  );
}
