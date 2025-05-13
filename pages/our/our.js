// pages/our/our.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    currentId: null,  // 添加currentId用于存储当前要删除的id
    userInfo: null,
    cards: []
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
      url: `http://localhost:5000/api/travelogues/${id}`,
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

  handleAdd(){
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
      url: 'http://localhost:5000/api/travelogues/user/'+openid,
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

  }
})