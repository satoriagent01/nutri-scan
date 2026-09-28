import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { scanLabel } from '../ocr';

interface ScannerProps {
  onScanComplete: (data: Record<string, string>) => void;
}

export function Scanner({ onScanComplete }: ScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct } = useStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      setScanning(true);
      setError(null);

      try {
        const data = await scanLabel(result);
        setExtracted(data);
        setScanning(false);
      } catch {
        setError('No se pudo leer la etiqueta. Intenta con otra foto.');
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const productData = {
      name: extracted['nombre'] || extracted['product'] || extracted['producto'] || 'Producto escaneado',
      brand: extracted['marca'] || extracted['brand'] || '',
      serving_size: extracted['porcion'] || extracted['serving'] || extracted['porción'] || '100g',
      serving_grams: parseFloat(extracted['gramos'] || extracted['grams'] || extracted['peso'] || '100'),
      calories: parseFloat(extracted['calorias'] || extracted['calories'] || extracted['energía'] || '0'),
      protein: parseFloat(extracted['proteina'] || extracted['protein'] || extracted['proteína'] || '0'),
      carbs: parseFloat(extracted['carbohidratos'] || extracted['carbs'] || extracted['carbs'] || extracted['hidratos'] || '0'),
      fat: parseFloat(extracted['grasa'] || extracted['fat'] || extracted['grasa_total'] || extracted['grasas'] || '0'),
      fiber: parseFloat(extracted['fibra'] || extracted['fiber'] || '0'),
      sugar: parseFloat(extracted['azucar'] || extracted['sugar'] || extracted['azúcar'] || extracted['azúcares'] || '0'),
      sodium: parseFloat(extracted['sodio'] || extracted['sodium'] || '0'),
      saturated_fat: parseFloat(extracted['grasa_saturada'] || extracted['saturated_fat'] || extracted['grasas_saturadas'] || '0'),
    };
    addProduct(productData);
    onScanComplete(productData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Escanear etiqueta</h2>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-12 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-slate-600 font-medium">Tomar foto o subir imagen</p>
              <p className="text-sm text-slate-400 mt-1">Etiqueta nutricional del producto</p>
            </div>
          </button>
        )}

        {preview && (
          <div className="space-y-4">
            <img src={preview} alt="Etiqueta escaneada" className="w-full rounded-lg max-h-64 object-contain bg-slate-50" />
            
            {scanning && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
                <p className="text-sm text-slate-500 mt-2">Leyendo etiqueta...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {extracted && !scanning && (
              <div className="space-y-3">
                <h3 className="font-medium text-slate-700">Datos detectados:</h3>
                {Object.entries(extracted).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm py-1 border-b border-slate-100">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Guardar producto
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
