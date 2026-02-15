const app = getApp();
const request = require('../../../utils/request');

/**
 * 本地产品数据库模拟
 * 结构说明：
 * - templates: 视觉样式的变体（如不同颜色的边框、不同形状的切图），直接影响预览图。
 * - options: 非视觉或次级视觉的规格（如尺寸、材质、数量），影响价格但可能不直接改变预览遮罩（简化处理）。
 */
const PRODUCT_DB = {
  1: {
    id: 1,
    name: 'Acrylic Magnet',
    basePrice: 49,
    desc: 'Crystal clear acrylic with magnetic backing.',
    // 维度1：视觉模板 (决定形状/遮罩)
    templates: [
      { id: 't1', name: 'Polaroid', img: '/images/templates/thumb-polaroid.png', mask: '/images/frame-0.png', priceMod: 0 },
      { id: 't2', name: 'Instagram', img: '/images/templates/thumb-insta.png', mask: '/images/frame-1.png', priceMod: 0 },
      { id: 't3', name: 'Circle', img: '/images/templates/thumb-circle.png', mask: '/images/frame-2.png', priceMod: 0 },
      { id: 't4', name: 'Xac', img: '/images/templates/thumb-circle.png', mask: '/images/frame-3.png', priceMod: 0 }
    ],
    // 维度2：规格选项
    options: [
      {
        id: 'size', name: 'Size', 
        choices: [
          { id: 's', name: 'Standard (2")', priceMod: 0 },
          { id: 'l', name: 'Large (3")', priceMod: 10 }
        ]
      },
      {
        id: 'finish', name: 'Finish', 
        choices: [
          { id: 'glossy', name: 'Glossy', priceMod: 0 },
          { id: 'holo', name: 'Holographic', priceMod: 15 } // 镭射工艺加价
        ]
      }
    ]
  },
  2: {
    id: 2,
    name: 'Postcard Set',
    basePrice: 29,
    desc: 'Premium cardstock, perfect for sharing moments.',
    templates: [
      { id: 't1', name: 'Full Bleed', img: '/images/templates/thumb-full.png', mask: '/images/masks/mask-full.png', priceMod: 0 },
      { id: 't2', name: 'White Border', img: '/images/templates/thumb-border.png', mask: '/images/masks/mask-border.png', priceMod: 0 },
      { id: 't3', name: 'Film Strip', img: '/images/templates/thumb-film.png', mask: '/images/masks/mask-film.png', priceMod: 0 }
    ],
    options: [
      {
        id: 'qty', name: 'Quantity', 
        choices: [
          { id: '10', name: '10 Pack', priceMod: 0 },
          { id: '20', name: '20 Pack', priceMod: 20 },
          { id: '50', name: '50 Pack', priceMod: 50 }
        ]
      },
      {
        id: 'paper', name: 'Paper Type', 
        choices: [
          { id: 'matte', name: 'Matte Art', priceMod: 0 },
          { id: 'pearl', name: 'Pearl Shimmer', priceMod: 10 }
        ]
      }
    ]
  },
  3: {
    id: 3,
    name: 'Fine Art Frame',
    basePrice: 299,
    desc: 'Museum quality framing for your home.',
    templates: [
      { id: 't1', name: 'Natural Oak', img: '/images/templates/thumb-oak.png', mask: '/images/masks/mask-oak.png', priceMod: 0 },
      { id: 't2', name: 'Walnut', img: '/images/templates/thumb-walnut.png', mask: '/images/masks/mask-walnut.png', priceMod: 50 }, // 胡桃木更贵
      { id: 't3', name: 'Matte Black', img: '/images/templates/thumb-black.png', mask: '/images/masks/mask-black.png', priceMod: 0 },
      { id: 't4', name: 'White', img: '/images/templates/thumb-white.png', mask: '/images/masks/mask-white.png', priceMod: 0 }
    ],
    options: [
      {
        id: 'size', name: 'Frame Size', 
        choices: [
          { id: '5x7', name: '5 x 7"', priceMod: 0 },
          { id: '8x10', name: '8 x 10"', priceMod: 80 },
          { id: '12x16', name: '12 x 16"', priceMod: 150 },
          { id: '16x20', name: '16 x 20"', priceMod: 250 }
        ]
      },
      {
        id: 'mat', name: 'Matting', 
        choices: [
          { id: 'none', name: 'No Mat', priceMod: 0 },
          { id: 'white', name: 'White Mat', priceMod: 30 }
        ]
      }
    ]
  }
};

Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    
    // 产品基础数据
    productInfo: {},
    
    // 状态数据
    activeTemplateIndex: 0,
    activeTemplate: {},      // 当前选中的模板（影响预览图）
    selectedOptions: {},     // 存储选中的规格 { size: 's', finish: 'glossy' }
    
    // 用户数据
    myFavorites: [],
    selectedPhoto: '',
    isLogin: false,
    
    // 价格
    totalPrice: 0
  },

  onLoad(options) {
    const productId = options.id || 1; // 默认 ID 1
    this.initProduct(productId);
  },

  onShow() {
    this.checkAuthAndFetch();
  },

  // --- 初始化核心逻辑 ---
  initProduct(id) {
    const product = PRODUCT_DB[id] || PRODUCT_DB[1];
    const defaultTemplate = product.templates[0];
    
    // 初始化默认选项 (默认选中每个 Option 的第一个 Choice)
    const initialOptions = {};
    if (product.options) {
      product.options.forEach(opt => {
        if (opt.choices && opt.choices.length > 0) {
          initialOptions[opt.id] = opt.choices[0].id;
        }
      });
    }

    this.setData({
      productInfo: product,
      activeTemplateIndex: 0,
      activeTemplate: defaultTemplate,
      selectedOptions: initialOptions
    });
    
    this.calculatePrice();
  },

  // --- 价格计算引擎 ---
  calculatePrice() {
    const { productInfo, activeTemplate, selectedOptions } = this.data;
    let price = productInfo.basePrice;

    // 1. 加上模板差价
    price += (activeTemplate.priceMod || 0);

    // 2. 加上选项差价
    if (productInfo.options) {
      productInfo.options.forEach(opt => {
        const selectedChoiceId = selectedOptions[opt.id];
        const choice = opt.choices.find(c => c.id === selectedChoiceId);
        if (choice) {
          price += (choice.priceMod || 0);
        }
      });
    }

    this.setData({ totalPrice: price });
  },

  // --- 交互事件 ---

  // 1. 切换模板 (Visual Style)
  handleSelectTemplate(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.activeTemplateIndex) return;

    this.setData({
      activeTemplateIndex: index,
      activeTemplate: this.data.productInfo.templates[index]
    });
    
    this.calculatePrice();
    wx.vibrateShort({ type: 'light' });
  },

  // 2. 切换规格选项 (Size, Material, etc.)
  handleSelectOption(e) {
    const { optId, choiceId } = e.currentTarget.dataset;
    const currentOptions = this.data.selectedOptions;

    if (currentOptions[optId] === choiceId) return;

    this.setData({
      [`selectedOptions.${optId}`]: choiceId
    });

    this.calculatePrice();
    wx.vibrateShort({ type: 'light' });
  },

  // 3. 选择照片
  handleSelectPhoto(e) {
    const url = e.currentTarget.dataset.url;
    this.setData({ selectedPhoto: url });
    wx.vibrateShort({ type: 'light' });
  },

  // --- 鉴权与数据 (保持不变) ---
  async checkAuthAndFetch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.setData({ isLogin: true });
      this.fetchFavorites();
    } else {
      this.setData({ isLogin: false, myFavorites: [] });
      try {
        await app.doLogin();
        this.setData({ isLogin: true });
        this.fetchFavorites();
      } catch (e) { console.log('Silent login failed'); }
    }
  },

  async fetchFavorites() {
    try {
      const res = await request({ url: '/favorites' });
      if (res.code === 200) {
        this.setData({ myFavorites: res.data });
        // 如果没有选中的照片，且有收藏数据，可以不选中或提示
      }
    } catch (e) { console.error(e); }
  },

  handleNoFav() {
    if (!this.data.isLogin) {
      this.checkAuthAndFetch(); // 重试登录
    } else {
      wx.switchTab({ url: '/pages/portfolio/portfolio' });
    }
  },

  handleCheckout() {
    if (!this.data.selectedPhoto) {
      return wx.showToast({ title: 'Please select a photo', icon: 'none' });
    }

    // 构建订单数据
    const orderPayload = {
      product: this.data.productInfo.name,
      template: this.data.activeTemplate.name,
      options: this.data.selectedOptions,
      price: this.data.totalPrice,
      photo: this.data.selectedPhoto
    };

    wx.showLoading({ title: 'Processing...' });
    console.log('ORDER:', orderPayload);
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: 'Added to Cart', icon: 'success' });
    }, 800);
  },

  goBack() { wx.navigateBack(); }
});


