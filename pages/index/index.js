Page({
  goToPortfolio() {
    wx.switchTab({ url: '/pages/portfolio/portfolio' })
  },
  goToContact() {
    wx.switchTab({ url: '/pages/contact/contact' })
  }
})