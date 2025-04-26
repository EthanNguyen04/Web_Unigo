"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  API_Get_CATEGORY,    // = `${BASE_URL}/manager/getCategories`
  Post_ADD_category,   // = `${BASE_URL}/manager/createCategory`
  Edit_category        // = `${BASE_URL}/manager/edit_category`
} from "../../config";

interface Category {
  _id: string;
  name: string;
  status: boolean;
}

interface ApiResponse {
  message: string;
  categories?: Category[];
  category?: Category;
}

const CategoryManagement: React.FC = () => {
  // dữ liệu gốc từ API
  const [categories, setCategories] = useState<Category[]>([]);
  // trạng thái UI
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // form thêm mới
  const [newName, setNewName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // bộ lọc
  const [filterStatus, setFilterStatus] = useState<"all"|"active"|"inactive">("all");
  const [filterText, setFilterText]     = useState<string>("");

  // 1. Lấy toàn bộ categories (đã sync status)
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_Get_CATEGORY, {
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      if (!Array.isArray(data.categories)) {
        throw new Error(data.message || "API không trả về categories");
      }
      setCategories(data.categories);
    } catch (e: any) {
      console.error("Lỗi khi tải phân loại:", e);
      setError(e.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Thêm mới category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    if (!newName.trim()) {
      setAddError("Tên phân loại không được để trống");
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(Post_ADD_category, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      setAddSuccess("Tạo phân loại thành công!");
      setNewName("");
      fetchCategories();
    } catch (e: any) {
      console.error("Lỗi khi thêm phân loại:", e);
      setAddError(e.message || "Lỗi không xác định");
    } finally {
      setAdding(false);
    }
  };

  // 3. Sửa category (chỉ khi status === false)
  const handleEdit = async (cat: Category) => {
    if (cat.status) return; // chỉ sửa khi đang không hoạt động
    const nameInput = window.prompt("Nhập tên mới cho phân loại:", cat.name);
    if (!nameInput?.trim() || nameInput.trim() === cat.name) return;

    try {
      const token = localStorage.getItem("tkn");
      const res = await fetch(`${Edit_category}/${cat._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: nameInput.trim() })
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`);
      alert("Cập nhật danh mục thành công!");
      fetchCategories();
    } catch (e: any) {
      console.error("Lỗi khi sửa phân loại:", e);
      alert(`Lỗi: ${e.message}`);
    }
  };

  // Apply filter trước khi render
  const filtered = categories.filter(cat => {
    if (filterStatus === "active" && !cat.status)   return false;
    if (filterStatus === "inactive" && cat.status)  return false;
    if (filterText && !cat.name.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div>Đang tải phân loại...</div>;
  if (error)   return <div className="text-red-600">Lỗi: {error}</div>;

  return (
    <div className="p-4 border border-[#ff8000] rounded-lg">
      <h1 className="text-2xl font-bold mb-2 text-[#ff8000]">
        Quản lý phân loại
      </h1>
      <p className="mb-4">Danh sách và chi tiết các phân loại sản phẩm.</p>

      {/* Form thêm mới */}
      <form onSubmit={handleAddCategory} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Tên phân loại mới"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border p-2 rounded flex-1"
          disabled={adding}
        />
        <button
          type="submit"
          className="bg-[#ff8000] text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={adding}
        >
          {adding ? "Đang thêm..." : "Thêm phân loại"}
        </button>
      </form>
      {addError   && <div className="text-red-600 mb-2">{addError}</div>}
      {addSuccess && <div className="text-green-600 mb-2">{addSuccess}</div>}

      {/* Bộ lọc */}
      <div className="mb-4 flex items-center gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="all">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="border p-2 rounded flex-1"
        />
      </div>

      {/* Bảng */}
      <table className="min-w-full border-collapse divide-y divide-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Tên phân loại</th>
            <th className="border p-2 text-left">Trạng thái</th>
            <th className="border p-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filtered.map(cat => (
            <tr key={cat._id} className="hover:bg-gray-50">
              <td className="border p-2">{cat._id}</td>
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2">
                {cat.status ? "Hoạt động" : "Không hoạt động"}
              </td>
              <td className="border p-2">
                {!cat.status && (
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;
