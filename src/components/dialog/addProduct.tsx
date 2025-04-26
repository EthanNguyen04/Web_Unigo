"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VariantBuilder, { Variant } from "./form/variantAdd"; // Điều chỉnh đường dẫn nếu cần
import {BASE_URL, API_ADD_PRODUCT, API_Get_CATEGORY } from "../../config";

interface AddProductProps {
    onClose: () => void;
  }
  
const AddProduct: React.FC<AddProductProps> = ({ onClose })=> {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priceIn, setPriceIn] = useState(""); 
  const [variants, setVariants] = useState<Variant[]>([]);
  // Sử dụng state cho 6 slot ảnh, khởi tạo mảng 6 phần tử null
  const [imageSlots, setImageSlots] = useState<(File | null)[]>(Array(6).fill(null));
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh mục từ API (danh mục là tùy chọn, không validate bắt buộc)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_Get_CATEGORY);
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (index: number, file: File) => {
    const newSlots = [...imageSlots];
    newSlots[index] = file;
    setImageSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    // Chuyển variants thành JSON string
    const variantsJSON = JSON.stringify(variants);

    // Tạo đối tượng FormData để gửi dữ liệu kèm file upload
    const formData = new FormData();
    formData.append("name", name);
    // Danh mục là tùy chọn, nên nếu không chọn sẽ gửi giá trị rỗng
    formData.append("category_id", categoryId);
    formData.append("description", description);
    formData.append("priceIn", priceIn);                // <-- gửi giá nhập
    formData.append("variants", variantsJSON);

    // Thêm các file ảnh từ imageSlots (chỉ những file khác null)
    imageSlots.forEach((file) => {
      if (file) {
        formData.append("images", file);
      }
    });

    try {
      const token = localStorage.getItem("tkn");
      if (!token) {
        setMessage("Không tìm thấy token! Vui lòng đăng nhập lại!");
        setIsSubmitting(false);
        return;
      }
      const res = await fetch(API_ADD_PRODUCT, {
        method: "POST",
        headers: {
          // Không set Content-Type khi dùng FormData
          Authorization: "Bearer " + token,
        },
        body: formData,
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setMessage(data.message || "Có lỗi xảy ra khi thêm sản phẩm");
      } else {
        setMessage("Thêm sản phẩm thành công!");
        setTimeout(() => {
            onClose();
          }, 1000);
      }
    } catch (error: any) {
      setMessage("Lỗi: " + error.message);
      console.log(error.message)
    } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="p-4 border border-[#ff8000] rounded-lg overflow-auto max-h-[90vh]">
      <h1 className="text-2xl font-bold mb-4 text-[#ff8000]">Thêm sản phẩm mới</h1>
      {message && <div className="mb-4 text-red-500">{message}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        {/* Phần Hình ảnh */}
        <div>
          <label className="block font-semibold mb-2">Hình ảnh:</label>
          <div className="grid grid-cols-6 gap-2">
            {imageSlots.map((slot, index) => (
              <div
                key={index}
                className="w-full aspect-[16/10] border border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer relative bg-gray-200"
                onClick={() =>
                  document.getElementById(`fileInput-${index}`)?.click()
                }
              >
                {slot ? (
                  <img
                    src={URL.createObjectURL(slot)}
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

        <div>
          <label className="block font-semibold">Tên sản phẩm:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Danh mục:</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn danh mục (nếu có)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Mô tả:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-semibold">Giá nhập (VNĐ):</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={priceIn}
            onChange={(e) => setPriceIn(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Nhập giá nhập"
            required
          />
        </div>

        {/* Variant Builder */}
        <div>
          <label className="block font-semibold">Phân loại sản phẩm:</label>
          <VariantBuilder onVariantsChange={(data) => setVariants(data)} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#ff8000] text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Đang thêm sản phẩm..." : "Thêm sản phẩm mới"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
