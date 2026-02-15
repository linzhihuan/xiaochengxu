const app = getApp();
const request = require('../../utils/request'); // 引入封装的请求

Page({
  data: {
    isLogin: false,
    favorites: []
  },

  onShow() {
    this.checkStatus();
  },

  checkStatus() {
    // 从全局或Storage判断登录态
    const token = wx.getStorageSync('token');
    const isLogin = !!token;
    this.setData({ isLogin });

    if (isLogin) {
      this.fetchFavorites();
    } else {
      this.setData({ favorites: [] });
    }
  },

  // 点击登录
  async handleAuth() {
    if (this.data.isLogin) return;

    wx.showLoading({ title: 'Logging in...' });
    try {
      await app.doLogin();
      this.setData({ isLogin: true });
      this.fetchFavorites(); // 登录成功后立即拉取数据
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: 'Login Failed', icon: 'none' });
    }
  },

  // 获取数据：直接使用 request，无需担心 Token 过期，request.js 会自动处理
  async fetchFavorites() {
    try {
      const res = await request({ url: '/favorites' });
      if (res.code === 200) {
        this.setData({ favorites: res.data });
      }
    } catch (e) {
      console.error(e);
    }
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?workId=${item.workId}&title=${item.title}&tag=${item.tag}&img=${encodeURIComponent(item.img)}&des=${item.des}`
    });
  },

  goExplore() {
    wx.switchTab({ url: '/pages/portfolio/portfolio' });
  }
});