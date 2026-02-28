Page({
  data: {
    // 真实摄影图片素材
    images: [
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/kid01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/kid02.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/kid03.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/old01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/family01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/girl01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/girl02.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/girl03.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/girl04.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/yun01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/man01.jpg",
      "https://2026-1312809563.cos.ap-shanghai.myqcloud.com/home/cat01.jpg",
    ],
    swiperInterval: 4000, // 图片停留时间
    swiperDuration: 1200  // 切换过渡耗时
  },

  goToPortfolio() {
    wx.switchTab({ url: '/pages/portfolio/portfolio' })
  },
  goToContact() {
    wx.switchTab({ url: '/pages/contact/contact' })
  }
})

