import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaArrowLeft, FaArrowRight, FaInfoCircle, FaExpand, FaCompress } from "react-icons/fa";
import { ShoppingCart, Search, Filter, X } from "lucide-react";
import Navbar from "../Component/Navbar";
import { API_BASE_URL } from "../../Config";
import RocketLoader from "../Component/RocketLoader";
import ToasterNotification from "../Component/ToasterNotification";
import SuccessAnimation from "../Component/SuccessAnimation";
import ModernCarousel from "../Component/ModernCarousel";
import LoadingSpinner from "../Component/LoadingSpinner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../App.css";
import need from '../default.jpg'

const Pricelist = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isExpandedCart, setIsExpandedCart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMinOrderModal, setShowMinOrderModal] = useState(false);
  const [minOrderMessage, setMinOrderMessage] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    customer_name: "",
    address: "",
    district: "",
    state: "",
    mobile_number: "",
    email: "",
    customer_type: "User",
  });
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [promocode, setPromocode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [promocodes, setPromocodes] = useState([]);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const debounceTimeout = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPercentage = (value) => {
    return Math.round(Number.parseFloat(value)).toString();
  };

  const formatPrice = (price) => {
    const num = Number.parseFloat(price);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const capitalize = str => str ? str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  const serialSort = (a, b) => {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return collator.compare(a.serial_number, b.serial_number);
  };

  const downloadPDF = () => {
    try {
      if (!products.length) {
        showError('No products available to export');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yOffset = 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MADHU NISHA CRACKERS', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Website - www.madhunishacrackers.com', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 10;
      doc.text('Retail Pricelist - 2025', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 10;
      doc.text('Contact Number - 9487524689', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 30;

      const tableData = [];
      let slNo = 1;
      const orderedTypes = [
        "One sound crackers",
        "Ground Chakkar",
        "Flower Pots",
        "Twinkling Star",
        "Rockets",
        "Bombs",
        "Repeating Shots",
        "Comets Sky Shots",
        "Fancy pencil varieties",
        "Fountain and Fancy Novelties",
        "Matches",
        "Guns and Caps",
        "Sparklers",
        "Premium Sparklers",
        "Gift Boxes",
        "Kids Special "
      ];

      orderedTypes.forEach(type => {
        const typeKey = type.replace(/ /g, "_").toLowerCase();
        const typeProducts = products
          .filter(product => product.product_type.toLowerCase() === typeKey)
          .sort(serialSort);
        if (typeProducts.length > 0) {
          tableData.push([{ content: capitalize(type), colSpan: 6, styles: { fontStyle: 'bold', halign: 'left', fillColor: [200, 200, 200] } }]);
          tableData.push(['Sl No.', 'Code', 'Product Name', 'Rate', 'Discounted Rate', 'Per']);
          typeProducts.forEach(product => {
            const discount = product.price * (product.discount / 100);
            const discountedRate = product.price - discount;
            tableData.push([
              slNo++,
              product.serial_number,
              product.productname,
              `Rs.${formatPrice(product.price)}`,
              `Rs.${formatPrice(discountedRate)}`,
              product.per
            ]);
          });
          tableData.push([]);
        }
      });

      autoTable(doc, {
        startY: yOffset,
        head: [['Sl No.', 'Code', 'Product Name', 'Rate', 'Discounted Rate', 'Per']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] },
        columnStyles: { 
          0: { cellWidth: 15 }, 
          1: { cellWidth: 20 }, 
          2: { cellWidth: 70 }, 
          3: { cellWidth: 20 }, 
          4: { cellWidth: 30 }, 
          5: { cellWidth: 25 }
        },
        didDrawCell: (data) => {
          if (data.row.section === 'body' && data.cell.raw && data.cell.raw.colSpan === 6) {
            data.cell.styles.cellPadding = 5;
            data.cell.styles.fontSize = 12;
          }
        },
      });

      doc.save('MNC_Pricelist_2025.pdf');
    } catch (err) {
      showError('Failed to generate PDF: ' + err.message);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const savedCart = localStorage.getItem("firecracker-cart");
        if (savedCart) setCart(JSON.parse(savedCart));
        const [statesRes, productsRes, promocodesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/locations/states`),
          fetch(`${API_BASE_URL}/api/products`),
          fetch(`${API_BASE_URL}/api/promocodes`),
        ]);
        const [statesData, productsData, promocodesData] = await Promise.all([
          statesRes.json(),
          productsRes.json(),
          promocodesRes.json(),
        ]);
        setStates(Array.isArray(statesData) ? statesData : []);

        const naturalSort = (a, b) => {
          const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
          });
          return collator.compare(a.productname, b.productname);
        };

        const seenSerials = new Set();
        const normalizedProducts = productsData.data
          .filter((p) => {
            if (p.status !== "on") return false;
            if (seenSerials.has(p.serial_number)) {
              console.warn(`Duplicate serial_number found: ${p.serial_number}`);
              return false;
            }
            seenSerials.add(p.serial_number);
            return true;
          })
          .map((product) => ({
            ...product,
            images: product.image
              ? typeof product.image === "string"
                ? JSON.parse(product.image)
                : product.image
              : [],
          }))
          .sort(naturalSort);

        setProducts(normalizedProducts);
        setPromocodes(Array.isArray(promocodesData) ? promocodesData : []);
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (customerDetails.state) {
      fetch(`${API_BASE_URL}/api/locations/states/${customerDetails.state}/districts`)
        .then((res) => res.json())
        .then((data) => setDistricts(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching districts:", err));
    }
  }, [customerDetails.state]);

  useEffect(() => localStorage.setItem("firecracker-cart", JSON.stringify(cart)), [cart]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (promocode && promocode !== "custom") handleApplyPromo(promocode);
      else {
        setAppliedPromo(null);
        setPromocode("");
      }
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [promocode, cart]);

  const addToCart = useCallback((product) => {
    if (!product || !product.serial_number) return console.error("Invalid product or missing serial_number:", product);
    setCart((prev) => ({ ...prev, [product.serial_number]: (prev[product.serial_number] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((product) => {
    if (!product || !product.serial_number) return console.error("Invalid product or missing serial_number:", product);
    setCart((prev) => {
      const count = (prev[product.serial_number] || 1) - 1;
      const updated = { ...prev };
      if (count <= 0) delete updated[product.serial_number];
      else updated[product.serial_number] = count;
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((product, quantity) => {
    if (!product?.serial_number) return console.error("Invalid product or missing serial_number:", product);
    if (quantity < 0) quantity = 0;
    setCart((prev) => {
      const updated = { ...prev };
      if (quantity === 0) delete updated[product.serial_number];
      else updated[product.serial_number] = quantity;
      return updated;
    });
  }, []);

  const handleFinalCheckout = async () => {
    setIsBookingLoading(true);
    const order_id = `ORD-${Date.now()}`;
    const selectedProducts = Object.entries(cart).map(([serial, qty]) => {
      const product = products.find((p) => p.serial_number === serial);
      return {
        id: product.id,
        product_type: product.product_type,
        quantity: qty,
        per: product.per,
        price: product.price,
        discount: product.discount,
        serial_number: product.serial_number,
        productname: product.productname,
        status: product.status,
      };
    });

    if (!selectedProducts.length) {
      showError("Your cart is empty.");
      setIsBookingLoading(false);
      return;
    }
    if (!customerDetails.customer_name) {
      showError("Customer name is required.");
      setIsBookingLoading(false);
      return;
    }
    if (!customerDetails.address) {
      showError("Address is required.");
      setIsBookingLoading(false);
      return;
    }
    if (!customerDetails.district) {
      showError("District is required.");
      setIsBookingLoading(false);
      return;
    }
    if (!customerDetails.state) {
      showError("Please select a state.");
      setIsBookingLoading(false);
      return;
    }
    if (!customerDetails.mobile_number) {
      showError("Mobile number is required.");
      setIsBookingLoading(false);
      return;
    }

    const mobile = customerDetails.mobile_number.replace(/\D/g, "").slice(-10);
    if (mobile.length !== 10) {
      showError("Mobile number must be 10 digits.");
      setIsBookingLoading(false);
      return;
    }

    const selectedState = customerDetails.state?.trim();
    const minOrder = states.find((s) => s.name === selectedState)?.min_rate;
    if (minOrder && Number.parseFloat(originalTotal) < minOrder) {
      showError(`Minimum order for ${selectedState} is ₹${minOrder}. Your total is ₹${originalTotal}.`);
      setIsBookingLoading(false);
      return;
    }

    try {
      setShowLoader(true);
      const response = await fetch(`${API_BASE_URL}/api/direct/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          products: selectedProducts,
          net_rate: Number.parseFloat(totals.net),
          you_save: Number.parseFloat(totals.save),
          processing_fee: Number.parseFloat(totals.processing_fee),
          total: Number.parseFloat(totals.total),
          promo_discount: Number.parseFloat(totals.promo_discount || "0.00"),
          customer_type: customerDetails.customer_type,
          customer_name: customerDetails.customer_name,
          address: customerDetails.address,
          mobile_number: mobile,
          email: customerDetails.email,
          district: customerDetails.district,
          state: customerDetails.state,
          promocode: appliedPromo?.code || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const pdfResponse = await fetch(`${API_BASE_URL}/api/direct/invoice/${data.order_id}`, { responseType: "blob" });
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safeCustomerName = (customerDetails.customer_name || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        link.setAttribute("download", `${safeCustomerName}-${data.order_id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setShowLoader(false);
        setIsBookingLoading(false);
        showError(data.message || "Booking failed.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setShowLoader(false);
      setIsBookingLoading(false);
      showError("Something went wrong during checkout.");
    }
  };

  const handleRocketComplete = () => {
    setShowLoader(false);
    setIsBookingLoading(false);
    setIsCartOpen(false);
    setShowModal(false);
    setShowDetailsModal(false);
    setShowMinOrderModal(false);
    setCart({});
    setCustomerDetails({
      customer_name: "",
      address: "",
      district: "",
      state: "",
      mobile_number: "",
      email: "",
      customer_type: "User",
    });
    setAppliedPromo(null);
    setPromocode("");
    setOriginalTotal(0);
    setTotalDiscount(0);
    setTimeout(() => {
      setShowToaster(true);
    }, 500);
  };

  const showError = (message) => {
    setMinOrderMessage(message);
    setShowMinOrderModal(true);
    setTimeout(() => setShowMinOrderModal(false), 5000);
  };

  const handleCheckoutClick = () =>
    Object.keys(cart).length ? (setShowModal(true), setIsCartOpen(false)) : showError("Your cart is empty.");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_number") {
      const cleaned = value.replace(/\D/g, "").slice(-10);
      setCustomerDetails((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShowDetails = useCallback((product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedProduct(null);
    setShowDetailsModal(false);
  }, []);

  const handleImageClick = useCallback((media) => {
    const mediaItems = Array.isArray(media) ? media : [];
    setSelectedImages(mediaItems);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  }, []);

  const handleApplyPromo = useCallback(
    async (code) => {
      if (!code) {
        setAppliedPromo(null);
        setPromocode("");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/promocodes`);
        const promos = await res.json();
        const found = promos.find((p) => p.code.toLowerCase() === code.toLowerCase());
        if (!found) {
          showError("Invalid promocode.");
          setAppliedPromo(null);
          setPromocode("");
          return;
        }
        if (found.min_amount && Number.parseFloat(originalTotal) < Number.parseFloat(found.min_amount)) {
          showError(`Minimum order amount for this promocode is ₹${found.min_amount}. Your total is ₹${originalTotal}.`);
          setAppliedPromo(null);
          setPromocode("");
          return;
        }
        if (found.end_date && new Date(found.end_date) < new Date()) {
          showError("This promocode has expired.");
          setAppliedPromo(null);
          setPromocode("");
          return;
        }
        if (found.product_type) {
          const cartProductTypes = new Set(
            Object.keys(cart).map((serial) => {
              const product = products.find((p) => p.serial_number === serial);
              return product?.product_type || "Others";
            })
          );
          if (!cartProductTypes.has(found.product_type)) {
            showError(`This promocode is only valid for ${found.product_type} products.`);
            setAppliedPromo(null);
            setPromocode("");
            return;
          }
        }
        setAppliedPromo(found);
      } catch (err) {
        console.error("Promo apply error:", err);
        showError("Could not validate promocode.");
        setAppliedPromo(null);
        setPromocode("");
      }
    },
    [originalTotal, cart, products],
  );

  const totals = useMemo(() => {
    let net = 0,
      save = 0,
      total = 0,
      productDiscount = 0,
      promoDiscount = 0;
    
    for (const serial in cart) {
      const qty = cart[serial];
      const product = products.find((p) => p.serial_number === serial);
      if (!product) continue;
      const originalPrice = Number.parseFloat(product.price);
      const discount = originalPrice * (product.discount / 100);
      const priceAfterDiscount = originalPrice - discount;
      net += originalPrice * qty;
      productDiscount += discount * qty;
      total += priceAfterDiscount * qty;

      if (appliedPromo) {
        if (!appliedPromo.product_type || product.product_type === appliedPromo.product_type) {
          const productTotal = priceAfterDiscount * qty;
          promoDiscount += (productTotal * appliedPromo.discount) / 100;
        }
      }
    }

    setOriginalTotal(total);
    setTotalDiscount(productDiscount);
    
    total -= promoDiscount;
    const processingFee = total * 0.01;
    total += processingFee;
    save = productDiscount + promoDiscount;
    
    return {
      net: formatPrice(net),
      save: formatPrice(save),
      total: formatPrice(total),
      promo_discount: formatPrice(promoDiscount),
      product_discount: formatPrice(productDiscount),
      processing_fee: formatPrice(processingFee),
    };
  }, [cart, products, appliedPromo]);

  const productTypes = useMemo(() => {
    const orderedTypes = [
      "One sound crackers",
      "Ground Chakkar",
      "Flower Pots",
      "Twinkling Star",
      "Rockets",
      "Bombs",
      "Repeating Shots",
      "Comets Sky Shots",
      "Fancy pencil varieties",
      "Fountain and Fancy Novelties",
      "Matches",
      "Guns and Caps",
      "Sparklers",
      "Premium Sparklers",
      "Gift Boxes",
      "Kids Special "
    ];
    const availableTypes = [...new Set(products
      .filter(p => p.product_type !== "gift_box_dealers")
      .map(p => p.product_type || "Others")
    )];
    const filteredOrderedTypes = orderedTypes.filter(type => 
      availableTypes.includes(type.replace(/ /g, "_").toLowerCase())
    );
    return ["All", ...filteredOrderedTypes];
  }, [products]);

  const grouped = useMemo(() => {
    const orderedTypes = [
      "One sound crackers",
      "Ground Chakkar",
      "Flower Pots",
      "Twinkling Star",
      "Rockets",
      "Bombs",
      "Repeating Shots",
      "Comets Sky Shots",
      "Fancy pencil varieties",
      "Fountain and Fancy Novelties",
      "Matches",
      "Guns and Caps",
      "Sparklers",
      "Premium Sparklers",
      "Gift Boxes",
      "Kids Special "
    ];
    const result = products
      .filter(p => p.product_type !== "gift_box_dealers" &&
                   (selectedType === "All" || p.product_type === selectedType.replace(/ /g, "_").toLowerCase()) &&
                   (!searchTerm || 
                    p.productname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.serial_number.toLowerCase().includes(searchTerm.toLowerCase())))
      .reduce((acc, p) => {
        const key = p.product_type || "Others";
        acc[key] = acc[key] || [];
        acc[key].push(p);
        return acc;
      }, {});
    const orderedResult = {};
    orderedTypes
      .map(type => type.replace(/ /g, "_").toLowerCase())
      .forEach(type => {
        if (result[type]) {
          orderedResult[type] = result[type].sort(serialSort);
        }
      });
    return orderedResult;
  }, [products, selectedType, searchTerm]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar />
      <ToasterNotification show={showToaster} onClose={() => setShowToaster(false)} />
      <AnimatePresence>
        {showLoader && <RocketLoader onComplete={handleRocketComplete} />}
        {showSuccess && <SuccessAnimation />}
        {showMinOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-96 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Oops!</h3>
              <p className="text-gray-600 mb-6">{minOrderMessage}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMinOrderModal(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-2xl"
              >
                Got it
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showDetailsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.productname}</h2>
                    <div className="flex items-center gap-2">
                      {selectedProduct.discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {formatPercentage(selectedProduct.discount)}% OFF
                        </span>
                      )}
                      <span className="text-orange-600 font-semibold text-lg">
                        ₹{formatPrice(selectedProduct.price * (1 - selectedProduct.discount / 100))} /{" "}
                        {selectedProduct.per}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseDetails}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
                <ModernCarousel media={selectedProduct.images} onImageClick={handleImageClick} />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">
                      {selectedProduct.description ||
                        "Experience the magic of celebrations with our premium quality fireworks."}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        addToCart(selectedProduct);
                        handleCloseDetails();
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseDetails}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={() => { setIsCartOpen(false); setIsExpandedCart(false); }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isExpandedCart ? 'w-full max-w-4xl h-[90vh] flex flex-col' : 'w-full max-w-2xl mobile:max-w-md mobile:w-[90%] onefifty:max-w-[40%] mx-4 max-h-[90vh] flex flex-col'} bg-white rounded-3xl shadow-2xl`}
            >
              <div className="flex justify-between items-center p-6 border-b border-orange-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  Your Cart
                </h3>
                <div className="flex items-center gap-2">
                  {!isExpandedCart && Object.keys(cart).length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsExpandedCart(true)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                    >
                      <FaExpand className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setIsCartOpen(false); setIsExpandedCart(false); }}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isExpandedCart ? '' : 'max-h-[40vh]'}`}>
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  Object.entries(cart).map(([serial, qty]) => {
                    const product = products.find((p) => p.serial_number === serial);
                    if (!product) return null;
                    const discount = (product.price * product.discount) / 100;
                    const priceAfterDiscount = formatPrice(product.price - discount);
                    // Use need image as fallback when no valid images are available
                    const imageSrc =
                      (Array.isArray(product.images)
                        ? product.images.filter(
                            (item) =>
                              !item.includes("/video/") && !item.toLowerCase().endsWith(".gif")
                          )[0]
                        : null) || need;

                    return (
                      <motion.div
                        key={serial}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100"
                      >
                        <img
                          src={imageSrc}
                          alt={product.productname}
                          className="w-20 h-20 rounded-xl object-cover bg-white"
                          onClick={() => handleImageClick(product.images)}
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-800 line-clamp-2">{product.productname}</p>
                          <p className="text-sm text-orange-600 font-bold">
                            ₹{priceAfterDiscount} x {qty}
                          </p>
                          <p className="text-xs text-gray-600">
                            Subtotal: ₹{formatPrice((product.price - discount) * qty)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(product)}
                            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                          >
                            <FaMinus className="w-4 h-4" />
                          </motion.button>
                          <span className="text-sm font-medium w-8 text-center">{qty}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(product)}
                            className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center"
                          >
                            <FaPlus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
              {isExpandedCart ? (
                <div className="p-6 border-t border-orange-100 bg-white rounded-b-3xl">
                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Net Total:</span>
                      <span>₹{totals.net}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Product Discount:</span>
                      <span>-₹{totals.product_discount}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promocode ({appliedPromo.code}):</span>
                        <span>-₹{totals.promo_discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span>-₹{totals.save}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Processing Fee:</span>
                      <span>₹{totals.processing_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t border-orange-200">
                      <span>Total:</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsExpandedCart(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <FaCompress className="w-4 h-4" />
                      Collapse
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Original cart footer */
                <div className="p-6 border-t border-orange-100 bg-white rounded-b-3xl">
                  <div className="mb-4 p-3 bg-orange-50 rounded-2xl border border-orange-200">
                    <p className="text-xs font-medium text-orange-800 mb-2 text-center">Minimum Purchase Rates</p>
                    <div className="text-xs text-orange-700 overflow-hidden">
                      <div className="animate-marquee whitespace-nowrap">
                        {states.map((s) => `${s.name}: ₹${s.min_rate}`).join(" • ")}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promocode</label>
                    <select
                      value={promocode}
                      onChange={(e) => setPromocode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                    >
                      <option value="">Select Promocode</option>
                      {promocodes.map((promo) => (
                        <option key={promo.id} value={promo.code}>
                          {promo.code} ({formatPercentage(promo.discount)}% OFF{promo.min_amount ? `, Min: ₹${promo.min_amount}` : ""}
                          {promo.product_type ? `, Type: ${promo.product_type.replace(/_/g, " ")}` : ""}
                          {promo.end_date ? `, Exp: ${new Date(promo.end_date).toLocaleDateString()}` : ""})
                        </option>
                      ))}
                      <option value="custom">Enter custom code</option>
                    </select>
                    {promocode === "custom" && (
                      <input
                        type="text"
                        value={promocode === "custom" ? "" : promocode}
                        onChange={(e) => setPromocode(e.target.value)}
                        placeholder="Enter custom code"
                        className="w-full px-3 py-2 mt-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                      />
                    )}
                    {appliedPromo && (
                      <p className="text-green-600 text-xs mt-1">
                        Applied: {appliedPromo.code} ({formatPercentage(appliedPromo.discount)}% OFF)
                        {appliedPromo.min_amount && `, Min: ₹${appliedPromo.min_amount}`}
                        {appliedPromo.product_type && `, Type: ${appliedPromo.product_type.replace(/_/g, " ")}`}
                        {appliedPromo.end_date && `, Expires: ${new Date(appliedPromo.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-red-500 font-semibold text-sm">T&C - The images given for crackers are provides for your references the products may vary according to avilability</p>
                    <p className="text-red-500 font-semibold text-sm">Dear customers, delivery charges are payable to the transport service and pickup is at your own cost.</p>
                  </div>
                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Net Total:</span>
                      <span>₹{totals.net}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Product Discount:</span>
                      <span>-₹{totals.product_discount}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promocode ({appliedPromo.code}):</span>
                        <span>-₹{totals.promo_discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span>-₹{totals.save}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Processing Fee:</span>
                      <span>₹{totals.processing_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t border-orange-200">
                      <span>Total:</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCart({})}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                    >
                      Clear Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckoutClick}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg"
                    >
                      Checkout
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
        {showImageModal && selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full mx-4"
            >
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {selectedImages[currentImageIndex]?.includes("/video/") ? (
                      <video
                        src={selectedImages[currentImageIndex]}
                        autoPlay
                        muted
                        loop
                        className="w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                    ) : (
                      <img
                        src={
                          selectedImages[currentImageIndex] ||
                          "/placeholder.svg?height=600&width=800&query=firecracker"
                        }
                        alt="Product Image"
                        className="w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseImageModal}
                  className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                {selectedImages.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev === 0 ? selectedImages.length - 1 : prev - 1))
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <FaArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev === selectedImages.length - 1 ? 0 : prev + 1))
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    >
                      <FaArrowRight className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                    {currentImageIndex + 1} / {selectedImages.length}
                  </div>
                )}
                {selectedImages.length > 1 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-md overflow-x-auto p-2 mobile:translate-y-40">
                    {selectedImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? "border-orange-400" : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        {image?.includes("/video/") ? (
                          <video src={image} className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={image || "/placeholder.svg?height=64&width=64&query=firecracker"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="hundred:pt-48 mobile:pt-34 px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-8 mobile:-mt-20"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            />
          </div>
          <motion.div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm appearance-none cursor-pointer min-w-[200px]"
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Download Pricelist
            <FaArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {Object.entries(grouped).map(([type, items]) => (
          <motion.div key={type} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 capitalize">{type.replace(/_/g, " ")}</h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
              <span className="text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full text-sm">
                {items.length} items
              </span>
            </div>
            <div className="grid mobile:grid-cols-2 hundred:grid-cols-4 onefifty:grid-cols-3 gap-6">
              {items.map((product) => {
                if (!product) return null;
                const originalPrice = Number.parseFloat(product.price);
                const discount = originalPrice * (product.discount / 100);
                const finalPrice =
                  product.discount > 0 ? formatPrice(originalPrice - discount) : formatPrice(originalPrice);
                const count = cart[product.serial_number] || 0;
                return (
                  <motion.div
                    key={product.serial_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-orange-100"
                  >
                    <div className="relative">
                      <ModernCarousel media={product.images} onImageClick={handleImageClick} />
                      {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                          {formatPercentage(product.discount)}% OFF
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShowDetails(product)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                      >
                        <FaInfoCircle className="text-orange-600" />
                      </motion.button>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600">
                        {product.productname}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">₹{formatPrice(originalPrice)}</span>
                        )}
                        <span className="text-xl font-bold text-orange-600">₹{finalPrice}</span>
                        <span className="text-sm text-gray-600">/ {product.per}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <AnimatePresence mode="wait">
                          {count > 0 ? (
                            <motion.div
                              key="quantity-controls"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-1.5 sm:p-2"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(product)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                              >
                                <FaMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </motion.button>
                              <span className="text-white font-bold text-sm sm:text-lg px-1 sm:px-2 w-10 sm:w-16 text-center">
                                {count}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addToCart(product)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                              >
                                <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="add-button"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(product)}
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                            >
                              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Add</span>
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </main>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Details</h2>
                <div className="space-y-4">
                  {["customer_name", "address", "mobile_number", "email"].map((field) => (
                    <input
                      key={field}
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      placeholder={field.replace(/_/g, " ").toUpperCase()}
                      value={customerDetails[field]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      required={field !== "email"}
                    />
                  ))}
                  <select
                    name="state"
                    value={customerDetails.state}
                    onChange={(e) => setCustomerDetails((prev) => ({ ...prev, state: e.target.value, district: "" }))}
                    className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {customerDetails.state && (
                    <select
                      name="district"
                      value={customerDetails.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      required
                    >
                      <option value="">Select Place / City</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Promocode</label>
                    <select
                      value={promocode}
                      onChange={(e) => setPromocode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                    >
                      <option value="">Select Promocode</option>
                      {promocodes.map((promo) => (
                        <option key={promo.id} value={promo.code}>
                          {promo.code} ({formatPercentage(promo.discount)}% OFF{promo.min_amount ? `, Min: ₹${promo.min_amount}` : ""}
                          {promo.product_type ? `, Type: ${promo.product_type.replace(/_/g, " ")}` : ""}
                          {promo.end_date ? `, Exp: ${new Date(promo.end_date).toLocaleDateString()}` : ""})
                        </option>
                      ))}
                      <option value="custom">Enter custom code</option>
                    </select>
                    {promocode === "custom" && (
                      <input
                        type="text"
                        value={promocode === "custom" ? "" : promocode}
                        onChange={(e) => setPromocode(e.target.value)}
                        placeholder="Enter custom code"
                        className="w-full px-3 py-2 mt-2 rounded-xl border border-orange-200 text-sm focus:ring-2 focus:ring-orange-400 transition-all duration-300"
                      />
                    )}
                    {appliedPromo && (
                      <p className="text-green-600 text-xs mt-1">
                        Applied: {appliedPromo.code} ({formatPercentage(appliedPromo.discount)}% OFF)
                        {appliedPromo.min_amount && `, Min: ₹${appliedPromo.min_amount}`}
                        {appliedPromo.product_type && `, Type: ${appliedPromo.product_type.replace(/_/g, " ")}`}
                        {appliedPromo.end_date && `, Expires: ${new Date(appliedPromo.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mobile:space-y-1">
                    <div className="flex justify-between">
                      <span>Net Total:</span>
                      <span>₹{totals.net}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Product Discount:</span>
                      <span>-₹{totals.product_discount}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Promocode ({appliedPromo.code}):</span>
                        <span>-₹{totals.promo_discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600">
                      <span>Total Discount:</span>
                      <span>-₹{totals.save}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Processing Fee:</span>
                      <span>₹{totals.processing_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t border-orange-200">
                      <span>Total:</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isBookingLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isBookingLoading ? 1 : 0.98 }}
                    onClick={handleFinalCheckout}
                    disabled={isBookingLoading}
                    className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 ${
                      isBookingLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isBookingLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsCartOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center ${isCartOpen ? "hidden" : ""}`}
      >
        <ShoppingCart className="w-6 h-6" />
        {Object.keys(cart).length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold"
          >
            {Object.values(cart).reduce((a, b) => a + b, 0)}
          </motion.span>
        )}
      </motion.button>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
};

export default Pricelist;