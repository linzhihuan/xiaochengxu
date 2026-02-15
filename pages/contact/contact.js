Page({
  data: {
    userName: '',
    userPhone: null,
    noteContent: '',
    types: ['婚礼', '情绪', '儿童', '宠物','更多定制服务'],
    idx: -1,
    isSubmitting: false // 防止重复提交
  },
  handleTextAreaInput(e) {
    this.setData({
      noteContent: e.detail.value
    });
  },

  // 失去焦点时校验（避免实时setData性能损耗）
  handleTextAreaBlur(e) {
    const content = e.detail.value.trim();
    // if (!content) {
    //   wx.showToast({ title: '备注不能为空', icon: 'none' });
    // }
  },

  pick(e) {
    this.setData({
      idx: e.detail.value
    });
  },

  submit(e) {
    const {
      userName,
      userPhone
    } = e.detail.value;
    const interest = this.data.idx != -1 ? this.data.types[this.data.idx] : '未选择';
    const noteContent = this.data.noteContent
    // 前端校验
    if (!userName || !userPhone) {
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
        name: userName,
        phone: userPhone,
        interest: interest,
        noteContent: noteContent
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 清空表单逻辑可在此添加
          this.setData({
            userName:'',
            userPhone:null,
            idx: -1,
            noteContent: ''
          });
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