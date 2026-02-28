// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 启动时检查是否有 Token
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.hasLogin = true;
    }

    // 登录
  //   wx.login({
  //     success: res => {
  //       // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //     }
  //   })
  },
  // --- 核心登录方法 (Promise化) ---
  // 该方法只负责: wx.login -> 后端API -> 存Token
  // const userInfo = {
  //   // 优先存 Base64 以解决“临时路径失效”问题，或者存后端返回的 URL
  //   // 这里演示存 Base64 (注意 Storage 单个 key 上限 1MB)
  //   avatarUrl: this.data.avatarBase64 || this.data.avatarUrl,
  //   nickName: this.data.nickName
  // }
  doLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发起请求给后端 (这里不能用 request.js 封装的，否则会死循环，用原生 wx.request)
            wx.request({
              url: 'https://www.in-the-moment.studio/api/login',
              method: 'POST',
              data: { code: res.code },
              success: (backendRes) => {
                if (backendRes.data.code === 200) {
                  console.log('after login:',backendRes.data)
                  const { token } = backendRes.data;
                  // 1. 存 Token
                  wx.setStorageSync('token', token);
                  this.globalData.hasLogin = true;
                  console.log('Login Refresh Success');
                  resolve(backendRes.data);
                } else {
                  reject(backendRes.data);
                }
              },
              fail: (err) => reject(err)
            });
          } else {
            reject('wx.login failed');
          }
        },
        fail: (err) => reject(err)
      });
    });
  },
  doRegist(userInfo) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发起请求给后端 (这里不能用 request.js 封装的，否则会死循环，用原生 wx.request)
            wx.request({
              url: 'https://www.in-the-moment.studio/api/regist',
              method: 'POST',
              data: { code: res.code, userInfo:userInfo },
              success: (backendRes) => {
                if (backendRes.data.code === 200) {
                  console.log('after regist:',backendRes.data)
                  const { token } = backendRes.data;
                  // 1. 存 Token
                  wx.setStorageSync('token', token);
                  this.globalData.hasLogin = true;
                  console.log('Regist Refresh Success');
                  resolve(token);
                } else {
                  reject(backendRes.data);
                }
              },
              fail: (err) => reject(err)
            });
          } else {
            reject('wx.login failed');
          }
        },
        fail: (err) => reject(err)
      });
    });
  },
  doUpdate(userInfo) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发起请求给后端 (这里不能用 request.js 封装的，否则会死循环，用原生 wx.request)
            wx.request({
              url: 'https://www.in-the-moment.studio/api/update/userinfo',
              method: 'POST',
              data: { code: res.code , userInfo: userInfo},
              success: (backendRes) => {
                if (backendRes.data.code === 200) {
                  console.log('after update userinfo:',backendRes.data)
                  const { token } = backendRes.data;
                  // 1. 存 Token
                  wx.setStorageSync('token', token);
                  this.globalData.hasLogin = true;
                  console.log('Update userinfo Refresh Success');
                  resolve(token);
                } else {
                  reject(backendRes.data);
                }
              },
              fail: (err) => reject(err)
            });
          } else {
            reject('wx.login failed');
          }
        },
        fail: (err) => reject(err)
      });
    });
  },
  globalData: {
    token: null,
    userInfo: null,
  }
})
