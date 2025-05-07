"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import VariantEdit, { Variant } from "./form/variantEdit";
import {
  API_GET_Edit_PRODUCT,
  API_Get_CATEGORY,
  PUT_EDIT_PRODUCT,
  BASE_URL,
} from "../../config";

/* ---------- types ---------- */
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
  isOnSale: boolean;      // 👈 mới
  discount: number;       // (tuỳ cần hiển thị)
}


/* ---------- component ---------- */
const EditProduct: React.FC<EditProductProps> = ({ productId, onClose }) => {
  /* ---------- state ---------- */
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageSlots, setImageSlots] = useState<(File | null)[]>(Array(6).fill(null));
  const [imagePreviews, setImagePreviews] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptSubmit, setAttemptSubmit] = useState(false);

 /* ---------- thêm state để nhớ vị trí ảnh đổi ---------- */
 const [changedIndexes, setChangedIndexes] = useState<number[]>([]);


  /* ---------- derived ---------- */
  const isVariantsValid = useMemo(
    () => !!product && product.variants.every(v => v.price >= 1000 && v.quantity >= 0),
    [product],
  );

  /* ---------- load categories ---------- */
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

  /* ---------- load product ---------- */
  /* ---------- load product ---------- */
useEffect(() => {
  (async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_GET_Edit_PRODUCT}/${productId}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      /* ①  Nếu sản phẩm đang giảm giá → show dialog rồi thoát */
      if (data.isOnSale) {
        window.alert("Sản phẩm đang giảm giá, không thể chỉnh sửa!"); // dùng bất kỳ UI dialog nào bạn muốn
        onClose();                         // đóng ngay form
        return;
      }

      /* ②  Map dữ liệu như cũ */
      const prod: ProductData = {
        id          : data.id,
        images      : data.images || [],
        name        : data.name || "",
        category_id : data.category || "",
        priceIn     : data.priceIn || 0,
        description : data.description || "",
        variants    : Array.isArray(data.variants) ? data.variants : [],
        isOnSale    : data.isOnSale,
        discount    : data.discount,
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


  /* ---------- handlers ---------- */
  /** nhận variants mới từ VariantEdit */
  const handleVariantsChange = useCallback((variants: Variant[]) => {
    setProduct(prev => (prev ? { ...prev, variants } : prev));
  }, []);

  const handleFieldChange = useCallback(
    (field: keyof ProductData, value: any) => {
      setProduct(prev => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );


/* ---------- khi chọn ảnh ---------- */
const handleFileChange = useCallback(
  (index: number, file: File) => {
    setImageSlots(p => {
      const next = [...p];
      next[index] = file;
      return next;
    });

    /* đánh dấu vị trí vừa đổi */
    setChangedIndexes(p => (p.includes(index) ? p : [...p, index]));
    console.log("chae " + index)
    /* preview */
    setImagePreviews(p => {
      const next = [...p];
      next[index] = URL.createObjectURL(file);
      return next;
    });
  },
  [],
);


  /* ---------- submit ---------- */
/* ---------- submit ---------- */
/* ---------- submit ---------- */
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  if (!product) return;

  if (!isVariantsValid) { setAttemptSubmit(true); return; }

  setSubmitting(true); setError(null);

  try {
    const token = localStorage.getItem("tkn");
    const fd    = new FormData();

    // ----- field text / JSON -----
    fd.append("name",        product.name);
    fd.append("category_id", product.category_id);
    fd.append("priceIn",    String(product.priceIn));
    fd.append("description", product.description);
    fd.append("variants",    JSON.stringify(product.variants));

    // ----- images (index fields trước – files sau) -----
    const sorted = [...changedIndexes].sort((a, b) => a - b);

    /* ① index fields */
    sorted.forEach(idx => fd.append("imageIndex", String(idx)));

    /* ② files khớp thứ tự chỉ số */
    sorted.forEach(idx => {
      const file = imageSlots[idx];
      if (file) fd.append("images", file, file.name);
    });

    const res = await fetch(`${PUT_EDIT_PRODUCT}/${productId}`, {
      method : "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body   : fd,
    });

    const ct   = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json()
                                                 : { message: await res.text() };

    if (!res.ok) throw new Error(body.message || `Status ${res.status}`);

    onClose();          // ✅ thành công
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
  } finally {
    setSubmitting(false);
  }
}, [product, imageSlots, changedIndexes, isVariantsValid, productId, onClose]);



  /* ---------- UI ---------- */
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
            <label className="block font-medium mb-1">Hình ảnh (tối đa 6)</label>
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
              <label className="block font-medium mb-1">Tên sản phẩm</label>
              <input
                type="text"
                value={product.name}
                onChange={e => handleFieldChange("name", e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Giá nhập (vnđ)
              </label>
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
            <label className="block font-medium mb-1">Mô tả</label>
            <textarea
              value={product.description}
              onChange={e => handleFieldChange("description", e.target.value)}
              className="w-full border p-2 rounded"
              rows={4}
            />
          </div>

          {/* ---------- variants ---------- */}
          <VariantEdit
            initialVariants={product.variants}
            onVariantsChange={handleVariantsChange}
            showAllErrors={attemptSubmit}
          />

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
              disabled={submitting || !isVariantsValid}
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
