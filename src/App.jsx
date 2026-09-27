import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  MessageSquare,
  Coffee,
  Layers,
  Lock,
  Unlock,
  PackageCheck,
  Calendar,
  AlertTriangle,
  Camera,
  Mail,
  Eye,
  Store,
  ShoppingCart,
  ChevronRight,
  Settings,
  Calculator,
  Printer
} from 'lucide-react';

// --- HELPER FORMAT TANGGAL & WAKTU ---
const getFormattedDate = (d = new Date()) => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const getDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

const getFormattedMonth = (d = new Date()) => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

const getFormattedTime = (d = new Date()) => {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const INITIAL_OUTLETS = [
  { id: 'out_1', name: 'Outlet Utama', isDefault: true }
];

const INITIAL_CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'King Baba'];

const INITIAL_INGREDIENTS = [
  { id: 'ing_1', name: 'Bubuk Coklat Premium', stock: 5000, unit: 'gram', costPerUnit: 50, minStock: 500 },
  { id: 'ing_2', name: 'Susu Fresh Milk', stock: 10000, unit: 'ml', costPerUnit: 25, minStock: 1000 },
  { id: 'ing_3', name: 'Cup Large 16oz', stock: 500, unit: 'pcs', costPerUnit: 1000, minStock: 100 },
  { id: 'ing_4', name: 'Boba Tapioka', stock: 2000, unit: 'gram', costPerUnit: 30, minStock: 300 }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'King Baba Coklat (Large)',
    category: 'King Baba',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
    prices: { dineIn: 10000, takeaway: 10000, online: 12000 },
    recipe: [
      { ingredientId: 'ing_1', qty: 40, unit: 'gram' },
      { ingredientId: 'ing_2', unit: 'ml', qty: 80 },
      { ingredientId: 'ing_3', unit: 'pcs', qty: 1 }
    ],
    customGroups: [
      {
        id: 'cg_topping',
        name: 'Extra Topping',
        type: 'multiple',
        options: [
          { name: 'Extra Boba', extraPrice: 3000, ingredientId: 'ing_4', stockQty: 30 }
        ]
      }
    ]
  }
];

export default function App() {
  const [outlets, setOutlets] = useState(() => {
    const saved = localStorage.getItem('nexpos_outlets');
    return saved ? JSON.parse(saved) : INITIAL_OUTLETS;
  });

  const [activeOutletId, setActiveOutletId] = useState(() => {
    const saved = localStorage.getItem('nexpos_active_outlet_id');
    return saved ? JSON.parse(saved) : 'out_1';
  });

  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [isManageOutletsModalOpen, setIsManageOutletsModalOpen] = useState(false);

  const [activeRole, setActiveRole] = useState('cashier');
  const [pinInput, setPinInput] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinPurpose, setPinPurpose] = useState(null);

  const [outletSettingsMap, setOutletSettingsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_outlet_settings_map');
    return saved ? JSON.parse(saved) : {
      out_1: {
        storeName: 'NEXPOS STORE',
        address: 'Jl. Contoh No. 123, Tasikmalaya',
        phone: '081234567890',
        footerMessage: 'Terima kasih atas kunjungan Anda!'
      }
    };
  });

  const [currentTab, setCurrentTab] = useState('pos');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [categoriesMap, setCategoriesMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_categories_map');
    return saved ? JSON.parse(saved) : { out_1: INITIAL_CATEGORIES };
  });

  const [productsMap, setProductsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_products_map');
    return saved ? JSON.parse(saved) : { out_1: INITIAL_PRODUCTS };
  });

  const [ingredientsMap, setIngredientsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_ingredients_map');
    return saved ? JSON.parse(saved) : { out_1: INITIAL_INGREDIENTS };
  });

  const [restockLogsMap, setRestockLogsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_restock_logs_map');
    return saved ? JSON.parse(saved) : { out_1: [] };
  });

  const [activeShiftsMap, setActiveShiftsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_active_shifts_map');
    return saved ? JSON.parse(saved) : {};
  });

  const [shiftHistoryMap, setShiftHistoryMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_shift_history_map');
    return saved ? JSON.parse(saved) : { out_1: [] };
  });

  const [transactionsMap, setTransactionsMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_transactions_map');
    return saved ? JSON.parse(saved) : { out_1: [] };
  });

  const [expensesMap, setExpensesMap] = useState(() => {
    const saved = localStorage.getItem('nexpos_expenses_map');
    return saved ? JSON.parse(saved) : { out_1: [] };
  });

  useEffect(() => { localStorage.setItem('nexpos_outlets', JSON.stringify(outlets)); }, [outlets]);
  useEffect(() => { localStorage.setItem('nexpos_active_outlet_id', JSON.stringify(activeOutletId)); }, [activeOutletId]);
  useEffect(() => { localStorage.setItem('nexpos_categories_map', JSON.stringify(categoriesMap)); }, [categoriesMap]);
  useEffect(() => { localStorage.setItem('nexpos_products_map', JSON.stringify(productsMap)); }, [productsMap]);
  useEffect(() => { localStorage.setItem('nexpos_ingredients_map', JSON.stringify(ingredientsMap)); }, [ingredientsMap]);
  useEffect(() => { localStorage.setItem('nexpos_restock_logs_map', JSON.stringify(restockLogsMap)); }, [restockLogsMap]);
  useEffect(() => { localStorage.setItem('nexpos_active_shifts_map', JSON.stringify(activeShiftsMap)); }, [activeShiftsMap]);
  useEffect(() => { localStorage.setItem('nexpos_shift_history_map', JSON.stringify(shiftHistoryMap)); }, [shiftHistoryMap]);
  useEffect(() => { localStorage.setItem('nexpos_transactions_map', JSON.stringify(transactionsMap)); }, [transactionsMap]);
  useEffect(() => { localStorage.setItem('nexpos_expenses_map', JSON.stringify(expensesMap)); }, [expensesMap]);

  const currentOutletObj = outlets.find(o => o.id === activeOutletId) || outlets[0] || { id: 'out_1', name: 'Outlet Utama' };
  
  const categories = categoriesMap[activeOutletId] || ['Semua', 'Makanan', 'Minuman'];
  const products = productsMap[activeOutletId] || [];
  const ingredients = ingredientsMap[activeOutletId] || [];
  const restockLogs = restockLogsMap[activeOutletId] || [];
  const currentShift = activeShiftsMap[activeOutletId] || null;
  const shiftHistory = shiftHistoryMap[activeOutletId] || [];
  const transactions = transactionsMap[activeOutletId] || [];
  const expenses = expensesMap[activeOutletId] || [];

  const [cashierNotes, setCashierNotes] = useState(() => {
    return currentShift ? (currentShift.cashierNotes || '') : '';
  });

  useEffect(() => {
    setCashierNotes(currentShift ? (currentShift.cashierNotes || '') : '');
  }, [activeOutletId, activeShiftsMap]);

  const setCategories = (newVal) => setCategoriesMap({ ...categoriesMap, [activeOutletId]: typeof newVal === 'function' ? newVal(categories) : newVal });
  const setProducts = (newVal) => setProductsMap({ ...productsMap, [activeOutletId]: typeof newVal === 'function' ? newVal(products) : newVal });
  const setIngredients = (newVal) => setIngredientsMap({ ...ingredientsMap, [activeOutletId]: typeof newVal === 'function' ? newVal(ingredients) : newVal });
  const setRestockLogs = (newVal) => setRestockLogsMap({ ...restockLogsMap, [activeOutletId]: typeof newVal === 'function' ? newVal(restockLogs) : newVal });
  const setShiftHistory = (newVal) => setShiftHistoryMap({ ...shiftHistoryMap, [activeOutletId]: typeof newVal === 'function' ? newVal(shiftHistory) : newVal });
  const setTransactions = (newVal) => setTransactionsMap({ ...transactionsMap, [activeOutletId]: typeof newVal === 'function' ? newVal(transactions) : newVal });
  const setExpenses = (newVal) => setExpensesMap({ ...expensesMap, [activeOutletId]: typeof newVal === 'function' ? newVal(expenses) : newVal });

  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [orderType, setOrderType] = useState('dineIn');
  const [cart, setCart] = useState([]);
  
  // State Input Pelanggan yang Independen agar Tidak Lag/Reset saat Mengetik
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  const [discountType, setDiscountType] = useState('none');
  const [discountVal, setDiscountVal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');

  const [paymentProofPhoto, setPaymentProofPhoto] = useState(null);
  const [paymentMissingReason, setPaymentMissingReason] = useState('');

  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedCustoms, setSelectedCustoms] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [viewingProofModal, setViewingProofModal] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formCustomGroups, setFormCustomGroups] = useState([]);
  const [formRecipe, setFormRecipe] = useState([]);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [newGroupTypeInput, setNewGroupTypeInput] = useState('single');

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedIngredientForRestock, setSelectedIngredientForRestock] = useState(null);

  const [reportFilterType, setReportFilterType] = useState('daily');
  const [reportDate, setReportDate] = useState(getFormattedDate());
  const [reportMonth, setReportMonth] = useState(getFormattedMonth());

  const calculateProductHPP = (recipeList) => {
    if (!recipeList || recipeList.length === 0) return 0;
    let totalHpp = 0;
    recipeList.forEach(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (ing) {
        totalHpp += (Number(item.qty) || 0) * (Number(ing.costPerUnit) || 0);
      }
    });
    return totalHpp;
  };

  const handleCreateOutletFromScratch = (e) => {
    e.preventDefault();
    const name = e.target.outletName.value.trim();
    if (!name) return;

    const newOutletId = 'out_' + Date.now();
    const newOutletObj = {
      id: newOutletId,
      name,
      createdAt: getFormattedDate()
    };

    setOutlets([...outlets, newOutletObj]);
    setCategoriesMap({ ...categoriesMap, [newOutletId]: ['Semua', 'Makanan', 'Minuman'] });
    setProductsMap({ ...productsMap, [newOutletId]: [] });
    setIngredientsMap({ ...ingredientsMap, [newOutletId]: [] });
    setRestockLogsMap({ ...restockLogsMap, [newOutletId]: [] });
    setShiftHistoryMap({ ...shiftHistoryMap, [newOutletId]: [] });
    setTransactionsMap({ ...transactionsMap, [newOutletId]: [] });
    setExpensesMap({ ...expensesMap, [newOutletId]: [] });

    setActiveOutletId(newOutletId);
    setIsOutletModalOpen(false);
    setCart([]);
    alert(`Outlet Baru "${name}" Berhasil Dibuat DARI NOL!`);
  };

  const handleDeleteOutlet = (outletIdToDelete, outletName) => {
    if (outlets.length <= 1) {
      alert('Tidak dapat menghapus outlet. Minimal harus ada 1 outlet aktif!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus outlet "${outletName}" secara permanen?`)) {
      const updatedOutlets = outlets.filter(o => o.id !== outletIdToDelete);
      setOutlets(updatedOutlets);

      const copyCat = { ...categoriesMap }; delete copyCat[outletIdToDelete]; setCategoriesMap(copyCat);
      const copyProd = { ...productsMap }; delete copyProd[outletIdToDelete]; setProductsMap(copyProd);
      const copyIng = { ...ingredientsMap }; delete copyIng[outletIdToDelete]; setIngredientsMap(copyIng);
      const copyLog = { ...restockLogsMap }; delete copyLog[outletIdToDelete]; setRestockLogsMap(copyLog);
      const copyShiftActive = { ...activeShiftsMap }; delete copyShiftActive[outletIdToDelete]; setActiveShiftsMap(copyShiftActive);
      const copyShiftHist = { ...shiftHistoryMap }; delete copyShiftHist[outletIdToDelete]; setShiftHistoryMap(copyShiftHist);
      const copyTx = { ...transactionsMap }; delete copyTx[outletIdToDelete]; setTransactionsMap(copyTx);
      const copyExp = { ...expensesMap }; delete copyExp[outletIdToDelete]; setExpensesMap(copyExp);

      if (activeOutletId === outletIdToDelete) {
        setActiveOutletId(updatedOutlets[0].id);
      }
      alert(`Outlet "${outletName}" berhasil dihapus.`);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === '1234') {
      if (pinPurpose === 'switch_owner') {
        setActiveRole('owner');
        setIsPinModalOpen(false);
      }
      setPinInput('');
    } else {
      alert('PIN Salah! (PIN Default Owner: 1234)');
      setPinInput('');
    }
  };

  const handleSelectProduct = (product) => {
    if (product.customGroups && product.customGroups.length > 0) {
      setCustomizingProduct(product);
      const initGroup = {};
      product.customGroups.forEach(g => {
        if (g.type === 'single' && g.options && g.options.length > 0) {
          initGroup[g.name] = g.options[0];
        } else {
          initGroup[g.name] = [];
        }
      });
      setSelectedCustoms(initGroup);
    } else {
      addToCart(product, {}, 1);
    }
  };

  const addToCart = (product, customs = {}, qty = 1) => {
    const unitPrice = (product.prices && (product.prices[orderType] || product.prices.dineIn)) || 0;
    let extraCost = 0;
    let customSummary = [];

    if (customs) {
      Object.keys(customs).forEach(groupName => {
        const val = customs[groupName];
        if (Array.isArray(val)) {
          val.forEach(opt => {
            extraCost += (opt.extraPrice || 0);
            customSummary.push(opt.name);
          });
        } else if (val && val.name) {
          extraCost += (val.extraPrice || 0);
          customSummary.push(val.name);
        }
      });
    }

    const finalPrice = unitPrice + extraCost;
    const toppingHpp = Object.values(customs || {}).reduce((total, val) => {
      const options = Array.isArray(val) ? val : (val && val.name ? [val] : []);
      return total + options.reduce((sum, opt) => {
        const ing = opt.ingredientId ? ingredients.find(i => i.id === opt.ingredientId) : null;
        return sum + ((Number(opt.stockQty) || 0) * (Number(ing?.costPerUnit) || 0));
      }, 0);
    }, 0);
    const itemHpp = calculateProductHPP(product.recipe) + toppingHpp;
    const cartItemId = product.id + '-' + customSummary.sort().join('-') + '-' + orderType;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, {
        cartItemId,
        product,
        customs: JSON.parse(JSON.stringify(customs || {})),
        customsSummary: customSummary.join(', '),
        price: finalPrice,
        hpp: itemHpp,
        qty
      }];
    });

    setCustomizingProduct(null);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  let discountAmount = 0;
  if (discountType === 'percent') discountAmount = (subtotal * discountVal) / 100;
  else if (discountType === 'nominal') discountAmount = discountVal;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleProcessPayment = () => {
    if (!currentShift) {
      alert(`Silakan Buka Shift Kasir untuk ${currentOutletObj.name} terlebih dahulu di menu Shift!`);
      setCurrentTab('shift');
      setIsCheckoutModalOpen(false);
      setIsMobileCartOpen(false);
      return;
    }

    if (paymentMethod !== 'cash') {
      if (!paymentProofPhoto && !paymentMissingReason.trim()) {
        alert('Harap unggah/foto Bukti Pembayaran QRIS/Debit atau isi Alasan jika tidak ada foto!');
        return;
      }
    }

    // Hitung seluruh bahan yang akan terpakai: resep menu + topping/varian yang terhubung ke stok.
    const stockUsage = {};
    const addStockUsage = (ingredientId, qty) => {
      if (!ingredientId) return;
      stockUsage[ingredientId] = (stockUsage[ingredientId] || 0) + (Number(qty) || 0);
    };

    cart.forEach(cartItem => {
      const productRecipe = cartItem.product.recipe || [];
      productRecipe.forEach(recipeItem => {
        addStockUsage(recipeItem.ingredientId, (Number(recipeItem.qty) || 0) * cartItem.qty);
      });

      Object.values(cartItem.customs || {}).forEach(val => {
        const options = Array.isArray(val) ? val : (val && val.name ? [val] : []);
        options.forEach(opt => {
          addStockUsage(opt.ingredientId, (Number(opt.stockQty) || 0) * cartItem.qty);
        });
      });
    });

    const insufficientStock = Object.entries(stockUsage)
      .map(([ingredientId, usedQty]) => {
        const ing = ingredients.find(i => i.id === ingredientId);
        return ing && usedQty > Number(ing.stock)
          ? { ...ing, usedQty }
          : null;
      })
      .filter(Boolean);

    if (insufficientStock.length > 0) {
      const detail = insufficientStock
        .map(ing => `${ing.name}: stok ${ing.stock} ${ing.unit}, dibutuhkan ${ing.usedQty} ${ing.unit}`)
        .join('\n');
      alert(`Stok tidak mencukupi untuk menyelesaikan transaksi:\n\n${detail}`);
      return;
    }

    let updatedIngredients = ingredients.map(ing => {
      const usedQty = stockUsage[ing.id] || 0;
      return usedQty > 0 ? { ...ing, stock: Math.max(0, Number(ing.stock) - usedQty) } : ing;
    });
    setIngredients(updatedIngredients);

    const totalTransactionHpp = cart.reduce((acc, item) => acc + ((item.hpp || 0) * item.qty), 0);

    const now = new Date();
    const dateStr = getFormattedDate(now);
    const monthStr = getFormattedMonth(now);
    const timeStr = getFormattedTime(now);

    const queueNum = 'A' + String(transactions.length + 1).padStart(3, '0');
    const cashVal = paymentMethod === 'cash' ? Number(cashGiven) : grandTotal;
    const changeVal = paymentMethod === 'cash' ? (cashVal - grandTotal) : 0;

    const newTx = {
      id: 'TX-' + Date.now(),
      outletId: activeOutletId,
      outletName: currentOutletObj.name,
      queueNum,
      timestamp: now.toISOString(),
      dateStr,
      monthStr,
      timeStr,
      shiftId: currentShift.id,
      cashierName: currentShift.cashierName,
      customerName: customerName || 'Pelanggan Umum',
      tableNumber: tableNumber || '-',
      orderType,
      items: cart,
      subtotal,
      discountAmount,
      grandTotal,
      totalHpp: totalTransactionHpp,
      paymentMethod,
      cashGiven: cashVal,
      change: changeVal,
      paymentProofPhoto,
      paymentMissingReason,
      status: 'completed'
    };

    setTransactions([newTx, ...transactions]);
    setLastReceipt(newTx);
    setIsCheckoutModalOpen(false);
    setIsMobileCartOpen(false);
    setIsReceiptModalOpen(true);

    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setDiscountType('none');
    setDiscountVal(0);
    setCashGiven('');
    setPaymentProofPhoto(null);
    setPaymentMissingReason('');
  };

  const handleDeleteTransaction = (txId) => {
    if (confirm('Apakah Anda yakin ingin menghapus permanen transaksi ini dari riwayat?')) {
      setTransactions(transactions.filter(t => t.id !== txId));
    }
  };

  const handleDeleteIngredient = (ingId, ingName) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${ingName}" dari stok gudang?`)) {
      setIngredients(ingredients.filter(i => i.id !== ingId));
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const amount = Number(form.amount.value);
    const category = form.category.value;

    const now = new Date();
    const newExpense = {
      id: 'EXP-' + Date.now(),
      outletId: activeOutletId,
      outletName: currentOutletObj.name,
      title,
      amount,
      category,
      dateStr: getFormattedDate(now),
      monthStr: getFormattedMonth(now),
      timeStr: getFormattedTime(now),
      cashierName: currentShift ? currentShift.cashierName : 'Owner/Admin'
    };

    setExpenses([newExpense, ...expenses]);
    form.reset();
    alert(`Pengeluaran "${title}" sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`);
  };

  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormCustomGroups(prod.customGroups ? JSON.parse(JSON.stringify(prod.customGroups)) : []);
      setFormRecipe(prod.recipe ? JSON.parse(JSON.stringify(prod.recipe)) : []);
    } else {
      setEditingProduct(null);
      setFormCustomGroups([]);
      setFormRecipe([]);
    }
    setNewGroupNameInput('');
    setIsProductModalOpen(true);
  };

  const handleAddGroupToProductForm = () => {
    if (!newGroupNameInput.trim()) {
      alert('Masukkan nama grup varian terlebih dahulu!');
      return;
    }
    const newGroup = {
      id: 'cg_' + Date.now(),
      name: newGroupNameInput.trim(),
      type: newGroupTypeInput,
      options: []
    };
    setFormCustomGroups([...formCustomGroups, newGroup]);
    setNewGroupNameInput('');
  };

  const handleRemoveOptionFromGroup = (groupId, optIndex) => {
    setFormCustomGroups(formCustomGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, options: g.options.filter((_, idx) => idx !== optIndex) };
      }
      return g;
    }));
  };

  const handleRemoveGroupFromForm = (groupId) => {
    setFormCustomGroups(formCustomGroups.filter(g => g.id !== groupId));
  };

  const handleAddRecipeItem = () => {
    if (ingredients.length === 0) {
      alert('Belum ada bahan baku di gudang! Tambahkan bahan baku terlebih dahulu di tab Stok.');
      return;
    }
    setFormRecipe([...formRecipe, { ingredientId: ingredients[0].id, qty: 1 }]);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const form = e.target;
    const prodName = form.prodName.value;
    const category = form.category.value;
    const priceDineIn = Number(form.priceDineIn.value);
    const priceTakeaway = Number(form.priceTakeaway.value);
    const priceOnline = Number(form.priceOnline.value);
    const imageUrl = form.imageUrl.value || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400';

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: prodName,
        category,
        image: imageUrl,
        prices: { dineIn: priceDineIn, takeaway: priceTakeaway, online: priceOnline },
        customGroups: formCustomGroups,
        recipe: formRecipe
      } : p));
    } else {
      const newProd = {
        id: 'prod_' + Date.now(),
        name: prodName,
        category,
        image: imageUrl,
        prices: { dineIn: priceDineIn, takeaway: priceTakeaway, online: priceOnline },
        customGroups: formCustomGroups,
        recipe: formRecipe
      };
      setProducts([...products, newProd]);
    }

    if (!categories.includes(category) && category.trim() !== '') {
      setCategories([...categories, category]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreateNewIngredient = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.ingName.value;
    const unit = form.ingUnit.value;
    const stock = Number(form.ingStock.value);
    const minStock = Number(form.ingMinStock.value);
    const costPerUnit = Number(form.costPerUnit.value);

    const newIng = {
      id: 'ing_' + Date.now(),
      name,
      unit,
      stock,
      minStock,
      costPerUnit
    };

    setIngredients([...ingredients, newIng]);
    setIsIngredientModalOpen(false);
    form.reset();
    alert(`Bahan Baku "${name}" berhasil ditambahkan!`);
  };

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const addAmt = Number(form.addStock.value);
    const now = new Date();

    if (selectedIngredientForRestock && addAmt > 0) {
      setIngredients(ingredients.map(ing => {
        if (ing.id === selectedIngredientForRestock.id) {
          return { ...ing, stock: ing.stock + addAmt };
        }
        return ing;
      }));

      const log = {
        id: 'LOG-' + Date.now(),
        ingredientName: selectedIngredientForRestock.name,
        amount: addAmt,
        unit: selectedIngredientForRestock.unit,
        dateStr: getFormattedDate(now),
        timeStr: getFormattedTime(now),
        by: currentShift ? currentShift.cashierName : 'Owner/Admin'
      };
      setRestockLogs([log, ...restockLogs]);

      alert(`Berhasil menambah stok ${selectedIngredientForRestock.name} sebanyak +${addAmt} ${selectedIngredientForRestock.unit}`);
      setIsRestockModalOpen(false);
      setSelectedIngredientForRestock(null);
    }
  };

  // --- CETAK STRUK TRANSAKSI ---
  const handlePrintReceipt = (receipt) => {
    if (!receipt) return;

    const itemsHtml = receipt.items.map(item => `
      <tr>
        <td style="padding:4px 0;vertical-align:top;">
          ${item.qty}x ${item.product.name}
          ${item.customsSummary ? `<div style="font-size:10px;color:#555;">${item.customsSummary}</div>` : ''}
        </td>
        <td style="padding:4px 0;text-align:right;vertical-align:top;white-space:nowrap;">
          Rp ${(item.price * item.qty).toLocaleString('id-ID')}
        </td>
      </tr>
    `).join('');

    const paymentLabel = {
      cash: 'TUNAI',
      qris: 'QRIS',
      debit: 'DEBIT'
    }[receipt.paymentMethod] || String(receipt.paymentMethod || '').toUpperCase();

    const printWindow = window.open('', '_blank', 'width=420,height=700');

    if (!printWindow) {
      alert('Popup diblokir browser. Izinkan popup untuk mencetak struk.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Struk ${receipt.queueNum} - ${receipt.outletName}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            width: 72mm;
            font-family: "Courier New", monospace;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          .receipt { width: 100%; }
          .center { text-align: center; }
          .bold { font-weight: 700; }
          .muted { color: #555; font-size: 10px; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .info td { padding: 2px 0; }
          .total td { font-weight: 700; font-size: 14px; padding-top: 6px; }
          .footer { text-align: center; margin-top: 12px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center bold" style="font-size:16px;">NEXPOS</div>
          <div class="center bold">${receipt.outletName}</div>
          <div class="center muted">${getDisplayDate(receipt.dateStr)} ${receipt.timeStr}</div>

          <div class="line"></div>

          <table class="info">
            <tr><td>Antrean</td><td style="text-align:right;" class="bold">${receipt.queueNum}</td></tr>
            <tr><td>Pelanggan</td><td style="text-align:right;">${receipt.customerName}</td></tr>
            <tr><td>Meja</td><td style="text-align:right;">${receipt.tableNumber || '-'}</td></tr>
            <tr><td>Pesanan</td><td style="text-align:right;">${receipt.orderType === 'dineIn' ? 'Dine-In' : receipt.orderType === 'takeaway' ? 'Takeaway' : 'Online'}</td></tr>
          </table>

          <div class="line"></div>
          <table>${itemsHtml}</table>
          <div class="line"></div>

          <table>
            <tr><td>Subtotal</td><td style="text-align:right;">Rp ${receipt.subtotal.toLocaleString('id-ID')}</td></tr>
            ${receipt.discountAmount > 0 ? `<tr><td>Diskon</td><td style="text-align:right;">- Rp ${receipt.discountAmount.toLocaleString('id-ID')}</td></tr>` : ''}
            <tr class="total"><td>TOTAL</td><td style="text-align:right;">Rp ${receipt.grandTotal.toLocaleString('id-ID')}</td></tr>
          </table>

          <div class="line"></div>

          <table class="info">
            <tr><td>Pembayaran</td><td style="text-align:right;">${paymentLabel}</td></tr>
            ${receipt.paymentMethod === 'cash' ? `
              <tr><td>Dibayar</td><td style="text-align:right;">Rp ${(receipt.cashGiven || 0).toLocaleString('id-ID')}</td></tr>
              <tr><td>Kembalian</td><td style="text-align:right;">Rp ${(receipt.change || 0).toLocaleString('id-ID')}</td></tr>
            ` : ''}
          </table>

          <div class="footer">
            Terima kasih telah berbelanja<br />
            NEXPOS F&B
          </div>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const generateWhatsAppReport = () => {
    const targetDate = reportFilterType === 'daily' ? reportDate : getFormattedDate();
    const outletTx = transactions.filter(t => t.dateStr === targetDate && t.status === 'completed');
    const outletExp = expenses.filter(e => e.dateStr === targetDate);

    const totalOmset = outletTx.reduce((acc, t) => acc + t.grandTotal, 0);
    const totalHpp = outletTx.reduce((acc, t) => acc + (t.totalHpp || 0), 0);
    const totalPengeluaran = outletExp.reduce((acc, e) => acc + e.amount, 0);
    const grossProfit = totalOmset - totalHpp;
    const netProfit = grossProfit - totalPengeluaran;

    const cashTotal = outletTx.filter(t => t.paymentMethod === 'cash').reduce((a, b) => a + b.grandTotal, 0);
    const qrisTotal = outletTx.filter(t => t.paymentMethod === 'qris').reduce((a, b) => a + b.grandTotal, 0);
    const debitTotal = outletTx.filter(t => t.paymentMethod === 'debit').reduce((a, b) => a + b.grandTotal, 0);

    let txDetailsText = "";
    outletTx.forEach((tx, idx) => {
      const itemsSummary = tx.items.map(i => `${i.qty}x ${i.product.name} (${i.customsSummary || 'Standar'})`).join(', ');
      txDetailsText += `\n${idx + 1}. [${tx.queueNum}] ${tx.customerName} - Rp ${tx.grandTotal.toLocaleString('id-ID')} (${tx.paymentMethod.toUpperCase()})\n   Item: ${itemsSummary}`;
    });

    let expDetailsText = "";
    if (outletExp.length === 0) {
      expDetailsText = "\n(Tidak ada pengeluaran)";
    } else {
      outletExp.forEach((exp, idx) => {
        expDetailsText += `\n${idx + 1}. ${exp.title} - Rp ${exp.amount.toLocaleString('id-ID')} (${exp.category})`;
      });
    }

    let stockDetailsText = "";
    if (ingredients.length === 0) {
      stockDetailsText = "\n(Belum ada data bahan baku)";
    } else {
      ingredients.forEach((ing, idx) => {
        const isLow = ing.stock <= ing.minStock;
        stockDetailsText += `\n${idx + 1}. ${ing.name}: ${ing.stock.toLocaleString('id-ID')} ${ing.unit}${isLow ? ' ⚠️ (STOK MENIPIS)' : ''}`;
      });
    }

    const notesText = currentShift?.cashierNotes || cashierNotes || '-';

    const message = `*REKAP LAPORAN KEUANGAN & HPP NEXPOS* ☕
----------------------------------
📍 *OUTLET:* ${currentOutletObj.name.toUpperCase()}
📅 *Tanggal:* ${getDisplayDate(targetDate)}
👤 *Kasir:* ${currentShift ? currentShift.cashierName : 'Shift Ditutup'}

📝 *CATATAN KASIR:*
${notesText}

💰 *RINGKASAN LABA / RUGI*
• *Total Omset (Penjualan):* Rp ${totalOmset.toLocaleString('id-ID')}
• *Total HPP (Modal Bahan):* Rp ${totalHpp.toLocaleString('id-ID')}
• *Laba Kotor (Gross Profit):* Rp ${grossProfit.toLocaleString('id-ID')}
• *Total Pengeluaran Ops:* Rp ${totalPengeluaran.toLocaleString('id-ID')}
----------------------------------
📈 *KEUNTUNGAN BERSIH (NET):* Rp ${netProfit.toLocaleString('id-ID')}

💳 *METODE PEMBAYARAN*
• Tunai: Rp ${cashTotal.toLocaleString('id-ID')}
• QRIS: Rp ${qrisTotal.toLocaleString('id-ID')}
• Debit: Rp ${debitTotal.toLocaleString('id-ID')}

💸 *PENGELUARAN OPERASIONAL:*${expDetailsText}

📦 *SISA STOK GUDANG:*${stockDetailsText}

📊 *DETIL TRANSAKSI (${outletTx.length} Pesanan):*${txDetailsText || '\n(Belum ada transaksi)'}
----------------------------------
_Laporan Otomatis Real-time NEXPOS F&B_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const CartContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-slate-50 border-b font-bold text-xs sm:text-sm flex justify-between items-center">
        <span>Pesanan Aktif ({currentOutletObj.name})</span>
        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
          {cart.reduce((a, b) => a + b.qty, 0)} Item
        </span>
      </div>

      <div className="p-2.5 bg-slate-50 border-b grid grid-cols-2 gap-2 text-xs">
        <input
          placeholder="Nama Pelanggan"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="p-2 border rounded-lg bg-white outline-none focus:border-amber-500"
        />
        <input
          placeholder="No. Meja"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="p-2 border rounded-lg bg-white outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-xs">Belum ada item dipilih</div>
        ) : (
          cart.map(item => (
            <div key={item.cartItemId} className="p-2.5 bg-slate-50 rounded-xl border text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{item.product.name}</span>
                <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
              </div>
              {item.customsSummary && <div className="text-[10px] text-slate-500">{item.customsSummary}</div>}
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400 text-[11px]">@ Rp {item.price.toLocaleString('id-ID')} | HPP: Rp {item.hpp}</span>
                <div className="flex items-center space-x-2 border rounded-lg bg-white px-2 py-0.5 shadow-sm">
                  <button onClick={() => updateCartQty(item.cartItemId, -1)} className="font-bold text-sm px-1 text-slate-700">-</button>
                  <span className="font-bold text-xs">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.cartItemId, 1)} className="font-bold text-sm px-1 text-slate-700">+</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3.5 bg-slate-50 border-t space-y-2.5">
        <div className="flex justify-between text-xs font-bold text-slate-800">
          <span>TOTAL HASIL</span>
          <span className="text-amber-600 text-base">Rp {grandTotal.toLocaleString('id-ID')}</span>
        </div>
        <button
          disabled={cart.length === 0}
          onClick={() => setIsCheckoutModalOpen(true)}
          className="w-full bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs transition active:scale-98 shadow"
        >
          BAYAR SEKARANG
        </button>
      </div>
    </div>
  );

  return (
    
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 text-slate-800 flex flex-col font-sans pb-16 md:pb-0">
      
      {/* NAVBAR TOP */}
      <header className="bg-slate-900 text-white px-2.5 sm:px-4 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-30 min-w-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-amber-500 p-1.5 sm:p-2 rounded-lg text-slate-900 font-extrabold flex items-center text-xs sm:text-sm">
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5 mr-1"/>
            <span>NEXPOS</span>
          </div>

          <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1.5 sm:px-2 py-1 min-w-0 max-w-[45vw] sm:max-w-none">
            <Store className="w-3.5 h-3.5 text-amber-400 mr-1"/>
            <select
              value={activeOutletId}
              onChange={(e) => {
                setActiveOutletId(e.target.value);
                setCart([]);
              }}
              className="bg-transparent text-[10px] sm:text-xs font-bold text-slate-200 outline-none cursor-pointer pr-1 max-w-[30vw] sm:max-w-none"
            >
              {outlets.map(o => (
                <option key={o.id} value={o.id} className="bg-slate-900 text-white">
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {activeRole === 'owner' && (
            <div className="flex space-x-1">
              <button
                onClick={() => setIsOutletModalOpen(true)}
                className="flex items-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[10px] sm:text-xs px-2 py-1 rounded-lg transition"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1"/>
                <span>+ Outlet</span>
              </button>
              <button
                onClick={() => setIsManageOutletsModalOpen(true)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                title="Kelola & Hapus Outlet"
              >
                <Settings className="w-3.5 h-3.5"/>
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
          <button onClick={() => setCurrentTab('pos')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'pos' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><ShoppingBag className="w-4 h-4 mr-1"/>Kasir</button>
          <button onClick={() => setCurrentTab('shift')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'shift' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><Clock className="w-4 h-4 mr-1"/>Shift</button>
          <button onClick={() => setCurrentTab('stock')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'stock' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><PackageCheck className="w-4 h-4 mr-1"/>Stok</button>
          <button onClick={() => setCurrentTab('expenses')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'expenses' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><Receipt className="w-4 h-4 mr-1"/>Pengeluaran</button>
          {activeRole === 'owner' && (
            <>
              <button onClick={() => setCurrentTab('products')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'products' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><Layers className="w-4 h-4 mr-1"/>Menu & HPP</button>
              <button onClick={() => setCurrentTab('reports')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'reports' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><TrendingUp className="w-4 h-4 mr-1"/>Laporan</button>
            </>
          )}
          <button onClick={() => setCurrentTab('history')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${currentTab === 'history' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}><Receipt className="w-4 h-4 mr-1"/>Riwayat</button>
        </div>

        <div>
          {activeRole === 'cashier' ? (
            <button
              onClick={() => { setPinPurpose('switch_owner'); setIsPinModalOpen(true); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-xs px-2.5 py-1 sm:py-1.5 rounded-lg border border-slate-700 flex items-center font-medium"
            >
              <Lock className="w-3 h-3 mr-1 text-amber-400"/>
              Mode Kasir
            </button>
          ) : (
            <button
              onClick={() => setActiveRole('cashier')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center font-bold"
            >
              <Unlock className="w-3 h-3 mr-1"/>
              Owner
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">

        {/* TAB 1: KASIR / POS */}
        {currentTab === 'pos' && (
          <div className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row overflow-hidden relative">
            <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-20 md:pb-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/>
                  <input
                    type="text"
                    placeholder="Cari menu makanan / minuman..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setOrderType('dineIn')} className={`flex-1 sm:flex-initial px-3 py-1 text-[11px] font-bold rounded-md ${orderType === 'dineIn' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-600'}`}>Dine-In</button>
                  <button onClick={() => setOrderType('takeaway')} className={`flex-1 sm:flex-initial px-3 py-1 text-[11px] font-bold rounded-md ${orderType === 'takeaway' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-600'}`}>Takeaway</button>
                  <button onClick={() => setOrderType('online')} className={`flex-1 sm:flex-initial px-3 py-1 text-[11px] font-bold rounded-md ${orderType === 'online' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-600'}`}>Online</button>
                </div>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-3 border">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300"/>
                  <p className="font-bold text-slate-700 text-sm">Katalog Menu Outlet Ini Masih Kosong</p>
                  <p className="text-xs text-slate-400">Owner dapat membuat menu & resep HPP di tab "Menu & HPP".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {filteredProducts.map(prod => {
                    const price = prod.prices[orderType] || prod.prices.dineIn;
                    const hpp = calculateProductHPP(prod.recipe);
                    const profit = price - hpp;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-amber-500 transition active:scale-98 cursor-pointer flex flex-col overflow-hidden group"
                      >
                        <img src={prod.image} alt={prod.name} className="h-24 sm:h-28 w-full object-cover group-hover:scale-105 transition" />
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{prod.name}</h4>
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-amber-600 font-extrabold text-xs sm:text-sm">Rp {price.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>HPP: Rp {hpp}</span>
                            <span className="text-emerald-600 font-bold">Untung: Rp {profit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden md:flex w-80 bg-white border-l border-slate-200 flex-col h-full">
              <CartContent />
            </div>

            {cart.length > 0 && (
              <div className="md:hidden fixed bottom-16 left-3 right-3 z-20">
                <button
                  onClick={() => setIsMobileCartOpen(true)}
                  className="w-full bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 flex justify-between items-center active:scale-98 transition"
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-amber-500 text-slate-900 font-extrabold px-2 py-0.5 rounded-lg text-xs">
                      {cart.reduce((a, b) => a + b.qty, 0)} Item
                    </div>
                    <span className="font-bold text-xs text-slate-200">Lihat Keranjang</span>
                  </div>
                  <div className="flex items-center space-x-1 font-extrabold text-amber-400 text-sm">
                    <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    <ChevronRight className="w-4 h-4"/>
                  </div>
                </button>
              </div>
            )}

            {isMobileCartOpen && (
              <div className="md:hidden fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 flex flex-col justify-end">
                <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom">
                  <div className="p-3 bg-slate-100 flex justify-between items-center border-b">
                    <span className="font-bold text-xs text-slate-700">Rincian Pesanan Kasir</span>
                    <button onClick={() => setIsMobileCartOpen(false)} className="p-1 bg-white rounded-full border">
                      <X className="w-4 h-4 text-slate-600"/>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <CartContent />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHIFT KASIR */}
        {currentTab === 'shift' && (
          <div className="p-4 sm:p-6 max-w-md mx-auto w-full overflow-y-auto">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-slate-800">Shift Kasir: {currentOutletObj.name}</h3>
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {currentOutletObj.name}
                </span>
              </div>

              {!currentShift ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const now = new Date();
                  const cashierName = e.target.cashierName.value;
                  const startCash = Number(e.target.startCash.value);
                  const fileInput = e.target.openPhoto.files[0];

                  let openPhotoBase64 = null;
                  if (fileInput) {
                    openPhotoBase64 = await fileToBase64(fileInput);
                  }

                  const newShiftObj = {
                    id: 'SHIFT-' + Date.now(),
                    cashierName,
                    startCash,
                    startTime: getFormattedTime(now),
                    startDate: getFormattedDate(now),
                    openPhoto: openPhotoBase64,
                    cashierNotes,
                    status: 'open'
                  };

                  setActiveShiftsMap({ ...activeShiftsMap, [activeOutletId]: newShiftObj });
                }} className="space-y-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Nama Kasir Bertugas</label>
                    <input required name="cashierName" className="w-full p-2.5 border rounded-xl" placeholder="Nama Kasir" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Modal Kas Awal (Rp)</label>
                    <input required type="number" name="startCash" className="w-full p-2.5 border rounded-xl" placeholder="200000" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Foto Bukti Buka Toko / Laci Kasir</label>
                    <input type="file" name="openPhoto" accept="image/*" capture="environment" className="w-full text-[11px]" />
                  </div>
                  <button type="submit" className="w-full bg-amber-500 font-bold py-3 rounded-xl text-slate-900 active:scale-98 transition">
                    Buka Shift Kasir ({currentOutletObj.name})
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border space-y-2">
                    <p>Status Shift: <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">AKTIF</span></p>
                    <p>Kasir Bertugas: <strong>{currentShift.cashierName}</strong></p>
                    <p>Jam Buka Toko: <strong className="text-amber-600">{currentShift.startTime} WIB</strong></p>
                    <p>Modal Kas Awal: <strong>Rp {currentShift.startCash.toLocaleString('id-ID')}</strong></p>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Catatan Kasir (Akan terlampir di WA Owner)</label>
                    <textarea
                      rows={3}
                      value={cashierNotes}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCashierNotes(val);
                        setActiveShiftsMap({
                          ...activeShiftsMap,
                          [activeOutletId]: { ...currentShift, cashierNotes: val }
                        });
                      }}
                      placeholder="Catat kendala atau catatan khusus..."
                      className="w-full p-2.5 border rounded-xl text-xs bg-amber-50/40 focus:bg-white"
                    />
                  </div>

                  <button onClick={generateWhatsAppReport} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center active:scale-98 transition">
                    <MessageSquare className="w-4 h-4 mr-1.5"/> Kirim Rekap WA Ke Owner
                  </button>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const endCashPhysical = Number(e.target.endCashPhysical.value);
                    const fileInput = e.target.closePhoto.files[0];

                    if (!fileInput) {
                      alert('Harap unggah foto Bukti Pembersihan Toko sebelum closing shift!');
                      return;
                    }

                    const closePhotoBase64 = await fileToBase64(fileInput);
                    const now = new Date();

                    const closedShift = {
                      ...currentShift,
                      outletId: activeOutletId,
                      outletName: currentOutletObj.name,
                      endTime: getFormattedTime(now),
                      endDate: getFormattedDate(now),
                      endCashPhysical,
                      closePhoto: closePhotoBase64,
                      cashierNotes,
                      status: 'closed'
                    };

                    setShiftHistory([closedShift, ...shiftHistory]);
                    const copyShifts = { ...activeShiftsMap };
                    delete copyShifts[activeOutletId];
                    setActiveShiftsMap(copyShifts);
                    setCashierNotes('');
                    alert(`Shift Outlet "${currentOutletObj.name}" Berhasil Ditutup!`);
                  }} className="pt-3 border-t space-y-3">
                    <h4 className="font-bold text-slate-800">Tutup Shift (Closing Outlet)</h4>
                    <div>
                      <label className="block mb-1 font-medium">Total Uang Fisik Kasir (Rp)</label>
                      <input required type="number" name="endCashPhysical" className="w-full p-2.5 border rounded-xl" placeholder="Hitung uang di laci" />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium text-rose-600 font-bold">Foto Bukti Pembersihan Outlet * (Wajib)</label>
                      <input required type="file" name="closePhoto" accept="image/*" capture="environment" className="w-full text-[11px]" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl active:scale-98 transition">
                      Tutup Shift & Simpan Bukti
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STOK GUDANG & HPP BAHAN */}
        {currentTab === 'stock' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800">Stok Gudang & HPP Bahan ({currentOutletObj.name})</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Atur harga dasar per unit bahan baku untuk perhitungan otomatis HPP produk.</p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Cari bahan..."
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
                {activeRole === 'owner' && (
                  <button onClick={() => setIsIngredientModalOpen(true)} className="bg-amber-500 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center">
                    <Plus className="w-4 h-4 mr-1"/> Tambah Bahan
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Nama Bahan Baku</th>
                    <th className="p-3">Sisa Stok</th>
                    <th className="p-3">Biaya / HPP Unit</th>
                    <th className="p-3">Min. Stok</th>
                    <th className="p-3">Status</th>
                    {activeRole === 'owner' && <th className="p-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ingredients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic">Belum ada bahan baku untuk outlet ini.</td>
                    </tr>
                  ) : (
                    filteredIngredients.map(ing => {
                      const isLow = ing.stock <= ing.minStock;
                      return (
                        <tr key={ing.id} className={isLow ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                          <td className="p-3 font-bold text-slate-800">{ing.name}</td>
                          <td className="p-3 font-bold text-sm">{ing.stock.toLocaleString('id-ID')} {ing.unit}</td>
                          <td className="p-3 font-bold text-amber-600">Rp {ing.costPerUnit || 0} / {ing.unit}</td>
                          <td className="p-3 text-slate-500">{ing.minStock} {ing.unit}</td>
                          <td className="p-3">
                            {isLow ? (
                              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px] flex items-center w-fit">
                                <AlertTriangle className="w-3 h-3 mr-1"/> Menipis
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">Aman</span>
                            )}
                          </td>
                          {activeRole === 'owner' && (
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedIngredientForRestock(ing);
                                  setIsRestockModalOpen(true);
                                }}
                                className="bg-slate-900 text-white font-bold px-2 py-1 rounded text-[11px] hover:bg-slate-800"
                              >
                                + Restok
                              </button>
                              <button
                                onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                                className="bg-rose-100 text-rose-700 hover:bg-rose-200 p-1 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border p-4 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800">Riwayat Catatan Restok Gudang</h4>
              {restockLogs.length === 0 ? (
                <p className="text-slate-400">Belum ada riwayat penambahan stok.</p>
              ) : (
                <div className="divide-y max-h-48 overflow-y-auto">
                  {restockLogs.map(log => (
                    <div key={log.id} className="py-2 flex justify-between items-center text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800">{log.ingredientName}</span> (+{log.amount} {log.unit})
                        <span className="text-[11px] text-slate-500 block">Dicatat oleh: {log.by}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                          📅 {getDisplayDate(log.dateStr)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{log.timeStr} WIB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PENGELUARAN */}
        {currentTab === 'expenses' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 overflow-y-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border space-y-3 text-xs h-fit">
                <h3 className="font-bold text-sm text-slate-800 flex items-center">
                  <Receipt className="w-4 h-4 mr-1 text-amber-600"/> Catat Pengeluaran ({currentOutletObj.name})
                </h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Deskripsi Pengeluaran</label>
                    <input required name="title" className="w-full p-2.5 border rounded-xl" placeholder="Misal: Beli Es Batu, Gas" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Nominal (Rp)</label>
                    <input required type="number" name="amount" className="w-full p-2.5 border rounded-xl" placeholder="15000" />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700">Kategori</label>
                    <select name="category" className="w-full p-2.5 border rounded-xl">
                      <option value="Bahan Baku Mendadak">Bahan Baku Mendadak</option>
                      <option value="Operasional Harian">Operasional Harian</option>
                      <option value="Gas / Listrik">Gas / Listrik</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl active:scale-98 transition">
                    Simpan Pengeluaran
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 bg-white rounded-2xl border overflow-x-auto">
                <div className="p-3 bg-slate-50 border-b font-bold text-xs">
                  Riwayat Pengeluaran ({currentOutletObj.name})
                </div>
                <table className="w-full text-left text-xs min-w-[450px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Deskripsi</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">Belum ada data pengeluaran.</td>
                      </tr>
                    ) : (
                      expenses.map(exp => (
                        <tr key={exp.id}>
                          <td className="p-3 text-slate-500">{getDisplayDate(exp.dateStr)} {exp.timeStr}</td>
                          <td className="p-3 font-bold text-slate-800">{exp.title}</td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">{exp.category}</span></td>
                          <td className="p-3 text-right font-bold text-rose-600">Rp {exp.amount.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA MENU & RESEP HPP (OWNER ONLY) */}
        {currentTab === 'products' && activeRole === 'owner' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Daftar Menu & Resep HPP ({currentOutletObj.name})</h3>
                <p className="text-xs text-slate-500">Tentukan resep bahan baku untuk otomatisasi hitung HPP dan pemotongan stok.</p>
              </div>
              <button onClick={() => handleOpenProductModal()} className="bg-amber-500 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center">
                <Plus className="w-4 h-4 mr-1"/> Tambah Menu
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Menu</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga Jual</th>
                    <th className="p-3">HPP (Modal)</th>
                    <th className="p-3">Estimasi Untung</th>
                    <th className="p-3">Varian & Topping</th>
                    <th className="p-3">Resep Bahan Baku</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={activeRole === 'owner' ? 9 : 8} className="p-8 text-center text-slate-400 italic">
                        Belum ada menu di outlet ini. Klik tombol "+ Tambah Menu".
                      </td>
                    </tr>
                  ) : (
                    products.map(p => {
                      const price = p.prices.dineIn;
                      const hpp = calculateProductHPP(p.recipe);
                      const profit = price - hpp;

                      return (
                        <tr key={p.id}>
                          <td className="p-3 font-bold">{p.name}</td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3 font-semibold text-slate-800">Rp {price.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-bold text-rose-600">Rp {hpp.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-bold text-emerald-600">Rp {profit.toLocaleString('id-ID')}</td>
                          <td className="p-3">
                            {p.customGroups && p.customGroups.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {p.customGroups.map(g => (
                                  <span key={g.id} className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                    {g.name} ({g.options.length})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Tanpa varian</span>
                            )}
                          </td>
                          <td className="p-3">
                            {p.recipe && p.recipe.length > 0 ? (
                              <div className="space-y-0.5">
                                {p.recipe.map((rec, rIdx) => {
                                  const ingObj = ingredients.find(i => i.id === rec.ingredientId);
                                  return (
                                    <div key={rIdx} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded w-fit">
                                      {ingObj ? ingObj.name : 'Bahan'}: {rec.qty} {ingObj ? ingObj.unit : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Belum diatur</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button onClick={() => handleOpenProductModal(p)} className="p-1 bg-slate-100 rounded">
                              <Edit className="w-3.5 h-3.5"/>
                            </button>
                            <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="p-1 bg-rose-50 text-rose-600 rounded">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: LAPORAN KEUANGAN & HPP (OWNER ONLY) */}
        {currentTab === 'reports' && activeRole === 'owner' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6 text-xs overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800">Laporan Laba/Rugi & HPP ({currentOutletObj.name})</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Omset dikurangi HPP (Modal Bahan) dan Pengeluaran Operasional.</p>
              </div>

              <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border w-full sm:w-auto">
                <select
                  value={reportFilterType}
                  onChange={(e) => setReportFilterType(e.target.value)}
                  className="p-1 border rounded font-semibold text-slate-700 text-xs"
                >
                  <option value="daily">Harian</option>
                  <option value="monthly">Bulanan</option>
                </select>

                {reportFilterType === 'daily' ? (
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="p-1 border rounded font-bold text-slate-800 text-xs"
                  />
                ) : (
                  <input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    className="p-1 border rounded font-bold text-slate-800 text-xs"
                  />
                )}

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="bg-slate-900 text-white px-2.5 py-1 rounded font-bold flex items-center text-xs ml-auto"
                >
                  <Mail className="w-3.5 h-3.5 mr-1"/> Email
                </button>
              </div>
            </div>

            {(() => {
              const txList = transactions.filter(t => {
                if (t.status !== 'completed') return false;
                return reportFilterType === 'daily' ? t.dateStr === reportDate : t.monthStr === reportMonth;
              });

              const expList = expenses.filter(e => {
                return reportFilterType === 'daily' ? e.dateStr === reportDate : e.monthStr === reportMonth;
              });

              const omset = txList.reduce((a, b) => a + b.grandTotal, 0);
              const totalHpp = txList.reduce((a, b) => a + (b.totalHpp || 0), 0);
              const grossProfit = omset - totalHpp;
              const totalExp = expList.reduce((a, b) => a + b.amount, 0);
              const netProfit = grossProfit - totalExp;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-slate-500">Total Omset Penjualan</p>
                      <p className="text-base sm:text-lg font-extrabold text-slate-800 mt-1">Rp {omset.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-slate-500">Total HPP (Modal Bahan)</p>
                      <p className="text-base sm:text-lg font-extrabold text-rose-600 mt-1">Rp {totalHpp.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                      <p className="text-slate-500">Total Pengeluaran Ops.</p>
                      <p className="text-base sm:text-lg font-extrabold text-amber-600 mt-1">Rp {totalExp.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow">
                      <p className="text-amber-400 font-medium">KEUNTUNGAN BERSIH</p>
                      <p className="text-lg sm:text-xl font-extrabold mt-1">Rp {netProfit.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 7: RIWAYAT TRANSAKSI */}
        {currentTab === 'history' && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-4 overflow-y-auto">
            <h3 className="font-bold text-sm sm:text-base">Riwayat Transaksi Pelanggan ({currentOutletObj.name})</h3>
            <div className="bg-white rounded-2xl border overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Antrean</th>
                    <th className="p-3">Tanggal / Waktu</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3">HPP (Modal)</th>
                    <th className="p-3 text-right">Total Jual</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Cetak</th>
                    {activeRole === 'owner' && <th className="p-3 text-center">Hapus</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Belum ada riwayat transaksi di outlet ini.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className={t.status === 'voided' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-bold">{t.queueNum}</td>
                        <td className="p-3 text-slate-500">
                          <div>{getDisplayDate(t.dateStr)}</div>
                          <div className="text-[10px]">{t.timeStr}</div>
                        </td>
                        <td className="p-3 font-medium">{t.customerName}</td>
                        <td className="p-3 uppercase font-semibold">{t.paymentMethod}</td>
                        <td className="p-3 font-bold text-rose-600">Rp {(t.totalHpp || 0).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-bold">Rp {t.grandTotal.toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handlePrintReceipt(t)}
                            disabled={t.status !== 'completed'}
                            className="p-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed rounded"
                            title="Cetak struk"
                          >
                            <Printer className="w-3.5 h-3.5"/>
                          </button>
                        </td>
                        {activeRole === 'owner' && (
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR - MENU LENGKAP SEPERTI LAPTOP */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-400 z-30">
        <div className="flex items-center gap-1 overflow-x-auto px-1.5 py-1.5 scrollbar-none">
        <button onClick={() => setCurrentTab('pos')} className={`flex-none min-w-[62px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'pos' ? 'text-amber-400 bg-slate-800' : ''}`}>
          <ShoppingBag className="w-5 h-5"/>
          <span>Kasir</span>
        </button>
        <button onClick={() => setCurrentTab('shift')} className={`flex-none min-w-[62px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'shift' ? 'text-amber-400 bg-slate-800' : ''}`}>
          <Clock className="w-5 h-5"/>
          <span>Shift</span>
        </button>
        <button onClick={() => setCurrentTab('stock')} className={`flex-none min-w-[62px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'stock' ? 'text-amber-400 bg-slate-800' : ''}`}>
          <PackageCheck className="w-5 h-5"/>
          <span>Stok</span>
        </button>
        <button onClick={() => setCurrentTab('expenses')} className={`flex-none min-w-[78px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'expenses' ? 'text-amber-400 bg-slate-800' : ''}`}>
          <Receipt className="w-5 h-5"/>
          <span>Pengeluaran</span>
        </button>
        {activeRole === 'owner' && (
          <>
            <button onClick={() => setCurrentTab('products')} className={`flex-none min-w-[78px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'products' ? 'text-amber-400 bg-slate-800' : ''}`}>
              <Layers className="w-5 h-5"/>
              <span>Menu</span>
            </button>
            <button onClick={() => setCurrentTab('reports')} className={`flex-none min-w-[70px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'reports' ? 'text-amber-400 bg-slate-800' : ''}`}>
              <TrendingUp className="w-5 h-5"/>
              <span>Laporan</span>
            </button>
          </>
        )}
        <button onClick={() => setCurrentTab('history')} className={`flex-none min-w-[70px] px-2 py-1 flex flex-col items-center text-[10px] font-semibold whitespace-nowrap rounded-lg ${currentTab === 'history' ? 'text-amber-400 bg-slate-800' : ''}`}>
          <Receipt className="w-5 h-5"/>
          <span>Riwayat</span>
        </button>
        </div>
      </div>

      {/* --- MODAL BUAT OUTLET BARU ---}
      {isOutletModalOpen && activeRole === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
              <span className="flex items-center"><Store className="w-4 h-4 mr-1 text-amber-500"/> Tambah Outlet Baru</span>
              <button onClick={() => setIsOutletModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <form onSubmit={handleCreateOutletFromScratch} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold text-slate-700">Nama Outlet Baru</label>
                <input required name="outletName" className="w-full p-2.5 border rounded-xl font-semibold" placeholder="Contoh: King Baba Cabang 2" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsOutletModalOpen(false)} className="flex-1 py-2.5 border rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl">Buat Outlet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL KELOLA OUTLET --- */}
      {isManageOutletsModalOpen && activeRole === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
              <span className="flex items-center"><Settings className="w-4 h-4 mr-1 text-amber-500"/> Kelola Daftar Outlet</span>
              <button onClick={() => setIsManageOutletsModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="divide-y max-h-60 overflow-y-auto">
              {outlets.map(o => (
                <div key={o.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">{o.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeOutletId === o.id && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Aktif</span>
                    )}
                    <button
                      disabled={outlets.length <= 1}
                      onClick={() => handleDeleteOutlet(o.id, o.name)}
                      className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-40 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsManageOutletsModalOpen(false)} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL CUSTOMIZING PRODUCT (VARIAN) --- */}
      {customizingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{customizingProduct.name}</h3>
                <p className="text-[11px] text-amber-400">Pilih varian / topping pesanan</p>
              </div>
              <button onClick={() => setCustomizingProduct(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {customizingProduct.customGroups.map(group => (
                <div key={group.id} className="space-y-1.5">
                  <h4 className="font-bold text-slate-700 uppercase text-[10px]">{group.name}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map(opt => {
                      const isSelected = selectedCustoms[group.name] && (
                        Array.isArray(selectedCustoms[group.name])
                          ? selectedCustoms[group.name].some(o => o.name === opt.name)
                          : selectedCustoms[group.name].name === opt.name
                      );
                      return (
                        <button
                          key={opt.name}
                          onClick={() => {
                            if (group.type === 'single') {
                              setSelectedCustoms({ ...selectedCustoms, [group.name]: opt });
                            } else {
                              const currentList = selectedCustoms[group.name] || [];
                              const exists = currentList.some(o => o.name === opt.name);
                              const updated = exists ? currentList.filter(o => o.name !== opt.name) : [...currentList, opt];
                              setSelectedCustoms({ ...selectedCustoms, [group.name]: updated });
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition ${isSelected ? 'border-amber-500 bg-amber-50 font-bold text-slate-900' : 'border-slate-200 bg-white text-slate-700'}`}
                        >
                          <span>{opt.name}</span>
                          {opt.extraPrice > 0 && <span className="text-[10px] text-amber-600 font-bold">+Rp {opt.extraPrice}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50">
              <button
                onClick={() => addToCart(customizingProduct, selectedCustoms, 1)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl text-xs transition active:scale-98"
              >
                + Tambahkan Ke Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CHECKOUT PEMBAYARAN --- */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center font-bold text-sm border-b pb-2">
              <span>Pembayaran Transaksi</span>
              <button onClick={() => setIsCheckoutModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center">
              <span className="text-slate-300 font-medium">TOTAL HASIL</span>
              <span className="text-xl font-bold text-amber-400">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => setPaymentMethod('cash')} className={`py-2 rounded-lg font-bold border ${paymentMethod === 'cash' ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>Tunai</button>
                <button onClick={() => setPaymentMethod('qris')} className={`py-2 rounded-lg font-bold border ${paymentMethod === 'qris' ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>QRIS</button>
                <button onClick={() => setPaymentMethod('debit')} className={`py-2 rounded-lg font-bold border ${paymentMethod === 'debit' ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>Debit</button>
              </div>
            </div>
            {paymentMethod === 'cash' && (
              <div className="space-y-2 pt-2 border-t">
                <label className="block font-semibold text-slate-700">Uang Diterima (Rp)</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="Masukkan nominal"
                  className="w-full p-2.5 border-2 border-slate-300 focus:border-amber-500 rounded-xl font-bold text-base outline-none"
                />
                {cashGiven !== '' && (
                  <div className={`p-2.5 rounded-xl border flex justify-between items-center ${Number(cashGiven) >= grandTotal ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                    <span className="font-bold text-xs">{Number(cashGiven) >= grandTotal ? 'KEMBALIAN:' : 'UANG KURANG:'}</span>
                    <span className="text-base font-extrabold">Rp {Math.abs(Number(cashGiven) - grandTotal).toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            )}
            {paymentMethod !== 'cash' && (
              <div className="space-y-3 pt-2 border-t">
                <label className="block font-semibold text-slate-700 flex items-center">
                  <Camera className="w-4 h-4 mr-1 text-amber-600"/> Bukti Foto Pembayaran
                </label>
                <input type="file" accept="image/*" capture="environment" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const b64 = await fileToBase64(file);
                    setPaymentProofPhoto(b64);
                  }
                }} className="w-full text-xs" />
                {paymentProofPhoto && <img src={paymentProofPhoto} alt="Bukti" className="h-28 w-full object-cover rounded border" />}
              </div>
            )}
            <button
              disabled={paymentMethod === 'cash' && Number(cashGiven) < grandTotal}
              onClick={handleProcessPayment}
              className="w-full bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs transition active:scale-98 shadow mt-2"
            >
              Selesaikan Transaksi & Potong Stok
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL STRUK --- */}
      {isReceiptModalOpen && lastReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-4 space-y-3 text-xs font-mono">
            <div className="text-center font-bold">
              <p className="text-sm">NEXPOS - {lastReceipt.outletName}</p>
              <p className="text-[10px] text-slate-500 font-normal">Tgl: {getDisplayDate(lastReceipt.dateStr)} {lastReceipt.timeStr}</p>
            </div>
            <div className="border-b border-dashed my-2"></div>
            <div className="flex justify-between">
              <span>Antrean: <strong>{lastReceipt.queueNum}</strong></span>
              <span>{lastReceipt.customerName}</span>
            </div>
            <div className="border-b border-dashed my-2"></div>
            {lastReceipt.items.map(i => (
              <div key={i.cartItemId} className="flex justify-between">
                <span>{i.qty}x {i.product.name}</span>
                <span>Rp {(i.price * i.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="border-b border-dashed my-2"></div>
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>Rp {lastReceipt.grandTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handlePrintReceipt(lastReceipt)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-sans font-bold py-2.5 rounded-xl flex items-center justify-center"
              >
                <Printer className="w-4 h-4 mr-1.5"/>
                Cetak / Print
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold py-2.5 rounded-xl"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH/EDIT PRODUK & KUSTOM VARIAN & RESEP HPP --- */}
      {isProductModalOpen && activeRole === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between font-bold text-sm border-b pb-2">
              <span>{editingProduct ? 'Edit Menu & Varian' : 'Tambah Menu Baru & Varian'}</span>
              <button onClick={() => setIsProductModalOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Nama Menu</label>
                <input required name="prodName" defaultValue={editingProduct ? editingProduct.name : ''} className="w-full p-2 border rounded-xl" placeholder="Misal: King Baba Coklat Large" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Kategori</label>
                  <input required name="category" defaultValue={editingProduct ? editingProduct.category : 'King Baba'} className="w-full p-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Harga Jual Dine-In (Rp)</label>
                  <input required type="number" name="priceDineIn" defaultValue={editingProduct ? editingProduct.prices.dineIn : ''} className="w-full p-2 border rounded-xl" placeholder="10000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Harga Takeaway (Rp)</label>
                  <input required type="number" name="priceTakeaway" defaultValue={editingProduct ? editingProduct.prices.takeaway : ''} className="w-full p-2 border rounded-xl" placeholder="10000" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Harga Online (Rp)</label>
                  <input required type="number" name="priceOnline" defaultValue={editingProduct ? editingProduct.prices.online : ''} className="w-full p-2 border rounded-xl" placeholder="12000" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">URL Gambar</label>
                <input name="imageUrl" defaultValue={editingProduct ? editingProduct.image : ''} className="w-full p-2 border rounded-xl" placeholder="https://..." />
              </div>

              {/* PENGATURAN VARIAN & TOPPING MENU */}
              <div className="pt-3 border-t space-y-3">
                <h4 className="font-bold text-slate-800">Kelola Varian & Topping Menu</h4>
                
                <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                  <span className="font-semibold text-slate-700 block">Buat Grup Varian Baru</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama Grup (Topping, Level, dll)"
                      value={newGroupNameInput}
                      onChange={(e) => setNewGroupNameInput(e.target.value)}
                      className="flex-1 p-1.5 border rounded-lg bg-white"
                    />
                    <select
                      value={newGroupTypeInput}
                      onChange={(e) => setNewGroupTypeInput(e.target.value)}
                      className="p-1.5 border rounded-lg bg-white"
                    >
                      <option value="single">Pilih 1</option>
                      <option value="multiple">Banyak</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddGroupToProductForm}
                      className="bg-amber-500 font-bold px-3 py-1.5 rounded-lg text-slate-900"
                    >
                      + Buat Grup
                    </button>
                  </div>
                </div>

                {formCustomGroups.map((group) => (
                  <div key={group.id} className="p-3 border rounded-xl space-y-2 bg-white">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{group.name} ({group.type === 'single' ? 'Pilih 1' : 'Pilih Banyak'})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroupFromForm(group.id)}
                        className="text-rose-600 text-[11px] hover:underline"
                      >
                        Hapus Grup
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 items-center bg-slate-50 p-2 rounded-lg">
                      <input
                        type="text"
                        id={`opt_name_${group.id}`}
                        placeholder="Nama Opsi (Misal: Extra Boba)"
                        className="sm:col-span-2 flex-1 p-1 border rounded text-xs bg-white"
                      />
                      <input
                        type="number"
                        id={`opt_price_${group.id}`}
                        placeholder="+Biaya (Rp)"
                        className="w-full p-1 border rounded text-xs bg-white"
                      />
                      <input
                        type="number"
                        id={`opt_stock_qty_${group.id}`}
                        placeholder="Pakai stok"
                        min="0"
                        step="any"
                        className="w-full p-1 border rounded text-xs bg-white"
                      />
                      <select
                        id={`opt_ingredient_${group.id}`}
                        defaultValue=""
                        className="sm:col-span-3 p-1 border rounded text-xs bg-white"
                      >
                        <option value="">Tanpa potong stok (opsional)</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            Stok: {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById(`opt_name_${group.id}`);
                          const priceInput = document.getElementById(`opt_price_${group.id}`);
                          const stockQtyInput = document.getElementById(`opt_stock_qty_${group.id}`);
                          const ingredientInput = document.getElementById(`opt_ingredient_${group.id}`);
                          if (!nameInput.value.trim()) {
                            alert('Masukkan nama opsi varian!');
                            return;
                          }
                          const stockQty = Number(stockQtyInput.value) || 0;
                          if (stockQty > 0 && !ingredientInput.value) {
                            alert('Pilih bahan stok yang akan dipotong untuk topping ini.');
                            return;
                          }
                          if (ingredientInput.value && stockQty <= 0) {
                            alert('Isi jumlah pemakaian stok topping lebih dari 0.');
                            return;
                          }
                          const newOpt = {
                            name: nameInput.value.trim(),
                            extraPrice: Number(priceInput.value) || 0,
                            ingredientId: ingredientInput.value || null,
                            stockQty
                          };
                          setFormCustomGroups(formCustomGroups.map(g => g.id === group.id ? { ...g, options: [...g.options, newOpt] } : g));
                          nameInput.value = '';
                          priceInput.value = '';
                          stockQtyInput.value = '';
                          ingredientInput.value = '';
                        }}
                        className="bg-slate-900 text-white font-bold px-2.5 py-1 rounded text-xs"
                      >
                        + Opsi
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {group.options.map((opt, optIdx) => (
                        <div key={optIdx} className="w-full bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="font-medium text-slate-800">{opt.name}</span>
                              {opt.extraPrice > 0 && <span className="text-amber-700 font-bold ml-1">(+Rp{opt.extraPrice.toLocaleString('id-ID')})</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromGroup(group.id, optIdx)}
                              className="text-rose-500 font-bold hover:text-rose-700 px-1"
                            >
                              ×
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-1.5">
                            <select
                              value={opt.ingredientId || ''}
                              onChange={(e) => {
                                const updated = [...formCustomGroups];
                                const target = updated.find(g => g.id === group.id);
                                if (target) target.options[optIdx] = { ...target.options[optIdx], ingredientId: e.target.value || null };
                                setFormCustomGroups(updated);
                              }}
                              className="sm:col-span-2 p-1 border rounded bg-white text-[10px]"
                            >
                              <option value="">Tidak terhubung ke stok</option>
                              {ingredients.map(ing => (
                                <option key={ing.id} value={ing.id}>
                                  Stok: {ing.name} ({ing.unit})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={opt.stockQty || ''}
                              onChange={(e) => {
                                const updated = [...formCustomGroups];
                                const target = updated.find(g => g.id === group.id);
                                if (target) target.options[optIdx] = { ...target.options[optIdx], stockQty: Number(e.target.value) || 0 };
                                setFormCustomGroups(updated);
                              }}
                              placeholder="Qty stok"
                              className="p-1 border rounded bg-white text-[10px]"
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 mt-1">{opt.ingredientId && opt.stockQty ? 'Stok akan berkurang saat topping dipilih dan transaksi dibayar.' : 'Belum terhubung ke stok.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* PENGATURAN RESEP BAHAN BAKU & HPP OTOMATIS */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Kustomisasi Resep HPP (Bahan yang Dipotong)</span>
                  <button type="button" onClick={handleAddRecipeItem} className="bg-slate-900 text-white px-2.5 py-1 rounded text-[11px] font-bold">
                    + Tambah Bahan Resep
                  </button>
                </div>

                {formRecipe.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">Belum ada bahan resep yang dipilih. HPP akan bernilai 0.</p>
                ) : (
                  <div className="space-y-2">
                    {formRecipe.map((rec, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                        <select
                          value={rec.ingredientId}
                          onChange={(e) => {
                            const updated = [...formRecipe];
                            updated[index].ingredientId = e.target.value;
                            setFormRecipe(updated);
                          }}
                          className="flex-1 p-1.5 border rounded bg-white"
                        >
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (Rp {ing.costPerUnit}/{ing.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={rec.qty}
                          onChange={(e) => {
                            const updated = [...formRecipe];
                            updated[index].qty = Number(e.target.value);
                            setFormRecipe(updated);
                          }}
                          placeholder="Jumlah"
                          className="w-20 p-1.5 border rounded bg-white text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setFormRecipe(formRecipe.filter((_, idx) => idx !== index))}
                          className="text-rose-600 p-1 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex justify-between font-bold text-slate-800">
                      <span>Estimasi Total HPP (Modal):</span>
                      <span className="text-amber-700">Rp {calculateProductHPP(formRecipe).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-3 py-2 border rounded-xl">Batal</button>
                <button type="submit" className="px-3 py-2 bg-amber-500 font-bold rounded-xl text-slate-900">Simpan Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH BAHAN BAKU & COST --- */}
      {isIngredientModalOpen && activeRole === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-slate-800">Tambah Bahan Baku & HPP Unit</h4>
            <form onSubmit={handleCreateNewIngredient} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Nama Bahan (Misal: Bubuk Coklat)</label>
                <input required name="ingName" className="w-full p-2 border rounded-xl" placeholder="Nama bahan" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Satuan (gram/ml/pcs)</label>
                  <input required name="ingUnit" className="w-full p-2 border rounded-xl" placeholder="gram" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Biaya per Unit (Rp)</label>
                  <input required type="number" name="costPerUnit" className="w-full p-2 border rounded-xl font-bold" placeholder="50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Stok Awal</label>
                  <input required type="number" name="ingStock" className="w-full p-2 border rounded-xl" placeholder="5000" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Min. Stok</label>
                  <input required type="number" name="ingMinStock" className="w-full p-2 border rounded-xl" placeholder="500" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsIngredientModalOpen(false)} className="px-3 py-2 border rounded-xl">Batal</button>
                <button type="submit" className="px-3 py-2 bg-slate-900 text-white font-bold rounded-xl">Simpan Bahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RESTOK --- */}
      {isRestockModalOpen && selectedIngredientForRestock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xs rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-slate-800">Restok Bahan Baku</h4>
            <p className="text-slate-500">Bahan: <strong>{selectedIngredientForRestock.name}</strong></p>
            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Jumlah Tambahan ({selectedIngredientForRestock.unit})</label>
                <input required type="number" name="addStock" className="w-full p-2 border rounded-xl font-bold" placeholder="1000" />
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="flex-1 py-2 border rounded-xl">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EMAIL LAPORAN --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center font-bold border-b pb-2">
              <span>Kirim Laporan Lengkap via Email</span>
              <button onClick={() => setIsEmailModalOpen(false)}><X className="w-5 h-5"/></button>
            </div>
            <a
              href={`mailto:owner@outlet.com?subject=Laporan HPP & Keuangan - ${currentOutletObj.name}&body=Halo Owner, Laporan Keuangan Telah Disiapkan.`}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-center block"
            >
              Buka Aplikasi Email
            </a>
          </div>
        </div>
      )}

      {/* --- MODAL PIN OWNER --- */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 text-center space-y-3">
            <h4 className="font-bold text-sm">Masukkan PIN Owner</h4>
            <p className="text-[11px] text-slate-400">PIN Default: 1234</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center border p-2 rounded-xl text-lg font-bold"
              placeholder="****"
            />
            <div className="flex space-x-2">
              <button onClick={() => setIsPinModalOpen(false)} className="flex-1 py-2 border rounded-xl text-xs">Batal</button>
              <button onClick={handlePinSubmit} className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">Masuk</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
