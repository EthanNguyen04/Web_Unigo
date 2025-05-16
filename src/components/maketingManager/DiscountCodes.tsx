"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Add_Discount, Get_All_Discount, Put_Edit_Discount } from "../../config";
import { FaEdit } from "react-icons/fa";

interface Discount {
  code: string;
  discount_percent: number;
  min_order_value: number;
  expiration_date: string; // ISO 8601 UTC string
  max_uses: number;
  times_used: number;
  created_at: string;      // ISO 8601 UTC string
  updated_at: string;      // ISO 8601 UTC string
}

const DiscountCodes: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<Discount[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [oldCode, setOldCode] = useState<string>("");

  // Form fields
  const [code, setCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [minOrderValue, setMinOrderValue] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Helpers
  const pad = (n: number) => n.toString().padStart(2, "0");
  const toVietnamDate = (iso: string) => {
    const d = new Date(iso);
    const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utcMs + 7 * 60 * 60000);
  };
  const formatVietnamTime = (iso: string) => {
    const vn = toVietnamDate(iso);
    return `${vn.getFullYear()}-${pad(vn.getMonth()+1)}-${pad(vn.getDate())}` +
           ` ${pad(vn.getHours())}:${pad(vn.getMinutes())}`;
  };

  // Current GMT+7 and tomorrow midnight
  const vnNow = toVietnamDate(new Date().toISOString());
  const startOfTomorrow = new Date(vnNow);
  startOfTomorrow.setDate(vnNow.getDate()+1);
  startOfTomorrow.setHours(0,0,0,0);
  const tomorrowLocal = new Date(vnNow);
  tomorrowLocal.setDate(tomorrowLocal.getDate()+1);
  tomorrowLocal.setHours(0,0,0,0);
  const endOfYear = new Date(vnNow.getFullYear(),11,31,23,59);

  // Only allow edit before tomorrow midnight
  const isCreatedToday = (iso: string) => {
    const vnCreated = toVietnamDate(iso);
    const startOfToday = new Date(vnNow);
    startOfToday.setHours(0,0,0,0);
    return vnCreated >= startOfToday && vnCreated < startOfTomorrow;
  };
  const canEdit = vnNow < startOfTomorrow;

  // Fetch list
  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa có token, vui lòng đăng nhập");
      const res = await fetch(Get_All_Discount, { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      const list: Discount[] = Array.isArray(data) ? data : Array.isArray((data as any).discounts) ? (data as any).discounts : [data];
      setDiscountCodes(list);
    } catch(e:any) { alert("❌ " + e.message); }
  };
  useEffect(() => { fetchDiscounts(); }, []);

  // Filtered list
  const filtered = discountCodes.filter(d => {
    const exp = toVietnamDate(d.expiration_date);
    if (filter === 'active') return exp >= vnNow;
    if (filter === 'expired') return exp < vnNow;
    return true;
  });

  // Dialog openers
  const openAddDialog = () => {
    setIsEditing(false);
    setOldCode(""); 
    setCode(""); 
    setDiscountPercent(""); 
    setMinOrderValue(""); 
    setMaxUses("");
    setExpirationDate(tomorrowLocal);
    setShowDialog(true);
  };
  const openEditDialog = (d: Discount) => {
    setIsEditing(true);
    setOldCode(d.code);
    setCode(d.code);
    setDiscountPercent(d.discount_percent.toString());
    setMinOrderValue(d.min_order_value.toString());
    setMaxUses(d.max_uses.toString());
    setExpirationDate(null); // expiration date can't edit
    setShowDialog(true);
  };

  // Validation
  const validate = () => {
    if (!code || code.length > 10) { alert("Mã bắt buộc & ≤10 ký tự"); return false; }
    const pct = Number(discountPercent);
    if (!/^[0-9]+$/.test(discountPercent) || pct < 0 || pct > 100) { alert("Giảm %: số nguyên 0–100"); return false; }
    const minVal = Number(minOrderValue);
    if (isNaN(minVal) || minVal < 1000) { alert("Tối thiểu ≥1.000 VND"); return false; }
    if (!isEditing) {
      if (!expirationDate) { alert("Chọn ngày giờ hết hạn"); return false; }
      if (expirationDate < tomorrowLocal) { alert(`Hết hạn từ ${tomorrowLocal.toLocaleDateString()}`); return false; }
    }
    const mu = Number(maxUses);
    if (!/^[0-9]+$/.test(maxUses) || mu < 1) { alert("Sử dụng tối đa ≥1"); return false; }
    return true;
  };

  // Commit changes
  const commit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("tkn");
      if (!token) throw new Error("Chưa có token, vui lòng đăng nhập");
      const endpoint = isEditing ? Put_Edit_Discount : Add_Discount;
      const method = isEditing ? "PUT" : "POST";
      const payload: any = { 
        code, 
        discount_percent: Number(discountPercent), 
        min_order_value: Number(minOrderValue), 
        max_uses: Number(maxUses) 
      };
      if (!isEditing && expirationDate) { 
        // Convert local GMT+7 back to UTC ISO string
        const utc = expirationDate.getTime() - 7 * 60 * 60000; 
        payload.expiration_date = new Date(utc).toISOString();
      }
      if (isEditing) { 
        payload.old_code = oldCode; 
        payload.new_code = code; 
      }
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi");
      alert(isEditing ? "✅ Cập nhật thành công" : "✅ Tạo thành công");
      setShowDialog(false);
      fetchDiscounts();
    } catch (e: any) { alert("❌ " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Mã giảm giá</h2>
        <button
          onClick={openAddDialog}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          + Thêm mã giảm giá
        </button>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          aria-label="Lọc mã giảm giá"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="expired">Đã hết hạn</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              {[
                "Mã", "Giảm %", "Tối thiểu", "Hết hạn", "Tối đa", "Đã dùng", "Tạo lúc", "Cập nhật", "Chỉnh sửa"
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="p-3 border border-gray-300 whitespace-nowrap"
                >
                  {header}
                  {(header === "Hết hạn" || header === "Tạo lúc" || header === "Cập nhật") && (
                    <br />
                  )}
                  {(header === "Hết hạn" || header === "Tạo lúc" || header === "Cập nhật") && (
                    <span className="text-xs font-normal text-gray-500">(GMT+7)</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-400 italic">
                  Không có mã giảm giá phù hợp
                </td>
              </tr>
            )}
            {filtered.map(d => (
              <tr
                key={d.code}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-default"
              >
                <td className="p-3 border border-gray-300">{d.code}</td>
                <td className="p-3 border border-gray-300">{d.discount_percent}%</td>
                <td className="p-3 border border-gray-300">{d.min_order_value.toLocaleString()}đ</td>
                <td className="p-3 border border-gray-300">{formatVietnamTime(d.expiration_date)}</td>
                <td className="p-3 border border-gray-300">{d.max_uses}</td>
                <td className="p-3 border border-gray-300">{d.times_used}</td>
                <td className="p-3 border border-gray-300">{formatVietnamTime(d.created_at)}</td>
                <td className="p-3 border border-gray-300">{formatVietnamTime(d.updated_at)}</td>
                <td className="p-3 border border-gray-300 text-center">
                  {canEdit && isCreatedToday(d.created_at) && (
                    <FaEdit
                      className="inline-block text-orange-500 cursor-pointer hover:text-orange-600 transition"
                      onClick={() => openEditDialog(d)}
                      title="Chỉnh sửa mã"
                      aria-label={`Chỉnh sửa mã ${d.code}`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4"
          onClick={() => !loading && setShowDialog(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-5 text-gray-900">
              {isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                commit();
              }}
              className="space-y-4"
            >
              {/* Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giảm giá
                </label>
                <input
                  id="code"
                  type="text"
                  maxLength={10}
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  placeholder="Nhập mã giảm giá (≤10 ký tự)"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {/* Discount percent */}
              <div>
                <label htmlFor="discountPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm giá (%)
                </label>
                <input
                  id="discountPercent"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  placeholder="0 - 100"
                  disabled={loading}
                  required
                />
              </div>

              {/* Min order value */}
              <div>
                <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị tối thiểu (VNĐ)
                </label>
                <input
                  id="minOrderValue"
                  type="number"
                  min={1000}
                  step={100}
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  placeholder="Tối thiểu 1.000 VND"
                  disabled={loading}
                  required
                />
              </div>

              {/* Expiration date */}
              {!isEditing && (
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày giờ hết hạn (GMT+7)
                  </label>
                  <DatePicker
                    id="expirationDate"
                    selected={expirationDate}
                    onChange={date => setExpirationDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Giờ"
                    dateFormat="yyyy-MM-dd HH:mm"
                    minDate={tomorrowLocal}
                    maxDate={endOfYear}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    placeholderText="Chọn ngày giờ hết hạn"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              {/* Max uses */}
              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
                  Số lần sử dụng tối đa
                </label>
                <input
                  id="maxUses"
                  type="number"
                  min={1}
                  step={1}
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  placeholder="Tối thiểu 1"
                  disabled={loading}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => !loading && setShowDialog(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (isEditing ? "Đang cập nhật..." : "Đang tạo...") : (isEditing ? "Cập nhật" : "Tạo mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodes;