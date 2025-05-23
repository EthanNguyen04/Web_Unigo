"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface Variant {
  size: string;
  color: string;
  quantity: number;
  price: number;
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
  // Cập nhật variantData dựa trên sizes và colors
  const updateVariantData = (
    newSizes: string[],
    newColors: string[],
    currentData: Variant[]
  ): Variant[] => {
    const combinations: Variant[] = [];
    newSizes.forEach((size) => {
      newColors.forEach((color) => {
        const existing = currentData.find((v) => v.size === size && v.color === color);
        if (existing) {
          combinations.push(existing);
        } else {
          combinations.push({ size, color, quantity: 0, price: 0 });
        }
      });
    });
    return combinations;
  };

  // Khi sizes hoặc colors thay đổi, cập nhật variantData
  useEffect(() => {
    const newData = updateVariantData(sizes, colors, variantData);
    setVariantData(newData);
    onVariantsChange(newData);
  }, [sizes, colors]);

  // Xử lý thay đổi cho bảng variants
  const handleVariantChange = (
    index: number,
    field: "quantity" | "price",
    value: number
  ) => {
    const updated = [...variantData];
    updated[index] = { ...updated[index], [field]: value < 0 ? 0 : value };
    setVariantData(updated);
    onVariantsChange(updated);
  };

  // Thêm size mới
// Validate và format size
const validateAndFormatSize = (size: string): string => {
  return size.toUpperCase();
};

// Validate và format color
const validateAndFormatColor = (color: string): string => {
  return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
};

  // Thêm size mới
const handleAddSize = () => {
  const trimmed = newSize.trim();
  if (trimmed === "") {
    setSizeError("Size không được để trống!");
    return;
  }
  const formattedSize = validateAndFormatSize(trimmed);
  if (sizes.includes(formattedSize)) {
    setSizeError("Size này đã tồn tại!");
    return;
  }
  setSizes([...sizes, formattedSize]);
  setNewSize("");
  setSizeError(""); // Xóa lỗi khi thêm thành công
};

const handleAddColor = () => {
  const trimmed = newColor.trim();
  if (trimmed === "") {
    setColorError("Màu sắc không được để trống!");
    return;
  }
  const formattedColor = validateAndFormatColor(trimmed);
  if (colors.includes(formattedColor)) {
    setColorError("Màu sắc này đã tồn tại!");
    return;
  }
  setColors([...colors, formattedColor]);
  setNewColor("");
  setColorError(""); // Xóa lỗi khi thêm thành công
};

const handleSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setNewSize(validateAndFormatSize(value));
  if (sizeError) setSizeError("");
};

const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setNewColor(validateAndFormatColor(value));
  if (colorError) setColorError("");
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
            onChange={handleSizeInputChange}
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
          {sizes.map((size, index) => (
            <div key={index} className="border p-1 rounded flex items-center">
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
            onChange={handleColorInputChange}
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
          {colors.map((color, index) => (
            <div key={index} className="border p-1 rounded flex items-center">
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

      {/* Bảng ghép cặp variants (chỉ hiển thị khi có cả size và color) */}
      {sizes.length > 0 && colors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Các variants</h3>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Size</th>
                <th className="border p-2">Màu</th>
                <th className="border p-2">Số lượng</th>
                <th className="border p-2">Giá (VND)</th>
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
