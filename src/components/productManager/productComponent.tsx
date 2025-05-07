"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardDocumentIcon,
  XMarkIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import AddProduct from "../dialog/addProduct";
import EditProduct from "../dialog/editProduct";
import { API_PRODUCT_MANAGER } from "../../config";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  totalQuantity: number;
  status: string;
  discount: number;
}

interface APIResponse {
  message: string;
  data: Product[];
}

const POPOVER_WIDTH = 150;  // chiều rộng popup

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // lưu tọa độ button và product cho popover
  const [statusMenu, setStatusMenu] = useState<{
    visible: boolean;
    rect: DOMRect | null;
    product: Product | null;
  }>({ visible: false, rect: null, product: null });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_PRODUCT_MANAGER);
      const json: APIResponse = await res.json();
      setProducts(json.data);
    } catch {
      console.error("Lỗi khi lấy danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const uniqueCategories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(p => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
        return true;
      }),
    [products, statusFilter, categoryFilter, searchQuery]
  );

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    alert("ID đã được sao chép");
  }, []);

  const openStatusMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setStatusMenu({ visible: true, rect, product });
    },
    []
  );

  const closeStatusMenu = useCallback(() => {
    setStatusMenu({ visible: false, rect: null, product: null });
  }, []);

  const updateStatus = useCallback(
    async (newStatus: string) => {
      if (!statusMenu.product) return;
      try {
        await fetch(`${API_PRODUCT_MANAGER}/${statusMenu.product.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        await fetchProducts();
      } catch {
        console.error("Lỗi cập nhật trạng thái");
      } finally {
        closeStatusMenu();
      }
    },
    [statusMenu.product, fetchProducts, closeStatusMenu]
  );

  const handleOpenEdit = useCallback((id: string) => {
    setSelectedProductId(id);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setSelectedProductId(null);
    fetchProducts();
  }, [fetchProducts]);

  const formatPrice = (priceStr: string) => {
    const f = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
    if (priceStr.includes(" - ")) {
      const [low, high] = priceStr.split(" - ");
      return `${f.format(+low)} - ${f.format(+high)}`;
    }
    return f.format(+priceStr);
  };

  const mapStatus = (s: string) => {
    if (s === "dang_ban") return "Đang bán";
    if (s === "ngung_ban") return "Ngừng bán";
    return s;
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="relative p-4 border border-[#ff8000] rounded-lg" onClick={closeStatusMenu}>
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#ff8000]">Quản lý sản phẩm</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-[#ff8000] text-white px-4 py-2 rounded"
        >
          Thêm sản phẩm mới
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-[#ff8000]">Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="all">Tất cả</option>
            <option value="dang_ban">Đang bán</option>
            <option value="ngung_ban">Ngừng bán</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label className="font-semibold text-[#ff8000]">Phân loại:</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="all">Tất cả</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat || "Trống"}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border p-1 rounded w-64"
          />
        </div>
      </div>

      {/* Products Table */}
      <table className="min-w-full border-collapse divide-y divide-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Phân loại</th>
            <th className="border p-2">Khoảng giá</th>
            <th className="border p-2">Kho</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredProducts.map(p => {
            const shortId = p.id.slice(-5);
            const editDisabled = p.discount > 0;
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border p-2 flex items-center gap-1">
                  ...{shortId}
                  <button onClick={() => handleCopyId(p.id)}>
                    <ClipboardDocumentIcon className="h-4 w-4 text-[#ff8000]" />
                  </button>
                </td>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.category}</td>
                <td className="border p-2">
                  <div className="flex justify-between items-baseline w-full">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    {p.discount > 0 && (
                      <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                        Sale {p.discount}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="border p-2">{p.totalQuantity}</td>
                <td className="border p-2">{mapStatus(p.status)}</td>
                <td className="border p-2 flex items-center space-x-2">
                  <button
                    onClick={e => openStatusMenu(e, p)}
                    className="p-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-500 hover:text-blue-700 transition-colors" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(p.id)}
                    disabled={editDisabled}
                    className={`p-1 rounded transition-colors ${
                      editDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
                    }`}
                  >
                    <PencilIcon className="h-5 w-5 text-green-500 hover:text-green-700 transition-colors" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Popover fixed ngay bên trái button */}
      {statusMenu.visible && statusMenu.rect && statusMenu.product && (
        <div
          onClick={e => e.stopPropagation()}
          className="fixed bg-white border rounded shadow-lg p-2 z-50"
          style={{
            top: statusMenu.rect.top + window.scrollY,
            left: statusMenu.rect.left - POPOVER_WIDTH + window.scrollX,
            width: POPOVER_WIDTH,
          }}
        >
          <h3 className="font-semibold mb-2">Cập nhật trạng thái</h3>
          {statusMenu.product.status === "dang_ban" && (
            <button
              onClick={() => updateStatus("ngung_ban")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            >
              Ngừng bán
            </button>
          )}
          {statusMenu.product.status === "ngung_ban" && (
            <button
              onClick={() => updateStatus("dang_ban")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            >
              Bán lại
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedProductId && (
        <EditProduct productId={selectedProductId} onClose={handleCloseEdit} />
      )}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[95%] bg-white p-6 rounded-lg shadow-lg overflow-auto">
            <button
              onClick={() => setShowAddProduct(false)}
              className="absolute top-2 right-2 text-red-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <AddProduct
              onClose={() => {
                setShowAddProduct(false);
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
