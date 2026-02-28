const app = getApp();
const request = require('../../../utils/request');

// 模拟本地数据库
const PRODUCT_DB = {
  1: {
    id: 1, name: 'Acrylic Magnet', basePrice: 49,
    templates: [
      { id: 't1', name: 'Polaroid', mask: '/images/frame-0.png', priceMod: 0 },
      { id: 't2', name: 'Instagram', mask: '/images/frame-1.png', priceMod: 0 },
      { id: 't3', name: 'Circle', mask: '/images/frame-2.png', priceMod: 0 },
      { id: 't4', name: 'Xac', mask: '/images/frame-3.png', priceMod: 0 }
    ],
    options: [
      { id: 'size', name: 'Size', choices: [{ id: 's', name: 'Standard (2")', priceMod: 0 }, { id: 'l', name: 'Large (3")', priceMod: 10 }] }
    ]
  },
  2: {
    id: 2, name: 'Postcard Set', basePrice: 29,
    templates: [
      { id: 't1', name: 'Full Bleed', mask: '/images/masks/mask-full.png', priceMod: 0 },
      { id: 't2', name: 'White Border', mask: '/images/masks/mask-border.png', priceMod: 0 }
    ],
    options: [
      { id: 'qty', name: 'Qty', choices: [{ id: '10', name: '10 Pack', priceMod: 0 }, { id: '20', name: '20 Pack', priceMod: 20 }] }
    ]
  },
  3: {
    id: 3, name: 'Oak Wood Frame', basePrice: 299,
    templates: [
      { id: 't1', name: 'Natural Oak', mask: '/images/masks/mask-oak.png', priceMod: 0 },
      { id: 't2', name: 'Walnut', mask: '/images/masks/mask-walnut.png', priceMod: 50 },
      { id: 't3', name: 'Matte Black', mask: '/images/masks/mask-black.png', priceMod: 0 }
    ],
    options: [
      { id: 'size', name: 'Size', choices: [{ id: '5x7', name: '5x7"', priceMod: 0 }, { id: '8x10', name: '8x10"', priceMod: 80 }] }
    ]
  }
};

Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    
    // 产品数据
    productInfo: {},
    activeTemplateIndex: 0,
    activeTemplate: {},
    selectedOptions: {},
    
    // 用户数据
    myFavorites: [],
    selectedPhoto: '',
    isLogin: false,
    totalPrice: 0,

    // --- 图片手势状态 ---
    imgStyle: '', // 最终绑定到图片的样式字符串
    touch: {
      baseX: 0, baseY: 0, // 上一次停止的位置
      baseScale: 1,       // 上一次停止的缩放
      x: 0, y: 0,         // 当前偏移
      scale: 1,           // 当前缩放
      distance: 0         // 双指距离
    }
  },

  onLoad(options) {
    const productId = options.id || 1;
    this.initProduct(productId);
  },

  onShow() {
    this.checkAuthAndFetch();
  },

  // --- 初始化与数据 ---
  initProduct(id) {
    const product = PRODUCT_DB[id] || PRODUCT_DB[1];
    const defaultTemplate = product.templates[0];
    
    // 默认选项
    const initialOptions = {};
    if (product.options) {
      product.options.forEach(opt => {
        if (opt.choices && opt.choices.length > 0) initialOptions[opt.id] = opt.choices[0].id;
      });
    }

    this.setData({
      productInfo: product,
      activeTemplateIndex: 0,
      activeTemplate: defaultTemplate,
      selectedOptions: initialOptions
    });
    this.calculatePrice();
    // 重置图片位置
    this.resetImageTransform();
  },

  calculatePrice() {
    const { productInfo, activeTemplate, selectedOptions } = this.data;
    let price = productInfo.basePrice + (activeTemplate.priceMod || 0);
    if (productInfo.options) {
      productInfo.options.forEach(opt => {
        const choice = opt.choices.find(c => c.id === selectedOptions[opt.id]);
        if (choice) price += (choice.priceMod || 0);
      });
    }
    this.setData({ totalPrice: price });
  },

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
      if (res.code === 200) this.setData({ myFavorites: res.data });
    } catch (e) { console.error(e); }
  },

  // --- 交互逻辑 ---
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

  handleSelectOption(e) {
    const { optId, choiceId } = e.currentTarget.dataset;
    if (this.data.selectedOptions[optId] === choiceId) return;
    this.setData({ [`selectedOptions.${optId}`]: choiceId });
    this.calculatePrice();
    wx.vibrateShort({ type: 'light' });
  },

  handleSelectPhoto(e) {
    const url = e.currentTarget.dataset.url;
    this.setData({ selectedPhoto: url });
    this.resetImageTransform(); // 换图后重置位置
    wx.vibrateShort({ type: 'light' });
  },

  handleNoFav() {
    if (!this.data.isLogin) {
      this.checkAuthAndFetch();
    } else {
      wx.switchTab({ url: '/pages/portfolio/portfolio' });
    }
  },

  // --- 手势操作核心逻辑 (Move & Zoom) ---
  
  touchStart(e) {
    if (!this.data.selectedPhoto) return;
    const touches = e.touches;
    
    if (touches.length === 1) {
      // 单指拖动初始化
      this.data.touch.startX = touches[0].clientX;
      this.data.touch.startY = touches[0].clientY;
    } else if (touches.length === 2) {
      // 双指缩放初始化
      const xMove = touches[1].clientX - touches[0].clientX;
      const yMove = touches[1].clientY - touches[0].clientY;
      this.data.touch.distance = Math.sqrt(xMove * xMove + yMove * yMove);
    }
  },

  touchMove(e) {
    if (!this.data.selectedPhoto) return;
    const touches = e.touches;
    const t = this.data.touch;

    if (touches.length === 1) {
      // 单指移动
      const moveX = touches[0].clientX - t.startX;
      const moveY = touches[0].clientY - t.startY;
      
      t.x = t.baseX + moveX;
      t.y = t.baseY + moveY;
    } else if (touches.length === 2) {
      // 双指缩放
      const xMove = touches[1].clientX - touches[0].clientX;
      const yMove = touches[1].clientY - touches[0].clientY;
      const newDistance = Math.sqrt(xMove * xMove + yMove * yMove);
      
      const scaleRatio = newDistance / t.distance;
      t.scale = t.baseScale * scaleRatio;
    }

    this.updateImageStyle();
  },

  touchEnd(e) {
    if (!this.data.selectedPhoto) return;
    // 保存当前状态作为下一次的基础
    this.data.touch.baseX = this.data.touch.x;
    this.data.touch.baseY = this.data.touch.y;
    this.data.touch.baseScale = this.data.touch.scale;
  },

  resetImageTransform() {
    this.data.touch = { baseX: 0, baseY: 0, baseScale: 1, x: 0, y: 0, scale: 1, distance: 0 };
    this.updateImageStyle();
  },

  updateImageStyle() {
    const { x, y, scale } = this.data.touch;
    // 使用 translate3d 开启硬件加速
    const style = `transform: translate3d(${x}px, ${y}px, 0) scale(${scale});`;
    this.setData({ imgStyle: style });
  },

  // --- 下单 ---
  handleCheckout() {
    if (!this.data.selectedPhoto) {
      return wx.showToast({ title: 'Please select a photo', icon: 'none' });
    }
    wx.showLoading({ title: 'Adding to Cart...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: 'Success', icon: 'success' });
    }, 800);
  },

  goBack() { wx.navigateBack(); }
});


