import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../Config';
import Sidebar from '../Sidebar/Sidebar';
import Logout from '../Logout';
import { FaDownload, FaTrash, FaSearch, FaEdit } from 'react-icons/fa';
import Select from 'react-select';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const map = {
    booked: "text-sky-600 bg-sky-50 border-sky-200",
    paid: "text-amber-600 bg-amber-50 border-amber-200",
    dispatched: "text-emerald-600 bg-emerald-50 border-emerald-200",
    delivered: "text-emerald-700 bg-emerald-100 border-emerald-300",
  };
  const icons = {
    booked: "⏳ Booked",
    paid: "💰 Paid",
    dispatched: "🚚 Dispatched",
    delivered: "✓ Delivered",
  };
  const cls = map[status?.toLowerCase()] || "text-slate-400 bg-slate-50 border-slate-200";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {icons[status?.toLowerCase()] || status}
    </span>
  );
};

const PaginBtn = ({ label, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all duration-150
      ${active ? "bg-indigo-600 border-indigo-600 text-white"
        : disabled ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
          : "bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:text-indigo-600"}`}
  >
    {label}
  </button>
);

const selectStyles = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border";

const reactSelectStyles = {
  control: (base, { isFocused }) => ({
    ...base,
    padding: "0.2rem 0.4rem",
    fontSize: "0.95rem",
    borderRadius: "10px",
    background: "#fff",
    borderColor: isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: isFocused ? "0 0 0 3px rgba(99,102,241,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
    transition: "all 0.2s",
    "&:hover": { borderColor: "#6366f1" },
  }),
  menu: (base) => ({ ...base, zIndex: 60, borderRadius: "10px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", overflow: "hidden" }),
  singleValue: (base) => ({ ...base, color: "#1e293b", fontWeight: 500 }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#fff1f2",
    borderRadius: "6px",
    border: "1px solid #fecdd3",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#e11d48",
    fontWeight: 600,
    fontSize: "0.75rem",
    padding: "2px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#e11d48",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#e11d48",
      color: "#fff",
    },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected ? "#6366f1" : isFocused ? "#f0f0ff" : "#fff",
    color: isSelected ? "#fff" : "#1e293b",
    fontWeight: isFocused || isSelected ? 500 : 400,
    cursor: "pointer",
    padding: "0.8rem",
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  clearIndicator: (base) => ({ ...base, color: "#94a3b8", "&:hover": { color: "#ef4444" } }),
};

const Spinner = ({ white = false }) => (
  <span className={`inline-block w-4 h-4 border-[3px] rounded-full animate-spin ${white ? "border-white/30 border-t-white" : "border-indigo-200 border-t-indigo-500"}`} />
);

const getEffectivePrice = (item) => Math.round(Number(item.price) || 0);

const formatTypeLabel = (type) => {
  if (!type) return '';
  return type
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const isExemptFromAdditionalDiscount = (itemOrType, exemptTypes = []) => {
  if (!itemOrType) return false;
  if (typeof itemOrType === 'object') {
    if (itemOrType.isCustom || itemOrType.isDirect || String(itemOrType.id || '').startsWith('custom-') || (itemOrType.product_type || '').toLowerCase() === 'custom') {
      return true;
    }
    if (parseFloat(itemOrType.discount || 0) === 0) return true;
  }
  const pt = (typeof itemOrType === 'string' ? itemOrType : (itemOrType.product_type || '')).toString().toLowerCase();
  if (pt === 'net_rate' || pt === 'multishot' || pt === 'custom') return true;
  return Array.isArray(exemptTypes) && exemptTypes.some(t => t.toLowerCase() === pt);
};

const isDiscountLocked = (item) => {
  if (!item) return false;
  const pt = (item.product_type || '').toString().toLowerCase();
  return pt === 'net_rate' || pt === 'multishot' || item.isCustom || String(item.id || '').startsWith('custom-') || (item.initialDiscount !== undefined && parseFloat(item.initialDiscount || 0) === 0);
};

const SummaryChip = ({ label, value, color, large }) => {
  const colorMap = {
    "#64748b": "text-slate-500",
    "#10b981": "text-emerald-500",
    "#f59e0b": "text-amber-500",
    "#94a3b8": "text-slate-400",
    "#6366f1": "text-indigo-500",
  };
  const textColor = colorMap[color] || "text-slate-600";
  return (
    <div className="text-right">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`font-bold ${large ? "text-xl" : "text-sm"} ${textColor}`}>{value}</div>
    </div>
  );
};

const CustomOption = (props) => {
  const { data, innerRef, innerProps, isFocused, isSelected, selectProps } = props;
  const { onAddToCart, cart } = selectProps;
  const cartItem = cart && cart.find(item => `${item.id}-${item.product_type}` === data.value);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.selectOption) {
          props.selectOption(data);
        } else if (onAddToCart) {
          onAddToCart(data.value, "plus");
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 12px",
        background: isSelected ? "#eef2ff" : isFocused ? "#f8fafc" : qty > 0 ? "#f0fdf4" : "#fff",
        color: "#1e293b",
        cursor: "pointer",
        gap: "8px",
        borderBottom: "1px solid #f1f5f9",
        transition: "background-color 0.15s ease",
      }}
      title="Click to select product and enter quantity"
    >
      <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: isFocused || isSelected || qty > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {data.label}
      </span>
      <div
        style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {qty > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart && onAddToCart(data.value, "minus"); }}
              style={{
                width: "22px", height: "22px", borderRadius: "50%", border: "1.5px solid #e2e8f0",
                background: "#fff", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "bold", cursor: "pointer", lineHeight: 1, flexShrink: 0,
              }}
            >−</button>
            <input
              type="number"
              value={qty}
              min="0"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(data.value, "set", parseInt(e.target.value) || 0); }}
              style={{
                width: "38px", height: "24px", borderRadius: "6px", border: "1.5px solid #c7d2fe",
                background: "#eef2ff", color: "#4338ca",
                textAlign: "center", fontSize: "0.78rem", fontWeight: "700",
                outline: "none", padding: "0 2px",
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (props.selectOption) {
                  props.selectOption(data);
                } else if (onAddToCart) {
                  onAddToCart(data.value, "plus");
                }
              }}
              style={{
                width: "22px", height: "22px", borderRadius: "50%", border: "1.5px solid #6366f1",
                background: "#6366f1", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "bold", cursor: "pointer", lineHeight: 1, flexShrink: 0,
              }}
            >+</button>
          </div>
        )}
        {qty === 0 && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (props.selectOption) {
                props.selectOption(data);
              } else if (onAddToCart) {
                onAddToCart(data.value, "plus");
              }
            }}
            title="Add to cart and enter quantity"
            style={{
              width: "26px", height: "26px", borderRadius: "50%", border: "1.5px solid #6366f1",
              background: "#6366f1", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "bold", cursor: "pointer", lineHeight: 1, flexShrink: 0,
            }}
          >+</button>
        )}
      </div>
    </div>
  );
};

const NewProductModal = ({ isOpen, onClose, onSubmit, newProductData, setNewProductData, productTypeOptions = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProductData, setLocalProductData] = useState(newProductData);

  useEffect(() => { setLocalProductData(newProductData); }, [newProductData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localProductData,
      [name]: ['price', 'discount', 'quantity'].includes(name) ? (value === '' ? '' : parseFloat(value) || 0) : value,
    };
    setLocalProductData(updatedData);
    setNewProductData(updatedData);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try { await onSubmit(localProductData); onClose(); }
    catch (err) { console.error('NewProductModal error:', err); }
    finally { setIsSubmitting(false); }
  };

  const isValid = Boolean(localProductData.productname && localProductData.price !== '' && localProductData.quantity !== '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] bg-black/60">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-emerald-500">✦</span> Add Custom Product
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Directly added to cart — exempt from additional discount</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">✕</button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              name="productname"
              type="text"
              value={localProductData.productname || ''}
              onChange={handleInputChange}
              placeholder="e.g. Special Fancy Pencil Box"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                value={localProductData.price ?? ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Discount (%)
              </label>
              <input
                name="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={localProductData.discount ?? ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={localProductData.quantity ?? '1'}
                onChange={handleInputChange}
                placeholder="1"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Unit / Per
              </label>
              <input
                name="per"
                type="text"
                list="tracking-units-list"
                value={localProductData.per || 'Box'}
                onChange={handleInputChange}
                placeholder="Box / Piece / Pkt"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              />
              <datalist id="tracking-units-list">
                <option value="Box" />
                <option value="Piece" />
                <option value="Pkt" />
                <option value="Bundle" />
                <option value="Unit" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Category
              </label>
              <select
                name="product_type"
                value={localProductData.product_type || 'custom'}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              >
                <option value="custom">Custom Product</option>
                {productTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Details / Notes
              </label>
              <input
                name="description"
                type="text"
                value={localProductData.description || ''}
                onChange={handleInputChange}
                placeholder="Optional description"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center gap-2 cursor-pointer
              ${isSubmitting || !isValid
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-500"
              }`}
          >
            {isSubmitting ? <><Spinner white />Adding...</> : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

const calculateDiscountedSubtotal = (targetCart = [], additionalDiscount = 0, exemptTypes = []) => {
  return targetCart.reduce((total, item) => {
    const linePrice = getEffectivePrice(item);
    const itemDisc = parseFloat(item.discount || 0);
    const lineAfterDisc = linePrice * (1 - itemDisc / 100) * item.quantity;
    if (isExemptFromAdditionalDiscount(item, exemptTypes)) {
      return total + lineAfterDisc;
    }
    return total + lineAfterDisc * (1 - (parseFloat(additionalDiscount) || 0) / 100);
  }, 0);
};

const calculateNetRate = (targetCart = []) =>
  targetCart.reduce((total, item) => total + getEffectivePrice(item) * item.quantity, 0).toFixed(2);

const calculateYouSave = (targetCart = []) =>
  targetCart.reduce((total, item) => {
    const disc = parseFloat(item.discount || 0);
    return total + getEffectivePrice(item) * (disc / 100) * item.quantity;
  }, 0).toFixed(2);

const calculateProcessingFee = (targetCart = [], additionalDiscount = 0, exemptTypes = []) => {
  const discountedSubtotal = calculateDiscountedSubtotal(targetCart, additionalDiscount, exemptTypes);
  return (discountedSubtotal * 0.01).toFixed(2);
};

const calculateTotal = (targetCart = [], additionalDiscount = 0, exemptTypes = []) => {
  const discountedSubtotal = calculateDiscountedSubtotal(targetCart, additionalDiscount, exemptTypes);
  return (discountedSubtotal + discountedSubtotal * 0.01).toFixed(2);
};

const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
  >
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
      {children}
    </div>
  </div>
);

const formatBillAmount = (booking) => {
  if (booking?.total != null && !isNaN(parseFloat(booking.total)) && parseFloat(booking.total) > 0) {
    return parseFloat(booking.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  try {
    const prods = typeof booking?.products === 'string'
      ? JSON.parse(booking.products)
      : (booking?.products || []);
    if (Array.isArray(prods) && prods.length > 0) {
      const sum = prods.reduce((acc, p) => acc + ((parseFloat(p.price || p.rate || p.disc_price) || 0) * (p.quantity || 1)), 0);
      if (sum > 0) {
        return sum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
  } catch {
    // ignore
  }
  return booking?.total != null && !isNaN(parseFloat(booking.total))
    ? parseFloat(booking.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
};

export default function Tracking() {
  const [bookings, setBookings] = useState([]);
  const [filterCustomerType, setFilterCustomerType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState(null);
  const ordersPerPage = 9;

  // ── Edit Booking State ──────────────────────────────────────────────────
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editCart, setEditCart] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [editSelectedProduct, setEditSelectedProduct] = useState(null);
  const [editAdditionalDiscount, setEditAdditionalDiscount] = useState(0);
  const [editChangeDiscount, setEditChangeDiscount] = useState(0);
  const [editNoAdditionalDiscountTypes, setEditNoAdditionalDiscountTypes] = useState([]);
  const [isExemptMinimized, setIsExemptMinimized] = useState(false);
  const [editCustomerDetailsOpen, setEditCustomerDetailsOpen] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editState, setEditState] = useState('');
  const [editCustomerType, setEditCustomerType] = useState('User');
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    productname: '', price: '', discount: 0, quantity: 1, per: 'Box', product_type: 'custom', description: ''
  });
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const quantityInputRefs = useRef({});
  const productSelectRef = useRef(null);

  const availableProductTypes = useMemo(() => {
    const defaultTypes = [
      "one_sound_crackers", "ground_chakkar", "flower_pots", "twinkling_star",
      "rockets", "bombs", "repeating_shots", "comets_sky_shots",
      "fancy_pencil_varieties", "fountain_and_fancy_novelties", "matches",
      "guns_and_caps", "sparklers", "premium_sparklers", "gift_boxes", "kids_special"
    ];
    const fromProducts = Array.isArray(availableProducts) ? availableProducts.map(p => p.product_type).filter(Boolean) : [];
    const combined = [...new Set([...defaultTypes, ...fromProducts])];
    combined.sort((a, b) => {
      const idxA = defaultTypes.indexOf(a.toLowerCase());
      const idxB = defaultTypes.indexOf(b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return combined;
  }, [availableProducts]);

  const productTypeOptions = useMemo(() => {
    return availableProductTypes.map(t => ({
      value: t,
      label: formatTypeLabel(t)
    }));
  }, [availableProductTypes]);

  const focusQuantityInput = useCallback((id, product_type) => {
    if (!id || !product_type) return;
    const key = `${id}-${product_type}`;
    let attempts = 0;
    const maxAttempts = 15;

    const tryFocus = () => {
      const input = quantityInputRefs.current[key];
      if (input) {
        if (productSelectRef.current) {
          try { productSelectRef.current.blur(); } catch (err) {}
        }
        input.focus({ preventScroll: false });
        try { input.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (err) {}
        try { input.select(); } catch (err) {}
        return true;
      }
      return false;
    };

    if (tryFocus()) {
      setTimeout(tryFocus, 40);
      setTimeout(tryFocus, 120);
      return;
    }

    const intervalId = setInterval(() => {
      attempts += 1;
      const success = tryFocus();
      if (success || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (success) {
          setTimeout(tryFocus, 40);
          setTimeout(tryFocus, 120);
        }
      }
    }, 25);
  }, []);

  useEffect(() => {
    if (lastAddedProduct) {
      focusQuantityInput(lastAddedProduct.id, lastAddedProduct.product_type);
      setLastAddedProduct(null);
    }
  }, [lastAddedProduct, focusQuantityInput]);

  const openEditModal = async (booking) => {
    setEditingBooking(booking);
    let parsedProducts = [];
    try {
      parsedProducts = typeof booking.products === 'string'
        ? JSON.parse(booking.products)
        : (booking.products || []);
    } catch {
      parsedProducts = [];
    }

    const initialExempt = [];
    const normalizedCart = parsedProducts.map(p => {
      const isCustom = Boolean(p.isCustom || String(p.id).startsWith('custom') || p.product_type === 'custom');
      if (p.exempt_additional_discount && p.product_type && !initialExempt.includes(p.product_type)) {
        initialExempt.push(p.product_type);
      }
      return {
        ...p,
        id: p.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product_type: p.product_type || 'custom',
        price: Math.round(Number(p.price || p.rate || p.disc_price) || 0),
        discount: parseFloat(p.discount) || 0,
        initialDiscount: parseFloat(p.discount) || 0,
        quantity: parseInt(p.quantity) || 1,
        per: p.per || 'Unit',
        serial_number: p.serial_number || undefined,
        isCustom,
        exempt_additional_discount: Boolean(p.exempt_additional_discount || isCustom)
      };
    });

    setEditCart(normalizedCart);
    setEditAdditionalDiscount(parseFloat(booking.additional_discount) || 0);
    setEditChangeDiscount(0);
    setEditNoAdditionalDiscountTypes(initialExempt);
    setEditCustomerName(booking.customer_name || '');
    setEditMobileNumber(booking.mobile_number || '');
    setEditAddress(booking.address || '');
    setEditDistrict(booking.district || '');
    setEditState(booking.state || '');
    setEditCustomerType(booking.customer_type || 'User');
    setEditCustomerDetailsOpen(false);
    setEditModalOpen(true);

    if (availableProducts.length === 0) {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/direct/aproducts`);
        const valid = Array.isArray(res.data)
          ? res.data.map(p => ({
              ...p,
              discount: parseFloat(p.discount) || 0,
              initialDiscount: parseFloat(p.discount) || 0,
            }))
          : [];
        setAvailableProducts(valid);
      } catch (err) {
        console.warn('Failed to load products list:', err.message);
      }
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingBooking(null);
    setEditCart([]);
    setEditSelectedProduct(null);
    setEditAdditionalDiscount(0);
    setEditChangeDiscount(0);
    setEditNoAdditionalDiscountTypes([]);
  };

  const handleChangeDiscount = (val) => {
    const newDiscount = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setEditChangeDiscount(newDiscount);
    setEditCart(prev => prev.map(item => (isDiscountLocked(item) || item.isCustom ? item : { ...item, discount: newDiscount })));
  };

  const handleOptionCartAction = useCallback((productValue, action, setValue) => {
    const [id, type] = productValue.split("-");
    const product = availableProducts.find(p => p.id.toString() === id && p.product_type === type);
    if (!product) return;
    const currentDiscount = editChangeDiscount;

    setEditCart(prev => {
      const exists = prev.find(item => item.id.toString() === id && item.product_type === type);
      const presetDiscount = parseFloat(product.discount) || 0;
      const appliedDiscount = presetDiscount || currentDiscount;
      if (action === "plus") {
        if (exists) {
          return prev.map(item => item.id.toString() === id && item.product_type === type ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
          const newItem = { ...product, id: product.id, price: Math.round(Number(product.price) || 0), quantity: 1, discount: appliedDiscount, initialDiscount: presetDiscount, per: product.per || 'Unit' };
          return [...prev, newItem];
        }
      } else if (action === "minus") {
        if (!exists) return prev;
        if (exists.quantity <= 1) return prev.filter(item => !(item.id.toString() === id && item.product_type === type));
        return prev.map(item => item.id.toString() === id && item.product_type === type ? { ...item, quantity: item.quantity - 1 } : item);
      } else if (action === "set") {
        const qty = parseInt(setValue) || 0;
        if (!exists && qty > 0) {
          const newItem = { ...product, id: product.id, price: Math.round(Number(product.price) || 0), quantity: qty, discount: appliedDiscount, initialDiscount: presetDiscount, per: product.per || 'Unit' };
          return [...prev, newItem];
        }
        if (qty <= 0) return prev.filter(item => !(item.id.toString() === id && item.product_type === type));
        return prev.map(item => item.id.toString() === id && item.product_type === type ? { ...item, quantity: qty } : item);
      }
      return prev;
    });

    if (action === "plus") {
      setLastAddedProduct({ id: product.id, product_type: product.product_type });
      focusQuantityInput(product.id, product.product_type);
    }
  }, [availableProducts, editChangeDiscount, focusQuantityInput]);

  const updateQuantity = (id, type, quantity) => {
    setEditCart(prev => prev.map(item => item.id === id && item.product_type === type ? { ...item, quantity: Math.max(0, quantity) } : item));
  };

  const updateDiscount = (id, type, discount) => {
    if (type === 'net_rate' || type === 'multishot') return;
    setEditCart(prev => prev.map(item => item.id === id && item.product_type === type ? { ...item, discount: Math.max(0, Math.min(100, discount)) } : item));
  };

  const updatePrice = (id, type, price) => {
    setEditCart(prev => prev.map(item => item.id === id && item.product_type === type ? { ...item, price: Math.max(0, price) } : item));
  };

  const removeFromCart = (id, type) => {
    setEditCart(prev => prev.filter(item => !(item.id === id && item.product_type === type)));
  };

  const handleAddNewCustomProduct = (productData) => {
    if (!productData.productname) return toast.error("Product name is required");
    if (productData.price === '' || productData.price < 0) return toast.error("Valid price is required");
    if (productData.quantity === '' || productData.quantity < 1) return toast.error("Quantity must be at least 1");
    const sanitizedData = {
      ...productData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_type: productData.product_type || 'custom',
      discount: parseFloat(productData.discount) || 0,
      initialDiscount: parseFloat(productData.discount) || 0,
      price: Math.round(Number(productData.price) || 0),
      quantity: parseInt(productData.quantity) || 1,
      per: productData.per || 'Unit',
      isCustom: true,
      exempt_additional_discount: true
    };
    setEditCart(prev => [...prev, sanitizedData]);
    setNewProductModalOpen(false);
    toast.success("Custom product added to cart!");
  };

  const handleUpdateBookingSubmit = async () => {
    if (!editCart.length) {
      toast.error("Please add at least one product to the booking");
      return;
    }
    if (editCart.some(item => !item.quantity || item.quantity <= 0)) {
      toast.error("Please ensure all products have a quantity greater than zero");
      return;
    }

    setEditSubmitLoading(true);
    try {
      const discountedSubtotal = calculateDiscountedSubtotal(editCart, editAdditionalDiscount, editNoAdditionalDiscountTypes);
      const processingFee = discountedSubtotal * 0.01;
      const netRate = calculateNetRate(editCart);
      const youSave = calculateYouSave(editCart);
      const total = calculateTotal(editCart, editAdditionalDiscount, editNoAdditionalDiscountTypes);

      const payload = {
        products: editCart.map(item => ({
          id: item.id,
          product_type: item.product_type || 'custom',
          productname: item.productname,
          price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discount) || 0,
          quantity: parseInt(item.quantity) || 1,
          per: item.per || 'Unit',
          serial_number: item.serial_number || undefined,
          isCustom: Boolean(item.isCustom || String(item.id).startsWith('custom') || item.product_type === 'custom'),
          exempt_additional_discount: isExemptFromAdditionalDiscount(item, editNoAdditionalDiscountTypes)
        })),
        net_rate: parseFloat(netRate),
        you_save: parseFloat(youSave),
        processing_fee: parseFloat(processingFee.toFixed(2)),
        total: parseFloat(total),
        promo_discount: 0,
        additional_discount: parseFloat(Number(editAdditionalDiscount || 0).toFixed(2)),
        customer_name: editCustomerName,
        mobile_number: editMobileNumber,
        address: editAddress,
        district: editDistrict,
        state: editState,
        customer_type: editCustomerType
      };

      const res = await axios.put(`${API_BASE_URL}/api/tracking/bookings/${editingBooking.order_id}`, payload);

      setBookings(prev => prev.map(b => b.order_id === editingBooking.order_id ? {
        ...b,
        ...payload,
        ...(res.data?.booking || {})
      } : b));

      toast.success("Booking updated successfully!", { position: "top-center", autoClose: 4000 });
      closeEditModal();
      fetchBookings(false);
    } catch (err) {
      console.error('Error updating booking:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking. Please try again.');
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const fetchBookings = async (resetPage = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tracking/bookings`, {
        params: { status: filterStatus || undefined, customerType: filterCustomerType || undefined }
      });
      const sortedBookings = response.data.sort((a, b) => b.id - a.id);
      setBookings(sortedBookings);
      setError('');
      if (resetPage) setCurrentPage(1);
    } catch {
      setError('Failed to fetch bookings');
    }
  };

  useEffect(() => {
    fetchBookings(true);
    const interval = setInterval(() => fetchBookings(false), 100000);
    return () => clearInterval(interval);
  }, [filterStatus, filterCustomerType]);

  const closeModals = () => {
    setShowPaidModal(false);
    setShowDetailsModal(false);
    setSelectedBookingId(null);
    setPaymentMethod('cash');
    setTransactionId('');
    setAmountPaid('');
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'paid') {
      setSelectedBookingId(id);
      const b = bookings.find((item) => item.id === id);
      setPaymentMethod(b?.payment_method || 'cash');
      setTransactionId(b?.transaction_id || '');
      setAmountPaid(b?.amount_paid ? String(b.amount_paid) : '');
      setShowPaidModal(true);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const updateStatus = async (id, newStatus, paymentDetails = null) => {
    try {
      const payload = { status: newStatus };
      if (paymentDetails) {
        payload.payment_method = paymentDetails.paymentMethod;
        payload.transaction_id = paymentDetails.transactionId || null;
        payload.amount_paid = paymentDetails.amountPaid;
      }
      await axios.put(`${API_BASE_URL}/api/tracking/bookings/${id}/status`, payload);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status: newStatus, ...(paymentDetails && { payment_method: paymentDetails.paymentMethod || booking.payment_method, transaction_id: paymentDetails.transactionId || booking.transaction_id, amount_paid: paymentDetails.amountPaid || booking.amount_paid }) }
            : booking
        ).sort((a, b) => b.id - a.id)
      );
      setError('');
      closeModals();
      toast.success("Status updated successfully", { position: "top-center", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteBooking = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tracking/bookings/${selectedOrderId}`);
      setBookings((prev) => prev.filter((booking) => booking.order_id !== selectedOrderId));
      setShowDeleteModal(false);
      setError('');
      toast.success("Booking deleted successfully", { position: "top-center", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete booking');
      setShowDeleteModal(false);
    }
  };

  const handleFillDetails = () => { setShowPaidModal(false); setShowDetailsModal(true); };

  const handleDetailsSubmit = () => {
    if (!amountPaid || !amountPaid.trim() || isNaN(amountPaid) || Number(amountPaid) <= 0) {
      toast.error('Please enter a valid amount paid', { position: "top-center", autoClose: 4000 });
      setError('Please enter a valid amount paid');
      return;
    }
    if (paymentMethod === 'bank' && !transactionId.trim()) {
      toast.error('Transaction ID is required for bank transactions', { position: "top-center", autoClose: 4000 });
      setError('Transaction ID is required for bank transactions');
      return;
    }
    updateStatus(selectedBookingId, 'paid', { paymentMethod, transactionId: paymentMethod === 'bank' ? transactionId.trim() : null, amountPaid: Number(amountPaid) });
  };

  const generateBillPDF = async (booking) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/direct/invoice/${booking.order_id}`, { responseType: 'blob' });
      if (!response.ok) throw new Error('Failed to fetch PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeCustomerName = (booking.customer_name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      link.setAttribute('download', `${safeCustomerName}-${booking.order_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded estimate bill, check downloads", { position: "top-center", autoClose: 5000 });
    } catch (err) {
      toast.error("Failed to download PDF. Please try again.", { position: "top-center", autoClose: 5000 });
    }
  };

  const generatePackingPDF = async (booking) => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const marginL = 14;
      const contentW = pageW - marginL * 2;

      // ── Header ──
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(234, 88, 12);
      doc.text('MADHU NISHA CRACKERS', pageW / 2, 18, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('www.madhunishacrackers.com  |  +91 94875 24689', pageW / 2, 25, { align: 'center' });

      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.8);
      doc.line(marginL, 29, marginL + contentW, 29);

      // ── PACKING SLIP label ──
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('PACKING SLIP', marginL, 38);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(marginL, 41, marginL + contentW, 41);

      // ── FROM / BILL TO boxes ──
      const boxY = 46;
      const boxH = 52;
      const halfW = contentW / 2 - 4;

      // FROM box
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.rect(marginL, boxY, halfW, boxH);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(150, 150, 150);
      doc.text('FROM', marginL + 4, boxY + 7);
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text('Madhu Nisha Crackers', marginL + 4, boxY + 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Sivakasi, Tamil Nadu', marginL + 4, boxY + 24);
      doc.text('+91 94875 24689', marginL + 4, boxY + 32);
      doc.text('madhunishacrackers@gmail.com', marginL + 4, boxY + 40);

      // SHIP TO box
      const shipX = marginL + halfW + 8;
      doc.rect(shipX, boxY, halfW, boxH);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(150, 150, 150);
      doc.text('SHIP TO', shipX + 4, boxY + 7);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(booking.customer_name || 'N/A', shipX + 4, boxY + 16, { width: halfW - 8 });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      let addr = booking.address || '';
      if (addr.length > 40) addr = addr.substring(0, 37) + '…';
      doc.text(addr, shipX + 4, boxY + 24, { width: halfW - 8 });
      const distState = [booking.district, booking.state].filter(Boolean).join(', ');
      doc.text(distState, shipX + 4, boxY + 32);
      doc.text(`Mobile: ${booking.mobile_number || 'N/A'}`, shipX + 4, boxY + 40);

      // ── Order ID row ──
      const metaY = boxY + boxH + 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Order ID:`, marginL, metaY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(booking.order_id || 'N/A', marginL + 20, metaY);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(marginL, metaY + 4, marginL + contentW, metaY + 4);

      // ── Products table — NO rate, NO total ──
      let products = [];
      try {
        products = typeof booking.products === 'string'
          ? JSON.parse(booking.products)
          : (booking.products || []);
      } catch { products = []; }

      const tableRows = products.map((p, i) => [
        i + 1,
        p.productname || 'N/A',
        p.quantity || 1,
      ]);

      autoTable(doc, {
        startY: metaY + 10,
        head: [['Sl.No', 'Product Name', 'Quantity']],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [40, 40, 40],
          fontStyle: 'bold',
          halign: 'center',
          lineColor: [200, 200, 200],
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 'auto', halign: 'left' },
          2: { cellWidth: 28, halign: 'center' },
        },
        alternateRowStyles: { fillColor: [255, 247, 237] },
      });

      // ── Footer ──
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setDrawColor(234, 88, 12);
      doc.setLineWidth(0.6);
      doc.line(marginL, finalY, marginL + contentW, finalY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Thank you for your business with Madhu Nisha Crackers, Sivakasi', pageW / 2, finalY + 7, { align: 'center' });

      const safeCustomerName = (booking.customer_name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      doc.save(`${safeCustomerName}-${booking.order_id}-packing.pdf`);
      toast.success("Packing slip downloaded!", { position: "top-center", autoClose: 5000 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate packing slip.", { position: "top-center", autoClose: 5000 });
    }
  };

  const handleDownloadClick = (booking) => {
    setDownloadTarget(booking);
    setShowDownloadModal(true);
  };

  const handleDownloadChoice = async (type) => {
    setShowDownloadModal(false);
    if (!downloadTarget) return;
    if (type === 'bill') await generateBillPDF(downloadTarget);
    else await generatePackingPDF(downloadTarget);
    setDownloadTarget(null);
  };

  const filteredBookings = bookings.filter((booking) =>
    ['customer_name', 'order_id', 'total', 'customer_type'].some((key) =>
      booking[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date)) return 'N/A';
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredBookings.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredBookings.length / ordersPerPage);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Logout />
      <div className="hundred:ml-64 mobile:ml-0 mobile:px-3 w-auto">
        <div className="mx-auto px-6 py-8 w-full">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tracking</h1>
            <p className="text-slate-400 mt-1.5 text-sm">Monitor and manage all bookings</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-700 px-4 py-3.5 rounded-xl mb-5 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1.5">Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectStyles}>
                  <option value="">All Statuses</option>
                  <option value="booked">Booked</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1.5">Customer Type</label>
                <select value={filterCustomerType} onChange={(e) => setFilterCustomerType(e.target.value)} className={selectStyles}>
                  <option value="">All Customer Types</option>
                  <option value="Customer">Customer</option>
                  <option value="Agent">Agent</option>
                  <option value="Customer of Selected Agent">Customer of Selected Agent</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="flex-1 min-w-64">
                <label className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1.5">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Name, order ID, total, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
                  />
                </div>
              </div>
            </div>
          </div>

          {currentOrders.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-6">
              {currentOrders.map((booking, index) => (
                <div
                  key={booking.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-extrabold text-indigo-500 tracking-wide">{booking.order_id}</div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">{booking.customer_name}</div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      ["📍 District", booking.district || "N/A"],
                      ["🏛️ State", booking.state || "N/A"],
                      ["👤 Type", booking.customer_type],
                      ["📅 Date", formatDate(booking.created_at)],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-slate-50 rounded-lg px-2.5 py-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{value}</div>
                      </div>
                    ))}
                    <div className="col-span-2 bg-indigo-50/70 border border-indigo-100 rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">💰 Bill Amount</span>
                      <span className="text-sm font-extrabold text-indigo-700">₹{formatBillAmount(booking)}</span>
                    </div>
                  </div>

                  {(booking.amount_paid || booking.payment_method || booking.transaction_id) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4 space-y-1">
                      {booking.amount_paid && (
                        <p className="text-xs text-slate-700">
                          <span className="font-bold text-amber-600">Amount Paid:</span> ₹{parseFloat(booking.amount_paid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                      {booking.payment_method && (
                        <p className="text-xs text-slate-700"><span className="font-bold text-amber-600">Method:</span> {booking.payment_method}</p>
                      )}
                      {booking.transaction_id && (
                        <p className="text-xs text-slate-700"><span className="font-bold text-amber-600">Txn ID:</span> {booking.transaction_id}</p>
                      )}
                    </div>
                  )}

                  {booking.mobile_number && (
                    <a href={`tel:${booking.mobile_number}`} className="block text-xs font-semibold text-indigo-500 hover:text-indigo-700 mb-4 transition-colors">
                      📞 {booking.mobile_number}
                    </a>
                  )}

                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Update Status</label>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={selectStyles}
                    >
                      <option value="">— Change Status —</option>
                      <option value="booked">Booked</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(booking)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-200"
                    >
                      <FaEdit className="text-xs" /> Edit
                    </button>
                    <button
                      onClick={() => handleDownloadClick(booking)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-200"
                    >
                      <FaDownload className="text-xs" /> Download
                    </button>
                    <button
                      onClick={() => { setSelectedOrderId(booking.order_id); setShowDeleteModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-500 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                    >
                      <FaTrash className="text-xs" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl mb-6">
              No bookings found
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 flex-wrap">
              <PaginBtn label="← Prev" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginBtn key={page} label={page} onClick={() => setCurrentPage(page)} active={currentPage === page} />
              ))}
              <PaginBtn label="Next →" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
            </div>
          )}
        </div>
      </div>

      {showPaidModal && (
        <ModalWrapper onClose={closeModals}>
          <div className="text-5xl mb-4 text-center">💰</div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2 text-center">Update to Paid?</h2>
          {selectedBooking && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 text-center">
              <div className="text-xs text-slate-500 font-semibold">{selectedBooking.customer_name} ({selectedBooking.order_id})</div>
              <div className="text-sm font-extrabold text-indigo-600 mt-1">Bill Amount: ₹{formatBillAmount(selectedBooking)}</div>
            </div>
          )}
          <p className="text-slate-500 text-sm mb-6 text-center">Please fill in the payment details to proceed.</p>
          <div className="flex gap-2.5 justify-center">
            <button onClick={closeModals} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleFillDetails} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-500 transition-all duration-200">
              Fill Details
            </button>
          </div>
        </ModalWrapper>
      )}

      {showDetailsModal && (
        <ModalWrapper onClose={closeModals}>
          <h2 className="text-xl font-extrabold text-slate-800 mb-4 text-center">💳 Payment Details</h2>
          
          {selectedBooking && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Order ID</div>
                <div className="text-xs font-bold text-slate-700">{selectedBooking.order_id}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Bill Amount</div>
                <div className="text-sm font-extrabold text-indigo-700">₹{formatBillAmount(selectedBooking)}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={selectStyles}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transaction</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Amount Paid <span className="text-red-500">*</span>
                </label>
                {selectedBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      const billAmt = selectedBooking.total != null && !isNaN(parseFloat(selectedBooking.total))
                        ? String(parseFloat(selectedBooking.total))
                        : '';
                      if (billAmt) setAmountPaid(billAmt);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Use Full Bill Amount
                  </button>
                )}
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={amountPaid ?? ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/,/g, '');
                  if (/^\d*\.?\d{0,2}$/.test(val)) {
                    setAmountPaid(val);
                  }
                }}
                placeholder="Enter amount paid"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
                autoFocus
              />
            </div>

            {paymentMethod === 'bank' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId ?? ""}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2.5 justify-end mt-6">
            <button
              onClick={closeModals}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDetailsSubmit}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </ModalWrapper>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-2">Download PDF</h2>
            <p className="text-slate-400 text-sm mb-7">Choose the type of PDF to download</p>
            <div className="flex gap-3">
              <button onClick={() => handleDownloadChoice('bill')}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all">
                🧾 Bill
              </button>
              <button onClick={() => handleDownloadChoice('packing')}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-orange-500 to-orange-400 shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-500 transition-all">
                📦 Packing
              </button>
            </div>
            <button onClick={() => { setShowDownloadModal(false); setDownloadTarget(null); }}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <ModalWrapper onClose={() => setShowDeleteModal(false)}>
          <div className="text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-lg font-extrabold text-slate-800 mb-2.5 text-center">Delete Booking?</h2>
          <p className="text-slate-500 text-sm mb-6 text-center">
            Are you sure you want to delete this booking and its associated quotation (if any)? This cannot be undone.
          </p>
          <div className="flex gap-2.5 justify-center">
            <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Keep It
            </button>
            <button onClick={handleDeleteBooking} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-red-500 to-red-400 shadow-lg shadow-red-200 hover:from-red-600 hover:to-red-500 transition-all duration-200">
              Yes, Delete
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Edit Booking Modal ── */}
      {editModalOpen && editingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                    <span className="text-amber-500">✏️</span> Edit Booking
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {editingBooking.order_id}
                  </span>
                  <StatusBadge status={editingBooking.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update products, quantities, prices, discounts, and customer information
                </p>
              </div>
              <button
                onClick={closeEditModal}
                disabled={editSubmitLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Customer Information Card (Works for all types of users) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-sm">{editCustomerName || "Customer"}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                        {editCustomerType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      📞 {editMobileNumber || "No phone"} · 📍 {[editDistrict, editState].filter(Boolean).join(", ") || "No location"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditCustomerDetailsOpen(!editCustomerDetailsOpen)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {editCustomerDetailsOpen ? "▲ Hide Customer Details" : "▼ Edit Customer Details"}
                </button>
              </div>

              {editCustomerDetailsOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={editMobileNumber}
                      onChange={(e) => setEditMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Customer Type
                    </label>
                    <select
                      value={editCustomerType}
                      onChange={(e) => setEditCustomerType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Agent">Agent</option>
                      <option value="Customer of Selected Agent">Customer of Selected Agent</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Discount Edit Options (Same as direct.jsx) */}
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">
                      Additional Discount (%)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Excludes bubble categories & 0% items</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={editAdditionalDiscount || ''}
                      onChange={(e) => setEditAdditionalDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      placeholder="0"
                      min="0" max="100" step="1"
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 outline-none focus:border-amber-400 transition-colors box-border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">%</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider">
                      Bulk Change Discount (%)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Leaves Net Rate & fixed 0% items untouched</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={editChangeDiscount || ''}
                      onChange={(e) => handleChangeDiscount(e.target.value)}
                      placeholder="0"
                      min="0" max="100" step="1"
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 transition-colors box-border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">%</span>
                  </div>
                </div>
              </div>

              {/* Category Exemption from Additional Discount (Bubbles with Checkboxes) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setIsExemptMinimized(!isExemptMinimized)}
                  >
                    <button
                      type="button"
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold transition-colors cursor-pointer"
                      title={isExemptMinimized ? "Expand" : "Minimize"}
                    >
                      {isExemptMinimized ? "▼" : "▲"}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🛡️</span> Exclude Categories from Additional Discount (%)
                        {editNoAdditionalDiscountTypes.length > 0 && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full lowercase">
                            {editNoAdditionalDiscountTypes.length} exempt
                          </span>
                        )}
                      </div>
                      {isExemptMinimized ? (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {editNoAdditionalDiscountTypes.length > 0
                            ? `${editNoAdditionalDiscountTypes.length} categories excluded from extra discount. Click to expand.`
                            : 'No categories excluded. Click to expand.'}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Select categories in the bubbles below to exclude them from the Additional Discount (they keep their regular discount).
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isExemptMinimized && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditNoAdditionalDiscountTypes(productTypeOptions.map(o => o.value))}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setEditNoAdditionalDiscountTypes([])}
                          className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer hover:underline"
                        >
                          Clear All
                        </button>
                        <span className="text-slate-300">|</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsExemptMinimized(!isExemptMinimized)}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                    >
                      {isExemptMinimized ? "▼ Expand" : "▲ Minimize"}
                    </button>
                  </div>
                </div>

                {!isExemptMinimized && (
                  <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-slate-100">
                    {productTypeOptions.length > 0 ? (
                      productTypeOptions.map(opt => {
                        const isChecked = editNoAdditionalDiscountTypes.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border cursor-pointer select-none transition-all duration-150 ${
                              isChecked
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const next = isChecked
                                  ? editNoAdditionalDiscountTypes.filter(t => t !== opt.value)
                                  : [...editNoAdditionalDiscountTypes, opt.value];
                                setEditNoAdditionalDiscountTypes(next);
                              }}
                              className="w-3.5 h-3.5 rounded accent-amber-600 cursor-pointer"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No categories loaded yet</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Table */}
            {editCart.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-10 text-center mb-5">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-slate-400 font-medium text-sm">Cart is empty — search or add products below</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-5">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b-2 border-indigo-100">
                        {["#", "Product", "Price (₹)", "Discount", "Qty", "Total", ""].map((h, i) => (
                          <th
                            key={i}
                            className={`px-3.5 py-3 text-xs font-bold text-indigo-500 uppercase tracking-widest whitespace-nowrap
                              ${i === 0 || i === 6 ? "text-center" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {editCart.map((item, index) => {
                        const itemDisc = parseFloat(item.discount || 0);
                        const effectivePrice = getEffectivePrice(item);
                        const lineTotal = Math.round(effectivePrice * (1 - itemDisc / 100) * item.quantity);
                        const cartInputCls = "w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800 text-center bg-slate-50 outline-none focus:border-indigo-400 transition-colors";
                        return (
                          <tr
                            key={`${item.id}-${item.product_type}`}
                            className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors duration-150"
                          >
                            <td className="px-3.5 py-2.5 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                            <td className="px-3.5 py-2.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                                <span>{item.productname}</span>
                                {(item.isCustom || String(item.id).startsWith('custom-')) && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                    Custom
                                  </span>
                                )}
                                {isExemptFromAdditionalDiscount(item, editNoAdditionalDiscountTypes) && editAdditionalDiscount > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                    Exempt Extra %
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {formatTypeLabel(item.product_type)}{item.serial_number ? ` · ${item.serial_number}` : ""}{item.per ? ` · ${item.per}` : ""}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <input
                                type="number"
                                value={effectivePrice}
                                min="0"
                                step="1"
                                onChange={(e) => updatePrice(item.id, item.product_type, parseFloat(e.target.value) || 0)}
                                className={`${cartInputCls} focus:border-emerald-400`}
                              />
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="relative inline-block">
                                {item.product_type === 'net_rate' || item.product_type === 'multishot' ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    0% (Net)
                                  </span>
                                ) : (
                                  <>
                                    <input
                                      type="number"
                                      value={item.discount}
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      onChange={(e) => updateDiscount(item.id, item.product_type, parseFloat(e.target.value) || 0)}
                                      className={`${cartInputCls} pr-6 focus:border-amber-400`}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">%</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <input
                                type="number"
                                value={item.quantity}
                                min="0"
                                onChange={(e) => updateQuantity(item.id, item.product_type, parseInt(e.target.value) || 0)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    productSelectRef.current?.focus();
                                  }
                                }}
                                onFocus={(e) => {
                                  try { e.target.select(); } catch {}
                                }}
                                ref={(el) => (quantityInputRefs.current[`${item.id}-${item.product_type}`] = el)}
                                className={`${cartInputCls} focus:border-indigo-400`}
                              />
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span className="font-bold text-slate-800">₹{lineTotal.toLocaleString('en-IN')}</span>
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              <button
                                onClick={() => removeFromCart(item.id, item.product_type)}
                                className="bg-red-50 border border-red-200 text-red-500 rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Bar */}
                <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border-t-2 border-indigo-100 px-5 py-4">
                  <div className="flex justify-end flex-wrap gap-6">
                    <SummaryChip
                      label="Net Rate"
                      value={`₹${parseFloat(calculateNetRate(editCart)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      color="#64748b"
                    />
                    <SummaryChip
                      label="You Save"
                      value={`₹${parseFloat(calculateYouSave(editCart)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      color="#10b981"
                    />
                    {editAdditionalDiscount > 0 && (
                      <SummaryChip
                        label="Extra Discount"
                        value={`${editAdditionalDiscount}%`}
                        color="#f59e0b"
                      />
                    )}
                    <SummaryChip
                      label="Processing Fee (1%)"
                      value={`₹${parseFloat(calculateProcessingFee(editCart, editAdditionalDiscount, editNoAdditionalDiscountTypes)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      color="#94a3b8"
                    />
                    <SummaryChip
                      label="Total"
                      value={`₹${parseFloat(calculateTotal(editCart, editAdditionalDiscount, editNoAdditionalDiscountTypes)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      color="#6366f1"
                      large
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Search & Add Product */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-60">
                  <label className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1.5">
                    Search & Add Products
                  </label>
                  <Select
                    ref={productSelectRef}
                    value={editSelectedProduct}
                    closeMenuOnSelect={true}
                    onChange={(option) => {
                      if (!option) return setEditSelectedProduct(null);
                      const [id, type] = option.value.split("-");
                      const product = availableProducts.find(p => p.id.toString() === id && p.product_type === type);
                      if (!product) return;
                      const presetDiscount = parseFloat(product.discount) || 0;
                      const appliedDiscount = presetDiscount || editChangeDiscount || 0;
                      const newItem = {
                        ...product,
                        id: product.id,
                        price: Math.round(Number(product.price) || 0),
                        quantity: 1,
                        discount: appliedDiscount,
                        initialDiscount: presetDiscount,
                        per: product.per || 'Unit',
                      };
                      setEditCart(prev => {
                        const exists = prev.find(item => item.id.toString() === id && item.product_type === type);
                        return exists
                          ? prev.map(item => item.id.toString() === id && item.product_type === type
                            ? { ...item, quantity: item.quantity + 1 } : item)
                          : [...prev, newItem];
                      });
                      setLastAddedProduct({ id: product.id, product_type: product.product_type });
                      focusQuantityInput(product.id, product.product_type);
                      setEditSelectedProduct(null);
                    }}
                    options={availableProducts.map((p) => ({
                      value: `${p.id}-${p.product_type}`,
                      label: `${p.serial_number ? `[${p.serial_number}] ` : ''}${p.productname} · ${formatTypeLabel(p.product_type)} · ₹${getEffectivePrice(p)}`,
                    }))}
                    placeholder="Type product name, serial number..."
                    isClearable
                    isSearchable
                    styles={reactSelectStyles}
                    components={{ Option: CustomOption }}
                    onAddToCart={handleOptionCartAction}
                    cart={editCart}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewProductData({
                      productname: '', price: '', discount: 0, quantity: 1, per: 'Box', product_type: 'custom', description: ''
                    });
                    setNewProductModalOpen(true);
                  }}
                  className="h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-500 transition-all duration-200 cursor-pointer"
                  title="Add custom product"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  + Add Product
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={editSubmitLoading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateBookingSubmit}
                disabled={editSubmitLoading || editCart.length === 0}
                className="px-7 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-indigo-500 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {editSubmitLoading ? (
                  <>
                    <Spinner white /> Saving Changes...
                  </>
                ) : (
                  <>💾 Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Product Modal for Custom Products */}
      <NewProductModal
        isOpen={newProductModalOpen}
        onClose={() => setNewProductModalOpen(false)}
        onSubmit={handleAddNewCustomProduct}
        newProductData={newProductData}
        setNewProductData={setNewProductData}
        productTypeOptions={productTypeOptions}
      />
    </div>
  );
}