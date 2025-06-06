Page({
  // 页面的初始数据
  data: {
    goodsList: [], // 商品列表数据
    total: 0, // 数据总条数
    isFinish: false, // 判断数据是否加载完毕
    isLoading: false, // 判断数据是否加载完毕

    // 商品列表请求参数
    requestData: {
      page: 1, // 页码
      limit: 10, // 每页请求的条数
      categoryId: '', // 分类 id
    }
  },

  // 获取商品列表数据
  async getGoodsList() {
    // 在请求发送之前，需要将 isLoading 设置为 true，表示请求正在发送中
    this.data.isLoading = true

    // 发送请求
    try {
      // 调用 listGoods 云函数来获取商品列表
      console.log("req:" + this.data.requestData.categoryId)
      const res = await wx.cloud.callFunction({
        name: 'listGoods',
        data: this.data.requestData // 传递请求参数
      });
      console.log("res:" + res.result.data)

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        // 将商品列表数据进行赋值
        this.setData({
          goodsList: res.result.data
        });
      } else {
        // 处理错误情况，例如显示错误提示
        toast({title: '获取商品列表失败'})
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      toast({title: '获取商品列表失败'})
      console.error('Error calling listGoods:', error);
    }

    // 在请求结束以后，需要将 isLoading 设置为 false，表示请求已经结束
    this.data.isLoading = false
  },

  // 监听到页面的上拉操作
  onReachBottom() {
    // 解构数据
    const {goodsList, total, requestData, isLoading} = this.data
    const {page} = requestData

    // 判断 isLoading 状态
    // 如果状态等于 true，说明请求正在发送中，如果请求正在发送中，就不请求下一页数据
    if (isLoading) return

    // 让 goodsList 长度 和 total 进行对比
    // 如果数据相等，商品列表已经加载完毕
    if (goodsList.length === total) {
      this.setData({
        isFinish: true
      })
      return
    }

    // 页码 + 1
    this.setData({
      requestData: {...this.data.requestData, page: page + 1}
    })

    // 重新获取商品列表
    this.getGoodsList()
  },

  // 监听页面的下拉刷新操作
  onPullDownRefresh() {
    // 将数据进行重置
    this.setData({
      goodsList: [],
      total: 0,
      isFinish: false,
      requestData: {...this.data.requestData, page: 1}
    })

    // 使用最新的参数发送请求
    this.getGoodsList()

    // 手动关闭下拉刷新的效果
    wx.stopPullDownRefresh()
  },

  onLoad(options) {
    // Object.assign 用来合并对象，后面对象对的属性会往前进行合并
    Object.assign(this.data.requestData, options)

    // 调用获取商品列表数据的方法
    this.getGoodsList()
  },

  // 转发功能，转发给好友、群聊
  onShareAppMessage() {
  },

  // 能够把小程序分享到朋友圈
  onShareTimeline() {
  }
})
