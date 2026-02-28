const app = getApp();
const request = require('../../utils/request'); // 引入封装的请求

Page({
  data: {
    // 初始默认头像和称呼
    avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    avatarBase64: '',
    nickName: '',
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
    this.setData({
      isLogin
    });

    if (isLogin) {
      this.fetchFavorites();
    } else {
      this.setData({
        favorites: []
      });
    }

    // 模拟检查本地缓存
    const userInfo = wx.getStorageSync('user_info');
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
    }
  },
  // --- 核心逻辑：获取并压缩头像 ---
  onChooseAvatar(e) {
    console.log('onChooseAvatar:', e)
    const {
      avatarUrl
    } = e.detail;

    // 1. 立即在前端展示（提升体验）
    this.setData({
      avatarUrl
    });

    // 2. 启动压缩与转码管线
    this.processAvatar(avatarUrl);
  },
  async processAvatar(tempUrl) {
    wx.showLoading({
      title: 'Processing...'
    });

    try {
      // Step 1: 质量压缩
      // 微信压缩接口，quality 建议 40-60，Base64 需要更小的体积
      const compressedRes = await wx.compressImage({
        src: tempUrl,
        quality: 30
      });

      const compressedPath = compressedRes.tempFilePath;

      // Step 2: 转 Base64
      const fs = wx.getFileSystemManager();

      // 读取文件信息以检查大小
      const fileInfo = await fs.statSync(compressedPath);
      console.log(`[Image Info] Original size after compress: ${(fileInfo.size / 1024).toFixed(2)}KB`);

      // 读取为 Base64
      const base64Data = fs.readFileSync(compressedPath, 'base64');
      const base64Str = `data:image/jpeg;base64,${base64Data}`;

      this.setData({
        avatarBase64: base64Str
      });

      console.log(`[Base64] Length: ${base64Str.length} chars`, base64Str);

      wx.hideLoading();

    } catch (err) {
      console.error('Avatar processing failed:', err);
      wx.hideLoading();
      wx.showToast({
        title: 'Image Error',
        icon: 'none'
      });
    }
  }, // --- 核心逻辑：获取昵称 ---
  // 注意：微信基础库 2.21.2+ 支持 input type="nickname"
  onInputNickname(e) {
    // 这里的 value 可能是键盘回填的，也可能是手输的
    const name = e.detail.value;
    if (name) {
      this.setData({
        nickName: name
      });
    }
  },

  // --- 提交保存 ---
  handleRegistUser() {
    if (!this.data.avatarBase64 && !this.data.avatarUrl) {
      return wx.showToast({
        title: 'Please choose avatar',
        icon: 'none'
      });
    }
    if (!this.data.nickName) {
      return wx.showToast({
        title: 'Please enter name',
        icon: 'none'
      });
    }

    // 模拟保存逻辑
    wx.showLoading({
      title: 'Saving...'
    });

    const userInfo = {
      // 优先存 Base64 以解决“临时路径失效”问题，或者存后端返回的 URL
      // 这里演示存 Base64 (注意 Storage 单个 key 上限 1MB)
      avatarUrl: this.data.avatarBase64 || this.data.avatarUrl,
      nickName: this.data.nickName
    };

    // 写入本地存储
    wx.setStorageSync('user_info', userInfo);


    try {
      if (!this.data.isLogin) { //未登录
        app.doRegist(userInfo).then((res) => {
          if (res.serverinfo == 'alreadyRegist') {
            //
            wx.hideLoading();
            wx.showLoading({
              title: '已注册，请点击右侧登录按钮...'
            });
            wx.hideLoading();
            setTimeout(() => {
              wx.hideLoading();
            }, 1500);
          } else {
            this.setData({
              isLogin: true
            });
            this.fetchFavorites(); // 登录成功后立即拉取数据
            console.log('未登录 doRegist res:', res)
            wx.hideLoading();
          }

        });
      } else {
        //这段逻辑应该是不存在的
        console.log('userInfo:XXX', userInfo);
        app.doRegist(userInfo).then((res) => {
          wx.setStorageSync('user_info', userInfo);
          console.log('已登录 doRegist res:', res)
        })
        wx.hideLoading();
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: 'Login Failed',
        icon: 'none'
      });
    }

    // setTimeout(() => {
    //   this.setData({ isLogin: true });
    //   this.loadFavorites();
    //   wx.hideLoading();
    //   wx.showToast({ title: 'Profile Updated', icon: 'success' });
    // }, 800);
  },
  handleUpdateUser() {
    if (!this.data.avatarBase64 && !this.data.avatarUrl) {
      return wx.showToast({
        title: 'Please choose avatar',
        icon: 'none'
      });
    }
    if (!this.data.nickName) {
      return wx.showToast({
        title: 'Please enter name',
        icon: 'none'
      });
    }

    // 模拟保存逻辑
    wx.showLoading({
      title: 'Saving...'
    });

    const userInfo = {
      // 优先存 Base64 以解决“临时路径失效”问题，或者存后端返回的 URL
      // 这里演示存 Base64 (注意 Storage 单个 key 上限 1MB)
      avatarUrl: this.data.avatarBase64 || this.data.avatarUrl,
      nickName: this.data.nickName
    };

    // 写入本地存储
    wx.setStorageSync('user_info', userInfo);

    // 模拟后端同步

    try {
      if (!this.data.isLogin) { //未登录
        app.doUpdate(userInfo).then((res) => {
          this.setData({
            isLogin: true
          });
          this.fetchFavorites(); // 登录成功后立即拉取数据
          console.log('res:', res)
          wx.hideLoading();
        });
      } else {
        console.log('userInfo:XXX', userInfo);
        app.doUpdate(userInfo).then((res) => {
          console.log('res:', res)
        })

        wx.hideLoading();
      }



    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: 'Login Failed',
        icon: 'none'
      });
    }



    // setTimeout(() => {
    //   this.setData({ isLogin: true });
    //   this.loadFavorites();
    //   wx.hideLoading();
    //   wx.showToast({ title: 'Profile Updated', icon: 'success' });
    // }, 800);
  },
  handleLoginUser() {
    // if (!this.data.avatarBase64 && !this.data.avatarUrl) {
    //   return wx.showToast({
    //     title: 'Please choose avatar',
    //     icon: 'none'
    //   });
    // }
    // if (!this.data.nickName) {
    //   return wx.showToast({
    //     title: 'Please enter name',
    //     icon: 'none'
    //   });
    // }

    // 模拟保存逻辑
    wx.showLoading({
      title: 'Login...'
    });

    // const userInfo = {
    //   // 优先存 Base64 以解决“临时路径失效”问题，或者存后端返回的 URL
    //   // 这里演示存 Base64 (注意 Storage 单个 key 上限 1MB)
    //   avatarUrl: this.data.avatarBase64 || this.data.avatarUrl,
    //   nickName: this.data.nickName
    // };

    // //写入本地存储
    // wx.setStorageSync('user_info', userInfo);

    // 模拟后端同步

    try {
      let userInfo = {
        // 优先存 Base64 以解决“临时路径失效”问题，或者存后端返回的 URL
        // 这里演示存 Base64 (注意 Storage 单个 key 上限 1MB)
        avatarUrl: this.data.avatarBase64 || this.data.avatarUrl,
        nickName: this.data.nickName
      };
      if (!this.data.isLogin) { //未登录
        app.doLogin().then((res) => {
          if (res.serverInfo == 'unRegist') {
            wx.hideLoading();
            wx.showLoading({
              title: '用户未注册，请您先注册~ ...'
            });
            setTimeout(() => {
              wx.hideLoading();
            }, 2000);
          } else {
            this.setData({
              isLogin: true,
              avatarUrl: res.userRows[0]['avatar_url'],
              nickName: res.userRows[0]['nickname']
            });
            wx.setStorageSync('user_info', {
              avatarUrl: res.userRows[0]['avatar_url'],
              nickName: res.userRows[0]['nickname']
            });
            this.fetchFavorites(); // 登录成功后立即拉取数据
            console.log('已注册未登录 login res:', res)
            wx.hideLoading();
          }
        });
      } else {
        //这一段基本不可能执行
        app.doLogin().then((res) => {
          this.setData({
            avatarUrl: res.userRows[0]['avatar_url'],
            nickName: res.userRows[0]['nickname']
          });
          wx.setStorageSync('user_info', userInfo);
          console.log('已登录 login res:', res)
        })

        wx.hideLoading();
      }



    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: 'Login Failed',
        icon: 'none'
      });
    }



    // setTimeout(() => {
    //   this.setData({ isLogin: true });
    //   this.loadFavorites();
    //   wx.hideLoading();
    //   wx.showToast({ title: 'Profile Updated', icon: 'success' });
    // }, 800);
  },
  // 点击登录 废弃
  // async handleAuth() {
  //   if (this.data.isLogin) return;

  //   wx.showLoading({
  //     title: 'Logging in...'
  //   });
  //   try {
  //     await app.doLogin();
  //     this.setData({
  //       isLogin: true
  //     });
  //     this.fetchFavorites(); // 登录成功后立即拉取数据
  //     wx.hideLoading();
  //   } catch (e) {
  //     wx.hideLoading();
  //     wx.showToast({
  //       title: 'Login Failed',
  //       icon: 'none'
  //     });
  //   }
  // },

  // 获取数据：直接使用 request，无需担心 Token 过期，request.js 会自动处理
  async fetchFavorites() {
    try {
      const res = await request({
        url: '/favorites'
      });
      if (res.code === 200) {
        this.setData({
          favorites: res.data
        });
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
    wx.switchTab({
      url: '/pages/portfolio/portfolio'
    });
  }
});