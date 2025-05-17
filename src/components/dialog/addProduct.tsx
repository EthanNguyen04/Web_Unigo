"use client";
import React, { useState, useEffect } from "react";
import VariantBuilder, { Variant } from "./form/variantAdd";
import { API_ADD_PRODUCT, API_Get_CATEGORY } from "../../config";

interface AddProductProps {
  onClose: () => void;
}

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-xl border border-orange-300 overflow-auto max-h-[90vh]">
      <h1 className="text-4xl font-extrabold mb-8 text-orange-600 tracking-wide drop-shadow-md">
        Thêm sản phẩm mới
      </h1>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded ${
            message.includes("thành công")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          } shadow-sm font-semibold`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-8"
      >
        {/* Hình ảnh */}
        <div>
          <label className="block text-lg font-semibold mb-3 text-orange-700">
            Hình ảnh sản phẩm (tối đa 6 ảnh):
          </label>
          <div className="grid grid-cols-6 gap-4">
            {imageSlots.map((slot, index) => (
              <div
                key={index}
                className="relative cursor-pointer w-full aspect-[16/10] rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-100 transition-shadow shadow-sm hover:shadow-lg flex items-center justify-center overflow-hidden"
                onClick={() => document.getElementById(`fileInput-${index}`)?.click()}
                title={`Chọn ảnh ${index + 1}`}
              >
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]!}
                    alt={`Ảnh ${index + 1}`}
                    className="object-cover w-full h-full rounded-lg"
                  />
                ) : (
                  <span className="text-orange-400 text-5xl font-bold select-none">+</span>
                )}
                <input
                  type="file"
                  id={`fileInput-${index}`}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
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
          <label className="block mb-2 text-lg font-semibold text-orange-700">
            Tên sản phẩm:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nhập tên sản phẩm"
            className="w-full rounded-lg border border-orange-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-md transition"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-orange-700">
            Danh mục:
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-orange-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-md transition"
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
          <label className="block mb-2 text-lg font-semibold text-orange-700">
            Mô tả:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            placeholder="Nhập mô tả chi tiết sản phẩm"
            className="w-full rounded-lg border border-orange-300 px-4 py-3 resize-y focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-md transition"
          />
        </div>

        {/* Giá nhập */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-orange-700">
            Giá nhập (VNĐ):
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={priceIn}
            onChange={(e) => setPriceIn(e.target.value)}
            placeholder="Nhập giá nhập"
            required
            className="w-full rounded-lg border border-orange-300 px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-md transition"
          />
        </div>

        {/* Variant */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-orange-700">
            Phân loại sản phẩm:
          </label>
          <VariantBuilder onVariantsChange={setVariants} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white text-xl font-bold rounded-xl shadow-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang thêm sản phẩm..." : "Thêm sản phẩm mới"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;