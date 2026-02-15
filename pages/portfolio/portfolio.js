Page({
  data: {
    rawData: [],
    activeTab: 'all',
    leftList: [],
    rightList: []
  },
  onLoad() {
// 发起网络请求
wx.request({
  // 注意：真机调试需要勾选“不校验合法域名”，或者在后台配置域名
  // 本地调试请确保手机和电脑在同一 WiFi，并将 localhost 换成电脑 IP
  url: 'https://www.in-the-moment.studio/api/works',
  method: 'GET',
  success: (res) => {
    wx.hideLoading();
    if (res.data.code === 200) {
      this.data.rawData = res.data.data
      this.distribute(this.data.rawData);
    } else {
      wx.showToast({
        title: '获取works数据失败',
        icon: 'none'
      });
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
  complete: () => {}
});

 
  },
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      activeTab: type
    });
    const list = type === 'all' ? this.data.rawData : this.data.rawData.filter(i => i.type === type);
    this.distribute(list);
  },
  distribute(list) {
    let l = [],
      r = [];
    list.forEach((item, i) => i % 2 === 0 ? l.push(item) : r.push(item));
    this.setData({
      leftList: l,
      rightList: r
    });
  },
  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?workId=${item.id}&title=${item.title}&tag=${item.tag}&des=${item.des}&img=${encodeURIComponent(item.img)}`
    });
  }
});