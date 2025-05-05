// pages/detail/detail.js
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
    desc: '这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述这是一大段描述'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.item) {
      this.setData({
        item: JSON.parse(decodeURIComponent(options.item))
      });
    }
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