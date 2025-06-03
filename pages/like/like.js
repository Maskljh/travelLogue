// pages/like/like.js
const app=getApp()
const config = require('../../config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [],
    searchValue: '',
    originalCards: [],
    userInfo: null
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
      this.fetchLikedTravelogues();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    setTimeout(() => {
      const waterfallInstance = this.selectComponent("#waterfall");
      if (waterfallInstance) {
        waterfallInstance.reflow();
      }
    }, 200);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.fetchLikedTravelogues();
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

  fetchLikedTravelogues() {
    const likedList = wx.getStorageSync('likedList') || [];
    console.log(likedList)
    if (likedList.length === 0) {
      this.setData({
        cards: [],
        originalCards: []
      });
      return;
    }

    wx.request({
      url: config.baseUrl + '/api/travelogues',
      method: 'GET',
      success: (res) => {
        const likedTravelogues = res.data.filter(item => likedList.includes(item.id));
        console.log(likedTravelogues)
        console.log(this.data.userInfo)
        this.setData({
          cards: likedTravelogues,
          originalCards: likedTravelogues
        }, () => {
          const waterfallInstance = this.selectComponent("#waterfall");
          if (waterfallInstance) {
            waterfallInstance.reflow();
          }
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

  onSearchChange(e) {
    const value = e.detail;
    this.setData({
      searchValue: value
    });
  },

  onSearch() {
    const searchValue = this.data.searchValue.toLowerCase();
    if (!searchValue) {
      this.setData({
        cards: this.data.originalCards
      });
      return;
    }

    const filteredCards = this.data.originalCards.filter(card => 
      card.title.toLowerCase().includes(searchValue) || 
      card.author.toLowerCase().includes(searchValue)
    );

    this.setData({
      cards: filteredCards
    });

    const waterfallInstance = this.selectComponent("#waterfall");
    waterfallInstance.reflow();
  },

  toDetail(e) {
    const id = JSON.stringify(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  backtop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  }
})