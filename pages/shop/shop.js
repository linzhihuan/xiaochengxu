Page({
  consult(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({ title: '开始定制', content: `咨询 ${item} 定制详情`, confirmText: '联系客服', success: (res) => { if(res.confirm) wx.switchTab({url:'/pages/contact/contact'}) } });
  }
})