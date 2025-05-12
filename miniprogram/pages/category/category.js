Page({
  // 初始化数据
  data: {
    categoryList: [], // 商品分类列表数据
    activeIndex: 0 // 被激活那一项的索引，默认是 0
  },

  // 实现一级分类的切换效果
  updateActive(event) {
    const {index} = event.currentTarget.dataset

    this.setData({
      activeIndex: index
    })
  },

  // 获取商品分类的数据
  async getCategoryData() {
    try {
      // 调用 listHomePage 云函数来获取所有数据
      const res = await wx.cloud.callFunction({
        name: 'getCategoryGoodData' // 替换为你的云函数名称
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        this.setData({
          categoryList: res.result.data
        })
      } else {
        wx.showToast({
          title: '获取分类数据失败',
        });
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.showToast({
        title: '调用云函数获取分类数据失败',
      });
      console.error('Error calling listHomePage:', error);
    }
  },

  // 监听页面的加载
  onLoad() {
    // 调用获取商品分类的数据的方法
    this.getCategoryData()
  }
})
