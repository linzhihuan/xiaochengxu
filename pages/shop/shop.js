const app = getApp();

Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    products: [
      { id: 1, name: '实体相框', desc: 'Capture daily fragments.', price: ' contact us', cover: 'https://2026-1312809563.cos.ap-shanghai.myqcloud.com/lab/xk.png', tag: 'HOT' },
      { id: 2, name: '影集', desc: 'Personalized for kids.', price: ' contact us', cover: 'https://2026-1312809563.cos.ap-shanghai.myqcloud.com/lab/yj.png' },
      { id: 3, name: '日历', desc: 'Personalized for kids.', price: ' contact us', cover: 'https://2026-1312809563.cos.ap-shanghai.myqcloud.com/lab/rl.png' },
      { id: 4, name: '冰箱贴', desc: 'Personalized for kids.', price: ' contact us', cover: 'https://2026-1312809563.cos.ap-shanghai.myqcloud.com/lab/bxt.png' },
    ]
  },

  goCustomize(e) {
    const id = e.currentTarget.dataset.id;
    // 跳转到二级页面
    wx.navigateTo({
      url: `/pages/shop/customize/customize?id=${id}`
    });
  }
});