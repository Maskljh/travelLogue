// pages/travelogue/travelogue.js
const config = require('../../config.js')
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [],
    page:1,
    pageSize:10,
    hasMore: true, // 是否还有更多数据
    searchValue: '',
    originalCards: [], // 存储原始数据
    isLoading: false // 添加加载状态控制
  },


  fetchTravelogues() {
    if (!this.data.hasMore || this.data.isLoading) return;
    
    this.setData({ isLoading: true });

    // 自定义加载图标
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      loadingType: 'spinner',
      duration: 3000,
    });
    
    wx.request({
      url: config.baseUrl + '/api/travelogues',
      method: 'GET',
      data:{
        page:this.data.page,
        pageSize:this.data.pageSize
      },
      success: (res) => {
        console.log(res)
        if (!res.data || !res.data.data) {
          Toast.fail('数据格式错误');
          return;
        }

        if( res.data.data.length < this.data.pageSize){
          this.setData({
            hasMore:false
          })
        }
        const totalData=[...this.data.cards,...res.data.data]
        console.log(totalData)
        this.setData({
          cards: totalData,
          originalCards: totalData, // 保存原始数据
          isLoading: false
        });

        // 关闭加载提示
        Toast.clear();
      },
      fail: (error) => {
        console.error('获取数据失败：', error);
        Toast.fail('获取数据失败');
        this.setData({ isLoading: false });
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

  backtop: function () {
    // 小程序api 的界面 - 滚动
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
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
    this.setData({
      page: 1,
      hasMore: true,
      cards: [],
      originalCards: []
    }, () => {
      this.fetchTravelogues();
      const waterfallInstance = this.selectComponent("#waterfall");
      if (waterfallInstance) {
        waterfallInstance.reflow();
      }
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      })
    }
    this.fetchTravelogues()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})