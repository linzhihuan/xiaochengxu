// pages/detail/detail.js
const app = getApp();
// 引入上一轮对话中封装好的 request 工具
const request = require('../../utils/request');

Page({
  data: {
    info: {},
    gallery: [],
    isFavorite: false, // 收藏状态
    statusBarHeight: 44
  },

  onLoad(opts) {
    // 1. 获取基础信息
    const sys = wx.getSystemInfoSync();
    this.setData({ 
      statusBarHeight: sys.statusBarHeight,
      info: {
        title: opts.title || 'UNTITLED',
        tag: opts.tag || 'PORTRAIT',
        // 如果图片包含特殊字符，建议解码
        img: opts.img ? decodeURIComponent(opts.img) : 'https://picsum.photos/400/600'
      }
    });

    // 2. 模拟加载更多样片
    this.mockGallery();

    // 3. 检查收藏状态 (如果已登录)
    this.checkFavoriteStatus();
  },

  // 模拟生成瀑布流图片
  mockGallery() {
    let imgs = [];
    for(let i=0; i<6; i++) {
      imgs.push(`https://picsum.photos/300/${400 + (i%2)*100}?random=${i}`);
    }
    this.setData({ gallery: imgs });
  },

  // --- 核心交互 ---

  // 1. 检查收藏状态
  async checkFavoriteStatus() {
    if (!wx.getStorageSync('token')) return;
    
    try {
      const res = await request({
        url: '/favorite/check',
        data: { title: this.data.info.title }
      });
      if (res.code === 200) {
        this.setData({ isFavorite: res.isFavorite });
      }
    } catch(e) {
      console.error(e);
    }
  },

  // 2. 点击收藏 (防抖 + 自动登录)
  async toggleFavorite() {
    // 未登录时，request.js 会自动处理登录，但为了交互流畅，先给个提示
    if (!wx.getStorageSync('token')) {
      wx.showToast({ title: 'Signing in...', icon: 'loading' });
    }

    try {
      const res = await request({
        url: '/favorite/toggle',
        method: 'POST',
        data: {
          title: this.data.info.title,
          img: this.data.info.img,
          tag: this.data.info.tag
        }
      });

      if (res.code === 200) {
        this.setData({ isFavorite: res.status });
        // 震动反馈，提升质感
        wx.vibrateShort({ type: 'light' });
        wx.showToast({ 
          title: res.status ? 'Added to Mine' : 'Removed', 
          icon: 'none' 
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 3. 预约跳转
  goBooking() {
    wx.switchTab({ url: '/pages/contact/contact' });
  },

  // 4. 图片预览
  previewHero() {
    wx.previewImage({ urls: [this.data.info.img] });
  },
  previewGallery(e) {
    const current = e.currentTarget.dataset.url;
    wx.previewImage({ current, urls: this.data.gallery });
  },

  // 5. 分享给好友
  onShareAppMessage() {
    return {
      title: `Explore: ${this.data.info.title}`,
      path: `/pages/detail/detail?title=${this.data.info.title}&img=${encodeURIComponent(this.data.info.img)}`,
      imageUrl: this.data.info.img
    };
  },

  // 6. 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.info.title,
      query: `title=${this.data.info.title}&img=${encodeURIComponent(this.data.info.img)}`,
      imageUrl: this.data.info.img
    };
  }
});