// pages/add/add.js
const app=getApp()
const config = require('../../config.js')
Page({
  data: {
    id: null,
    formData: {
      title: '',
      desc: '',
      imglist: [],
      video: null,
      reason: ''
    },
    uploaderConfig: {
      maxCount: 9,
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: 'image'
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
    // 上传图片到服务器
    wx.uploadFile({
      url: config.baseUrl + '/api/upload',
      filePath: file.url,
      name: 'file',
      success: (res) => {
        const data = JSON.parse(res.data);
        const imglist = [...this.data.formData.imglist];
        imglist.push({
          url: data.url,
          name: file.name
        });
        this.setData({
          'formData.imglist': imglist
        });
      },
      fail: (error) => {
        console.error('上传失败：', error);
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
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

  // 选择视频
  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 上传视频到服务器
        wx.uploadFile({
          url: config.baseUrl + '/api/upload',
          filePath: tempFilePath,
          name: 'file',
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            this.setData({
              'formData.video': {
                url: data.url,
                name: 'video'
              }
            });
          },
          fail: (error) => {
            console.error('视频上传失败：', error);
            wx.showToast({
              title: '视频上传失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 删除视频
  deleteVideo() {
    this.setData({
      'formData.video': null
    });
  },

  // 提交
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

    const submitData = {
      title: formData.title,
      desc: formData.desc,
      imglist: formData.imglist.map(item => item.url),
      video: formData.video ? formData.video.url : null,
      authorID: app.globalData.openid,
      avatar: app.globalData.userInfo.avatarUrl,
      author: app.globalData.userInfo.nickName,
      time: new Date().toJSON().substring(0, 10) + ' ' + new Date().toTimeString().substring(0,8),
      reason: formData.reason
    };


    wx.request({
      url: `${config.baseUrl}/api/travelogues`,
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