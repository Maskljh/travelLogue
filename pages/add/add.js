// pages/add/add.js
const app=getApp()
Page({
  data: {
    id: null,
    formData: {
      title: '',
      desc: '',
      imglist: []
    }
  },

  onLoad(options) {

  },


  onTitleChange(e) {
    this.setData({
      'formData.title': e.detail
    });
  },

  onDescChange(e) {
    this.setData({
      'formData.desc': e.detail
    });
  },

  afterRead(event) {
    const { file } = event.detail;
    // 这里可以添加上传图片到服务器的逻辑
    // 暂时直接添加到列表中
    const imglist = [...this.data.formData.imglist];
    imglist.push({
      url: file.url,
    });
    this.setData({
      'formData.imglist': imglist
    });
  },

  onDelete(event) {
    const { index } = event.detail;
    const imglist = [...this.data.formData.imglist];
    imglist.splice(index, 1);
    this.setData({
      'formData.imglist': imglist
    });
  },

  onSubmit() {
    const { formData } = this.data;
    
    // 验证必填字段
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }

    if (!formData.desc.trim()) {
      wx.showToast({
        title: '请输入描述',
        icon: 'none'
      });
      return;
    }

    if (formData.imglist.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }

    console.log(app.globalData.userInfo)
    console.log(app.globalData.openid)
    const submitData = {
      title: formData.title,
      desc: formData.desc,
      imglist: formData.imglist.map(item => item.url),
      authorID: app.globalData.openid,
      avatar: app.globalData.userInfo.avatarUrl,
      author: app.globalData.userInfo.nickName
    };

    wx.request({
      url: `http://localhost:5000/api/travelogues`,
      method: 'POST',
      data: submitData,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: (error) => {
        console.error('保存失败：', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  }
}); 