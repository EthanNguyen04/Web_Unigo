"use client";
import React, { useState, useEffect,useRef } from "react";
import VariantBuilder, { Variant } from "./form/variantAdd";
import { API_ADD_PRODUCT, API_Get_CATEGORY } from "../../config";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

// Tooltip component
const Tooltip: React.FC<{ message: string }> = ({ message }) => (
  <span className="relative group ml-2 cursor-pointer align-middle">
    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 animate-pulse" />
    <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-max min-w-[120px] bg-red-500 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-pre-line">
      {message}
    </span>
  </span>
);

interface AddProductProps {
  onClose: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const AddProduct: React.FC<AddProductProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceIn, setPriceIn] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageSlots, setImageSlots] = useState<(File | null)[]>(Array(6).fill(null));
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(Array(6).fill(null));
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  // Error states
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    priceIn?: string;
    images?: string;
    variants?: string;
  }>({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(API_Get_CATEGORY);
        if (!res.ok) throw new Error("Lỗi tải danh mục");
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const newUrls = imageSlots.map((file) =>
      file ? URL.createObjectURL(file) : null
    );
    previewUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    setPreviewUrls(newUrls);
    return () => {
      newUrls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [imageSlots]);

  const handleFileChange = (index: number, file: File) => {
    setImageSlots((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
  };
  // Hàm chèn emoji vào vị trí con trỏ

  const handleSelectEmoji = (emoji: any) => {
    if (!descRef.current) return;
    const textarea = descRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      description.substring(0, start) +
      emoji.native +
      description.substring(end);
    setDescription(newValue);
    setShowEmoji(false);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.native.length;
    }, 0);
  };
  // Validate all fields
  const validateAll = () => {
    const newErrors: typeof errors = {};

    // Validate images
    const hasImage = imageSlots.some((file) => file !== null);
    if (!hasImage) {
      newErrors.images = "Vui lòng chọn ít nhất 1 hình ảnh.";
    } else {
      for (const file of imageSlots) {
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
    if (!name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống.";
    } else if (name.length < 15) {
      newErrors.name = "Tên sản phẩm phải từ 15 ký tự.";
    }

    // Không validate categoryId

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Mô tả không được để trống.";
    } else if (description.length < 10) {
      newErrors.description = "Mô tả phải từ 10 ký tự.";
    }

    // Validate price
    if (!priceIn.trim()) {
      newErrors.priceIn = "Giá nhập không được để trống.";
    } else if (isNaN(Number(priceIn)) || Number(priceIn) < 0) {
      newErrors.priceIn = "Giá nhập phải là số dương.";
    }

    // Validate variants
    if (!variants.length) {
      newErrors.variants = "Vui lòng thêm ít nhất 1 phân loại.";
    } else {
      const priceInNumber = Number(priceIn);
      for (const v of variants) {
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
        // Validate giá variant >= giá nhập
        if (!isNaN(priceInNumber) && v.price < priceInNumber) {
          newErrors.variants = "Giá bán của mỗi phân loại không được nhỏ hơn giá nhập!";
          break;
        }
      }
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    if (!validateAll()) {
      setMessage("Vui lòng kiểm tra lại các trường bị lỗi.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("tkn");
      if (!token) {
        setMessage("Không tìm thấy token! Vui lòng đăng nhập lại!");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category_id", categoryId);
      formData.append("description", description);
      formData.append("priceIn", priceIn);
      formData.append("variants", JSON.stringify(variants));

      imageSlots.forEach((file) => {
        if (file) formData.append("images", file);
      });

      const res = await fetch(API_ADD_PRODUCT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Có lỗi xảy ra khi thêm sản phẩm");
      } else {
        setMessage("Thêm sản phẩm thành công!");
        setTimeout(onClose, 1200);
      }
    } catch (error: any) {
      setMessage("Lỗi: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg overflow-auto w-[80%] max-h-[90%]">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-red-500">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h1 className="text-3xl font-bold mb-8 text-orange-600 tracking-wide text-center">
          Thêm sản phẩm mới
        </h1>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-8"
        >
          {/* Hình ảnh */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Hình ảnh sản phẩm</label>
              {errors.images && <Tooltip message={errors.images} />}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {imageSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`aspect-[16/10] border-2 border-dashed rounded flex items-center justify-center cursor-pointer relative bg-gray-100 hover:bg-orange-50 transition ${errors.images ? "border-red-400" : "border-gray-200"}`}
                  onClick={() =>
                    document.getElementById(`fileInput-${index}`)?.click()
                  }
                >
                  {slot && !!previewUrls[index] ? (
                    <img
                      src={previewUrls[index] as string}
                      alt={`Ảnh ${index + 1}`}
                      className="object-contain w-full h-full rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xl">+</span>
                  )}
                  <input
                    type="file"
                    id={`fileInput-${index}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(index, e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tên sản phẩm */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Tên sản phẩm</label>
              {errors.name && <Tooltip message={errors.name} />}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nhập tên sản phẩm"
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 shadow transition ${
                errors.name
                  ? "border-red-400 focus:ring-red-200"
                  : "border-orange-200 focus:ring-orange-300"
              }`}
            />
          </div>

          {/* Danh mục */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Danh mục</label>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 shadow transition border-orange-200 focus:ring-orange-300"
            >
              <option value="">Chọn danh mục (nếu có)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Mô tả sản phẩm</label>
              <button
                type="button"
                className="ml-2 text-xl"
                onClick={() => setShowEmoji((v) => !v)}
                title="Chèn emoji"
              >
                😊
              </button>
              {errors.description && <Tooltip message={errors.description} />}
            </div>
            <div className="relative">
              <textarea
                ref={descRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="✍️ Nhập mô tả chi tiết sản phẩm (có thể dùng emoji 😊)"
                className={`w-full rounded-lg border px-4 py-3 resize-y focus:outline-none focus:ring-2 shadow transition ${
                  errors.description
                    ? "border-red-400 focus:ring-red-200"
                    : "border-orange-200 focus:ring-orange-300"
                }`}
              />
              {showEmoji && (
                <div className="absolute z-50 top-full left-0 mt-2">
                  <Picker
                    data={data}
                    onEmojiSelect={handleSelectEmoji}
                    theme="light"
                    previewPosition="none"
                    locale="vi"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Giá nhập */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Giá nhập (VNĐ)</label>
              {errors.priceIn && <Tooltip message={errors.priceIn} />}
            </div>
            <input
              type="number"
              min={1000}
              step={1000}
              value={priceIn}
              onChange={(e) => setPriceIn(e.target.value)}
              placeholder="Nhập giá nhập"
              required
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 shadow transition ${
                errors.priceIn
                  ? "border-red-400 focus:ring-red-200"
                  : "border-orange-200 focus:ring-orange-300"
              }`}
            />
          </div>

          {/* Variant */}
          <div>
            <div className="flex items-center mb-2">
              <label className="font-semibold text-base">Phân loại sản phẩm</label>
              {errors.variants && <Tooltip message={errors.variants} />}
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 shadow-inner">
              <VariantBuilder onVariantsChange={setVariants} />
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded text-center ${
                message.includes("thành công")
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              } shadow-sm font-semibold`}
            >
              {message}
            </div>
          )}
          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white text-xl font-bold rounded-xl shadow-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Đang thêm sản phẩm...
              </span>
            ) : "Thêm sản phẩm mới"}
          </button>
        </form>
      </div>
    </div>

  );
};

export default AddProduct;