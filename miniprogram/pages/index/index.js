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
    const bannerRes = await wx.cloud.callFunction({
      name: 'getListData',
      data: { type: 'banner' } // 假设传入 type 参数来区分不同的数据请求
    });

    const bannerList = bannerRes.result && bannerRes.result.success ? bannerRes.result.data : [];

    // 调用云函数获取 categoryList
    const categoryRes = await wx.cloud.callFunction({
      name: 'getListData',
      data: { type: 'category' }
    });

    const categoryList = categoryRes.result && categoryRes.result.success ? categoryRes.result.data : [];

    // 调用云函数获取 advertiseList
    const advertiseRes = await wx.cloud.callFunction({
      name: 'getListData',
      data: { type: 'advertise' }
    });

    const advertiseList = advertiseRes.result && advertiseRes.result.success ? advertiseRes.result.data : [];


    // 需要对数据进行赋值，在赋值的时候，一定要注意索引
    this.setData({
      bannerList: bannerList,
      categoryList: categoryList,
      advertiseList: advertiseList,
      loading: false
    })
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
