// pages/travelogue/travelogue.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [
      {
        id: 1,
        img: '../../images/js.jpg',
        avatar :'../../images/js.jpg',
        title: '江苏无锡三天两晚旅游攻略',
        desc: '抓紧收藏！江苏无锡三天两晚旅游攻略来了',
        author: '小吴要干饭o',
        views: 2293
      },
      {
        id: 2,
        img: '../../images/js.jpg',
        avatar :'../../images/js.jpg',
        title: '无锡近期热门景点榜',
        desc: '跟着热点去旅行',
        author: '旅游研究所',
        views: 881
      },
      {
        id: 3,
        img: '../../images/js.jpg',
        avatar :'../../images/js.jpg',
        title: '无锡鼋头渚 | 樱花开了',
        desc: '最美赏樱地。',
        author: '旅游研究所',
        views: 881
      },
      {
        id: 4,
        img: '../../images/js.jpg',
        avatar :'../../images/js.jpg',
        title: '在无锡！好吃不贵的本帮菜馆',
        desc: '挤爆了~',
        author: '强哥',
        views: 114
      }
    ]
  },

  toDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/detail/detail?item=${JSON.stringify(item)}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  }
})