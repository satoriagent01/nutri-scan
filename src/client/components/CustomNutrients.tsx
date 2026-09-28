import { useState } from 'react';
import { useStore } from '../store';

export function CustomNutrients() {
  const { customNutrients, addCustomNutrient, deleteCustomNutrient } = useStore();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('g');
  const [dailyGoal, setDailyGoal] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addCustomNutrient({
      name: name.trim(),
      unit,
      dailyGoal: dailyGoal ? parseFloat(dailyGoal) : undefined,
    });
    setName('');
    setDailyGoal('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Nutrientes personalizados</h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nombre (ej: Potasio)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-400 outline-none"
          />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
          >
            <option value="g">g</option>
            <option value="mg">mg</option>
            <option value="mcg">mcg</option>
            <option value="UI">UI</option>
            <option value="%">%</option>
          </select>
          <input
            type="number"
            placeholder="Meta diaria"
            value={dailyGoal}
            onChange={e => setDailyGoal(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-400 outline-none"
          />
          <button
            onClick={handleAdd}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            +
          </button>
        </div>

        <div className="space-y-2">
          {customNutrients.map(nutrient => (
            <div key={nutrient.id} className="flex justify-between items-center py-2 border-b border-slate-100">
              <div>
                <span className="font-medium">{nutrient.name}</span>
                <span className="text-sm text-slate-400 ml-2">({nutrient.unit})</span>
                {nutrient.dailyGoal && (
                  <span className="text-xs text-emerald-600 ml-2">Meta: {nutrient.dailyGoal}{nutrient.unit}</span>
                )}
              </div>
              <button
                onClick={() => deleteCustomNutrient(nutrient.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          {customNutrients.length === 0 && (
            <p className="text-center text-slate-400 py-4 text-sm">Agrega nutrientes personalizados</p>
          )}
        </div>
      </div>
    </div>
  );
}
