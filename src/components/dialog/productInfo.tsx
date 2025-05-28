"use client";
import React, { useState, useEffect } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Get_product, BASE_URL,Get_evaluate_product } from "../../config";

interface ProductInfoProps {
  productId: string;
  onClose: () => void;
  category: string;
}

interface ProductDetail {
  id: string;
  images: string[];
  name: string;
  discount: number;
  stock: number;
  sold: number;
  description: string;
  variants: {
    price: number;
    quantity: number;
    size: string;
    color: string;
  }[];
  averageStar: number;
  totalReviews: number;
}

interface Evaluate {
  user: {
    name: string;
    avatar: string;
  };
  product_variant: string;
  star: number;
  content: string;
  createdAt: string;
}

interface EvaluateResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    evaluates: Evaluate[];
  };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ productId, onClose, category }) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [evaluates, setEvaluates] = useState<Evaluate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, evaluateRes] = await Promise.all([
          fetch(`${Get_product}${productId}`),
          fetch(`${Get_evaluate_product}${productId}`)
        ]);

        if (!productRes.ok) throw new Error('Không thể lấy thông tin sản phẩm');
        if (!evaluateRes.ok) throw new Error('Không thể lấy đánh giá sản phẩm');

        const productData = await productRes.json();
        const evaluateData: EvaluateResponse = await evaluateRes.json();

        setProduct(productData);
        setEvaluates(evaluateData.data.evaluates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-[#ff8000] font-semibold">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-500">{error || 'Không tìm thấy thông tin sản phẩm'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#ff8000] text-white rounded-lg hover:bg-[#e67300]"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-[#ff8000]">Thông tin chi tiết sản phẩm</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images.length > 0 && (
                  <>
                    <img
                      src={`${BASE_URL}${product.images[currentImageIndex]}`}
                      alt={`${product.name} - ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        >
                          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                        >
                          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-[#ff8000]' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Tên sản phẩm:</span>
                    <span className="text-gray-800">{product.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Phân loại:</span>
                    <span className="text-gray-800">{category}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Giảm giá:</span>
                    <span className="text-red-500">{product.discount}%</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Tồn kho:</span>
                    <span className="text-gray-800">{product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Đã bán:</span>
                    <span className="text-gray-800">{product.sold}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-600 min-w-[100px]">Đánh giá:</span>
                    <span className="text-gray-800">
                      {product.averageStar} ⭐ ({product.totalReviews} đánh giá)
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                <p className="text-sm text-gray-700">{product.description}</p>
              </div>

              {/* Variants */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Biến thể sản phẩm</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border text-left">Màu sắc</th>
                        <th className="px-3 py-2 border text-left">Kích thước</th>
                        <th className="px-3 py-2 border text-right">Giá</th>
                        <th className="px-3 py-2 border text-right">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-3 py-2 border">{variant.color}</td>
                          <td className="px-3 py-2 border">{variant.size}</td>
                          <td className="px-3 py-2 border text-right">{formatPrice(variant.price)}</td>
                          <td className="px-3 py-2 border text-right">{variant.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
            <div className="space-y-4">
              {evaluates.map((evaluate, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {evaluate.user.avatar ? (
                      <img
                        src={`${BASE_URL}${evaluate.user.avatar}`}
                        alt={evaluate.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="8" r="4"/>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            </svg>
                          `)}`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="4"/>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{evaluate.user.name}</p>
                          <p className="text-sm text-gray-500">{evaluate.product_variant}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">{"⭐".repeat(evaluate.star)}</span>
                          <span className="text-sm text-gray-500">{evaluate.createdAt}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{evaluate.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo; 