"use client";
import React, { useEffect, useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import AddProduct from "../dialog/addProduct"; // Điều chỉnh đường dẫn nếu cần
import { XMarkIcon } from "@heroicons/react/24/outline";
import { API_PRODUCT_MANAGER } from "../../config";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  totalQuantity: number;
  status: string;
}

interface APIResponse {
  message: string;
  data: Product[];
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Hàm định dạng giá sang VND
  const formatPrice = (priceStr: string) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    if (priceStr.includes(" - ")) {
      const parts = priceStr.split(" - ");
      const num1 = Number(parts[0]);
      const num2 = Number(parts[1]);
      return `${formatter.format(num1)} - ${formatter.format(num2)}`;
    } else {
      const num = Number(priceStr);
      return formatter.format(num);
    }
  };

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const mapStatus = (status: string) => {
    switch (status) {
      case "dang_ban":
        return "Đang bán";
      case "het_hang":
        return "Hết hàng";
      case "ngung_ban":
        return "Ngừng bán";
      default:
        return status;
    }
  };

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_PRODUCT_MANAGER);
        const data: APIResponse = await response.json();
        setProducts(data.data);
        // Tính danh sách danh mục duy nhất từ các sản phẩm
        const categories = Array.from(
          new Set(data.data.map((prod: Product) => prod.category))
        ) as string[];
        setUniqueCategories(categories);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo trạng thái, danh mục và tìm kiếm
  useEffect(() => {
    let filtered = products;
    if (statusFilter !== "all") {
      filtered = filtered.filter((prod) => prod.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((prod) => prod.category === categoryFilter);
    }
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((prod) =>
        prod.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [products, statusFilter, categoryFilter, searchQuery]);

  // Hàm copy ID vào clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("ID đã được sao chép");
  };

  // Hàm xử lý sửa trạng thái sản phẩm
  const handleEditStatus = (id: string) => {
    alert(`Sửa trạng thái sản phẩm có ID: ${id}`);
  };

  // Hàm xử lý sửa thông tin sản phẩm
  const handleEditProduct = (id: string) => {
    alert(`Sửa thông tin sản phẩm có ID: ${id}`);
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-4 border border-[#ff8000] rounded-lg relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#ff8000]">Quản lý sản phẩm</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-[#ff8000] text-white px-4 py-2 rounded"
        >
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Bộ lọc và thanh tìm kiếm */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-[#ff8000]">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="all">Tất cả</option>
              <option value="dang_ban">Đang bán</option>
              <option value="het_hang">Hết hàng</option>
              <option value="ngung_ban">Ngừng bán</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-[#ff8000]">Phân loại:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="all">Tất cả</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "Không xác định" ? "Trống" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-1 rounded w-64"
          />
          <button className="bg-[#ff8000] text-white px-3 py-1 rounded">
            Lọc
          </button>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <table className="min-w-full border-collapse divide-y divide-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Phân loại</th>
            <th className="border p-2">Khoảng giá</th>
            <th className="border p-2">Kho</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Sửa trạng thái</th>
            <th className="border p-2">Sửa sản phẩm</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredProducts.map((product) => {
            // Lấy 5 ký tự cuối của ID nếu dài hơn 5 ký tự
            const shortId = product.id.length > 5 ? product.id.slice(-5) : product.id;
            return (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="border p-2 flex items-center space-x-1">
                  <span>...{shortId}</span>
                  <button onClick={() => handleCopyId(product.id)} title="Sao chép ID">
                    <ClipboardDocumentIcon className="h-4 w-4 text-[#ff8000]" />
                  </button>
                </td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">
                  {product.category === "Không xác định" ? "" : product.category}
                </td>
                <td className="border p-2">{formatPrice(product.price)}</td>
                <td className="border p-2">{product.totalQuantity}</td>
                <td className="border p-2">{mapStatus(product.status)}</td>
                <td className="border p-2">
                  <button
                    className="bg-blue-500 text-white p-1 rounded"
                    onClick={() => handleEditStatus(product.id)}
                  >
                    Sửa trạng thái
                  </button>
                </td>
                <td className="border p-2">
                  <button
                    className="bg-green-500 text-white p-1 rounded"
                    onClick={() => handleEditProduct(product.id)}
                  >
                    Sửa sản phẩm
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Dialog thêm sản phẩm mới */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
          <div className="relative w-[95%] bg-white p-6 rounded-lg shadow-lg overflow-auto">
          <button
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn đóng?")) {
                setShowAddProduct(false);
              }
            }}
            className="absolute top-2 right-2 text-red-500 cursor-pointer transition-colors duration-200 hover:bg-red-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
              <AddProduct />
            </div>
          </div>
        )}


    </div>
  );
};

export default ProductManagement;
