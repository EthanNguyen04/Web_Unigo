"use client";
import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface Variant {
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface VariantEditProps {
  initialVariants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  /** Khi true: đánh dấu tất cả ô không hợp lệ để show * ngay */
  showAllErrors?: boolean;
}



const VariantEdit: React.FC<VariantEditProps> = ({ initialVariants, onVariantsChange }) => {
  const [sizes, setSizes] = useState<string[]>(() => Array.from(new Set(initialVariants.map(v => v.size))));
  const [colors, setColors] = useState<string[]>(() => Array.from(new Set(initialVariants.map(v => v.color))));
  const [variantData, setVariantData] = useState<Variant[]>(initialVariants);

  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("");

  // track errors and touched fields
  const [errors, setErrors] = useState<Record<number, { quantity?: boolean; price?: boolean }>>({});
  const [touched, setTouched] = useState<Record<number, { quantity?: boolean; price?: boolean }>>({});

  const updateCombinations = useCallback(
    (newSizes: string[], newColors: string[], current: Variant[]) => {
      const combos: Variant[] = [];
      newSizes.forEach(size => newColors.forEach(color => {
        const existing = current.find(v => v.size === size && v.color === color);
        combos.push(existing ? { ...existing } : { size, color, quantity: 0, price: 0 });
      }));
      return combos;
    }, []);

  useEffect(() => {
    setVariantData(prev => updateCombinations(sizes, colors, prev));
  }, [sizes, colors, updateCombinations]);

  useEffect(() => {
    onVariantsChange(variantData);
  }, [variantData, onVariantsChange]);

  const handleAddSize = useCallback(() => {
    const val = newSize.trim();
    if (val && !sizes.includes(val)) setSizes(prev => [...prev, val]);
    setNewSize("");
  }, [newSize, sizes]);

  const handleAddColor = useCallback(() => {
    const val = newColor.trim();
    if (val && !colors.includes(val)) setColors(prev => [...prev, val]);
    setNewColor("");
  }, [newColor, colors]);

  const handleDeleteSize = useCallback((s: string) => setSizes(prev => prev.filter(x => x !== s)), []);
  const handleDeleteColor = useCallback((c: string) => setColors(prev => prev.filter(x => x !== c)), []);

  const validate = useCallback((index: number, field: 'quantity' | 'price', value: number) => {
    setErrors(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: field === 'quantity' ? value < 0 : value < 1000 }
    }));
  }, []);

  const markTouched = useCallback((index: number, field: 'quantity' | 'price') => {
    setTouched(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: true }
    }));
  }, []);

  const handleVariantChange = useCallback(
    (index: number, field: 'quantity' | 'price', raw: number) => {
      const value = isNaN(raw) ? 0 : Math.floor(raw);
      setVariantData(prev => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: field === 'quantity' ? Math.max(0, value) : value };
        return next;
      });
      validate(index, field, value);
    }, [validate]);

  const formatNumber = useCallback((num: number) => num.toLocaleString('de-DE'), []);

  return (
    <div className="space-y-4">
      {/* Size Controls */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold">Sizes:</span>
        {sizes.map(s => (
          <div key={s} className="flex items-center space-x-1 border p-1 rounded">
            <span>{s}</span>
            <button type="button" onClick={() => handleDeleteSize(s)}>
              <XMarkIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
        <input
          type="text" value={newSize} onChange={e => setNewSize(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
          placeholder="Nhập size" className="border p-1 rounded" />
        <button type="button" onClick={handleAddSize} className="p-1">
          <PlusIcon className="h-5 w-5 text-blue-500" />
        </button>
      </div>

      {/* Color Controls */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold">Colors:</span>
        {colors.map(c => (
          <div key={c} className="flex items-center space-x-1 border p-1 rounded">
            <span>{c}</span>
            <button type="button" onClick={() => handleDeleteColor(c)}>
              <XMarkIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
        <input
          type="text" value={newColor} onChange={e => setNewColor(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
          placeholder="Nhập màu" className="border p-1 rounded" />
        <button type="button" onClick={handleAddColor} className="p-1">
          <PlusIcon className="h-5 w-5 text-blue-500" />
        </button>
      </div>

      {/* Variants Table */}
      {sizes.length > 0 && colors.length > 0 && (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Size</th>
              <th className="border p-2">Color</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {variantData.map((v, i) => (
              <tr key={`${v.size}-${v.color}`} className="hover:bg-gray-50">
                <td className="border p-2">{v.size}</td>
                <td className="border p-2">{v.color}</td>
                <td className="border p-2 relative">
                  <input
                    type="number" min={0} value={v.quantity}
                    onBlur={() => markTouched(i, 'quantity')}
                    onChange={e => handleVariantChange(i, 'quantity', Number(e.target.value))}
                    className="w-full border p-1 rounded" />
                  {errors[i]?.quantity && touched[i]?.quantity && (
                    <span className="absolute top-0 right-0 text-red-500">*</span>
                  )}
                </td>
                <td className="border p-2 relative">
                  <input
                    type="text" value={formatNumber(v.price)}
                    onBlur={() => { markTouched(i, 'price'); handleVariantChange(i, 'price', v.price); }}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (/^\d*$/.test(raw)) handleVariantChange(i, 'price', Number(raw));
                    }}
                    className="w-full border p-1 rounded" />
                  {errors[i]?.price && touched[i]?.price && (
                    <span className="absolute top-0 right-0 text-red-500">*</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VariantEdit;
