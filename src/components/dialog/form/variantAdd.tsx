"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface Variant {
  size: string;
  color: string;
  quantity: number;
  price: number;
  priceIn: number;
}

interface VariantBuilderProps {
  onVariantsChange: (variants: Variant[]) => void;
}

const VariantBuilder: React.FC<VariantBuilderProps> = ({ onVariantsChange }) => {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [variantData, setVariantData] = useState<Variant[]>([]);
  const [sizeError, setSizeError] = useState<string>("");
  const [colorError, setColorError] = useState<string>("");

  // Format size/collor
  const formatSize = (s: string) => s.trim().toUpperCase();
  const formatColor = (c: string) =>
    c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();

  // Update variantData khi size/color thay đổi
  useEffect(() => {
    const combos: Variant[] = [];
    sizes.forEach((size) =>
      colors.forEach((color) => {
        const exist = variantData.find(
          (v) => v.size === size && v.color === color
        );
        combos.push(
          exist
            ? exist
            : { size, color, quantity: 0, price: 0, priceIn: 0 }
        );
      })
    );
    setVariantData(combos);
    onVariantsChange(combos);
    // eslint-disable-next-line
  }, [sizes, colors]);

  // Khi variantData thay đổi (số lượng, giá...), cập nhật lên cha
  useEffect(() => {
    onVariantsChange(variantData);
    // eslint-disable-next-line
  }, [variantData]);

  // Thêm size
  const handleAddSize = () => {
    const val = formatSize(newSize);
    if (!val) {
      setSizeError("Size không được để trống!");
      return;
    }
    if (sizes.includes(val)) {
      setSizeError("Size này đã tồn tại!");
      return;
    }
    setSizes([...sizes, val]);
    setNewSize("");
    setSizeError("");
  };

  // Thêm color
  const handleAddColor = () => {
    const val = formatColor(newColor);
    if (!val) {
      setColorError("Màu sắc không được để trống!");
      return;
    }
    if (colors.includes(val)) {
      setColorError("Màu sắc này đã tồn tại!");
      return;
    }
    setColors([...colors, val]);
    setNewColor("");
    setColorError("");
  };

  // Xử lý thay đổi input variant
  const handleVariantChange = (
    index: number,
    field: "quantity" | "price" | "priceIn",
    value: number
  ) => {
    const updated = [...variantData];
    updated[index] = { ...updated[index], [field]: value < 0 ? 0 : value };
    setVariantData(updated);
  };

  return (
    <div className="space-y-4">
      {/* Nhập sizes */}
      <div>
        <div className="flex items-center mb-2">
          <label className="mr-2 font-semibold">Size:</label>
          <input
            type="text"
            value={newSize}
            onChange={(e) => {
              setNewSize(formatSize(e.target.value));
              if (sizeError) setSizeError("");
            }}
            placeholder="Nhập size"
            className="border p-1 rounded mr-2"
          />
          <button
            type="button"
            onClick={handleAddSize}
            className="bg-blue-500 text-white p-1 rounded flex items-center"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        {sizeError && <div className="text-red-500 text-sm mt-1">{sizeError}</div>}
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, idx) => (
            <div key={idx} className="border p-1 rounded flex items-center">
              <span>{size}</span>
              <button
                type="button"
                onClick={() => setSizes(sizes.filter((s) => s !== size))}
                className="ml-2 text-red-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Nhập colors */}
      <div>
        <div className="flex items-center mb-2">
          <label className="mr-2 font-semibold">Màu sắc:</label>
          <input
            type="text"
            value={newColor}
            onChange={(e) => {
              setNewColor(formatColor(e.target.value));
              if (colorError) setColorError("");
            }}
            placeholder="Nhập màu sắc"
            className="border p-1 rounded mr-2"
          />
          <button
            type="button"
            onClick={handleAddColor}
            className="bg-blue-500 text-white p-1 rounded flex items-center"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        {colorError && <div className="text-red-500 text-sm mt-1">{colorError}</div>}
        <div className="flex flex-wrap gap-2">
          {colors.map((color, idx) => (
            <div key={idx} className="border p-1 rounded flex items-center">
              <span>{color}</span>
              <button
                type="button"
                onClick={() => setColors(colors.filter((c) => c !== color))}
                className="ml-2 text-red-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Bảng variants */}
      {sizes.length > 0 && colors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Các phân loại</h3>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Size</th>
                <th className="border p-2">Màu</th>
                <th className="border p-2">Số lượng</th>
                <th className="border p-2">Giá nhập (VND)</th>
                <th className="border p-2">Giá bán (VND)</th>
              </tr>
            </thead>
            <tbody>
              {variantData.map((variant, index) => (
                <tr key={`${variant.size}-${variant.color}`} className="hover:bg-gray-50">
                  <td className="border p-2">{variant.size}</td>
                  <td className="border p-2">{variant.color}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) =>
                        handleVariantChange(index, "quantity", Number(e.target.value))
                      }
                      className="w-full border p-1 rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      value={variant.priceIn}
                      onChange={(e) =>
                        handleVariantChange(index, "priceIn", Number(e.target.value))
                      }
                      className="w-full border p-1 rounded"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", Number(e.target.value))
                      }
                      className="w-full border p-1 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantBuilder;