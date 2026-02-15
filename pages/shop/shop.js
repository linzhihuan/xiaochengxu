const app = getApp();

Page({
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    products: [
      { id: 1, name: 'Acrylic Magnet', desc: 'Capture daily fragments.', price: 49, cover: 'https://images.unsplash.com/photo-1583875323984-63df774d0810?w=300', tag: 'HOT' },
      { id: 2, name: 'Waterproof Sticker', desc: 'Personalized for kids.', price: 29, cover: 'https://images.unsplash.com/photo-1616423668352-731307b22d19?w=300' },
      { id: 3, name: 'Oak Wood Frame', desc: 'Minimalist solid wood.', price: 299, cover: 'https://images.unsplash.com/photo-1534349762913-96e08227f2c0?w=300' },
      { id: 4, name: 'Metal Art Print', desc: 'Modern industrial style.', price: 399, cover: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=300' },
      { id: 5, name: 'Metal Art Print', desc: 'Modern industrial style.', price: 399, cover: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=300' },
      { id: 6, name: 'Metal Art Print', desc: 'Modern industrial style.', price: 399, cover: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=300' }
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