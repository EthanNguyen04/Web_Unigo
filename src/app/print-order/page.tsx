"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Barcode from 'react-barcode';

interface Variant {
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface Product {
  firstImage: string;
  name: string;
  variants: Variant[];
  price: number;
}

interface Order {
  orderId: string;
  user_id: string;
  shipping_address: {
    address: string;
    phone: string;
  };
  order_status: string;
  payment_status: string;
  products: Product[];
  rawTotal: number;
  purchaseTotal: number;
  createdAt: string;
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
};

const PrintOrder = () => {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const orderData = searchParams.get('data');
    if (orderData) {
      try {
        const decodedOrders = JSON.parse(decodeURIComponent(orderData));
        // Đảm bảo orders luôn là một mảng
        setOrders(Array.isArray(decodedOrders) ? decodedOrders : [decodedOrders]);
        // Tự động in sau khi tải trang
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, [searchParams]);

  if (orders.length === 0) {
    return <div className="text-center py-10">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="print-content">
      <style jsx global>{`
        @media print {
          @page {
            size: 74mm 105mm;
            margin: 0;
          }
          body {
            width: 74mm;
            margin: 0;
            padding: 10px;
          }
          .no-print {
            display: none;
          }
          .page-break {
            page-break-after: always;
          }
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          padding: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .barcode {
          text-align: center;
          margin: 5px 0;
          width: 100%;
          overflow: hidden;
        }
        .barcode svg {
          max-width: 60mm;
          height: auto;
          margin: 0 auto;
        }
        .info-section {
          margin: 5px 0;
          border-top: 1px dashed #ccc;
          border-bottom: 1px dashed #ccc;
          padding: 5px 0;
        }
        .info-row {
          margin: 3px 0;
        }
        .product {
          margin: 5px 0;
          border-top: 1px dashed #ccc;
          padding-top: 3px;
        }
        .product-name {
          font-weight: bold;
          margin-bottom: 3px;
        }
        .variant {
          margin-left: 5px;
          font-size: 11px;
        }
        .total {
          margin-top: 5px;
          border-top: 1px solid #000;
          padding-top: 3px;
          text-align: right;
        }
        .footer {
          text-align: center;
          margin-top: 5px;
          font-size: 11px;
          color: #666;
        }
      `}</style>

      {orders.map((order, index) => (
        <div key={order.orderId} className={index < orders.length - 1 ? "page-break" : ""}>
          <div className="header">
            <h2 className="text-lg font-bold">UNIGO</h2>
            <p className="text-sm text-gray-600">Đơn hàng #{order.orderId}</p>
          </div>
          
          <div className="barcode">
            <Barcode 
              value={order.orderId}
              width={0.8}
              height={25}
              fontSize={8}
              margin={0}
              displayValue={false}
            />
          </div>

          <div className="info-section">
            <div className="info-row">
              <p>Địa chỉ: {order.shipping_address.address}</p>
              <p>SĐT: {order.shipping_address.phone}</p>
              <p>Thời gian: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="products">
            {order.products.map((p, i) => (
              <div key={i} className="product">
                <div className="product-name">{p.name}</div>
                {p.variants.map((v, vi) => (
                  <div key={vi} className="variant">
                    {v.color} - {v.size} x{v.quantity} = {v.price.toLocaleString()}₫
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="total">
            <div className="flex justify-between items-center">
              <span className="font-medium">Tổng tiền:</span>
              <span className="text-lg font-bold">{order.purchaseTotal.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-medium">Trạng thái:</span>
              <span>{PAYMENT_STATUS_LABEL[order.payment_status]}</span>
            </div>
          </div>

          <div className="footer">
            <p>Cảm ơn quý khách!</p>
            <p>UNIGO - Thời trang trẻ trung</p>
          </div>
        </div>
      ))}

      <div className="no-print mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          In đơn hàng
        </button>
      </div>
    </div>
  );
};

export default PrintOrder; 