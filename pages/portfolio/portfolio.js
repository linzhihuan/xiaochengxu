const rawData = [
  { id: 1, type: 'portrait', title: 'Blue Hour', tag: 'PORTRAIT', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500' },
  { id: 2, type: 'commercial', title: 'Minimalist', tag: 'BUSINESS', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500' },
  { id: 3, type: 'portrait', title: 'Summer Vibe', tag: 'PORTRAIT', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500' },
  { id: 4, type: 'memory', title: 'The Wedding', tag: 'WEDDING', img: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=500' }
];

Page({
  data: { activeTab: 'all', leftList: [], rightList: [] },
  onLoad() { this.distribute(rawData); },
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeTab: type });
    const list = type === 'all' ? rawData : rawData.filter(i => i.type === type);
    this.distribute(list);
  },
  distribute(list) {
    let l = [], r = [];
    list.forEach((item, i) => i % 2 === 0 ? l.push(item) : r.push(item));
    this.setData({ leftList: l, rightList: r });
  },
  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ url: `/pages/detail/detail?title=${item.title}&tag=${item.tag}&img=${encodeURIComponent(item.img)}` });
  }
});