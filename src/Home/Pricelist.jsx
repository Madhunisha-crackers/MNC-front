import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaArrowLeft, FaArrowRight, FaInfoCircle, FaExpand, FaCompress } from "react-icons/fa";
import { ShoppingCart, Search, Filter, X, Download, Sparkles, ChevronRight } from "lucide-react";
import Navbar from "../Component/Navbar";
import { API_BASE_URL, GOOGLE_REVIEW_URL } from "../../Config";
import RocketLoader from "../Component/RocketLoader";
import ToasterNotification from "../Component/ToasterNotification";
import SuccessAnimation from "../Component/SuccessAnimation";
import ModernCarousel from "../Component/ModernCarousel";
import LoadingSpinner from "../Component/LoadingSpinner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../App.css";
import need from '../default.jpg';

const ArcheryGameModal = ({ isOpen, onClose, freeProducts, onClaimGift }) => {
  const [step, setStep] = useState(1);
  const [wonProduct, setWonProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [gameError, setGameError] = useState("");
  const [isFiring, setIsFiring] = useState(false);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setWonProduct(null);
      setRating(5);
      setHoverRating(0);
      setComment("");
      setName("");
      setGameError("");
      setIsFiring(false);
      setShowMuzzleFlash(false);
    }
  }, [isOpen]);

  const shoot = () => {
    if (isFiring) return;
    if (!freeProducts || freeProducts.length === 0) {
      setGameError("No free gift products configured right now.");
      return;
    }

    setGameError("");
    setIsFiring(true);
    setShowMuzzleFlash(true);

    let hit = null;

    if (containerRef.current && trackRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const items = trackRef.current.querySelectorAll("[data-product-item]");
      let closestDist = Infinity;
      let closestSerial = null;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closestSerial = item.getAttribute("data-serial");
        }
      });

      if (closestSerial != null) {
        hit = freeProducts.find((p) => String(p.serial_number) === String(closestSerial)) || null;
      }
    }

    if (!hit) {
      hit = freeProducts[0] || null;
    }

    setTimeout(() => {
      setShowMuzzleFlash(false);
      setWonProduct(hit);
      setStep(2);
      setIsFiring(false);
    }, 400);
  };

  const handleClaim = () => {
    onClaimGift({ wonProduct });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-orange-100">
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600 px-6 py-5 flex items-center justify-between text-white">
            <div>
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                {step === 1 ? "🔫 Shoot to Win a Free Gift!" : "🎁 Claim Free Gift & Google Review"}
              </h3>
              <p className="text-orange-100 text-xs mt-0.5">
                {step === 1 ? "Line up your shot and pull the trigger to win a free gift added to your order!" : "Claim your free gift and help us grow with a 5-star Google review!"}
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold transition-colors">✕</button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <div>
                {gameError && <div className="bg-red-50 text-red-600 border border-red-200 text-xs rounded-xl p-3 mb-4">{gameError}</div>}
                {(!freeProducts || freeProducts.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-5xl mb-2">🎁</div>
                    <p className="font-bold text-gray-700">No free gifts configured currently</p>
                    <button onClick={() => onClaimGift({ wonProduct: null, rating: 0, comment: "", name: "" })}
                      className="mt-4 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm">
                      Continue to Checkout →
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4 text-center">Watch the targets drift past, line them up in your sights, and pull the <strong className="text-orange-600">trigger</strong> to win a free gift!</p>

                    <div
                      ref={containerRef}
                      className={`relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-purple-50 h-32 mb-6 shadow-inner ${isFiring ? "screen-shake" : ""}`}
                    >
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500/70 z-10 -translate-x-1/2" />
                      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="relative w-9 h-9">
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/80 -translate-y-1/2" />
                          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-red-500/80 -translate-x-1/2" />
                          <div className="absolute inset-0 border-2 border-red-500 rounded-full" />
                          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {showMuzzleFlash && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1.3 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-1/2 bottom-9 -translate-x-1/2 z-20 pointer-events-none"
                          >
                            <span className="text-3xl drop-shadow-[0_0_8px_rgba(255,180,0,0.9)]">💥</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div
                        ref={trackRef}
                        className="archery-track flex gap-4 items-center h-full"
                        style={{
                          width: "max-content",
                          animation: `archerySlide 9s linear infinite`,
                          animationPlayState: isFiring ? "paused" : "running",
                          paddingLeft: 24,
                        }}
                      >
                        {[...freeProducts, ...freeProducts, ...freeProducts, ...freeProducts].map((p, i) => (
                          <div
                            key={i}
                            data-product-item
                            data-serial={p.serial_number}
                            className="flex-shrink-0 bg-white rounded-xl shadow-md px-3.5 py-2.5 text-center border border-orange-100 min-w-[90px]"
                          >
                            <div className="text-2xl mb-1">🧨</div>
                            <div className="text-xs font-bold text-gray-800 line-clamp-1">{p.productname}</div>
                            <div className="text-[10px] text-orange-600 font-bold">FREE 🎁</div>
                          </div>
                        ))}
                      </div>

                      <div
                        className={`absolute left-1/2 -bottom-2 -translate-x-1/2 z-10 pointer-events-none gun-icon ${isFiring ? "gun-recoil" : ""}`}
                      >
                        <svg width="46" height="30" viewBox="0 0 46 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="20" y="2" width="6" height="16" rx="1" fill="#3f3f46" />
                          <rect x="8" y="14" width="24" height="6" rx="1.5" fill="#27272a" />
                          <path d="M10 20 L10 28 L16 28 L18 20 Z" fill="#18181b" />
                          <rect x="30" y="16" width="8" height="3" rx="1" fill="#52525b" />
                        </svg>
                      </div>
                    </div>

                    <button
                      onClick={shoot}
                      disabled={isFiring}
                      className={`w-full font-extrabold py-3.5 rounded-2xl text-lg shadow-xl shadow-orange-500/30 transition-all active:scale-95 text-white ${
                        isFiring
                          ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600"
                      }`}
                    >
                      {isFiring ? "🔫 Firing…" : "🔫 PULL TRIGGER"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {wonProduct && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 rounded-2xl p-4 mb-4">
                    <span className="text-3xl">🎁</span>
                    <div className="flex-1">
                      <div className="text-[10px] text-purple-600 font-extrabold uppercase tracking-widest">Congratulations! You Won</div>
                      <div className="text-base font-extrabold text-gray-800">{wonProduct.productname}</div>
                      <div className="text-xs text-purple-600 font-semibold">Added to your order as a Complimentary Free Gift (₹0.00)</div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50/80 via-white to-orange-50/80 border border-blue-100 rounded-2xl p-5 mb-5 shadow-sm text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">Support Us on Google</span>
                  </div>

                  <div className="flex justify-center gap-1 text-amber-400 text-xl mb-2">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>

                  <p className="text-xs text-gray-600 mb-4 leading-relaxed max-w-sm mx-auto">
                    Please take a moment to leave us a <strong>5-star review on Google</strong>! Your review supports our local Sivakasi pyrotech team and helps us keep offering the lowest wholesale prices.
                  </p>

                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-indigo-700 font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    ⭐ Submit Google Review ↗
                  </a>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleClaim}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold py-3 rounded-2xl text-sm shadow-lg transition-all hover:scale-[1.01]"
                  >
                    ✓ Claim Gift &amp; Checkout →
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const isZeroDiscountProductType = (productType) => {
  if (!productType) return false;
  const normalized = productType.toString().toLowerCase().replace(/[\s_-]+/g, '');
  return (
    normalized.includes('comet') ||
    normalized.includes('skyshot') ||
    normalized.includes('repeatingshot') ||
    normalized.includes('repeating')
  );
};

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
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiBudget, setAiBudget] = useState("");
  const [aiPreferences, setAiPreferences] = useState({
    kids: false,
    sound: false,
    night: false,
    kidsnight: false,
  });
  const [suggestedCart, setSuggestedCart] = useState({});

  const [freeGiftProducts, setFreeGiftProducts] = useState([]);
  const [showArcheryModal, setShowArcheryModal] = useState(false);
  const [wonGiftProduct, setWonGiftProduct] = useState(null);
  const [userReviewData, setUserReviewData] = useState({ rating: 0, comment: "", name: "" });
  const [hasPlayedArchery, setHasPlayedArchery] = useState(false);
  const [showPostBookingGoogleReview, setShowPostBookingGoogleReview] = useState(false);

  const fetchFreeGiftProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/free`);
      if (res.ok) setFreeGiftProducts(await res.json());
    } catch (e) {
      console.error("Failed to fetch free gift products", e);
    }
  }, []);

  useEffect(() => {
    fetchFreeGiftProducts();
  }, [fetchFreeGiftProducts]);

  const formatPercentage = (value) => Math.round(Number.parseFloat(value)).toString();
  const formatPrice = (price) => {
    const num = Number.parseFloat(price);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };
  const capitalize = str => str ? str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

  const serialSort = (a, b) => {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return collator.compare(a.serial_number, b.serial_number);
  };

  const showError = (message) => {
    setMinOrderMessage(message);
    setShowMinOrderModal(true);
    setTimeout(() => setShowMinOrderModal(false), 5000);
  };

  const downloadPDF = async () => {
    if (!products.length) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yOffset = 20;

    const year = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MADHU NISHA CRACKERS', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Website - www.madhunishacrackers.com', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    doc.text(`Retail Pricelist - ${year}`, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    doc.text('Contact Number - 9487524689', pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    const orderedTypes = [
      "One sound crackers", "Ground Chakkar", "Flower Pots", "Twinkling Star",
      "Rockets", "Bombs", "Repeating Shots", "Comets Sky Shots",
      "Fancy pencil varieties", "Fountain and Fancy Novelties", "Matches",
      "Guns and Caps", "Sparklers", "Premium Sparklers", "Gift Boxes", "Kids Special "
    ];

    const fetchImageAsBase64 = (url) => {
      return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX = 80;
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
            else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const imageCache = {};
    const allProducts = orderedTypes.flatMap(type => {
      const typeKey = type.replace(/ /g, "_").toLowerCase();
      return products.filter(p => p.product_type.toLowerCase() === typeKey);
    });

    await Promise.all(
      allProducts.map(async (product) => {
        const images = Array.isArray(product.images) ? product.images : [];
        const imgUrl = images.find(img => img && !img.includes('/video/') && !img.toLowerCase().endsWith('.gif'));
        if (imgUrl) {
          imageCache[product.serial_number] = await fetchImageAsBase64(imgUrl);
        }
      })
    );

    const ROW_HEIGHT = 18;
    const IMG_SIZE = 14;

    for (const type of orderedTypes) {
      const typeKey = type.replace(/ /g, "_").toLowerCase();
      const typeProducts = products.filter(p => p.product_type.toLowerCase() === typeKey).sort(serialSort);
      if (!typeProducts.length) continue;

      const sectionHeaderHeight = 10;
      if (yOffset + sectionHeaderHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFillColor(200, 200, 200);
      doc.rect(10, yOffset, pageWidth - 20, sectionHeaderHeight, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(capitalize(type), 14, yOffset + 7);
      yOffset += sectionHeaderHeight + 1;

      const colHeaderHeight = 8;
      doc.setFillColor(234, 88, 12);
      doc.rect(10, yOffset, pageWidth - 20, colHeaderHeight, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);

      const cols = { sl: 12, code: 23, img: 39, name: 61, rate: 131, disc: 152, per: 176 };
      doc.text('Sl', cols.sl, yOffset + 5.5);
      doc.text('Code', cols.code, yOffset + 5.5);
      doc.text('Image', cols.img, yOffset + 5.5);
      doc.text('Product Name', cols.name, yOffset + 5.5);
      doc.text('Rate', cols.rate, yOffset + 5.5);
      doc.text('Disc. Rate', cols.disc, yOffset + 5.5);
      doc.text('Per', cols.per, yOffset + 5.5);
      yOffset += colHeaderHeight + 1;

      let slNo = 1;
      for (const product of typeProducts) {
        if (yOffset + ROW_HEIGHT > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage();
          yOffset = 20;
        }

        const prodDisc = isZeroDiscountProductType(product.product_type) ? 0 : (product.discount || 0);
        const discount = product.price * (prodDisc / 100);
        const discountedRate = product.price - discount;

        if (slNo % 2 === 0) {
          doc.setFillColor(255, 247, 237);
          doc.rect(10, yOffset, pageWidth - 20, ROW_HEIGHT, 'F');
        }

        doc.setDrawColor(220, 220, 220);
        doc.rect(10, yOffset, pageWidth - 20, ROW_HEIGHT);

        [21, 37, 59, 129, 150, 173].forEach(x => {
          doc.line(x, yOffset, x, yOffset + ROW_HEIGHT);
        });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);

        const textY = yOffset + ROW_HEIGHT / 2 + 1.5;

        doc.text(String(slNo++), cols.sl, textY);
        doc.text(product.serial_number || '', cols.code, textY);

        const nameLines = doc.splitTextToSize(product.productname, 66);
        const nameY = nameLines.length > 1 ? yOffset + 5 : textY;
        doc.text(nameLines.slice(0, 2), cols.name, nameY);

        doc.text(`Rs.${formatPrice(product.price)}`, cols.rate, textY);
        doc.text(`Rs.${formatPrice(discountedRate)}`, cols.disc, textY);
        doc.text(product.per || '', cols.per, textY);

        const imgData = imageCache[product.serial_number];
        if (imgData) {
          const imgX = cols.img - 1;
          const imgY = yOffset + (ROW_HEIGHT - IMG_SIZE) / 2;
          try {
            doc.addImage(imgData, 'JPEG', imgX, imgY, IMG_SIZE, IMG_SIZE);
          } catch { }
        } else {
          doc.setFillColor(245, 245, 245);
          doc.rect(cols.img - 1, yOffset + (ROW_HEIGHT - IMG_SIZE) / 2, IMG_SIZE, IMG_SIZE, 'F');
          doc.setFontSize(6);
          doc.setTextColor(180, 180, 180);
          doc.text('No img', cols.img + 2, yOffset + ROW_HEIGHT / 2 + 1);
        }

        yOffset += ROW_HEIGHT;
      }

      yOffset += 6;
    }

    doc.save(`MNC_Pricelist_${year}.pdf`);
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
        const naturalSort = (a, b) => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare(a.productname, b.productname);
        const seenSerials = new Set();
        const normalizedProducts = productsData.data
          .filter(p => p.status === "on" && !seenSerials.has(p.serial_number) && seenSerials.add(p.serial_number))
          .map(product => ({
            ...product,
            discount: isZeroDiscountProductType(product.product_type) ? 0 : (parseFloat(product.discount) || 0),
            images: product.image ? (typeof product.image === "string" ? JSON.parse(product.image) : product.image) : [],
          }))
          .sort(naturalSort);
        setProducts(normalizedProducts);
        setPromocodes(Array.isArray(promocodesData) ? promocodesData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsLoading(false), 1500);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (customerDetails.state) {
      fetch(`${API_BASE_URL}/api/locations/states/${customerDetails.state}/districts`)
        .then(res => res.json())
        .then(data => setDistricts(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [customerDetails.state]);

  useEffect(() => {
    localStorage.setItem("firecracker-cart", JSON.stringify(cart));
  }, [cart]);

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
    if (!product?.serial_number) return;
    setCart(prev => ({ ...prev, [product.serial_number]: (prev[product.serial_number] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((product) => {
    if (!product?.serial_number) return;
    setCart(prev => {
      const count = (prev[product.serial_number] || 1) - 1;
      const updated = { ...prev };
      if (count <= 0) delete updated[product.serial_number];
      else updated[product.serial_number] = count;
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((product, quantity) => {
    if (!product?.serial_number) return;
    if (quantity < 0) quantity = 0;
    setCart(prev => {
      const updated = { ...prev };
      if (quantity === 0) delete updated[product.serial_number];
      else updated[product.serial_number] = quantity;
      return updated;
    });
  }, []);

  const addToSuggestedCart = useCallback((product) => {
    if (!product?.serial_number) return;
    setSuggestedCart(prev => ({ ...prev, [product.serial_number]: (prev[product.serial_number] || 0) + 1 }));
  }, []);

  const removeFromSuggestedCart = useCallback((product) => {
    if (!product?.serial_number) return;
    setSuggestedCart(prev => {
      const count = (prev[product.serial_number] || 1) - 1;
      const updated = { ...prev };
      if (count <= 0) delete updated[product.serial_number];
      else updated[product.serial_number] = count;
      return updated;
    });
  }, []);

  const updateSuggestedQuantity = useCallback((product, quantity) => {
    if (!product?.serial_number) return;
    if (quantity < 0) quantity = 0;
    setSuggestedCart(prev => {
      const updated = { ...prev };
      if (quantity === 0) delete updated[product.serial_number];
      else updated[product.serial_number] = quantity;
      return updated;
    });
  }, []);

  const generateSuggestions = useCallback(() => {
    const budget = Number(aiBudget);
    if (!budget || budget <= 0) { showError("Please enter a valid budget"); return; }

    const categories = {
      kids: [
        "new_arrivals",
        "fancy_pencil_varieties",
        "twinkling_star",
        "guns_and_caps",
        "matches"
      ],
      sound: [
        "bombs",
        "one_sound_crackers"
      ],
      night: [
        "repeating_shots",
        "comets_sky_shots",
        "new_arrivals",
        "rockets"
      ],
      kidsnight: [
        "fountain_and_fancy_novelties",
        "flower_pots",
        "ground_chakkar",
        "sparklers",
        "premium_sparklers"
      ]
    };

    const selectedPrefs = ["night", "kids", "sound", "kidsnight"].filter(p => aiPreferences[p]);
    if (!selectedPrefs.length) { showError("Select at least one preference"); return; }

    const budgetPerPref = budget / selectedPrefs.length;

    const tempCart = {};
    const sparklerSizeCount = {};
    const categorySpentMap = {};
    selectedPrefs.forEach(p => { categorySpentMap[p] = 0; });

    const getSparklerSize = name => {
      const m = name?.match(/(\d+)\s*cm/i);
      return m ? m[1] : null;
    };

    for (const pref of selectedPrefs) {
      const phase1Budget = budgetPerPref * 0.70;
      const types = categories[pref];

      const byType = {};
      for (const type of types) byType[type] = [];

      products
        .filter(p => types.includes(p.product_type?.toLowerCase()))
        .forEach(p => {
          const type = p.product_type?.toLowerCase();
          if (byType[type]) {
            byType[type].push({
              ...p,
              finalPrice: p.price * (1 - (p.discount || 0) / 100),
            });
          }
        });

      for (const type of types) {
        byType[type]
          .sort(() => Math.random() - 0.5)
          .sort((a, b) => {
            const priceDiff = a.finalPrice - b.finalPrice;
            if (Math.abs(priceDiff) < 50) return Math.random() - 0.5;
            return priceDiff;
          });
      }

      const sorted = types.flatMap(type => byType[type] || []).filter(p => p.finalPrice > 0);

      let prefSpent = 0;

      for (const p of sorted) {
        if (prefSpent + p.finalPrice > phase1Budget) continue;
        if (tempCart[p.serial_number]) continue;

        if (p.product_type === "sparklers" || p.product_type === "premium_sparklers") {
          const size = getSparklerSize(p.productname) || "unknown";
          if ((sparklerSizeCount[size] || 0) >= 3) continue;
          sparklerSizeCount[size] = (sparklerSizeCount[size] || 0) + 1;
        }

        tempCart[p.serial_number] = 1;
        prefSpent += p.finalPrice;
        categorySpentMap[pref] = (categorySpentMap[pref] || 0) + p.finalPrice;
      }
    }

    for (const pref of selectedPrefs) {
      const phase2Budget = budgetPerPref * 0.30;
      const types = categories[pref];

      const boostCandidates = types
        .flatMap(type =>
          Object.keys(tempCart)
            .map(serial => {
              const p = products.find(x => x.serial_number === serial);
              if (!p) return null;
              if (p.product_type?.toLowerCase() !== type) return null;
              return { ...p, finalPrice: p.price * (1 - (p.discount || 0) / 100) };
            })
            .filter(Boolean)
            .sort(() => Math.random() - 0.5)
        );

      if (!boostCandidates.length) continue;

      let boostRemaining = phase2Budget;
      const boostThreshold = budgetPerPref * 0.02;
      let safetyLimit = 500;

      while (boostRemaining > boostThreshold && safetyLimit-- > 0) {
        let addedAny = false;
        for (const p of boostCandidates) {
          if (boostRemaining < p.finalPrice) continue;
          const maxQty = Math.max(1, Math.floor((budgetPerPref * 0.25) / p.finalPrice));
          const currentQty = tempCart[p.serial_number] || 0;
          if (currentQty >= maxQty) continue;
          tempCart[p.serial_number] = currentQty + 1;
          boostRemaining -= p.finalPrice;
          addedAny = true;
          if (boostRemaining <= boostThreshold) break;
        }
        if (!addedAny) break;
      }
    }

    const totalSpent = Object.entries(tempCart).reduce((sum, [serial, qty]) => {
      const p = products.find(x => x.serial_number === serial);
      if (!p) return sum;
      return sum + (p.price * (1 - (p.discount || 0) / 100)) * qty;
    }, 0);

    let globalRemaining = budget - totalSpent;
    const globalThreshold = budget * 0.03;

    if (globalRemaining > globalThreshold && Object.keys(tempCart).length > 0) {
      const globalCandidates = selectedPrefs
        .flatMap(pref =>
          categories[pref].flatMap(type =>
            Object.keys(tempCart)
              .map(serial => {
                const p = products.find(x => x.serial_number === serial);
                if (!p) return null;
                if (p.product_type?.toLowerCase() !== type) return null;
                return { ...p, finalPrice: p.price * (1 - (p.discount || 0) / 100) };
              })
              .filter(Boolean)
              .sort(() => Math.random() - 0.5)
          )
        );

      let safetyLimit = 500;
      while (globalRemaining > globalThreshold && safetyLimit-- > 0) {
        let addedAny = false;
        for (const p of globalCandidates) {
          if (globalRemaining < p.finalPrice) continue;
          const maxQty = Math.max(1, Math.floor((budget * 0.20) / p.finalPrice));
          const currentQty = tempCart[p.serial_number] || 0;
          if (currentQty >= maxQty) continue;
          tempCart[p.serial_number] = currentQty + 1;
          globalRemaining -= p.finalPrice;
          addedAny = true;
          if (globalRemaining <= globalThreshold) break;
        }
        if (!addedAny) break;
      }
    }

    setSuggestedCart(tempCart);
  }, [aiBudget, aiPreferences, products]);

  const handleAiNext = () => {
    if (aiStep === 0 && !aiBudget) return showError("Please enter a budget.");
    if (aiStep < 2) { setAiStep(aiStep + 1); }
    else { generateSuggestions(); }
  };

  const handleAiBack = () => {
    if (aiStep > 0) {
      if (aiStep === 2) setSuggestedCart({});
      setAiStep(aiStep - 1);
    }
  };

  const addSuggestedToCart = () => {
    setCart(prev => {
      const updated = { ...prev };
      Object.entries(suggestedCart).forEach(([serial, qty]) => {
        updated[serial] = (updated[serial] || 0) + qty;
      });
      return updated;
    });
    setShowAiModal(false);
    setAiStep(0);
    setAiBudget("");
    setAiPreferences({ kids: false, sound: false, night: false, kidsnight: false });
    setSuggestedCart({});
  };

  const handleFinalCheckout = async () => {
    setIsBookingLoading(true);
    const selectedProducts = Object.entries(cart).map(([serial, qty]) => {
      const product = products.find(p => p.serial_number === serial);
      return {
        id: product.id,
        product_type: product.product_type,
        quantity: qty,
        per: product.per,
        price: product.price,
        discount: isZeroDiscountProductType(product.product_type) ? 0 : (product.discount || 0),
        serial_number: product.serial_number,
        productname: product.productname,
        status: product.status,
        is_gift: false,
      };
    });

    if (wonGiftProduct) {
      selectedProducts.push({
        id: wonGiftProduct.id,
        product_type: wonGiftProduct.product_type,
        quantity: 1,
        per: wonGiftProduct.per || "pcs",
        price: 0,
        discount: 0,
        productname: wonGiftProduct.productname,
        is_gift: true,
      });
    }

    if (!selectedProducts.length) { showError("Your cart is empty."); setIsBookingLoading(false); return; }
    if (!customerDetails.customer_name || !customerDetails.address || !customerDetails.district || !customerDetails.state || !customerDetails.mobile_number) {
      showError("Please fill all required customer details."); setIsBookingLoading(false); return;
    }

    const mobile = customerDetails.mobile_number.replace(/\D/g, "").slice(-10);
    if (mobile.length !== 10) { showError("Mobile number must be 10 digits."); setIsBookingLoading(false); return; }

    const selectedState = customerDetails.state?.trim();
    const minOrder = states.find(s => s.name === selectedState)?.min_rate;
    if (minOrder && Number.parseFloat(originalTotal) < minOrder) {
      showError(`Minimum order for ${selectedState} is ₹${minOrder}. Your total is ₹${originalTotal}.`);
      setIsBookingLoading(false); return;
    }

    try {
      setShowLoader(true);
      const response = await fetch(`${API_BASE_URL}/api/direct/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        const safeName = (customerDetails.customer_name || "order").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        link.download = `${safeName}-${data.order_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        showError(data.message || "Booking failed.");
      }
    } catch (err) {
      showError("Something went wrong during checkout.");
    } finally {
      setShowLoader(false);
      setIsBookingLoading(false);
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
    setCustomerDetails({ customer_name: "", address: "", district: "", state: "", mobile_number: "", email: "", customer_type: "User" });
    setAppliedPromo(null);
    setPromocode("");
    setOriginalTotal(0);
    setTotalDiscount(0);
    setWonGiftProduct(null);
    setHasPlayedArchery(false);
    setUserReviewData({ rating: 0, comment: "", name: "" });
    setTimeout(() => {
      setShowToaster(true);
      setShowPostBookingGoogleReview(true);
    }, 600);
  };

  const handleCheckoutClick = () => {
    if (!Object.keys(cart).length) return showError("Your cart is empty.");
    setIsCartOpen(false);
    if (!hasPlayedArchery && freeGiftProducts && freeGiftProducts.length > 0) {
      setShowArcheryModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_number") {
      const cleaned = value.replace(/\D/g, "").slice(-10);
      setCustomerDetails(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setCustomerDetails(prev => ({ ...prev, [name]: value }));
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
    const items = Array.isArray(media) ? media : [];
    setSelectedImages(items);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  }, []);

  const handleApplyPromo = useCallback(async (code) => {
    if (!code) { setAppliedPromo(null); setPromocode(""); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/promocodes`);
      const promos = await res.json();
      const found = promos.find(p => p.code.toLowerCase() === code.toLowerCase());
      if (!found) return showError("Invalid promocode.");
      if (found.min_amount && Number.parseFloat(originalTotal) < Number.parseFloat(found.min_amount)) {
        return showError(`Minimum order amount for this promocode is ₹${found.min_amount}.`);
      }
      if (found.end_date && new Date(found.end_date) < new Date()) {
        return showError("This promocode has expired.");
      }
      setAppliedPromo(found);
    } catch {
      showError("Could not validate promocode.");
    }
  }, [originalTotal]);

  const totals = useMemo(() => {
    let net = 0, save = 0, total = 0, productDiscount = 0, promoDiscount = 0;
    for (const serial in cart) {
      const qty = cart[serial];
      const p = products.find(x => x.serial_number === serial);
      if (!p) continue;
      const orig = Number.parseFloat(p.price);
      const isZeroDisc = isZeroDiscountProductType(p.product_type);
      const effectiveDisc = isZeroDisc ? 0 : (Number.parseFloat(p.discount) || 0);
      const disc = orig * (effectiveDisc / 100);
      const after = orig - disc;
      net += orig * qty;
      productDiscount += disc * qty;
      total += after * qty;
      if (appliedPromo && !isZeroDisc && (!appliedPromo.product_type || p.product_type === appliedPromo.product_type)) {
        promoDiscount += (after * qty * appliedPromo.discount) / 100;
      }
    }
    setOriginalTotal(total);
    setTotalDiscount(productDiscount);
    total -= promoDiscount;
    const fee = total * 0.01;
    total += fee;
    save = productDiscount + promoDiscount;
    return {
      net: formatPrice(net),
      save: formatPrice(save),
      total: formatPrice(total),
      promo_discount: formatPrice(promoDiscount),
      product_discount: formatPrice(productDiscount),
      processing_fee: formatPrice(fee),
    };
  }, [cart, products, appliedPromo]);

  const suggestedTotals = useMemo(() => {
    let total = 0;
    for (const serial in suggestedCart) {
      const qty = suggestedCart[serial];
      const p = products.find(x => x.serial_number === serial);
      if (!p) continue;
      const disc = isZeroDiscountProductType(p.product_type) ? 0 : (p.discount || 0);
      total += (p.price * (1 - disc / 100)) * qty;
    }
    return formatPrice(total);
  }, [suggestedCart, products]);

  const productTypes = useMemo(() => {
    const ordered = [
      "One sound crackers", "Ground Chakkar", "Flower Pots", "Twinkling Star", "Rockets", "Bombs",
      "Repeating Shots", "Comets Sky Shots", "Fancy pencil varieties", "Fountain and Fancy Novelties",
      "Matches", "Guns and Caps", "Sparklers", "Premium Sparklers", "Gift Boxes", "Kids Special "
    ];
    const available = [...new Set(products.filter(p => p.product_type !== "gift_box_dealers").map(p => p.product_type || "Others"))];
    const filtered = ordered.filter(t => available.includes(t.replace(/ /g, "_").toLowerCase()));
    return ["All", ...filtered];
  }, [products]);

  const grouped = useMemo(() => {
    const ordered = [
      "One sound crackers", "Ground Chakkar", "Flower Pots", "Twinkling Star", "Rockets", "Bombs",
      "Repeating Shots", "Comets Sky Shots", "Fancy pencil varieties", "Fountain and Fancy Novelties",
      "Matches", "Guns and Caps", "Sparklers", "Premium Sparklers", "Gift Boxes", "Kids Special "
    ];
    const result = products
      .filter(p => p.product_type !== "gift_box_dealers" &&
        (selectedType === "All" || p.product_type === selectedType.replace(/ /g, "_").toLowerCase()) &&
        (!searchTerm || p.productname.toLowerCase().includes(searchTerm.toLowerCase()) || p.serial_number.toLowerCase().includes(searchTerm.toLowerCase())))
      .reduce((acc, p) => {
        const key = p.product_type || "Others";
        acc[key] = acc[key] || [];
        acc[key].push(p);
        return acc;
      }, {});
    const orderedResult = {};
    ordered.map(t => t.replace(/ /g, "_").toLowerCase()).forEach(t => {
      if (result[t]) orderedResult[t] = result[t].sort(serialSort);
    });
    return orderedResult;
  }, [products, selectedType, searchTerm]);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  if (isLoading) return <LoadingSpinner />;

  const SummaryRows = () => (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-700"><span>Net Total</span><span className="font-medium text-black">₹{totals.net}</span></div>
      <div className="flex justify-between text-emerald-600"><span>Product Discount</span><span>−₹{totals.product_discount}</span></div>
      {appliedPromo && <div className="flex justify-between text-emerald-600"><span>Promo ({appliedPromo.code})</span><span>−₹{totals.promo_discount}</span></div>}
      <div className="flex justify-between text-emerald-600 font-medium"><span>You Save</span><span>−₹{totals.save}</span></div>
      <div className="flex justify-between text-gray-600"><span>Processing Fee (1%)</span><span>₹{totals.processing_fee}</span></div>
      <div className="flex justify-between text-orange-600 font-bold text-base pt-2 border-t border-orange-100"><span>Total</span><span>₹{totals.total}</span></div>
    </div>
  );

  const PromoSelector = () => (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Promo Code</label>
      <select value={promocode} onChange={e => setPromocode(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-gray-50 text-black text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
        <option value="">Select a promocode</option>
        {promocodes.map(promo => (
          <option key={promo.id} value={promo.code}>
            {promo.code} ({formatPercentage(promo.discount)}% OFF{promo.min_amount ? `, Min: ₹${promo.min_amount}` : ""}{promo.product_type ? `, Type: ${promo.product_type.replace(/_/g, " ")}` : ""}{promo.end_date ? `, Exp: ${new Date(promo.end_date).toLocaleDateString()}` : ""})
          </option>
        ))}
        <option value="custom">Enter custom code</option>
      </select>
      {promocode === "custom" && (
        <input type="text" value={promocode === "custom" ? "" : promocode} onChange={e => setPromocode(e.target.value)}
          placeholder="Enter custom code"
          className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-gray-50 text-black text-sm focus:ring-2 focus:ring-orange-500 transition-all" />
      )}
      {appliedPromo && (
        <p className="text-emerald-600 text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          ✓ {appliedPromo.code} — {formatPercentage(appliedPromo.discount)}% OFF applied
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-white" />
      <Navbar />
      <ToasterNotification show={showToaster} onClose={() => setShowToaster(false)} />

      <AnimatePresence>
        {showLoader && <RocketLoader onComplete={handleRocketComplete} />}
        {showSuccess && <SuccessAnimation />}

        {showMinOrderModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[96] bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-orange-100">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-500 text-2xl">⚠</div>
              <h3 className="text-lg font-bold text-black mb-2">Minimum Order Required</h3>
              <p className="text-gray-700 text-sm mb-6">{minOrderMessage}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowMinOrderModal(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl transition-all shadow-md">
                Understand
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showDetailsModal && selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseDetails}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-orange-100">
              <div className="p-6 text-black">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black mb-1">{selectedProduct.productname}</h3>
                    <div className="flex items-center gap-2">
                      {selectedProduct.discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedProduct.discount}% OFF</span>
                      )}
                      <span className="text-orange-600 font-bold text-base">₹{formatPrice(selectedProduct.price - (selectedProduct.price * (selectedProduct.discount || 0) / 100))}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={handleCloseDetails}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors border border-gray-200">
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
                <ModernCarousel media={selectedProduct.images} />
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedProduct.description || "Experience the magic of celebrations with our premium quality fireworks."}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { addToCart(selectedProduct); handleCloseDetails(); }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                      <FaPlus className="w-3 h-3" /> Add to Cart
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleCloseDetails}
                      className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition-colors border border-gray-200">
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center backdrop-blur-md"
            onClick={() => { setIsCartOpen(false); setIsExpandedCart(false); }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              onClick={e => e.stopPropagation()}
              className={`${isExpandedCart ? 'w-full max-w-4xl h-[90vh]' : 'w-full max-w-lg sm:mx-4 max-h-[90vh] sm:rounded-3xl rounded-t-3xl'} bg-white flex flex-col shadow-2xl overflow-hidden border border-orange-100`}>

              <div className="flex justify-between items-center px-6 py-4 border-b border-orange-100">
                <div>
                  <h3 className="font-bold text-black flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" /> Shopping Cart
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">{cartItemCount} items selected</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isExpandedCart && Object.keys(cart).length > 0 && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setIsExpandedCart(true)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors border border-gray-200">
                      <FaExpand className="w-3.5 h-3.5 text-gray-600" />
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setIsCartOpen(false); setIsExpandedCart(false); }}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors border border-gray-200">
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${isExpandedCart ? '' : 'max-h-[38vh]'}`}>
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                      <ShoppingCart className="w-8 h-8 text-orange-500/60" />
                    </div>
                    <p className="text-gray-700 font-medium">Your cart is empty</p>
                    <p className="text-gray-500 text-sm mt-1">Add some fireworks to get started!</p>
                  </div>
                ) : (
                  Object.entries(cart).map(([serial, qty]) => {
                    const product = products.find(p => p.serial_number === serial);
                    if (!product) return null;
                    const discount = (product.price * product.discount) / 100;
                    const priceAfterDiscount = formatPrice(product.price - discount);
                    const imageSrc = Array.isArray(product.images) ? product.images.filter(item => !item.includes("/video/") && !item.toLowerCase().endsWith(".gif"))[0] || need : need;
                    return (
                      <motion.div key={serial} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:border-orange-300 transition-colors">
                        <img src={imageSrc} alt={product.productname}
                          className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-200 cursor-pointer flex-shrink-0"
                          onClick={() => handleImageClick(product.images)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black line-clamp-2 leading-tight">{product.productname}</p>
                          <p className="text-xs text-orange-600 font-bold mt-0.5">₹{priceAfterDiscount} × {qty}</p>
                          <p className="text-xs text-gray-600">= ₹{formatPrice((product.price - discount) * qty)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(product)}
                            className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors">
                            <FaMinus className="w-2.5 h-2.5" />
                          </motion.button>
                          <span className="text-sm font-bold w-7 text-center text-black">{qty}</span>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(product)}
                            className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors">
                            <FaPlus className="w-2.5 h-2.5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {isExpandedCart ? (
                <div className="px-6 py-5 border-t border-orange-100 bg-gray-50">
                  <SummaryRows />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setIsExpandedCart(false)}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-gray-200">
                    <FaCompress className="w-3.5 h-3.5" /> Collapse View
                  </motion.button>
                </div>
              ) : (
                <div className="px-5 py-5 border-t border-orange-100 bg-gray-50 space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-2.5 overflow-hidden">
                    <p className="text-xs font-semibold text-orange-600 mb-1">Minimum Purchase Rates</p>
                    <div className="text-xs text-orange-700 overflow-hidden">
                      <div className="animate-marquee whitespace-nowrap">
                        {states.map(s => `${s.name}: ₹${s.min_rate}`).join(" • ")}
                      </div>
                    </div>
                  </div>
                  <PromoSelector />
                  <div className="text-xs text-red-700 space-y-1 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <p>⚠ Product images are for reference only — actual products may vary.</p>
                    <p>⚠ Delivery charges are payable to transport. Pickup at your own cost.</p>
                  </div>
                  <SummaryRows />
                  <div className="flex gap-3 pt-1">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setCart({})}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm border border-gray-200">
                      Clear Cart
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleCheckoutClick}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-orange-500/30 text-sm">
                      Checkout →
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {showImageModal && selectedImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseImageModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full mx-4">
              <AnimatePresence mode="wait">
                <motion.div key={currentImageIndex} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}>
                  {selectedImages[currentImageIndex]?.includes("/video/") ? (
                    <video src={selectedImages[currentImageIndex]} autoPlay muted loop className="w-full max-h-[80vh] object-contain rounded-2xl" />
                  ) : (
                    <img src={selectedImages[currentImageIndex] || "/placeholder.svg"} alt="Product"
                      className="w-full max-h-[80vh] object-contain rounded-2xl" />
                  )}
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleCloseImageModal}
                className="absolute top-3 right-3 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-colors border border-white/10">
                <X className="w-5 h-5" />
              </motion.button>
              {selectedImages.length > 1 && (
                <>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedImages.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-colors border border-white/10">
                    <FaArrowLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(prev => prev === selectedImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white transition-colors border border-white/10">
                    <FaArrowRight className="w-4 h-4" />
                  </motion.button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                    {currentImageIndex + 1} / {selectedImages.length}
                  </div>
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 max-w-sm overflow-x-auto p-1 mobile:translate-y-40">
                    {selectedImages.map((image, index) => (
                      <motion.button key={index} whileHover={{ scale: 1.1 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${index === currentImageIndex ? "border-orange-400 opacity-100" : "border-orange-100 opacity-60 hover:opacity-80"}`}>
                        {image?.includes("/video/") ? <video src={image} className="w-full h-full object-cover" /> : <img src={image || "/placeholder.svg"} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {showAiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-md px-4"
            onClick={() => { setShowAiModal(false); setAiStep(0); setAiBudget(""); setAiPreferences({ kids: false, sound: false, night: false, kidsnight: false }); setSuggestedCart({}); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-orange-100">

              <div className="px-6 pt-6 pb-4 border-b border-orange-100">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black">Smart AI Assistant</h2>
                    <p className="text-xs text-gray-600">Let me build your perfect cart</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {["Budget", "Preferences", "Suggestions"].map((label, i) => (
                    <div key={i} className="flex-1 flex items-center gap-1">
                      <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= aiStep ? 'bg-orange-500' : 'bg-gray-100'}`} />
                      {i < 2 && <div className={`w-1 h-1 rounded-full ${i < aiStep ? 'bg-orange-500' : 'bg-gray-100'}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-0.5">
                  {["Budget", "Preferences", "Suggestions"].map((label, i) => (
                    <span key={i} className={i === aiStep ? 'text-orange-600 font-medium' : ''}>{label}</span>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {aiStep === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                      <p className="text-gray-700 text-sm">What's your total budget for fireworks?</p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">₹</span>
                        <input type="number" value={aiBudget} onChange={e => setAiBudget(e.target.value)}
                          className="w-full pl-8 pr-4 py-3.5 border border-orange-200 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold text-black transition-all"
                          placeholder="Enter amount" />
                      </div>
                    </motion.div>
                  )}

                  {aiStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                      <p className="text-gray-700 text-sm">What kind of fireworks do you prefer?</p>
                      <div className="space-y-3">
                        {[
                          { key: 'kids', emoji: '🧒', label: 'Kids Friendly', desc: 'Twinkling Star, Fancy Pencil, Novelties' },
                          { key: 'sound', emoji: '💥', label: 'Sound Crackers', desc: 'Bombs, Atom Bombs, One Sound' },
                          { key: 'night', emoji: '🚀', label: 'Night Sky Display', desc: 'Rockets, Repeating Shots, Sky Shots' },
                          { key: 'kidsnight', emoji: '✨', label: 'Kids Night Crackers', desc: 'Sparklers, Flower Pots, Fountains, Ground Chakkar' },
                        ].map(({ key, emoji, label, desc }) => (
                          <label key={key}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${aiPreferences[key] ? 'border-orange-500 bg-orange-500/10' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
                            <input type="checkbox" checked={aiPreferences[key]}
                              onChange={e => setAiPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="sr-only" />
                            <span className="text-2xl">{emoji}</span>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${aiPreferences[key] ? 'text-orange-600' : 'text-gray-800'}`}>{label}</p>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${aiPreferences[key] ? 'bg-orange-500 border-orange-500' : 'border-gray-500'}`}>
                              {aiPreferences[key] && <span className="text-white text-xs">✓</span>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {aiStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-black">Suggested Items</p>
                          <p className="text-xs text-gray-600">{Object.keys(suggestedCart).length} items · ≈ ₹{suggestedTotals}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={generateSuggestions}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-orange-200">
                          <span>Regenerate</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </motion.button>
                      </div>

                      {Object.keys(suggestedCart).length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                          <p className="text-sm">No suggestions generated.</p>
                          <p className="text-xs mt-1">Try increasing the budget or changing preferences.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                          {Object.entries(suggestedCart).map(([serial, qty]) => {
                            const product = products.find(p => p.serial_number === serial);
                            if (!product) return null;
                            const discount = (product.price * product.discount) / 100;
                            const priceAfterDiscount = formatPrice(product.price - discount);
                            const imageSrc = Array.isArray(product.images) && product.images.length > 0
                              ? product.images.find(img => !img.includes("/video/")) || product.images[0] : need;
                            return (
                              <div key={serial} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                                <img src={imageSrc} alt={product.productname}
                                  className="w-14 h-14 rounded-xl object-cover bg-white border border-gray-200 flex-shrink-0"
                                  onError={e => e.target.src = need} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-black text-sm line-clamp-2 leading-tight">{product.productname}</p>
                                  <p className="text-xs text-orange-600 mt-0.5">₹{priceAfterDiscount} × {qty}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => removeFromSuggestedCart(product)}
                                    className="w-7 h-7 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 transition-colors border border-orange-200">
                                    <FaMinus className="w-2.5 h-2.5" />
                                  </motion.button>
                                  <span className="w-8 text-center font-bold text-sm text-black">{qty}</span>
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => addToSuggestedCart(product)}
                                    className="w-7 h-7 bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 transition-colors border border-orange-200">
                                    <FaPlus className="w-2.5 h-2.5" />
                                  </motion.button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {Object.keys(suggestedCart).length > 0 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={addSuggestedToCart}
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-emerald-500/30 text-sm transition-all">
                          ✓ Add All to Cart
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 flex justify-between items-center">
                  {aiStep > 0 ? (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleAiBack}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-medium transition-colors border border-gray-200">
                      ← Back
                    </motion.button>
                  ) : <div />}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleAiNext}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all">
                    {aiStep < 2 ? "Next →" : "Generate"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="hundred:pt-48 mobile:pt-34 px-4 sm:px-8 max-w-7xl mx-auto pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 mb-6 mobile:mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or code…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-black placeholder-gray-500 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-sm transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
              className="pl-11 pr-10 py-3 bg-white text-black border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-sm appearance-none cursor-pointer min-w-[200px] transition-all">
              {productTypes.map(type => <option className="bg-white text-black" key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-10">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={downloadPDF}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center gap-2.5 text-sm transition-all">
            <Download className="w-4 h-4" />
            Download Pricelist
          </motion.button>

          <div className="relative">
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowAiModal(true)}
              className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-500/30 w-14 h-14 flex items-center justify-center transition-all">
              <span className="text-2xl">🤖</span>
            </motion.button>
            <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute -top-2 -right-12 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
              Need Help?
            </motion.span>
          </div>
        </motion.div>

        {Object.entries(grouped).map(([type, items], groupIndex) => (
          <motion.section key={type}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
            className="mb-16">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full flex-shrink-0" />
              <h2 className="text-2xl font-bold text-black capitalize">{type.replace(/_/g, " ")}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                {items.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product, idx) => {
                if (!product) return null;
                const originalPrice = Number.parseFloat(product.price);
                const discount = originalPrice * (product.discount / 100);
                const finalPrice = product.discount > 0 ? formatPrice(originalPrice - discount) : formatPrice(originalPrice);
                const count = cart[product.serial_number] || 0;
                return (
                  <motion.div key={product.serial_number}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 border border-orange-100 hover:border-orange-300 transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <ModernCarousel media={product.images} onImageClick={handleImageClick} />
                      {product.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg">
                          {formatPercentage(product.discount)}% OFF
                        </div>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleShowDetails(product)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md transition-colors border border-orange-100">
                        <FaInfoCircle className="text-orange-500 w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-600 font-mono mb-1">{product.serial_number}</p>
                      <h3 className="text-sm font-bold text-orange-600 line-clamp-2 leading-snug mb-2 group-hover:text-orange-700 transition-colors">
                        {product.productname}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">₹{formatPrice(originalPrice)}</span>
                        )}
                        <span className="text-base font-bold text-orange-600">₹{finalPrice}</span>
                        <span className="text-xs text-gray-600">/ {product.per}</span>
                      </div>

                      <AnimatePresence mode="wait">
                        {count > 0 ? (
                          <motion.div key="qty"
                            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-1.5 shadow-md shadow-orange-500/30">
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(product)}
                              className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
                              <FaMinus className="w-2.5 h-2.5" />
                            </motion.button>
                            <span className="text-white font-bold text-sm px-2 min-w-[2rem] text-center">{count}</span>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => addToCart(product)}
                              className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors">
                              <FaPlus className="w-2.5 h-2.5" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button key="add"
                            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => addToCart(product)}
                            className="w-full bg-orange-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 text-orange-600 hover:text-white border border-orange-100 hover:border-transparent font-semibold py-2.5 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-1.5">
                            <FaPlus className="w-2.5 h-2.5" />
                            Add
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </main>

      <div className="fixed hundred:bottom-6 mobile:bottom-22 right-6 z-20">
        <motion.button onClick={() => setIsCartOpen(true)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className={`relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-2xl shadow-orange-500/40 w-16 h-16 flex items-center justify-center transition-all ${isCartOpen ? "hidden" : ""}`}>
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md">
              {cartItemCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-md px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-orange-100">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black">Customer Details</h2>
                    <p className="text-xs text-gray-600">Fill in your details to confirm booking</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {["customer_name", "address", "mobile_number", "email"].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        {field.replace(/_/g, " ")}{field !== "email" && " *"}
                      </label>
                      <input name={field} type={field === "email" ? "email" : "text"}
                        placeholder={`Enter ${field.replace(/_/g, " ")}`}
                        value={customerDetails[field]} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-orange-200 rounded-2xl bg-gray-50 text-black placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
                        required={field !== "email"} />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">State *</label>
                    <select name="state" value={customerDetails.state}
                      onChange={e => setCustomerDetails(prev => ({ ...prev, state: e.target.value, district: "" }))}
                      className="w-full px-4 py-3 border border-orange-200 rounded-2xl bg-gray-50 text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all" required>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  {customerDetails.state && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">City / Place *</label>
                      <select name="district" value={customerDetails.district} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-orange-200 rounded-2xl bg-gray-50 text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all" required>
                        <option value="">Select Place / City</option>
                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  {wonGiftProduct ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🎁</span>
                        <div>
                          <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Free Gift Included</p>
                          <p className="text-sm font-extrabold text-gray-800">{wonGiftProduct.productname}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200">₹0.00 (FREE)</span>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setShowModal(false); setShowArcheryModal(true); }}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all">
                      <span>🎯</span> Play Archery Target Game to Win a Free Gift!
                    </button>
                  )}

                  <PromoSelector />

                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-black">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Order Summary</p>
                    <SummaryRows />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl text-sm transition-colors border border-gray-200">
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isBookingLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isBookingLoading ? 1 : 0.98 }}
                    onClick={handleFinalCheckout} disabled={isBookingLoading}
                    className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm transition-all ${isBookingLoading ? "opacity-75 cursor-not-allowed" : ""}`}>
                    {isBookingLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Booking…
                      </>
                    ) : "Confirm Booking →"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ArcheryGameModal
        isOpen={showArcheryModal}
        onClose={() => {
          setShowArcheryModal(false);
          setShowModal(true);
        }}
        freeProducts={freeGiftProducts}
        onClaimGift={({ wonProduct }) => {
          if (wonProduct) {
            setWonGiftProduct({
              id: wonProduct.id,
              product_type: wonProduct.product_type,
              productname: wonProduct.productname,
              price: 0,
              discount: 0,
              per: wonProduct.per || 'pcs',
              is_gift: true,
            });
          }
          setHasPlayedArchery(true);
          setShowArcheryModal(false);
          setShowModal(true);
        }}
      />

      {/* Post Booking Google Review Modal */}
      <AnimatePresence>
        {showPostBookingGoogleReview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-[105] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-orange-100 text-center p-6 sm:p-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner font-bold">
                ✓
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                Booking Confirmed! 🎉
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Your order bill has been downloaded. Our team will contact you shortly to confirm dispatch.
              </p>

              <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-amber-50/50 border border-indigo-100 rounded-2xl p-5 mb-6 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-bold text-gray-800 text-sm">Loved your booking experience?</span>
                </div>
                <div className="flex justify-center gap-1 text-amber-400 text-xl mb-2">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Support Madhu Nisha Crackers with a quick <strong>5-star Google Review</strong>! It takes only 10 seconds.
                </p>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPostBookingGoogleReview(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  ⭐ Submit Google Review ↗
                </a>
              </div>

              <button
                onClick={() => setShowPostBookingGoogleReview(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
              >
                Close &amp; Continue Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 15s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @keyframes archerySlide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gun-icon { transition: transform 0.08s ease-out; }
        .gun-recoil { animation: gunRecoil 0.38s ease-out; }
        @keyframes gunRecoil {
          0%   { transform: translate(-50%, 0) rotate(0deg); }
          15%  { transform: translate(-50%, 4px) rotate(-6deg); }
          40%  { transform: translate(-50%, -2px) rotate(3deg); }
          100% { transform: translate(-50%, 0) rotate(0deg); }
        }
        .screen-shake { animation: screenShake 0.38s ease-out; }
        @keyframes screenShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
      `}</style>
    </>
  );
};

export default Pricelist;