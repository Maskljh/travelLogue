// pages/detail/detail.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
    departTime: '2月',
    days: '7天',
    cost: '5.0千',
    partner: '夫妻',
    isVideoPlaying: false,
    currentIndex: 0,
    isLiked: false,
    isFavorited: false,
    userInfo: null
  },

  fetchTraveloguesInfo(id) {
    wx.request({
      url: 'http://localhost:5000/api/travelogues/'+id,
      method: 'GET',
      success: (res) => {
        console.log(res)
        const item = res.data;
        const likedList = wx.getStorageSync('likedList') || [];
        const favoritedList = wx.getStorageSync('favoritedList') || [];
        this.setData({
          item,
          isLiked: likedList.includes(item.id),
          isFavorited: favoritedList.includes(item.id)
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options.id)
    // if (options.item) {
    //   this.setData({
    //     item: JSON.parse(decodeURIComponent(options.item))
    //   });
    // }
    this.fetchTraveloguesInfo(options.id)
    // // 获取存储的用户信息
    // const userInfo = app.globalData.userInfo;
    // console.log(userInfo)
    // if (userInfo) {
    //   this.setData({
    //     userInfo: userInfo
    //   });
    // }
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
    // 获取存储的用户信息
    const userInfo = app.globalData.userInfo;
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo: userInfo
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

  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    console.log(current)
    wx.previewImage({
      current: current,
      urls: this.data.item.imglist
    });
  },

  onVideoPlay() {
    this.setData({
      isVideoPlaying: true
    });
  },

  onVideoPause() {
    this.setData({
      isVideoPlaying: false
    });
  },

  onVideoEnd() {
    this.setData({
      isVideoPlaying: false,
      currentIndex: 1  // 视频播放完成后，切换到第一张图片
    });
  },

  onLikeClick() {
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
    const id = this.data.item.id;
    let likedList = wx.getStorageSync('likedList') || [];
    let isLiked = likedList.includes(id);

    if (isLiked) {
      likedList = likedList.filter(itemId => itemId !== id);
    } else {
      likedList.push(id);
    }
    wx.setStorageSync('likedList', likedList);

    this.setData({
      isLiked: !isLiked
    });
    wx.showToast({
      title: !isLiked ? '点赞成功' : '取消点赞',
      icon: 'none'
    });
  },

  onFavoriteClick() {
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
    const id = this.data.item.id;
    let favoritedList = wx.getStorageSync('favoritedList') || [];
    let isFavorited = favoritedList.includes(id);

    if (isFavorited) {
      favoritedList = favoritedList.filter(itemId => itemId !== id);
    } else {
      favoritedList.push(id);
    }
    wx.setStorageSync('favoritedList', favoritedList);

    this.setData({
      isFavorited: !isFavorited
    });
    wx.showToast({
      title: !isFavorited ? '收藏成功' : '取消收藏',
      icon: 'none'
    });
  }
})