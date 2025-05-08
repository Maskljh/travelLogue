// pages/travelogue/travelogue.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [],
    searchValue: '',
    originalCards: [] // 存储原始数据
  },


  fetchTravelogues() {
    wx.request({
      url: 'http://localhost:5000/api/travelogues',
      method: 'GET',
      success: (res) => {
        console.log(res)
        this.setData({
          cards: res.data,
          originalCards: res.data // 保存原始数据
        }, () => {
          // 在数据更新完成后调用reflow
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
    console.log(searchValue)
    if (!searchValue) {
      // 如果搜索值为空，显示所有数据
      this.setData({
        cards: this.data.originalCards
      });
      return;
    }

    // 搜索标题和作者
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchTravelogues();
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
    // 每次页面显示时重新获取数据
    this.fetchTravelogues();
    const waterfallInstance = this.selectComponent("#waterfall");
    waterfallInstance.reflow();
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