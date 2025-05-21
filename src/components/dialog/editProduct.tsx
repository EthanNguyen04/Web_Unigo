"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import VariantEdit, { Variant } from "./form/variantEdit";
import {
  API_GET_Edit_PRODUCT,
  API_Get_CATEGORY,
  PUT_EDIT_PRODUCT,
  BASE_URL,
} from "../../config";

// Tooltip component
const Tooltip: React.FC<{ message: string }> = ({ message }) => (
  <span className="relative group ml-2 cursor-pointer align-middle">
    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 animate-pulse" />
    <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-max min-w-[120px] bg-red-500 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-pre-line">
      {message}
    </span>
  </span>
);

interface EditProductProps {
  productId: string;
  onClose: () => void;
}

interface Category {
  _id: string;
  name: string;
  status: boolean;
}

interface ProductData {
  id: string;
  images: string[];
  name: string;
  category_id: string;
  priceIn: number;
  description: string;
  variants: Variant[];
  isOnSale: boolean;
  discount: number;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const EditProduct: React.FC<EditProductProps> = ({ productId, onClose }) => {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageSlots, setImageSlots] = useState<(File | null)[]>(Array(6).fill(null));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptSubmit, setAttemptSubmit] = useState(false);
  const [changedIndexes, setChangedIndexes] = useState<number[]>([]);

  // Validate state
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
    priceIn?: string;
    images?: string;
    variants?: string;
  }>({});

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_Get_CATEGORY);
        const data = await res.json();
        const active = Array.isArray(data.categories)
          ? data.categories.filter((c: Category) => c.status)
          : [];
        setCategories(active);
      } catch (e) {
        console.error("Lỗi khi lấy danh mục:", e);
      }
    })();
  }, []);

  // Load product
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_GET_Edit_PRODUCT}/${productId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        if (data.isOnSale) {
          window.alert("Sản phẩm đang giảm giá, không thể chỉnh sửa!");
          onClose();
          return;
        }

        const prod: ProductData = {
          id: data.id,
          images: data.images || [],
          name: data.name || "",
          category_id: data.category || "",
          priceIn: data.priceIn || 0,
          description: data.description || "",
          variants: Array.isArray(data.variants) ? data.variants : [],
          isOnSale: data.isOnSale,
          discount: data.discount,
        };

        setProduct(prod);

        const previews = prod.images.map(src => `${BASE_URL}${src}`);
        setImagePreviews([...previews, ...Array(6 - previews.length).fill("")]);
      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, onClose]);

  // Validate all fields
  const validateAll = useCallback(() => {
    if (!product) return false;
    const newErrors: typeof fieldErrors = {};

    // Validate images
    const hasImage = imagePreviews.some((src, i) => src || imageSlots[i]);
    if (!hasImage) {
      newErrors.images = "Vui lòng chọn ít nhất 1 hình ảnh.";
    } else {
      for (let i = 0; i < imageSlots.length; i++) {
        const file = imageSlots[i];
        if (file) {
          if (!file.type.startsWith("image/")) {
            newErrors.images = "Chỉ chấp nhận file ảnh.";
            break;
          }
          if (file.size > MAX_IMAGE_SIZE) {
            newErrors.images = "Mỗi ảnh phải nhỏ hơn 5MB.";
            break;
          }
        }
      }
    }

    // Validate name
    if (!product.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống.";
    } else if (product.name.length < 15) {
      newErrors.name = "Tên sản phẩm phải từ 15 ký tự.";
    }

    // Validate description
    if (!product.description.trim()) {
      newErrors.description = "Mô tả không được để trống.";
    } else if (product.description.length < 10) {
      newErrors.description = "Mô tả phải từ 10 ký tự.";
    }

    // Validate priceIn
    if (product.priceIn === undefined || product.priceIn === null) {
      newErrors.priceIn = "Giá nhập không được để trống.";
    } else if (isNaN(Number(product.priceIn)) || Number(product.priceIn) < 0) {
      newErrors.priceIn = "Giá nhập phải là số dương.";
    }

    // Validate variants
    if (!product.variants.length) {
      newErrors.variants = "Vui lòng thêm ít nhất 1 phân loại.";
    } else {
      const priceInNumber = Number(product.priceIn);
      for (const v of product.variants) {
        if (!v.size || !v.color) {
          newErrors.variants = "Mỗi phân loại phải có size và màu.";
          break;
        }
        if (v.quantity < 0 || isNaN(Number(v.quantity))) {
          newErrors.variants = "Số lượng phải là số >= 0.";
          break;
        }
        if (v.price < 0 || isNaN(Number(v.price))) {
          newErrors.variants = "Giá phải là số >= 0.";
          break;
        }
        if (!isNaN(priceInNumber) && v.price < priceInNumber) {
          newErrors.variants = "Giá bán của mỗi phân loại không được nhỏ hơn giá nhập!";
          break;
        }
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [product, imagePreviews, imageSlots]);

  // Handlers
  const handleVariantsChange = useCallback((variants: Variant[]) => {
    setProduct(prev => (prev ? { ...prev, variants } : prev));
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof ProductData, value: any) => {
      setProduct(prev => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const handleFileChange = useCallback(
    (index: number, file: File) => {
      setImageSlots(p => {
        const next = [...p];
        next[index] = file;
        return next;
      });
      setChangedIndexes(p => (p.includes(index) ? p : [...p, index]));
      setImagePreviews(p => {
        const next = [...p];
        next[index] = URL.createObjectURL(file);
        return next;
      });
    },
    [],
  );

  // Submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!validateAll()) {
      setAttemptSubmit(true);
      return;
    }

    setSubmitting(true); setError(null);

    try {
      const token = localStorage.getItem("tkn");
      const fd = new FormData();

      fd.append("name", product.name);
      fd.append("category_id", product.category_id);
      fd.append("priceIn", String(product.priceIn));
      fd.append("description", product.description);
      fd.append("variants", JSON.stringify(product.variants));

      const sorted = [...changedIndexes].sort((a, b) => a - b);
      sorted.forEach(idx => fd.append("imageIndex", String(idx)));
      sorted.forEach(idx => {
        const file = imageSlots[idx];
        if (file) fd.append("images", file, file.name);
      });

      const res = await fetch(`${PUT_EDIT_PRODUCT}/${productId}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const ct = res.headers.get("content-type") || "";
      const body = ct.includes("application/json") ? await res.json()
        : { message: await res.text() };

      if (!res.ok) throw new Error(body.message || `Status ${res.status}`);

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    } finally {
      setSubmitting(false);
    }
  }, [product, imageSlots, changedIndexes, productId, onClose, validateAll]);

  // UI
  if (loading) return <div>Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm.</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg overflow-auto w-[80%] max-h-[90%]">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-red-500">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h1 className="text-2xl font-bold mb-4">
          Sửa sản phẩm: {product.name}
        </h1>

        {error && (
          <div className="mb-4 text-red-600">
            Lỗi: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ---------- images ---------- */}
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <label className="block font-medium">Hình ảnh (tối đa 6)</label>
              {fieldErrors.images && <Tooltip message={fieldErrors.images} />}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="w-full aspect-[16/10] border border-dashed rounded flex items-center justify-center bg-gray-100 cursor-pointer"
                  onClick={() => document.getElementById(`fileInput-${idx}`)?.click()}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      className="object-contain w-full h-full rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xl">+</span>
                  )}
                  <input
                    id={`fileInput-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e =>
                      e.target.files?.[0] && handleFileChange(idx, e.target.files[0])
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ---------- category ---------- */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Phân loại</label>
            <select
              value={product.category_id}
              onChange={e => handleFieldChange("category_id", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Không phân loại</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ---------- basic ---------- */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center mb-1">
                <label className="block font-medium">Tên sản phẩm</label>
                {fieldErrors.name && <Tooltip message={fieldErrors.name} />}
              </div>
              <input
                type="text"
                value={product.name}
                onChange={e => handleFieldChange("name", e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="block font-medium">
                  Giá nhập (vnđ)
                </label>
                {fieldErrors.priceIn && <Tooltip message={fieldErrors.priceIn} />}
              </div>
              <input
                type="number"
                value={product.priceIn}
                onChange={e =>
                  handleFieldChange("priceIn", Number(e.target.value))
                }
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* ---------- description ---------- */}
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <label className="block font-medium">Mô tả</label>
              {fieldErrors.description && <Tooltip message={fieldErrors.description} />}
            </div>
            <textarea
              value={product.description}
              onChange={e => handleFieldChange("description", e.target.value)}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>

          {/* ---------- variants ---------- */}
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <label className="block font-medium">Phân loại sản phẩm</label>
              {fieldErrors.variants && <Tooltip message={fieldErrors.variants} />}
            </div>
            <VariantEdit
              initialVariants={product.variants}
              onVariantsChange={handleVariantsChange}
              priceIn={product.priceIn}
              showAllErrors={attemptSubmit}
            />
          </div>

          {/* ---------- actions ---------- */}
          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#ff8000] text-white rounded disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;