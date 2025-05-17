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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

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

const POPOVER_WIDTH = 150;

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [statusMenu, setStatusMenu] = useState({
    visible: false,
    rect: null as DOMRect | null,
    product: null as Product | null,
  });

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
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      }),
    [products, statusFilter, categoryFilter, searchQuery]
  );

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    alert("ID đã được sao chép");
  }, []);

  const openStatusMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setStatusMenu({ visible: true, rect, product });
  }, []);

  const closeStatusMenu = useCallback(() => {
    setStatusMenu({ visible: false, rect: null, product: null });
  }, []);

  const updateStatus = useCallback(async (newStatus: string) => {
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
  }, [statusMenu.product, fetchProducts, closeStatusMenu]);

  const handleOpenEdit = useCallback((id: string) => setSelectedProductId(id), []);
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

  const mapStatus = (s: string) => (s === "dang_ban" ? "Đang bán" : s === "ngung_ban" ? "Ngừng bán" : s);

  if (loading) return <div className="text-center py-10 text-[#ff8000] font-semibold">Đang tải dữ liệu...</div>;

  const exportToExcel = () => {
    if (products.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const data = products.map((p) => ({
      ID: p.id,
      Tên: p.name,
      Phân_loại: p.category,
      Giá: p.price,
      Kho: p.totalQuantity,
      Trạng_thái: p.status === "dang_ban" ? "Đang bán" : "Ngừng bán",
      Giảm_giá: p.discount > 0 ? `${p.discount}%` : "Không",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
    XLSX.writeFile(workbook, "san_pham.xlsx");
  };

  const exportToPDF = () => {
    if (products.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Danh sách sản phẩm", 14, 22);

    const tableColumn = ["ID", "Tên", "Phân loại", "Giá", "Kho", "Trạng thái", "Giảm giá"];
    const tableRows: (string | number)[][] = [];

    products.forEach((p) => {
      const rowData = [
        p.id,
        p.name,
        p.category,
        p.price,
        p.totalQuantity,
        p.status === "dang_ban" ? "Đang bán" : "Ngừng bán",
        p.discount > 0 ? `${p.discount}%` : "Không",
      ];
      tableRows.push(rowData);
    });

    // @ts-ignore
    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 136, 0] },
    });

    doc.save("san_pham.pdf");
  };

  return (
    <div className="relative p-6 border border-[#ff8000] bg-white rounded-xl shadow" onClick={closeStatusMenu}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-[#ff8000]">📦 Quản lý sản phẩm</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center gap-1"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Xuất Excel
          </button>

          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 flex items-center gap-1"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Xuất PDF
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-[#ff8000] text-white px-5 py-2 rounded-lg shadow hover:bg-[#e67300]"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#ff8000]">Trạng thái:</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-2 rounded-md">
            <option value="all">Tất cả</option>
            <option value="dang_ban">Đang bán</option>
            <option value="ngung_ban">Ngừng bán</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#ff8000]">Phân loại:</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border p-2 rounded-md">
            <option value="all">Tất cả</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat || "Trống"}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border p-2 rounded-md w-full md:w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Phân loại</th>
              <th className="p-3">Khoảng giá</th>
              <th className="p-3">Kho</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map(p => {
              const shortId = p.id.slice(-5);
              const editDisabled = p.discount > 0;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-1">
                    ...{shortId}
                    <button onClick={() => handleCopyId(p.id)}>
                      <ClipboardDocumentIcon className="h-4 w-4 text-[#ff8000]" />
                    </button>
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 flex justify-between items-center">
                    <span>{formatPrice(p.price)}</span>
                    {p.discount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">Sale {p.discount}%</span>
                    )}
                  </td>
                  <td className="p-3">{p.totalQuantity}</td>
                  <td className="p-3">{mapStatus(p.status)}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={e => openStatusMenu(e, p)} className="p-1 hover:bg-blue-100 rounded">
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p.id)}
                      disabled={editDisabled}
                      className={`p-1 rounded ${editDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"}`}
                    >
                      <PencilIcon className="h-5 w-5 text-green-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusMenu.visible && statusMenu.rect && statusMenu.product && (
        <div
          onClick={e => e.stopPropagation()}
          className="fixed bg-white border rounded shadow-lg p-3 z-50"
          style={{
            top: statusMenu.rect.top + window.scrollY,
            left: statusMenu.rect.left - POPOVER_WIDTH + window.scrollX,
            width: POPOVER_WIDTH,
          }}
        >
          <h3 className="font-semibold mb-2">Cập nhật trạng thái</h3>
          {statusMenu.product.status === "dang_ban" && (
            <button onClick={() => updateStatus("ngung_ban")} className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
              Ngừng bán
            </button>
          )}
          {statusMenu.product.status === "ngung_ban" && (
            <button onClick={() => updateStatus("dang_ban")} className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
              Bán lại
            </button>
          )}
        </div>
      )}

      {selectedProductId && <EditProduct productId={selectedProductId} onClose={handleCloseEdit} />}

      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[95%] bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-auto">
            <button onClick={() => setShowAddProduct(false)} className="absolute top-2 right-2 text-red-500">
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