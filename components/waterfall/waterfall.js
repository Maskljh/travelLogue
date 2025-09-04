Component({
  properties: {
    cards: {
      type: Array,
      value: [],
    },
  },
  data: {
    leftItems: [],
    rightItems: [],
  },

  observers: {
    'cards': function(cards) {
      this.layoutItems(cards);
    },
  },

  methods: {
    layoutItems(cards) {
      const leftItems = [];
      const rightItems = [];
      let leftHeight = 0;
      let rightHeight = 0;

      // 将 cards 分配到两列
      cards.forEach(item => {
        if (leftHeight <= rightHeight) {
          leftItems.push(item);
          leftHeight += Math.random() * 100 + 150; // 模拟每个 item 的高度
        } else {
          rightItems.push(item);
          rightHeight += Math.random() * 100 + 150;
        }
      });

      this.setData({
        leftItems,
        rightItems,
      });
    },

    toDetail(e) {
      const id = JSON.stringify(e.currentTarget.dataset.id);
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + id
      });
    },
  },
});
