"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardDocumentIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import AddProduct from "../dialog/addProduct";
import EditProduct from "../dialog/editProduct";
import ProductInfo from "../dialog/productInfo";
import { API_PRODUCT_MANAGER , patch_discount} from "../../config";
import * as XLSX from "xlsx";

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
  const [infoProductId, setInfoProductId] = useState<string | null>(null);

  const [discountMenu, setDiscountMenu] = useState({
    visible: false,
    rect: null as DOMRect | null,
    product: null as Product | null,
    value: "",
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
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return p.name.toLowerCase().includes(searchLower) || p.id.toLowerCase().includes(searchLower);
        }
        return true;
      }),
    [products, statusFilter, categoryFilter, searchQuery]
  );

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    alert("ID đã được sao chép");
  }, []);

  const openDiscountMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDiscountMenu({ visible: true, rect, product, value: product.discount.toString() });
  }, []);

  const closeDiscountMenu = useCallback(() => {
    setDiscountMenu({ visible: false, rect: null, product: null, value: "" });
  }, []);

  const updateDiscount = useCallback(async () => {
    if (!discountMenu.product) return;
    try {
      const discountValue = parseInt(discountMenu.value);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        alert("Giá trị giảm giá phải từ 0 đến 100");
        return;
      }

      const token = localStorage.getItem('tkn');
      if (!token) {
        alert("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      if (!patch_discount) {
        throw new Error("URL API không hợp lệ");
      }

      const url = `${patch_discount}${discountMenu.product.id}`;
      console.log('Đang gửi request đến:', url);
      console.log('Dữ liệu gửi đi:', { discount: discountValue });

      const response = await fetch(url, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ discount: discountValue }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response không phải JSON:", await response.text());
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error("Lỗi parse JSON:", error);
        throw new Error("Không thể đọc dữ liệu từ server");
      }

      console.log('Mã trạng thái:', response.status);
      console.log('Dữ liệu phản hồi:', responseData);

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(responseData.message || "Dữ liệu không hợp lệ");
          case 401:
            throw new Error(responseData.message || "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
          case 403:
            throw new Error(responseData.message || "Bạn không có quyền thực hiện thao tác này");
          case 404:
            throw new Error(responseData.message || "Không tìm thấy sản phẩm");
          case 500:
            throw new Error(responseData.message || "Lỗi máy chủ, vui lòng thử lại sau");
          default:
            throw new Error(responseData.message || `Lỗi không xác định: ${response.status}`);
        }
      }

      if (responseData.success) {
        await fetchProducts();
        alert(responseData.message || "Cập nhật giảm giá thành công");
      } else {
        throw new Error(responseData.message || "Cập nhật giảm giá thất bại");
      }
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Có lỗi xảy ra khi cập nhật giảm giá");
      }
    } finally {
      closeDiscountMenu();
    }
  }, [discountMenu.product, discountMenu.value, fetchProducts, closeDiscountMenu]);

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

  const mapStatus = (s: string) =>
    s === "dang_ban"
      ? "Đang bán"
      
      : s === "het_hang"
      ? "Hết hàng"
      : s;

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
      Trạng_thái: mapStatus(p.status),
      Giảm_giá: p.discount > 0 ? `${p.discount}%` : "Không",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
    XLSX.writeFile(workbook, "san_pham.xlsx");
  };

  return (
    <div className="relative p-6 border border-[#ff8000] bg-white rounded-xl shadow" onClick={closeDiscountMenu}>
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
            <option value="het_hang">Hết hàng</option>
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
              <th className="p-3">Thông tin</th>
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
            {filteredProducts.map((p, idx) => {
              const shortId = p.id.slice(-5);
              const editDisabled = p.discount > 0;
              const isOutOfStock = p.status === "het_hang";
              const rowClass = isOutOfStock
                ? "bg-yellow-100 font-bold text-red-600 animate-pulse"
                : idx % 2 === 1
                ? "bg-gray-200"
                : "";

              return (
                <tr key={p.id} className={rowClass + " hover:bg-gray-100"}>
                  <td className="p-3">
                    <button
                      onClick={() => setInfoProductId(p.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <InformationCircleIcon className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      ...{shortId}
                      <button onClick={() => handleCopyId(p.id)}>
                        <ClipboardDocumentIcon className="h-4 w-4 text-[#ff8000]" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-1">
                      {p.name}
                      {isOutOfStock && (
                        <span title="Hết hàng" className="ml-1">
                          <svg className="inline h-5 w-5 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{formatPrice(p.price)}</span>
                      {p.discount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">Sale {p.discount}%</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{p.totalQuantity}</td>
                  <td className="p-3">{mapStatus(p.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={e => openDiscountMenu(e, p)} className="p-1 hover:bg-orange-100 rounded">
                        <TagIcon className="h-5 w-5 text-orange-500" />
                      </button>
                      {!p.discount && (
                        <button
                          onClick={() => handleOpenEdit(p.id)}
                          className="p-1 hover:bg-green-100 rounded"
                        >
                          <PencilIcon className="h-5 w-5 text-green-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {discountMenu.visible && discountMenu.rect && discountMenu.product && (
        <div
          onClick={e => e.stopPropagation()}
          className="fixed bg-white border-2 border-[#ff8000] rounded-lg shadow-xl p-4 z-50"
          style={{
            top: discountMenu.rect.top + window.scrollY,
            left: discountMenu.rect.left - POPOVER_WIDTH + window.scrollX,
            width: POPOVER_WIDTH,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#ff8000] text-lg">Cập nhật giảm giá</h3>
            <button 
              onClick={closeDiscountMenu}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={discountMenu.value}
                onChange={(e) => setDiscountMenu(prev => ({ ...prev, value: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-[#ff8000] focus:outline-none transition-colors"
                placeholder="Nhập % giảm giá"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDiscountMenu(prev => ({ ...prev, value: "0" }))}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={updateDiscount}
                className="flex-1 bg-[#ff8000] text-white px-3 py-2 rounded-lg hover:bg-[#e67300] transition-colors font-medium"
              >
                Cập nhật
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Giá trị từ 0 đến 100%
            </div>
          </div>
        </div>
      )}

      {selectedProductId && <EditProduct productId={selectedProductId} onClose={handleCloseEdit} />}

      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <AddProduct
            onClose={() => {
              setShowAddProduct(false);
              fetchProducts();
            }}
          />
        </div>
      )}

      {infoProductId && (
        <ProductInfo
          productId={infoProductId}
          onClose={() => setInfoProductId(null)}
          category={products.find(p => p.id === infoProductId)?.category || ''}
        />
      )}
    </div>
  );
};

export default ProductManagement;