Page({
  // 初始化数据
  data: {
    bannerList: [], // 轮播图数据
    categoryList: [], // 商品导航数据
    advertiseList: [], // 广告渲染区域
    loading: false // 是否显示骨架屏，后面看看怎么处理，不会的话体验差点也没办法
  },

  // 获取首页数据
  async getIndexData() {
    try {
      // 调用 listHomePage 云函数来获取所有数据
      const res = await wx.cloud.callFunction({
        name: 'listHomePage' // 替换为你的云函数名称
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        const { bannerList, categoryList, advertiseList } = res.result.data;
        // 需要对数据进行赋值
        this.setData({
          bannerList,
          categoryList,
          advertiseList,
          loading: false
        });
      } else {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
      console.error('Error calling listHomePage:', error);
    }
  },

  // 监听页面的加载
  onLoad() {
    // 在页面加载以后，调用获取首页数据的方法
    this.getIndexData()
  },

  // 转发功能，转发给好友、群聊
  onShareAppMessage() {
  },

  // 能够把小程序分享到朋友圈
  onShareTimeline() {
  }
})
