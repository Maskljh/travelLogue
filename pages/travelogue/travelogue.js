// pages/travelogue/travelogue.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [],
    searchValue: '',
    originalCards: [], // 存储原始数据
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    loading: false, // 加载状态
    hasMore: true // 是否还有更多数据
  },

  fetchTravelogues(page = 1, append = false) {
    if (this.data.loading) return; // 防抖
    
    this.setData({ loading: true });

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    
    wx.request({
      url: 'http://localhost:5000/api/travelogues',
      method: 'GET',
      data: {
        page: page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        // 修正 imglist 字段
        const fixedData = res.data.data.map(card => ({
          ...card,
          isdeleted: card.isdeleted === 0? false : true,
          imglist: typeof card.imglist === 'string' ? JSON.parse(card.imglist) : card.imglist
        }));
        
        console.log(fixedData);
        
        if (append) {
          // 追加数据
          const newCards = [...this.data.cards, ...fixedData];
          this.setData({
            cards: newCards,
            originalCards: newCards,
            page: page,
            hasMore: fixedData.length === this.data.pageSize
          });
        } else {
          // 替换数据
          this.setData({
            cards: fixedData,
            originalCards: fixedData,
            page: page,
            hasMore: fixedData.length === this.data.pageSize
          });
        }
        wx.hideLoading();
        
        // // 在数据更新完成后调用reflow
        // const waterfallInstance = this.selectComponent("#waterfall");
        // if (waterfallInstance) {
        //   waterfallInstance.reflow();
        // }
      },
      fail: (error) => {
        console.error('获取数据失败：', error);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 加载更多数据
  loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    const nextPage = this.data.page + 1;
    this.fetchTravelogues(nextPage, true);
  },

  onSearchChange(e) {
    const value = e.detail;
    this.setData({
      searchValue: value
    });
  },

  onSearch() {
    const searchValue = this.data.searchValue.toLowerCase();
    console.log(searchValue);
    
    if (!searchValue) {
      // 如果搜索值为空，显示所有数据，重置分页
      this.setData({
        page: 1,
        hasMore: true
      });
      this.fetchTravelogues(1, false);
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
    this.fetchTravelogues(1, false);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 在页面渲染完成后重新布局瀑布流
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
    // 每次页面显示时重新获取数据，重置分页
    this.setData({
      page: 1,
      hasMore: true
    });
    this.fetchTravelogues(1, false);
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
    // 重置分页状态
    this.setData({
      page: 1,
      hasMore: true
    });
    
    // 重新获取第一页数据
    this.fetchTravelogues(1, false);
    
    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})