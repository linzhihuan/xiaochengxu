// pages/detail/detail.js
const app = getApp();
// 引入上一轮对话中封装好的 request 工具
const request = require('../../utils/request');

Page({
  data: {
    info: {},
    gallery: [],
    isFavorite: false, // 收藏状态
    statusBarHeight: 54
  },

  onLoad(opts) {
    // 1. 获取基础信息
    console.log('opts:', opts)
    const sys = wx.getAppBaseInfo();
    this.setData({
      statusBarHeight: sys.statusBarHeight,
      info: {
        title: opts.title || 'UNTITLED',
        tag: opts.tag || 'PORTRAIT',
        des: opts.des,
        // 如果图片包含特殊字符，建议解码
        img: opts.img ? decodeURIComponent(opts.img) : 'https://picsum.photos/400/600',
        workId: opts.workId
      }
    });

    // 2. 模拟加载更多样片
    this.mockGallery();

    // 3. 检查收藏状态 (如果已登录)
    this.checkFavoriteStatus();
  },
  goBack() {
    wx.navigateBack();
  },
  // 模拟生成瀑布流图片
  mockGallery() {

    let imgs = [];
    // for(let i=0; i<6; i++) {
    //   imgs.push(`https://picsum.photos/300/${400 + (i%2)*100}?random=${i}`);
    // }

    // 发起网络请求
    wx.request({
      // 注意：真机调试需要勾选“不校验合法域名”，或者在后台配置域名
      // 本地调试请确保手机和电脑在同一 WiFi，并将 localhost 换成电脑 IP
      url: 'https://www.in-the-moment.studio/api/pics',
      method: 'POST',
      data: {
        workId: this.data.info.workId,
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          for (let i = 0; i < res.data.data.length; i++) {
            imgs.push(res.data.data[i].url);
          }
          this.setData({
            gallery: imgs
          });
        } else {
          console.log('查询pics失败')
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        });
        console.error(err);
      },
      complete: () => {
        this.setData({
          isSubmitting: false
        });
      }
    });






  },

  // --- 核心交互 ---

  // 1. 检查收藏状态
  async checkFavoriteStatus() {
    if (!wx.getStorageSync('token')) return;

    try {
      const res = await request({
        url: '/favorite/check',
        data: {
          workId: this.data.info.workId,
          title: this.data.info.title
        }
      });
      if (res.code === 200) {
        this.setData({
          isFavorite: res.isFavorite
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 2. 点击收藏 (防抖 + 自动登录)
  async toggleFavorite() {
    // 未登录时，request.js 会自动处理登录，但为了交互流畅，先给个提示
    if (!wx.getStorageSync('token')) {
      wx.showToast({
        title: 'Signing in...',
        icon: 'loading'
      });
    }

    try {
      const res = await request({
        url: '/favorite/toggle',
        method: 'POST',
        data: {
          workId: this.data.info.workId,
          title: this.data.info.title,
          img: this.data.info.img,
          tag: this.data.info.tag
        }
      });

      if (res.code === 200) {
        this.setData({
          isFavorite: res.status
        });
        // 震动反馈，提升质感
        wx.vibrateShort({
          type: 'light'
        });
        wx.showToast({
          title: res.status ? '添加至我的收藏！' : '取消收藏！',
          icon: 'none'
        });
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 3. 预约跳转
  goBooking() {
    wx.switchTab({
      url: '/pages/contact/contact'
    });
  },

  // 4. 图片预览
  previewHero() {
    wx.previewImage({
      urls: [this.data.info.img]
    });
  },
  previewGallery(e) {
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls: this.data.gallery
    });
  },

  // 5. 分享给好友
  onShareAppMessage() {
    return {
      title: `Explore: ${this.data.info.title}`,
      path: `/pages/detail/detail?workId=${this.data.info.workId}&title=${this.data.info.title}&tag=${this.data.info.tag}&des=${this.data.info.des}&img=${encodeURIComponent(this.data.info.img)}`,
      imageUrl: decodeURIComponent(this.data.info.img)
    };
  },

  // 6. 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.info.title,
      query: `workId=${this.data.info.workId}&title=${this.data.info.title}&tag=${this.data.info.tag}&des=${this.data.info.des}&img=${encodeURIComponent(this.data.info.img)}`,
      imageUrl: decodeURIComponent(this.data.info.img)
    };
  }
});