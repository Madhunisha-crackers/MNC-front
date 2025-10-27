import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';
import '../../App.css';
import { API_BASE_URL } from '../../../Config';
import Sidebar from '../Sidebar/Sidebar';
import Logout from '../Logout';
import { FaEdit, FaArrowRight, FaTrash, FaDownload, FaSearch, FaCamera } from 'react-icons/fa';
import Select from 'react-select';
import Tesseract from 'tesseract.js';
import Webcam from 'react-webcam'; // Correct import

// Set app element for accessibility
Modal.setAppElement("#root");

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

// Error Boundary for Direct component
class DirectErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by DirectErrorBoundary:", error, errorInfo);
    console.log("Error stack:", error.stack);
    console.log("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg text-center shadow-md">
          An error occurred in the Direct Booking component: {this.state.error?.message || 'Unknown error'}. Please refresh the page or contact support.
        </div>
      );
    }
    return this.props.children;
  }
}

// Error Boundary for QuotationTable
class QuotationTableErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by QuotationTableErrorBoundary:", error, errorInfo);
    console.log("Error stack:", error.stack);
    console.log("Component stack:", errorInfo.componentStack);
    console.log("Products prop:", this.props.products);
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

// Shared styles
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


const QuotationTable = ({
  cart = [],
  products = [],
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
  setCart,
  setModalCart,
}) => {
  const quantityInputRefs = useRef({});
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanError, setScanError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef(null);

  // Filter out invalid products
  const validProducts = products.filter(
    (p) =>
      p != null &&
      typeof p === 'object' &&
      typeof p.product_type === 'string' &&
      typeof p.productname === 'string' &&
      typeof p.id !== 'undefined'
  );

  // Define product types
  const productTypes = [
    'all',
    ...new Set(
      validProducts
        .map((p) => p.product_type)
        .filter((type) => typeof type === 'string')
    ),
  ];

  // Filter products based on search and selected type
  const filteredProducts = validProducts.filter(
    (p) =>
      (selectedType === 'all' || p.product_type === selectedType) &&
      (p.productname.toLowerCase().includes(search.toLowerCase()) ||
        (p.serial_number && typeof p.serial_number === 'string' && p.serial_number.toLowerCase().includes(search.toLowerCase())))
  );

  // Focus on quantity input after adding product
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

  // Handle image capture
  const captureImage = async () => {
    if (!webcamRef.current) return;

    try {
      setIsProcessing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setScanError('Failed to capture image');
        setIsProcessing(false);
        return;
      }
      setCapturedImage(imageSrc);

      // Process the captured image for OCR
      await processImageForOCR(imageSrc);
    } catch (err) {
      console.error('Capture error:', err);
      setScanError('Failed to capture image');
      setIsProcessing(false);
    }
  };

  // Process image with Tesseract.js
  const processImageForOCR = async (imageSrc) => {
    if (!imageSrc) return;

    try {
      setIsScanning(true);

      const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng', {
        tessedit_char_whitelist: '0123456789', // Restrict to numbers
      });

      const number = text.trim().match(/^\d+$/); // Match pure numbers
      if (number) {
        console.log('Detected number:', number[0]);
        const matchedProduct = validProducts.find(
          (p) => p.serial_number && p.serial_number.toString() === number[0].toString()
        );

        if (matchedProduct) {
          addToCart(isModal, matchedProduct, false, 1);

          // Play success sound
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
          } catch (soundErr) {
            console.log('Sound not supported');
          }

          setScanError('Product added successfully!');
          setTimeout(() => setScanError(''), 3000);
          // Clear captured image to prepare for next scan
          setCapturedImage(null);
        } else {
          setScanError(`No product found for number: ${number[0]}`);
          setTimeout(() => setScanError(''), 3000);
          setCapturedImage(null);
        }
      } else {
        setScanError('No number detected in the image');
        setTimeout(() => setScanError(''), 3000);
        setCapturedImage(null);
      }
    } catch (err) {
      console.error('Tesseract error:', err);
      setScanError('Failed to process image. Please try again.');
      setTimeout(() => setScanError(''), 3000);
      setCapturedImage(null);
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  // Handle manual number input as fallback
  const handleManualNumberInput = (e) => {
    if (e.key === 'Enter') {
      const number = e.target.value.trim();
      if (number) {
        const matchedProduct = validProducts.find(
          (p) => p.serial_number && p.serial_number.toString() === number
        );

        if (matchedProduct) {
          addToCart(isModal, matchedProduct, false, 1);
          setScanError('Product added successfully!');
          setTimeout(() => setScanError(''), 3000);
          e.target.value = '';
        } else {
          setScanError(`No product found for number: ${number}`);
          setTimeout(() => setScanError(''), 3000);
          e.target.value = '';
        }
      }
    }
  };

  const handleQuantityKeyDown = (e, id, product_type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('product-search')?.focus();
    }
  };

  const handleChangeDiscount = (value) => {
    const newDiscount = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setChangeDiscount(newDiscount);
    const updatedCart = cart.map(item => ({
      ...item,
      discount: item.initialDiscount === 0 ? 0 : newDiscount,
    }));
    if (isModal) {
      setModalCart(updatedCart);
    } else {
      setCart(updatedCart);
    }
  };

  const handleCloseCamera = () => {
    setCameraOpen(false);
    setCapturedImage(null);
    setScanError('');
  };

  return (
    <div className="space-y-4">
      {/* Product Grid Section */}
      <div className="flex flex-col items-center mobile:w-full">
        <label className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base">
          Select Product
        </label>
        <div className="flex flex-col gap-4 w-full max-w-3xl">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mobile:w-full">
            <FaSearch className="text-gray-500" />
            <input
              id="product-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or serial number..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile:text-sm"
              style={styles.input}
            />
            <button
              onClick={() => setCameraOpen(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mobile:p-1.5"
              title="Scan Number"
            >
              <FaCamera />
            </button>
          </div>
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } mobile:px-2 mobile:py-1 mobile:text-xs`}
                style={styles.button}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={`${product.id}-${product.product_type}`}
                  className="p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100 mobile:p-2"
                  style={styles.card}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-800 mobile:text-base">
                    {product.productname}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-900 mobile:text-xs">
                    Serial: {product.serial_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-800 mobile:text-xs">
                    Type: {product.product_type}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-800 mobile:text-xs">
                    Price: ₹{getEffectivePrice(product).toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(isModal, product, false, 1)}
                    className="mt-2 w-full text-white px-4 py-2 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 mobile:px-2 mobile:py-1 mobile:text-xs"
                    style={styles.button}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 mobile:text-xs">
                No products found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Discount */}
      <div className="flex flex-col items-center mobile:w-full">
        <label className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base">
          Additional Discount (%)
        </label>
        <div className="flex items-center gap-4 mobile:w-full onefifty:w-96">
          <input
            type="number"
            value={additionalDiscount || ''}
            onChange={(e) => setAdditionalDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            placeholder="Enter additional discount (%)"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile:text-sm"
            min="0"
            max="100"
            step="1"
            style={styles.input}
          />
        </div>
      </div>

      {/* Change Discount */}
      <div className="flex flex-col items-center mobile:w-full">
        <label className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base">
          Change Discount (%)
        </label>
        <div className="flex items-center gap-4 mobile:w-full onefifty:w-96">
          <input
            type="number"
            value={changeDiscount || ''}
            onChange={(e) => handleChangeDiscount(e.target.value)}
            placeholder="Enter change discount (%)"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mobile:text-sm"
            min="0"
            max="100"
            step="1"
            style={styles.input}
          />
          <button
            onClick={() => openNewProductModal(isModal)}
            className="h-10 text-white px-4 rounded-lg font-bold shadow bg-green-600 hover:bg-green-700 mobile:px-2 mobile:text-xs"
            style={styles.button}
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Cart Table */}
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
                      className="w-20 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-16 mobile:text-xs"
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
                      className="w-20 text-center bg-transparent border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-16 mobile:text-xs"
                    />
                  </td>
                  <td className="text-center border-r mobile:p-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, item.product_type, Number.parseInt(e.target.value) || 0, isModal)
                      }
                      onKeyDown={(e) => handleQuantityKeyDown(e, item.id, item.product_type)}
                      min="0"
                      ref={(el) => (quantityInputRefs.current[`${item.id}-${item.product_type}`] = el)}
                      className="w-16 text-center border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 mobile:w-12 mobile:text-xs"
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
                { label: 'Processing Fee (1%)', value: `₹${calculateProcessingFee(cart, additionalDiscount)}` },
                additionalDiscount > 0 && {
                  label: 'Additional Discount',
                  value: `${additionalDiscount.toFixed(2)}%`,
                },
                { label: 'Total', value: `₹${calculateTotal(cart, additionalDiscount)}` },
              ]
                .filter(Boolean)
                .map(({ label, value }) => (
                  <tr key={label} className="dark:text-white">
                    <td colSpan="5" className="text-center font-bold mobile:p-1 text-xl mobile:text-base">
                      {label}
                    </td>
                    <td colSpan="2" className="text-center font-bold mobile:p-1 text-xl mobile:text-base">
                      {value}
                    </td>
                  </tr>
                ))}
            </tfoot>
          )}
        </table>
      </div>

      {/* Camera Capture Modal */}
      <Modal
        isOpen={cameraOpen}
        onRequestClose={handleCloseCamera}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black/50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full relative mobile:p-4">
          <button
            onClick={handleCloseCamera}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 mobile:text-sm"
          >
            ×
          </button>
          <h2 className="text-xl font-semibold text-center mb-4 mobile:text-base">Scan Product Number</h2>

          {scanError && (
            <div className={`px-4 py-2 rounded mb-4 text-center ${scanError.includes('successfully') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'} mobile:text-sm`}>
              {scanError}
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            {/* Webcam Component */}
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: 'environment'
                }}
                className="w-full h-64 bg-black rounded-lg object-cover mobile:h-48"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <div className="text-white text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm">{isScanning ? 'Scanning...' : 'Processing...'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Capture Button */}
            <button
              onClick={captureImage}
              disabled={isProcessing || isScanning}
              className={`px-6 py-2 rounded-lg font-bold text-white ${
                isProcessing || isScanning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={styles.button}
            >
              {isScanning ? 'Scanning...' : 'Capture & Scan'}
            </button>

            {/* Manual Input Fallback */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter number manually:
              </label>
              <input
                type="text"
                placeholder="Enter serial number and press Enter"
                onKeyDown={handleManualNumberInput}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={styles.input}
                disabled={isProcessing || isScanning}
              />
            </div>

            {/* Captured Image Preview (if any) */}
            {capturedImage && (
              <div className="w-full max-w-xs">
                <p className="text-sm text-gray-600 mb-2 text-center">Captured Image:</p>
                <img src={capturedImage} alt="Captured" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center mobile:text-xs">
              Point camera at product sticker and tap "Capture & Scan"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// FormFields component
const FormFields = ({
  isEdit,
  customers,
  modalSelectedCustomer,
  setModalSelectedCustomer,
  modalCart,
  setModalCart,
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
      <Select
        id="modal-customer-select"
        value={modalSelectedCustomer}
        onChange={setModalSelectedCustomer}
        options={customers.map((c) => ({
          value: c.id.toString(),
          label: `${c.name} (${c.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : c.customer_type || "User"} - ${c.district || "N/A"})`,
        }))}
        placeholder="Search for a customer..."
        isClearable
        className="mobile:w-full onefifty:w-96 hundred:w-96"
        classNamePrefix="react-select"
        styles={selectStyles}
      />
    </div>
    <QuotationTableErrorBoundary>
      <QuotationTable
        cart={modalCart}
        setCart={setModalCart}
        setModalCart={setModalCart}
        products={products || []} // Ensure products is an array
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
            { name: "product_type", label: "Product Type *", type: "text", placeholder: "Enter product type", required: true },
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
            disabled={isSubmitting || !localProductData.productname || localProductData.price === '' || localProductData.quantity === '' || !localProductData.product_type}
            className={`rounded-md px-4 py-2 text-sm text-white ${isSubmitting || !localProductData.productname || localProductData.price === '' || localProductData.quantity === '' || !localProductData.product_type ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            Add Product
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Cancel Confirmation Modal
const CancelConfirmModal = ({ isOpen, onClose, onConfirm, quotationId }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    className="fixed inset-0 flex items-center justify-center p-4"
    overlayClassName="fixed inset-0 bg-black/50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mobile:p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Confirm Cancellation
      </h3>
      <p className="text-gray-700 dark:text-gray-200 mb-6">
        Are you sure you want to cancel quotation <strong>{quotationId}</strong>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          No, Keep It
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </Modal>
);

// PDF Download Confirm Modal
const PDFDownloadConfirmModal = ({ isOpen, onClose, onYes, fileName }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    className="fixed inset-0 flex items-center justify-center p-4"
    overlayClassName="fixed inset-0 bg-black/50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mobile:p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Download PDF
      </h3>
      <p className="text-gray-700 dark:text-gray-200 mb-6">
        Quotation created/updated successfully. Do you want to download the PDF now?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          No
        </button>
        <button
          onClick={onYes}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          Yes, Download
        </button>
      </div>
    </div>
  </Modal>
);

export default function Direct() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]); // Initialize as empty array
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
  const [modalSelectedCustomer, setModalSelectedCustomer] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [modalAdditionalDiscount, setModalAdditionalDiscount] = useState(0);
  const [modalChangeDiscount, setModalChangeDiscount] = useState(0);
  const [newProductModalIsOpen, setNewProductModalIsOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    productname: '',
    price: '',
    discount: 0,
    quantity: 1,
    per: '',
    product_type: 'custom',
  });
  const [newProductIsForModal, setNewProductIsForModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [modalLastAddedProduct, setModalLastAddedProduct] = useState(null);
  const [changeDiscount, setChangeDiscount] = useState(0);
  const [createLoading, setCreateLoading] = useState(false);
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [quotationToCancel, setQuotationToCancel] = useState(null);
  const [pdfConfirmOpen, setPdfConfirmOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");

  // PDF download helper
  const triggerPdfDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePdfYes = () => {
    if (pdfUrl && pdfFileName) triggerPdfDownload(pdfUrl, pdfFileName);
    setPdfConfirmOpen(false);
    setPdfUrl(null);
    setPdfFileName("");
  };

  const handlePdfNo = () => {
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    setPdfConfirmOpen(false);
    setPdfUrl(null);
    setPdfFileName("");
  };

  // Fetch quotations
  const fetchQuotations = async () => {
    try {
      const quotationsResponse = await axios.get(`${API_BASE_URL}/api/direct/quotations`);
      const data = Array.isArray(quotationsResponse.data) ? quotationsResponse.data : [];
      const validQuotations = data.filter(
        (q) => q.quotation_id && q.quotation_id !== "undefined" && /^[a-zA-Z0-9-_]+$/.test(q.quotation_id)
      );
      setQuotations(validQuotations);
      setFilteredQuotations(validQuotations);
    } catch (err) {
      console.error("Failed to fetch quotations:", err.message);
      setError(`Failed to fetch quotations: ${err.message}`);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersResponse, productsResponse, quotationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/direct/customers`),
          axios.get(`${API_BASE_URL}/api/direct/aproducts`),
          axios.get(`${API_BASE_URL}/api/direct/quotations`),
        ]);

        const sortedCustomers = Array.isArray(customersResponse.data)
          ? customersResponse.data.sort((a, b) => (b.id || 0) - (a.id || 0))
          : [];

        // Validate and filter products
        const validProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data.filter(
              (p) =>
                p != null &&
                typeof p === 'object' &&
                typeof p.id !== 'undefined' &&
                typeof p.product_type === 'string' &&
                typeof p.productname === 'string'
            )
          : [];

        setCustomers(sortedCustomers);
        setProducts(validProducts);
        const data = Array.isArray(quotationsResponse.data) ? quotationsResponse.data : [];
        const validQuotations = data.filter(
          (q) => q.quotation_id && q.quotation_id !== "undefined" && /^[a-zA-Z0-9-_]+$/.test(q.quotation_id)
        );
        setQuotations(validQuotations);
        setFilteredQuotations(validQuotations);
      } catch (err) {
        console.error('Fetch data error:', err);
        setError(`Failed to fetch data: ${err.message}`);
        setProducts([]); // Ensure products is always an array
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchQuotations, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Search
  const handleSearch = useCallback(
    debounce((query) => {
      const lowerQuery = query.toLowerCase();
      const filtered = quotations.filter(
        (q) =>
          q.quotation_id.toLowerCase().includes(lowerQuery) ||
          (q.customer_name || '').toLowerCase().includes(lowerQuery) ||
          q.status.toLowerCase().includes(lowerQuery)
      );
      setFilteredQuotations(filtered);
      setCurrentPage(1);
    }, 300),
    [quotations]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const downloadCustomersExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const customerGroups = {
        Customer: customers.filter(c => c.customer_type === 'Customer'),
        Agent: customers.filter(c => c.customer_type === 'Agent'),
        'Customer of Agent': customers.filter(c => c.customer_type === 'Customer of Selected Agent'),
      };

      for (const [type, group] of Object.entries(customerGroups)) {
        if (group.length === 0) continue;
        const data = group.map(customer => ({
          ID: customer.id || 'N/A',
          Name: customer.name || 'N/A',
          'Customer Type': customer.customer_type || 'User',
          ...(type === 'Customer of Agent' ? { 'Agent Name': customer.agent_name || 'N/A' } : {}),
          'Mobile Number': customer.mobile_number || 'N/A',
          Email: customer.email || 'N/A',
          Address: customer.address || 'N/A',
          District: customer.district || 'N/A',
          State: customer.state || 'N/A',
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, type);
      }
      XLSX.writeFile(workbook, 'customers_export.xlsx');
    } catch (err) {
      console.error('Failed to download customers Excel:', err);
      setError(`Failed to download customers Excel: ${err.message}`);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuotations = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Cart helpers
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
        product_type: customProduct.product_type || 'custom',
        price: Math.round(Number(customProduct.price) || 0),
        quantity: Number.parseInt(customProduct.quantity) || 1,
        discount: Number.parseFloat(customProduct.discount) || targetDiscount,
        initialDiscount: Number.parseFloat(customProduct.discount) || targetDiscount,
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
        initialDiscount: Number.parseFloat(product.discount) || 0,
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
        : [product, ...prev];
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
    return (discountedSubtotal * 0.03).toFixed(2);
  };

  const calculateTotal = (targetCart = [], additionalDiscount = 0) => {
    const subtotal = targetCart.reduce(
      (total, item) => total + getEffectivePrice(item) * (1 - item.discount / 100) * item.quantity,
      0,
    );
    const discountedSubtotal = subtotal * (1 - additionalDiscount / 100);
    const processingFee = discountedSubtotal * 0.01;
    return (discountedSubtotal + processingFee).toFixed(2);
  };

  // CREATE QUOTATION
  const createQuotation = async () => {
    if (!selectedCustomer || !cart.length) return setError("Customer and products are required");
    if (cart.some(i => i.quantity === 0)) return setError("Please remove products with zero quantity");

    setCreateLoading(true);
    setError("");

    const customer = customers.find(c => c.id.toString() === selectedCustomer.value);
    if (!customer) { setCreateLoading(false); return setError("Invalid customer"); }

    const quotation_id = `QUO-${Date.now()}`;
    try {
      const subtotal = parseFloat(calculateNetRate(cart)) - parseFloat(calculateYouSave(cart));
      const discountedSubtotal = subtotal * (1 - additionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.03;

      const payload = {
        customer_id: Number(selectedCustomer.value),
        quotation_id,
        products: cart.map(item => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: getEffectivePrice(item),
          discount: parseFloat(item.discount) || 0,
          quantity: parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: parseFloat(calculateNetRate(cart)),
        you_save: parseFloat(calculateYouSave(cart)),
        processing_fee: processingFee,
        total: parseFloat(calculateTotal(cart, additionalDiscount)),
        promo_discount: 0,
        additional_discount: parseFloat(additionalDiscount.toFixed(2)),
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
      if (!newQuotationId || newQuotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(newQuotationId))
        throw new Error("Invalid quotation ID returned from server");

      setQuotationId(newQuotationId);
      setIsQuotationCreated(true);
      setSuccessMessage("Quotation created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations(prev => [{ ...payload, created_at: new Date().toISOString(), customer_name: customer.name, total: payload.total }, ...prev]);
      setFilteredQuotations(prev => [{ ...payload, created_at: new Date().toISOString(), customer_name: customer.name, total: payload.total }, ...prev]);

      const pdfRes = await axios.get(`${API_BASE_URL}/api/direct/quotation/${newQuotationId}`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const safeName = (customer.name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const fileName = `${safeName}-${newQuotationId}-quotation.pdf`;

      setPdfUrl(blobUrl);
      setPdfFileName(fileName);
      setPdfConfirmOpen(true);

      setCart([]);
      setSelectedCustomer(null);
      setSelectedProduct(null);
      setAdditionalDiscount(0);
      setChangeDiscount(0);
      setLastAddedProduct(null);
      setQuotationId(null);
      setIsQuotationCreated(false);
    } catch (err) {
      console.error("Create quotation error:", err);
      setError(`Failed to create quotation. Try again.`);
    } finally {
      setCreateLoading(false);
    }
  };

  // EDIT QUOTATION
  const editQuotation = async (quotation = null) => {
    if (quotation) {
      if (!quotation.quotation_id || quotation.quotation_id === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotation.quotation_id)) {
        setError("Invalid or missing quotation ID");
        return;
      }

      setModalMode("edit");
      setModalSelectedCustomer({
        value: quotation.customer_id?.toString(),
        label: `${quotation.customer_name} (${quotation.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : quotation.customer_type || "User"} - ${quotation.district || "N/A"})`
      });
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
                initialDiscount: Number.parseFloat(p.discount) || 0,
                quantity: Number.parseInt(p.quantity) || 0,
                per: p.per || 'Unit',
                product_type: p.product_type || 'custom',
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
    if (!quotationId || quotationId === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotationId)) {
      setError("Invalid or missing quotation ID");
      return;
    }

    setModalSubmitLoading(true);
    try {
      const customer = customers.find((c) => c.id.toString() === modalSelectedCustomer.value);
      if (!customer) throw new Error("Invalid customer");

      const subtotal = parseFloat(calculateNetRate(modalCart)) - parseFloat(calculateYouSave(modalCart));
      const discountedSubtotal = subtotal * (1 - modalAdditionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.01;

      const payload = {
        customer_id: Number(modalSelectedCustomer.value),
        products: modalCart.map(item => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: parseFloat(item.price) || 0,
          discount: parseFloat(item.discount) || 0,
          quantity: parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: parseFloat(calculateNetRate(modalCart)) || 0,
        you_save: parseFloat(calculateYouSave(modalCart)) || 0,
        processing_fee: parseFloat(processingFee) || 0,
        total: parseFloat(calculateTotal(modalCart, modalAdditionalDiscount)) || 0,
        promo_discount: 0,
        additional_discount: parseFloat(modalAdditionalDiscount.toFixed(2)) || 0,
        status: "pending",
      };

      const response = await axios.put(`${API_BASE_URL}/api/direct/quotations/${quotationId}`, payload);
      const updatedId = response.data.quotation_id || quotationId;
      if (!updatedId) throw new Error("Invalid quotation ID returned");

      setSuccessMessage("Quotation updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations(prev => prev.map(q => q.quotation_id === quotationId ? { ...q, ...payload, customer_name: customer.name, total: payload.total } : q));
      setFilteredQuotations(prev => prev.map(q => q.quotation_id === quotationId ? { ...q, ...payload, customer_name: customer.name, total: payload.total } : q));

      const pdfRes = await axios.get(`${API_BASE_URL}/api/direct/quotation/${updatedId}`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const safeName = (customer.name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const fileName = `${safeName}-${updatedId}-quotation.pdf`;

      setPdfUrl(blobUrl);
      setPdfFileName(fileName);
      setPdfConfirmOpen(true);

      closeModal();
    } catch (err) {
      console.error("Edit quotation error:", err);
      setError(`Failed to update quotation. Try again.`);
    } finally {
      setModalSubmitLoading(false);
    }
  };

  // CONVERT TO BOOKING
  const convertToBooking = async (quotation = null) => {
    if (quotation) {
      if (!quotation.quotation_id || quotation.quotation_id === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(quotation.quotation_id)) {
        setError("Invalid or missing quotation ID");
        return;
      }

      setModalMode("book");
      setModalSelectedCustomer({
        value: quotation.customer_id?.toString(),
        label: `${quotation.customer_name} (${quotation.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : quotation.customer_type || "User"} - ${quotation.district || "N/A"})`
      });
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
                initialDiscount: Number.parseFloat(p.discount) || 0,
                quantity: Number.parseInt(p.quantity) || 0,
                per: p.per || 'Unit',
                product_type: p.product_type || 'custom',
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

    setModalSubmitLoading(true);
    try {
      const customer = customers.find((c) => c.id.toString() === modalSelectedCustomer.value);
      if (!customer) throw new Error("Invalid customer");

      const subtotal = parseFloat(calculateNetRate(modalCart)) - parseFloat(calculateYouSave(modalCart));
      const discountedSubtotal = subtotal * (1 - modalAdditionalDiscount / 100);
      const processingFee = discountedSubtotal * 0.03;

      const payload = {
        customer_id: Number(modalSelectedCustomer.value),
        order_id: orderId,
        quotation_id: quotationId,
        products: modalCart.map(item => ({
          id: item.id,
          product_type: item.product_type,
          productname: item.productname,
          price: getEffectivePrice(item),
          discount: parseFloat(item.discount) || 0,
          quantity: parseInt(item.quantity) || 0,
          per: item.per || 'Unit',
        })),
        net_rate: parseFloat(calculateNetRate(modalCart)),
        you_save: parseFloat(calculateYouSave(modalCart)),
        processing_fee: processingFee,
        total: parseFloat(calculateTotal(modalCart, modalAdditionalDiscount)),
        promo_discount: 0,
        additional_discount: parseFloat(modalAdditionalDiscount.toFixed(2)),
        customer_type: customer.customer_type || "User",
        customer_name: customer.name,
        address: customer.address,
        mobile_number: customer.mobile_number,
        email: customer.email,
        district: customer.district,
        state: customer.state,
      };

      const response = await axios.post(`${API_BASE_URL}/api/direct/bookings`, payload);
      setSuccessMessage("Booking created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations(prev => prev.map(q => q.quotation_id === quotationId ? { ...q, status: "booked" } : q));
      setFilteredQuotations(prev => prev.map(q => q.quotation_id === quotationId ? { ...q, status: "booked" } : q));

      const pdfRes = await axios.get(`${API_BASE_URL}/api/direct/invoice/${response.data.order_id}`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const safeName = (customer.name || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const fileName = `${safeName}-${response.data.order_id}-invoice.pdf`;

      setPdfUrl(blobUrl);
      setPdfFileName(fileName);
      setPdfConfirmOpen(true);

      closeModal();
    } catch (err) {
      console.error("Convert to booking error:", err);
      setError(`Failed to create booking. Try again.`);
    } finally {
      setModalSubmitLoading(false);
    }
  };

  // CANCEL QUOTATION
  const cancelQuotation = async () => {
    const target = quotationToCancel;
    if (!target || target === "undefined" || !/^[a-zA-Z0-9-_]+$/.test(target)) {
      setError("Invalid quotation ID");
      setCancelConfirmOpen(false);
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/direct/quotations/cancel/${target}`);
      setSuccessMessage("Quotation cancelled successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setQuotations(prev => prev.map(q => q.quotation_id === target ? { ...q, status: "cancelled" } : q));
      setFilteredQuotations(prev => prev.map(q => q.quotation_id === target ? { ...q, status: "cancelled" } : q));

      if (!quotationToCancel) {
        setCart([]);
        setSelectedCustomer(null);
        setSelectedProduct(null);
        setQuotationId(null);
        setIsQuotationCreated(false);
        setAdditionalDiscount(0);
        setChangeDiscount(0);
        setLastAddedProduct(null);
      }
    } catch (err) {
      setError(`Failed to cancel: ${err.response?.data?.message || err.message}`);
    } finally {
      setCancelConfirmOpen(false);
      setQuotationToCancel(null);
    }
  };

  const openCancelConfirm = (id) => {
    setQuotationToCancel(id);
    setCancelConfirmOpen(true);
  };

  const openNewProductModal = (isModal = false) => {
    setNewProductIsForModal(isModal);
    setNewProductModalIsOpen(true);
    setNewProductData({
      productname: '',
      price: '',
      discount: isModal ? modalChangeDiscount : changeDiscount,
      quantity: 1,
      per: '',
      product_type: 'custom',
    });
  };

  const closeNewProductModal = () => {
    setNewProductModalIsOpen(false);
    setNewProductData({ productname: '', price: '', discount: 0, quantity: 1, per: '', product_type: 'custom' });
    setError("");
  };

  const handleAddNewProduct = (productData) => {
    if (!productData.productname) return setError("Product name is required");
    if (productData.price === '' || productData.price < 0) return setError("Price must be a non-negative number");
    if (productData.quantity === '' || productData.quantity < 1) return setError("Quantity must be at least 1");
    if (productData.discount < 0 || productData.discount > 100) return setError("Discount must be between 0 and 100");
    if (!productData.product_type) return setError("Product type is required");

    addToCart(newProductIsForModal, {
      ...productData,
      price: Number.parseFloat(productData.price) || 0,
      discount: Number.parseFloat(productData.discount) || 0,
      quantity: parseInt(productData.quantity) || 1,
      product_type: productData.product_type || 'custom',
    });
    closeNewProductModal();
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalMode(null);
    setModalCart([]);
    setModalSelectedCustomer(null);
    setModalSelectedProduct(null);
    setOrderId("");
    setModalAdditionalDiscount(0);
    setModalChangeDiscount(0);
    setModalLastAddedProduct(null);
    setError("");
    setSuccessMessage("");
  };

  return (
    <DirectErrorBoundary>
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

            {/* CUSTOMER SELECTOR */}
            <div className="flex flex-col items-center mb-6 mobile:w-full">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2 mobile:text-base">
                Select Customer
              </label>
              <Select
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                options={customers.map((c) => ({
                  value: c.id.toString(),
                  label: `${c.name} (${c.customer_type === "Customer of Selected Agent" ? "Customer - Agent" : c.customer_type || "User"} - ${c.district || "N/A"})`,
                }))}
                placeholder="Search for a customer..."
                isClearable
                className="mobile:w-full onefifty:w-96 hundred:w-96"
                classNamePrefix="react-select"
                styles={selectStyles}
              />
            </div>

            {/* QUOTATION TABLE */}
            <QuotationTableErrorBoundary>
              <QuotationTable
                cart={cart}
                setCart={setCart}
                setModalCart={setModalCart}
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

            {/* CREATE QUOTATION BUTTON */}
            <div className="flex justify-center gap-4 mt-8 mobile:mt-4 mobile:flex-col">
              <button
                onClick={createQuotation}
                disabled={!selectedCustomer || !cart.length || createLoading}
                className={`onefifty:w-50 hundred:w-50 h-10 text-white px-8 rounded-lg font-bold shadow flex items-center justify-center gap-2
                  ${(!selectedCustomer || !cart.length || createLoading) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                style={styles.button}
              >
                {createLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : error && error.includes("Try again") ? "Try Again" : "Create Quotation"}
              </button>
            </div>

            {/* QUOTATIONS LIST */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 mobile:text-xl">All Quotations</h2>
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 mobile:w-full onefifty:w-96">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by Quotation ID, Customer, or Status"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={styles.input}
                  />
                </div>
              </div>
              {currentQuotations.length ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mobile:gap-4">
                    {currentQuotations.map((quotation) => (
                      <div key={quotation.quotation_id} className="p-6 rounded-lg shadow-lg" style={styles.card}>
                        <h3 className="text-lg font-bold mb-2 mobile:text-base text-gray-900">{quotation.quotation_id}</h3>
                        <p className="text-sm mb-1 mobile:text-xs text-gray-900">
                          <span className="font-semibold">Customer:</span> {quotation.customer_name || "N/A"}
                        </p>
                        <p className="text-sm mb-1 mobile:text-xs text-gray-900">
                          <span className="font-semibold">Location:</span> {quotation.district || "N/A"}
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
                            onClick={() => openCancelConfirm(quotation.quotation_id)}
                            disabled={quotation.status !== "pending"}
                            className={`flex-1 text-white px-4 py-2 rounded-lg font-bold text-sm ${quotation.status !== "pending" ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      style={styles.button}
                    >
                      Previous
                    </button>

                    {(() => {
                      const maxPagesToShow = 4;
                      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                      // Adjust startPage if endPage is at the totalPages limit
                      if (endPage === totalPages) {
                        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                      }

                      const pageButtons = [];

                      // Generate page buttons
                      for (let page = startPage; page <= endPage; page++) {
                        pageButtons.push(
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-4 py-2 rounded-lg text-sm ${
                              currentPage === page ? "bg-blue-800 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            style={styles.button}
                          >
                            {page}
                          </button>
                        );
                      }
                      return pageButtons;
                    })()}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      style={styles.button}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 mobile:p-2 mobile:text-xs">
                  {searchQuery ? "No quotations match your search" : "No quotations available"}
                </div>
              )}
            </div>

            {/* DOWNLOAD EXCEL */}
            <div className="flex justify-center mt-5 mb-20">
              <button
                onClick={downloadCustomersExcel}
                className="h-10 text-white px-6 rounded-lg font-bold shadow bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                style={styles.button}
              >
                <FaDownload /> Download Customers Excel
              </button>
            </div>

            {/* MAIN MODAL */}
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
                  setModalCart={setModalCart}
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

            {/* MODALS */}
            <CancelConfirmModal
              isOpen={cancelConfirmOpen}
              onClose={() => setCancelConfirmOpen(false)}
              onConfirm={cancelQuotation}
              quotationId={quotationToCancel}
            />
            <PDFDownloadConfirmModal
              isOpen={pdfConfirmOpen}
              onClose={handlePdfNo}
              onYes={handlePdfYes}
              fileName={pdfFileName}
            />
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
    </DirectErrorBoundary>
  );
}