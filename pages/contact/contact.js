Page({
  data: {
    types: ['Portrait', 'Wedding', 'Family', 'DIY Custom'],
    idx: -1,
    isSubmitting: false // 防止重复提交
  },

  pick(e) {
    this.setData({
      idx: e.detail.value
    });
  },

  submit(e) {
    const {
      name,
      phone
    } = e.detail.value;
    const interest = this.data.idx != -1 ? this.data.types[this.data.idx] : '未选择';

    // 前端校验
    if (!name || !phone) {
      return wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
    }

    // 防止重复点击
    if (this.data.isSubmitting) return;
    this.setData({
      isSubmitting: true
    });

    wx.showLoading({
      title: '提交中...'
    });

    // 发起网络请求
    wx.request({
      // 注意：真机调试需要勾选“不校验合法域名”，或者在后台配置域名
      // 本地调试请确保手机和电脑在同一 WiFi，并将 localhost 换成电脑 IP
      url: 'https://www.in-the-moment.studio/api/booking',
      method: 'POST',
      data: {
        name: name,
        phone: phone,
        interest: interest
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 清空表单逻辑可在此添加
          setTimeout(() => wx.switchTab({
            url: '/pages/index/index'
          }), 1500);
        } else {
          wx.showToast({
            title: '提交失败',
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
      complete: () => {
        this.setData({
          isSubmitting: false
        });
      }
    });
  }
})