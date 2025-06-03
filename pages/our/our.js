// pages/our/our.js
const config = require('../../config.js')
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    currentId: null,  // 添加currentId用于存储当前要删除的id
    userInfo: null,
    cards: [],
    navBarHeight: '88rpx' // 默认高度，防止未获取到时出错
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取存储的用户信息
    const userInfo = app.globalData.userInfo;
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
      // 只有在用户登录的情况下才获取游记列表
      this.fetchTravelogues();
    }
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    // 导航栏高度 = 胶囊bottom + 胶囊top - 状态栏高度
    const navBarHeight = menuButtonInfo.bottom + menuButtonInfo.top - statusBarHeight;
    this.setData({
      navBarHeight: navBarHeight + 'px'
    });
  },

  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
      success: function() {
        console.log('跳转成功')
      },
      fail: function(err) {
        console.error('跳转失败', err)
      }
    })
  },

  toDetail(e) {
    const id = JSON.stringify(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  handleDelete(e){
    const id = e.currentTarget.dataset.id;
    this.setData({ 
      show: true,
      currentId: id
    });
  },

  onClose() {
    this.setData({ 
      show: false,
      currentId: null
    });
  },

  confirmDelete(e) {
    const id = this.data.currentId;
    wx.request({
      url: `${config.baseUrl}/api/travelogues/${id}`,
      method: 'DELETE',
      success: (res) => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        // 重新获取列表数据
        this.fetchTravelogues();
        // 关闭弹窗
        this.onClose();
      },
      fail: (error) => {
        console.error('删除失败：', error);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    });
  },

  handleEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}`
    });
  },

  handleAdd() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1000);
      return;
    }
    wx.navigateTo({
      url: '/pages/add/add'
    });
  },

  fetchTravelogues() {
    const openid = app.globalData.openid;
    if (!openid) {
      console.error('未获取到用户openid');
      return;
    }

    wx.request({
      url: config.baseUrl + '/api/travelogues/user/'+openid,
      method: 'GET',
      success: (res) => {
        this.setData({
          cards: res.data,
          originalCards: res.data
        });
      },
      fail: (error) => {
        console.error('获取数据失败：', error);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const userInfo = app.globalData.userInfo;
    console.log(userInfo)
    this.setData({
      userInfo: userInfo
    });
    // 只有在用户登录的情况下才获取游记列表
    if (userInfo) {
      this.fetchTravelogues();
    } else {
      // 如果用户未登录，清空游记列表
      this.setData({
        cards: []
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    const userInfo = app.globalData.userInfo;
    console.log(userInfo)
    this.setData({
      userInfo: userInfo
    });
    // 只有在用户登录的情况下才获取游记列表
    if (userInfo) {
      this.fetchTravelogues();
    } else {
      // 如果用户未登录，清空游记列表
      this.setData({
        cards: []
      });
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  onClickLeft() {
    wx.navigateBack();
  },

  onClickRight() {
    // 这里可以添加右侧按钮的点击事件处理
    wx.showToast({
      title: '点击了右侧按钮',
      icon: 'none'
    });
  }
})