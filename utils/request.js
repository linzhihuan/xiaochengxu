// utils/request.js
const app = getApp();
const BASE_URL = 'https://www.in-the-moment.studio/api'; // 本地调试地址

// 正在刷新的标记，防止并发请求导致多次弹窗或多次登录
let isRefreshing = false;
let requestsQueue = [];

const request = (options) => {
  // 获取 Token
  let token = wx.getStorageSync('token');
  
  // 组装 Header
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  };
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: async (res) => {
        // === 核心逻辑: 处理 Token 过期 (401) ===
        if (res.statusCode === 401) {
          if (!isRefreshing) {
            isRefreshing = true;
            // 1. Token 失效，尝试静默重新登录
            try {
              // 引用 App.js 中的 login 方法 (需确保 App.js 已加载)
              const newApp = getApp(); 
              await newApp.doLogin(); // 重新获取 Token
              
              // 2. 登录成功，重试队列中的请求
              isRefreshing = false;
              requestsQueue.forEach(cb => cb());
              requestsQueue = [];
              
              // 3. 重试当前请求
              resolve(request(options));
            } catch (e) {
              // 登录彻底失败 (如网络问题)
              isRefreshing = false;
              requestsQueue = [];
              wx.showToast({ title: '登录已过期，请手动刷新', icon: 'none' });
              reject(e);
            }
          } else {
            // 如果正在刷新 Token，将当前请求加入队列，等刷新完再执行
            requestsQueue.push(() => {
              resolve(request(options));
            });
          }
        } else if (res.statusCode === 200 && res.data.code === 200) {
          // 业务成功
          resolve(res.data);
        } else {
          // 业务错误
          resolve(res.data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = request;