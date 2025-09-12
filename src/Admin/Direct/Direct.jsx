import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Modal from 'react-modal';
import '../../App.css';
import { API_BASE_URL } from '../../../Config';
import Sidebar from '../Sidebar/Sidebar';
import Logout from '../Logout';
import { FaEdit, FaArrowRight, FaTrash } from 'react-icons/fa';

// Set app element for accessibility
Modal.setAppElement("#root");

// Error Boundary Component
class QuotationTableErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by QuotationTableErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg text-center shadow-md">
          An error occurred while rendering the quotation table. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper to calculate effective price
const getEffectivePrice = (item) => {
  return Math.round(Number(item.price) || 0);
};

// Shared select styles
const selectStyles = {
  control: (base) => ({
    ...base,
    padding: "0.25rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    background: "#fff",
    borderColor: "#d1d5db",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    "&:hover": { borderColor: "#3b82f6" },
    "@media (max-width: 640px)": { padding: "0.25rem", fontSize: "0.875rem" },
  }),
  menu: (base) => ({ ...base, zIndex: 20, background: "#fff" }),
  singleValue: (base) => ({ ...base, color: "#1f2937" }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected ? "#3b82f6" : isFocused ? "#e5e7eb" : "#fff",
    color: isSelected ? "#fff" : "#1f2937",
  }),
  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
};

// Component styles
const styles = {
  input: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(240,249,255,0.6))",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(2,132,199,0.3)",
  },
  button: {
    background: "linear-gradient(135deg, rgba(2,132,199,0.9), rgba(14,165,233,0.95))",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(125,211,252,0.4)",
    boxShadow: "0 15px 35px rgba(2,132,199,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
  },
  card: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,249,255,0.7))",
    border: "1px solid rgba(2,132,199,0.3)",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
};

// QuotationTable component
const QuotationTable = ({
  cart = [],
  products,
  selectedProduct,
  setSelectedProduct,
  addToCart,
  updateQuantity,
  updateDiscount,
  updatePrice,
  removeFromCart,
  calculateNetRate,
  calculateYouSave,
  calculateProcessingFee,
  calculateTotal,
  styles,
  isModal = false,
  additionalDiscount,
  setAdditionalDiscount,
  changeDiscount,
  setChangeDiscount,
  openNewProductModal,
  lastAddedProduct,
  setLastAddedProduct,
  setCart, // Added prop
  setModalCart, // Added prop
}) => {
  const quantityInputRefs = useRef({});

  useEffect(() => {
    if (lastAddedProduct) {
      const key = `${lastAddedProduct.id}-${lastAddedProduct.product_type}`;
      const input = quantityInputRefs.current[key];
      if (input) {
        input.focus();
        input.select();
        setLastAddedProduct(null);
      }
    }
  }, [lastAddedProduct, setLastAddedProduct]);

  const handleChangeDiscount = (value) => {
    const newDiscount = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setChangeDiscount(newDiscount);
    const updatedCart = cart.map(item => ({
      ...item,
      discount: item.initialDiscount === 0 ? 0 : newDiscount, // Use initialDiscount to determine if discount stays 0
    }));
    if (isModal) {
      setModalCart(updatedCart);
    } else {
      setCart(updatedCart);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mobile:w-full">
        <label
          htmlFor="product-select"
          className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base"
        >
          Product
        </label>
        <Select
          id="product-select"
          value={selectedProduct}
          onChange={setSelectedProduct}
          options={products.map((p) => ({
            value: `${p.id}-${p.product_type}`,
            label: `${p.serial_number} - ${p.productname} (${p.product_type})`,
          }))}
          placeholder="Search for a product..."
          isClearable
          className="mobile:w-full onefifty:w-96 hundred:w-96"
          classNamePrefix="react-select"
          styles={selectStyles}
        />
        <button
          onClick={() => addToCart(isModal)}
          disabled={!selectedProduct}
          className={`mt-4 onefifty:w-50 hundred:w-50 h-10 text-white px-6 rounded-lg font-bold shadow ${!selectedProduct ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          style={styles.button}
        >
          Add to Cart
        </button>
      </div>
      <div className="flex flex-col items-center mobile:w-full">
        <label
          className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base"
        >
          Additional Discount (%)
        </label>
        <div className="flex items-center gap-4 mobile:w-full onefifty:w-96">
          <input
            type="number"
            value={additionalDiscount || ''}
            onChange={(e) => setAdditionalDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            placeholder="Enter additional discount (%)"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="1"
            style={styles.input}
          />
        </div>
      </div>
      <div className="flex flex-col items-center mobile:w-full">
        <label
          className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base"
        >
          Change Discount (%)
        </label>
        <div className="flex items-center gap-4 mobile:w-full onefifty:w-96">
          <input
            type="number"
            value={changeDiscount || ''}
            onChange={(e) => handleChangeDiscount(e.target.value)}
            placeholder="Enter change discount (%)"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="1"
            style={styles.input}
          />
          <button
            onClick={() => openNewProductModal(isModal)}
            className="h-10 text-white px-4 rounded-lg font-bold shadow bg-green-600 hover:bg-green-700"
            style={styles.button}
          >
            Add New Product
          </button>
        </div>
      </div>
      <div className={`overflow-x-auto ${isModal ? "overflow-y-auto max-h-[60vh] pr-2" : ""}`}>
        <table className="w-full border-collapse dark:bg-gray-800 dark:text-gray-100 bg-white shadow rounded-lg mobile:text-xs">
          <thead className="border">
            <tr className="hundred:text-lg mobile:text-sm">
              <th className="text-center border-r mobile:p-1">Product</th>
              <th className="text-center border-r mobile:p-1">Type</th>
              <th className="text-center border-r mobile:p-1">Price</th>
              <th className="text-center border-r mobile:p-1">Discount (%)</th>
              <th className="text-center border-r mobile:p-1">Qty</th>
              <th className="text-center border-r mobile:p-1">Total</th>
              <th className="text-center border-r mobile:p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.length ? (
              cart.map((item) => (
                <tr
                  key={`${item.id}-${item.product_type}`}
                  className="border border-gray-200 text-gray-900 dark:text-gray-100 mobile:text-sm"
                >
                  <td className="text-center border-r mobile:p-1">{item.productname}</td>
                  <td className="text-center border-r mobile:p-1">{item.product_type}</td>
                  <td className="text-center border-r mobile:p-1">
                    <input
                      type="number"
                      value={getEffectivePrice(item)}
                      onChange={(e) =>
                        updatePrice(item.id, item.product_type, Number.parseFloat(e.target.value) || 0, isModal)
                      }
                      min="0"
                      step="1"
                      className="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </td>
                  <td className="text-center border-r mobile:p-1">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) =>
                        updateDiscount(item.id, item.product_type, Number.parseFloat(e.target.value) || 0, isModal)
                      }
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-20 text-center bg-transparent border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </td>
                  <td className="text-center border-r mobile:p-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, item.product_type, Number.parseInt(e.target.value) || 0, isModal)
                      }
                      min="0"
                      ref={(el) => (quantityInputRefs.current[`${item.id}-${item.product_type}`] = el)}
                      className="w-16 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </td>
                  <td className="text-center border-r mobile:p-1">
                    ₹{Math.round(getEffectivePrice(item) * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                  </td>
                  <td className="text-center border-r mobile:p-1">
                    <button
                      onClick={() => removeFromCart(item.id, item.product_type, isModal)}
                      className="text-red-600 hover:text-red-800 font-bold mobile:text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-100 mobile:p-2 mobile:text-xs">
                  Cart is empty
                </td>
              </tr>
            )}
          </tbody>
          {cart.length > 0 && (
            <tfoot>
              {[
                { label: 'Net Rate', value: `₹${calculateNetRate(cart)}` },
                { label: 'You Save', value: `₹${calculateYouSave(cart)}` },
                { label: 'Processing Fee (3%)', value: `₹${calculateProcessingFee(cart)}` },
                additionalDiscount > 0 && {
                  label: 'Additional Discount',
                  value: `${additionalDiscount.toFixed(2)}%`,
                },
                { label: 'Total', value: `₹${calculateTotal(cart)}` },
              ]
                .filter(Boolean)
                .map(({ label, value }) => (
                  <tr key={label} className="dark:text-white">
                    <td colSpan="5" className="text-center font-bold mobile:p-1 text-xl">
                      {label}
                    </td>
                    <td colSpan="2" className="text-center font-bold mobile:p-1 text-xl">
                      {value}
                    </td>
                  </tr>
                ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// FormFields component for modal
const FormFields = ({
  isEdit,
  customers,
  modalSelectedCustomer,
  setModalSelectedCustomer,
  modalCart,
  setModalCart, // Added prop
  products,
  modalSelectedProduct,
  setModalSelectedProduct,
  addToCart,
  updateQuantity,
  updateDiscount,
  updatePrice,
  removeFromCart,
  calculateNetRate,
  calculateYouSave,
  calculateProcessingFee,
  calculateTotal,
  handleSubmit,
  closeModal,
  styles,
  modalAdditionalDiscount,
  setModalAdditionalDiscount,
  modalChangeDiscount,
  setModalChangeDiscount,
  openNewProductModal,
  modalLastAddedProduct,
  setModalLastAddedProduct,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center mobile:w-full">
      <label
        htmlFor="modal-customer-select"
        className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base"
      >
        Select Customer
      </label>
      <select
        id="modal-customer-select"
        value={modalSelectedCustomer}
        onChange={(e) => setModalSelectedCustomer(e.target.value)}
        className="onefifty:w-96 hundred:w-96 p-3 rounded-lg bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-full mobile:p-2 mobile:text-sm"
        style={styles.input}
      >
        <option value="">Select a customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} (
            {c.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : c.customer_type || "User"})
          </option>
        ))}
      </select>
    </div>
    <QuotationTableErrorBoundary>
      <QuotationTable
        cart={modalCart}
        setCart={setModalCart} // Pass setModalCart as setCart for modal context
        setModalCart={setModalCart} // Pass setModalCart explicitly
        products={products}
        selectedProduct={modalSelectedProduct}
        setSelectedProduct={setModalSelectedProduct}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        updateDiscount={updateDiscount}
        updatePrice={updatePrice}
        removeFromCart={removeFromCart}
        calculateNetRate={calculateNetRate}
        calculateYouSave={calculateYouSave}
        calculateProcessingFee={calculateProcessingFee}
        calculateTotal={calculateTotal}
        styles={styles}
        isModal={true}
        additionalDiscount={modalAdditionalDiscount}
        setAdditionalDiscount={setModalAdditionalDiscount}
        changeDiscount={modalChangeDiscount}
        setChangeDiscount={setModalChangeDiscount}
        openNewProductModal={openNewProductModal}
        lastAddedProduct={modalLastAddedProduct}
        setLastAddedProduct={setModalLastAddedProduct}
      />
    </QuotationTableErrorBoundary>
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={closeModal}
        className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!modalSelectedCustomer || !modalCart.length}
        className={`rounded-md px-4 py-2 text-sm text-white ${!modalSelectedCustomer || !modalCart.length ? "bg-gray-400 cursor-not-allowed" : isEdit ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}
      >
        {isEdit ? "Update Quotation" : "Confirm Booking"}
      </button>
    </div>
  </div>
);

// New Product Modal
const NewProductModal = ({ isOpen, onClose, onSubmit, newProductData, setNewProductData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProductData, setLocalProductData] = useState(newProductData);

  useEffect(() => {
    setLocalProductData(newProductData);
  }, [newProductData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localProductData,
      [name]: ['price', 'discount', 'quantity'].includes(name)
        ? value === '' ? '' : Number.parseFloat(value) || 0
        : value,
    };
    setLocalProductData(updatedData);
    setNewProductData(updatedData);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(localProductData);
      onClose();
    } catch (err) {
      console.error('NewProductModal: Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mobile:p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">Add New Product</h2>
        <div className="space-y-4">
          {[
            { name: "productname", label: "Product Name *", type: "text", placeholder: "Enter product name", required: true },
            { name: "price", label: "Price (₹) *", type: "number", placeholder: "Enter price", min: 0, step: 1, required: true },
            { name: "discount", label: "Discount (%)", type: "number", placeholder: "Enter discount", min: 0, max: 100, step: 0.01 },
            { name: "quantity", label: "Quantity *", type: "number", placeholder: "Enter quantity", min: 1, step: 1, required: true },
            { name: "per", label: "Unit (e.g., Box, Unit)", type: "text", placeholder: "Enter unit" },
          ].map(({ name, label, type, placeholder, min, max, step, required }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-1">{label}</label>
              <input
                name={name}
                type={type}
                value={localProductData[name] || ''}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={styles.input}
                {...{ min, max, step, required }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`rounded-md px-4 py-2 text-sm text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !localProductData.productname || localProductData.price === '' || localProductData.quantity === ''}
            className={`rounded-md px-4 py-2 text-sm text-white ${isSubmitting || !localProductData.productname || localProductData.price === '' || localProductData.quantity === '' ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            Add Product
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function Direct() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [quotationId, setQuotationId] = useState(null);
  const [isQuotationCreated, setIsQuotationCreated] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalCart, setModalCart] = useState([]);
  const [modalSelectedProduct, setModalSelectedProduct] = useState(null);
  const [modalSelectedCustomer, setModalSelectedCustomer] = useState("");
  const [orderId, setOrderId] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [modalAdditionalDiscount, setModalAdditionalDiscount] = useState(0);
  const [changeDiscount, setChangeDiscount] = useState(0);
  const [modalChangeDiscount, setModalChangeDiscount] = useState(0);
  const [newProductModalIsOpen, setNewProductModalIsOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    productname: '',
    price: '',
    discount: 0,
    quantity: 1,
    per: '',
  });
  const [newProductIsForModal, setNewProductIsForModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [modalLastAddedProduct, setModalLastAddedProduct] = useState(null);

  // Function to fetch quotations
  const fetchQuotations = async () => {
    try {
      const quotationsResponse = await axios.get(`${API_BASE_URL}/api/direct/quotations`);
      const data = Array.isArray(quotationsResponse.data) ? quotationsResponse.data : [];
      setQuotations(data.filter(q => q.quotation_id && q.quotation_id !== "undefined" && /^[a-zA-Z0-9-_]+$/.test(q.quotation_id)));
    } catch (err) {
      console.error("Failed to fetch quotations:", err.message);
      setError(`Failed to fetch quotations: ${err.message}`);
    }
  };

  // Initial data fetch and setup polling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersResponse, productsResponse, quotationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/direct/customers`),
          axios.get(`${API_BASE_URL}/api/direct/aproducts`),
          axios.get(`${API_BASE_URL}/api/direct/quotations`),
        ]);
        setCustomers(Array.isArray(customersResponse.data) ? customersResponse.data : []);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
        const data = Array.isArray(quotationsResponse.data) ? quotationsResponse.data : [];
        setQuotations(data.filter(q => q.quotation_id && q.quotation_id !== "undefined" && /^[a-zA-Z0-9-_]+$/.test(q.quotation_id)));
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchQuotations, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const addToCart = (isModal = false, customProduct = null) => {
    const targetCart = isModal ? modalCart : cart;
    const setTargetCart = isModal ? setModalCart : setCart;
    const targetSelectedProduct = isModal ? modalSelectedProduct : selectedProduct;
    const setTargetSelectedProduct = isModal ? setModalSelectedProduct : setSelectedProduct;
    const targetDiscount = isModal ? modalChangeDiscount : changeDiscount;
    const setTargetLastAddedProduct = isModal ? setModalLastAddedProduct : setLastAddedProduct;

    if (!customProduct && !targetSelectedProduct) {
      setError("Please select a product");
      return;
    }

    let product;
    if (customProduct) {
      product = {
        ...customProduct,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        product_type: 'custom',
        price: Math.round(Number(customProduct.price) || 0),
        quantity: Number.parseInt(customProduct.quantity) || 1,
        discount: Number.parseFloat(customProduct.discount) || targetDiscount,
        initialDiscount: Number.parseFloat(customProduct.discount) || targetDiscount, // Store initial discount
        per: customProduct.per || 'Unit',
      };
    } else {
      const [id, type] = targetSelectedProduct.value.split("-");
      product = products.find((p) => p.id.toString() === id && p.product_type === type);
      if (!product) {
        setError("Product not found");
        return;
      }
      product = {
        ...product,
        price: Math.round(Number(product.price) || 0),
        quantity: 1,
        discount: Number.parseFloat(product.discount) || targetDiscount,
        initialDiscount: Number.parseFloat(product.discount) || 0, // Store initial discount from product data
        per: product.per || 'Unit',
      };
    }

    setTargetCart((prev) => {
      const exists = prev.find((item) => item.id === product.id && item.product_type === product.product_type);
      return exists
        ? prev.map((item) =>
            item.id === product.id && item.product_type === product.product_type
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...prev, product];
    });
    setTargetSelectedProduct(null);
    setTargetLastAddedProduct({ id: product.id, product_type: product.product_type });
    setError("");
  };

  const updateQuantity = (id, type, quantity, isModal = false) => {
    const setTargetCart = isModal ? setModalCart : setCart;
    setTargetCart((prev) =>
      prev.map((item) =>
        item.id === id && item.product_type === type ? { ...item, quantity: quantity < 0 ? 0 : quantity } : item,
      ),
    );
  };

  const updateDiscount = (id, type, discount, isModal = false) => {
    const setTargetCart = isModal ? setModalCart : setCart;
    setTargetCart((prev) =>
      prev.map((item) =>
        item.id === id && item.product_type === type
          ? { ...item, discount: discount < 0 ? 0 : discount > 100 ? 100 : discount }
          : item,
      ),
    );
  };

  const updatePrice = (id, type, price, isModal = false) => {
    const setTargetCart = isModal ? setModalCart : setCart;
    setTargetCart((prev) =>
      prev.map((item) =>
        item.id === id && item.product_type === type ? { ...item, price: price < 0 ? 0 : price } : item,
      ),
    );
  };

  const removeFromCart = (id, type, isModal = false) => {
    const setTargetCart = isModal ? setModalCart : setCart;
    setTargetCart((prev) => prev.filter((item) => !(item.id === id && item.product_type === type)));
  };

  const calculateNetRate = (targetCart = []) =>
    targetCart.reduce((total, item) => total + getEffectivePrice(item) * item.quantity, 0).toFixed(2);

  const calculateYouSave = (targetCart = []) =>
    targetCart.reduce((total, item) => total + getEffectivePrice(item) * (item.discount / 100) * item.quantity, 0).toFixed(2);

  const calculateProcessingFee = (targetCart = [], additionalDiscount = 0) => {
    const subtotal = targetCart.reduce(
      (total, item) => total + getEffectivePrice(item) * (1 - item.discount / 100) * item.quantity,
      0,
    );
    const discountedSubtotal = subtotal * (1 - additionalDiscount / 100);
    return (discountedSubtotal * 0.03).toFixed(2); // 3% processing fee
  };

  const calculateTotal = (targetCart = [], additionalDiscount = 0) => {
    const subtotal = targetCart.reduce(
      (total, item) => total + getEffectivePrice(item) * (1 - item.discount / 100) * item.quantity,
      0,
    );
    const discountedSubtotal = subtotal * (1 - additionalDiscount / 100);
    const processingFee = discountedSubtotal * 0.03;
    return (discountedSubtotal + processingFee).toFixed(2);
  };

  const createQuotation = async () => {
    if (!selectedCustomer || !cart.length) return setError("Customer and products are required");
    if (cart.some((item) => item.quantity === 0)) return setError("Please remove products with zero quantity");

    const customer = customers.find((c) => c.id.toString() === selectedCustomer);
    if (!customer) return setError("Invalid customer");

    const quotation_id = `QUO-${Date.now()}`;
    try {
      const subtotal = Number.parseFloat(calculateNetRate(cart)) - Number.parseFloat(calculateYouSave(cart));
      const discountedSubtotal = subtotal * (1 - additionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.03;
      const payload = {
        customer_id: Number(selectedCustomer),
        quotation_id,
        products: cart.map((item) => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: getEffectivePrice(item),
          discount: Number.parseFloat(item.discount) || 0,
          quantity: Number.parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: Number.parseFloat(calculateNetRate(cart)),
        you_save: Number.parseFloat(calculateYouSave(cart)),
        processing_fee: processingFee,
        total: Number.parseFloat(calculateTotal(cart, additionalDiscount)),
        promo_discount: 0,
        additional_discount: Number.parseFloat(additionalDiscount.toFixed(2)),
        customer_type: customer.customer_type || "User",
        customer_name: customer.name,
        address: customer.address,
        mobile_number: customer.mobile_number,
        email: customer.email,
        district: customer.district,
        state: customer.state,
        status: "pending",
      };

      const response = await axios.post(`${API_BASE_URL}/api/direct/quotations`, payload);
      const newQuotationId = response.data.quotation_id;
      console.log("Created quotation with ID:", newQuotationId); // Debug log
      if (!newQuotationId || newQuotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(newQuotationId)) {
        throw new Error("Invalid quotation ID returned from server");
      }

      setQuotationId(newQuotationId);
      setIsQuotationCreated(true);
      setSuccessMessage("Quotation created successfully! Check downloads for PDF.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations((prev) => [
        {
          ...payload,
          created_at: new Date().toISOString(),
          customer_name: customer.name || "N/A",
          total: payload.total,
        },
        ...prev,
      ]);

      console.log("Fetching PDF for quotation_id:", newQuotationId); // Debug log
      const pdfResponse = await axios.get(`${API_BASE_URL}/api/direct/quotation/${newQuotationId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      const safeCustomerName = (customer.name || "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      link.setAttribute("download", `${safeCustomerName}-${newQuotationId}-quotation.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Reset state after successful PDF download
      setCart([]);
      setSelectedCustomer("");
      setSelectedProduct(null);
      setAdditionalDiscount(0);
      setChangeDiscount(0);
      setLastAddedProduct(null);
      setQuotationId(null);
      setIsQuotationCreated(false);
    } catch (err) {
      console.error("Create quotation error:", err); // Debug log
      setError(`Failed to create quotation: ${err.response?.data?.message || err.message}`);
    }
  };

  const editQuotation = async (quotation = null) => {
    if (quotation) {
      // Validate quotation_id before proceeding
      if (!quotation.quotation_id || quotation.quotation_id === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotation.quotation_id)) {
        setError("Invalid or missing quotation ID");
        return;
      }

      setModalMode("edit");
      setModalSelectedCustomer(quotation.customer_id?.toString() || "");
      setQuotationId(quotation.quotation_id);
      setModalAdditionalDiscount(Number.parseFloat(quotation.additional_discount) || 0);
      setModalChangeDiscount(0);
      try {
        const products = typeof quotation.products === "string" ? JSON.parse(quotation.products) : quotation.products;
        setModalCart(
          Array.isArray(products)
            ? products.map((p) => ({
                ...p,
                price: Number.parseFloat(p.price) || 0,
                discount: Number.parseFloat(p.discount) || 0,
                initialDiscount: Number.parseFloat(p.discount) || 0, // Preserve initial discount
                quantity: Number.parseInt(p.quantity) || 0,
                per: p.per || 'Unit',
              }))
            : [],
        );
      } catch (e) {
        setModalCart([]);
        setError("Failed to parse quotation products");
        return;
      }
      setModalIsOpen(true);
      return;
    }

    if (!modalSelectedCustomer || !modalCart.length) return setError("Customer and products are required");
    if (modalCart.some((item) => item.quantity === 0)) return setError("Please remove products with zero quantity");
    if (!customers.length) return setError("Customer data is not loaded. Please try again.");
    if (!quotationId || quotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotationId)) {
      setError("Invalid or missing quotation ID");
      return;
    }

    try {
      const customer = customers.find((c) => c.id.toString() === modalSelectedCustomer);
      if (!customer) return setError("Invalid customer");

      const subtotal = Number.parseFloat(calculateNetRate(modalCart)) - Number.parseFloat(calculateYouSave(modalCart));
      const discountedSubtotal = subtotal * (1 - modalAdditionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.03;
      const payload = {
        customer_id: Number(modalSelectedCustomer),
        products: modalCart.map((item) => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: getEffectivePrice(item),
          discount: Number.parseFloat(item.discount) || 0,
          quantity: Number.parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: Number.parseFloat(calculateNetRate(modalCart)),
        you_save: Number.parseFloat(calculateYouSave(modalCart)),
        processing_fee: processingFee,
        total: Number.parseFloat(calculateTotal(modalCart, modalAdditionalDiscount)),
        promo_discount: 0,
        additional_discount: Number.parseFloat(modalAdditionalDiscount.toFixed(2)),
        status: "pending",
      };

      const response = await axios.put(`${API_BASE_URL}/api/direct/quotations/${quotationId}`, payload);
      const updatedQuotationId = response.data.quotation_id;
      console.log("Updated quotation with ID:", updatedQuotationId); // Debug log
      if (!updatedQuotationId || updatedQuotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(updatedQuotationId)) {
        throw new Error("Invalid quotation ID returned from server");
      }

      setSuccessMessage("Quotation updated successfully! Check downloads for PDF.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations((prev) =>
        prev.map((q) =>
          q.quotation_id === quotationId
            ? {
                ...q,
                ...payload,
                customer_name: customer.name || "N/A",
                total: payload.total,
              }
            : q,
        ),
      );

      console.log("Fetching PDF for quotation_id:", updatedQuotationId); // Debug log
      const pdfResponse = await axios.get(`${API_BASE_URL}/api/direct/quotation/${updatedQuotationId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      const safeCustomerName = (customer.name || "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      link.setAttribute("download", `${safeCustomerName}-${updatedQuotationId}-quotation.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Reset modal state after successful PDF download
      closeModal();
    } catch (err) {
      console.error("Edit quotation error:", err); // Debug log
      setError(`Failed to update quotation: ${err.response?.data?.message || err.message}`);
    }
  };

  const convertToBooking = async (quotation = null) => {
    if (quotation) {
      // Validate quotation_id before proceeding
      if (!quotation.quotation_id || quotation.quotation_id === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotation.quotation_id)) {
        setError("Invalid or missing quotation ID");
        return;
      }

      setModalMode("book");
      setModalSelectedCustomer(quotation.customer_id?.toString() || "");
      setQuotationId(quotation.quotation_id);
      setOrderId(`ORD-${Date.now()}`);
      setModalAdditionalDiscount(Number.parseFloat(quotation.additional_discount) || 0);
      setModalChangeDiscount(0);
      try {
        const products = typeof quotation.products === "string" ? JSON.parse(quotation.products) : quotation.products;
        setModalCart(
          Array.isArray(products)
            ? products.map((p) => ({
                ...p,
                price: Number.parseFloat(p.price) || 0,
                discount: Number.parseFloat(p.discount) || 0,
                initialDiscount: Number.parseFloat(p.discount) || 0, // Preserve initial discount
                quantity: Number.parseInt(p.quantity) || 0,
                per: p.per || 'Unit',
              }))
            : [],
        );
      } catch (e) {
        setModalCart([]);
        setError("Failed to parse quotation products");
        return;
      }
      setModalIsOpen(true);
      return;
    }

    if (!modalSelectedCustomer || !modalCart.length || !orderId)
      return setError("Customer, products, and order ID are required");
    if (modalCart.some((item) => item.quantity === 0)) return setError("Please remove products with zero quantity");
    if (!quotationId || quotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotationId)) {
      setError("Invalid or missing quotation ID");
      return;
    }

    const customer = customers.find((c) => c.id.toString() === modalSelectedCustomer);
    if (!customer) return setError("Invalid customer");

    try {
      const subtotal = Number.parseFloat(calculateNetRate(modalCart)) - Number.parseFloat(calculateYouSave(modalCart));
      const discountedSubtotal = subtotal * (1 - modalAdditionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.03;
      const payload = {
        customer_id: Number(modalSelectedCustomer),
        order_id: orderId,
        quotation_id: quotationId,
        products: modalCart.map((item) => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: getEffectivePrice(item),
          discount: Number.parseFloat(item.discount) || 0,
          quantity: Number.parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: Number.parseFloat(calculateNetRate(modalCart)),
        you_save: Number.parseFloat(calculateYouSave(modalCart)),
        processing_fee: processingFee,
        total: Number.parseFloat(calculateTotal(modalCart, modalAdditionalDiscount)),
        promo_discount: 0,
        additional_discount: Number.parseFloat(modalAdditionalDiscount.toFixed(2)),
        customer_type: customer.customer_type || "User",
        customer_name: customer.name,
        address: customer.address,
        mobile_number: customer.mobile_number,
        email: customer.email,
        district: customer.district,
        state: customer.state,
      };

      const response = await axios.post(`${API_BASE_URL}/api/direct/bookings`, payload);
      console.log("Created booking with order_id:", response.data.order_id); // Debug log
      setSuccessMessage("Booking created successfully! Check downloads for PDF.");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations((prev) => prev.map((q) => (q.quotation_id === quotationId ? { ...q, status: "booked" } : q)));

      console.log("Fetching invoice for order_id:", response.data.order_id); // Debug log
      const pdfResponse = await axios.get(`${API_BASE_URL}/api/direct/invoice/${response.data.order_id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      const safeCustomerName = (customer.name || "unknown")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      link.setAttribute("download", `${safeCustomerName}-${response.data.order_id}-invoice.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Reset modal state after successful PDF download
      closeModal();
    } catch (err) {
      console.error("Convert to booking error:", err); // Debug log
      setError(`Failed to create booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const cancelQuotation = async (quotationIdToCancel = null) => {
    const targetQuotationId = quotationIdToCancel || quotationId;
    if (!targetQuotationId || targetQuotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(targetQuotationId)) {
      setError("Invalid or missing quotation ID");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/direct/quotations/cancel/${targetQuotationId}`);
      if (!quotationIdToCancel) {
        setCart([]);
        setSelectedCustomer("");
        setSelectedProduct(null);
        setQuotationId(null);
        setIsQuotationCreated(false);
        setAdditionalDiscount(0);
        setChangeDiscount(0);
        setLastAddedProduct(null);
      }
      setSuccessMessage("Quotation canceled successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setQuotations((prev) =>
        prev.map((q) => (q.quotation_id === targetQuotationId ? { ...q, status: "cancelled" } : q)),
      );
    } catch (err) {
      console.error("Failed to cancel quotation:", err.response?.data || err.message);
      setError(`Failed to cancel quotation: ${err.response?.data?.message || err.message}`);
    }
  };

  const openNewProductModal = (isModal = false) => {
    setNewProductIsForModal(isModal);
    setNewProductModalIsOpen(true);
    setNewProductData({ productname: '', price: '', discount: isModal ? modalChangeDiscount : changeDiscount, quantity: 1, per: '' });
  };

  const closeNewProductModal = () => {
    setNewProductModalIsOpen(false);
    setNewProductData({ productname: '', price: '', discount: 0, quantity: 1, per: '' });
    setError("");
  };

  const handleAddNewProduct = (productData) => {
    if (!productData.productname) return setError("Product name is required");
    if (productData.price === '' || productData.price < 0) return setError("Price must be a non-negative number");
    if (productData.quantity === '' || productData.quantity < 1) return setError("Quantity must be at least 1");
    if (productData.discount < 0 || productData.discount > 100) return setError("Discount must be between 0 and 100");

    addToCart(newProductIsForModal, {
      ...productData,
      price: Number.parseFloat(productData.price) || 0,
      discount: Number.parseFloat(productData.discount) || 0,
      quantity: Number.parseInt(productData.quantity) || 1,
    });
    closeNewProductModal();
  };

  const renderSelect = (value, onChange, options, label, placeholder, id) => (
    <div className="flex flex-col items-center mobile:w-full">
      <label htmlFor={id} className="text-lg font-semibold text-gray-700 mb-2 mobile:text-base">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="onefifty:w-96 hundred:w-96 p-3 rounded-lg bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-full mobile:p-2 mobile:text-sm"
        style={styles.input}
      >
        <option value="">{placeholder}</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} (
            {c.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : c.customer_type || "User"})
          </option>
        ))}
      </select>
    </div>
  );

  const closeModal = () => {
    setModalIsOpen(false);
    setModalMode(null);
    setModalCart([]);
    setModalSelectedCustomer("");
    setModalSelectedProduct(null);
    setOrderId("");
    setModalAdditionalDiscount(0);
    setModalChangeDiscount(0);
    setModalLastAddedProduct(null);
    setError("");
    setSuccessMessage("");
    // Note: Do not reset quotationId here to avoid race condition with PDF fetch
  };

  return (
    <div className="flex min-h-screen dark:bg-gray-800 bg-gray-50 mobile:flex-col">
      <Sidebar />
      <Logout />
      <div className="flex-1 hundred:ml-64 p-6 pt-16 mobile:p-2">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 mobile:text-2xl dark:text-gray-100">
            Direct Booking
          </h1>
          {loading && <div className="text-center text-gray-500">Loading...</div>}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg mb-6 text-center shadow-md mobile:text-sm mobile:px-3 mobile:py-2">
              {error}
            </div>
          )}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg mb-6 text-center shadow-md mobile:text-sm mobile:px-3 mobile:py-2">
              {successMessage}
            </div>
          )}
          <div className="flex flex-wrap gap-6 justify-center mb-8 mobile:flex-col mobile:gap-3">
            {renderSelect(
              selectedCustomer,
              (e) => setSelectedCustomer(e.target.value),
              customers,
              "Select Customer",
              "Select a customer",
              "main-customer-select",
            )}
            <QuotationTableErrorBoundary>
              <QuotationTable
                cart={cart}
                setCart={setCart} // Pass setCart for main table
                setModalCart={setModalCart} // Pass setModalCart (not used in main table but included for consistency)
                products={products}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                updateDiscount={updateDiscount}
                updatePrice={updatePrice}
                removeFromCart={removeFromCart}
                calculateNetRate={calculateNetRate}
                calculateYouSave={calculateYouSave}
                calculateProcessingFee={calculateProcessingFee}
                calculateTotal={calculateTotal}
                styles={styles}
                additionalDiscount={additionalDiscount}
                setAdditionalDiscount={setAdditionalDiscount}
                changeDiscount={changeDiscount}
                setChangeDiscount={setChangeDiscount}
                openNewProductModal={openNewProductModal}
                lastAddedProduct={lastAddedProduct}
                setLastAddedProduct={setLastAddedProduct}
              />
            </QuotationTableErrorBoundary>
          </div>
          <div className="flex justify-center gap-4 mt-8 mobile:mt-4 mobile:flex-col">
            <button
              onClick={createQuotation}
              disabled={!selectedCustomer || !cart.length}
              className={`onefifty:w-50 hundred:w-50 h-10 text-white px-8 rounded-lg font-bold shadow ${!selectedCustomer || !cart.length ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              style={styles.button}
            >
              Create Quotation
            </button>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 mobile:text-xl">All Quotations</h2>
            {quotations.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mobile:gap-4">
                {quotations.map((quotation) => (
                  <div key={quotation.quotation_id} className="p-6 rounded-lg shadow-lg" style={styles.card}>
                    <h3 className="text-lg font-bold mb-2 mobile:text-base text-gray-900">{quotation.quotation_id}</h3>
                    <p className="text-sm mb-1 mobile:text-xs text-gray-900">
                      <span className="font-semibold">Customer:</span> {quotation.customer_name || "N/A"}
                    </p>
                    <p className="text-sm mb-1 mobile:text-xs text-gray-900">
                      <span className="font-semibold">Total:</span> ₹{Number.parseFloat(quotation.total).toFixed(2)}
                    </p>
                    <p className="text-sm mb-1 mobile:text-xs text-gray-900">
                      <span className="font-semibold">Status:</span>
                      <span
                        className={`capitalize ${quotation.status === "pending" ? "text-yellow-600" : quotation.status === "booked" ? "text-green-600" : "text-red-600"}`}
                      >
                        {quotation.status}
                      </span>
                    </p>
                    <p className="text-sm mb-4 mobile:text-xs text-gray-900">
                      <span className="font-semibold">Created At:</span>
                      {new Date(quotation.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex gap-2 mobile:flex-col">
                      <button
                        onClick={() => editQuotation(quotation)}
                        disabled={quotation.status !== "pending"}
                        className={`flex-1 text-white px-4 py-2 rounded-lg font-bold text-sm ${quotation.status !== "pending" ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => convertToBooking(quotation)}
                        disabled={quotation.status !== "pending"}
                        className={`flex-1 text-white px-4 py-2 rounded-lg font-bold text-sm ${quotation.status !== "pending" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        Convert to Booking
                      </button>
                      <button
                        onClick={() => cancelQuotation(quotation.quotation_id)}
                        disabled={quotation.status !== "pending"}
                        className={`flex-1 text-white px-4 py-2 rounded-lg font-bold text-sm ${quotation.status !== "pending" ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 mobile:p-2 mobile:text-xs">No quotations available</div>
            )}
          </div>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-black/50"
            key="quotation-modal"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mobile:p-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
                {modalMode === "edit" ? "Edit Quotation" : "Convert to Booking"}
              </h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg mb-6 text-center shadow-md mobile:text-sm mobile:px-3 mobile:py-2">
                  {error}
                </div>
              )}
              {modalMode === "book" && (
                <div className="flex flex-col items-center mobile:w-full mb-6">
                  <label
                    htmlFor="order-id"
                    className="text-lg font-semibold dark:text-gray-100 text-gray-700 mb-2 mobile:text-base"
                  >
                    Order ID
                  </label>
                  <input
                    id="order-id"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="onefifty:w-96 hundred:w-96 p-3 rounded-lg bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-full mobile:p-2 mobile:text-sm"
                    style={styles.input}
                    placeholder="Enter Order ID"
                  />
                </div>
              )}
              <FormFields
                isEdit={modalMode === "edit"}
                customers={customers}
                modalSelectedCustomer={modalSelectedCustomer}
                setModalSelectedCustomer={setModalSelectedCustomer}
                modalCart={modalCart}
                setModalCart={setModalCart} // Pass setModalCart to FormFields
                products={products}
                modalSelectedProduct={modalSelectedProduct}
                setModalSelectedProduct={setModalSelectedProduct}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                updateDiscount={updateDiscount}
                updatePrice={updatePrice}
                removeFromCart={removeFromCart}
                calculateNetRate={calculateNetRate}
                calculateYouSave={calculateYouSave}
                calculateProcessingFee={calculateProcessingFee}
                calculateTotal={calculateTotal}
                handleSubmit={modalMode === "edit" ? () => editQuotation() : () => convertToBooking()}
                closeModal={closeModal}
                styles={styles}
                modalAdditionalDiscount={modalAdditionalDiscount}
                setModalAdditionalDiscount={setModalAdditionalDiscount}
                modalChangeDiscount={modalChangeDiscount}
                setModalChangeDiscount={setModalChangeDiscount}
                openNewProductModal={openNewProductModal}
                modalLastAddedProduct={modalLastAddedProduct}
                setModalLastAddedProduct={setModalLastAddedProduct}
              />
            </div>
          </Modal>
          <NewProductModal
            isOpen={newProductModalIsOpen}
            onClose={closeNewProductModal}
            onSubmit={handleAddNewProduct}
            newProductData={newProductData}
            setNewProductData={setNewProductData}
          />
        </div>
      </div>
    </div>
  );
}