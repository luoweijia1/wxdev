Page({
  // 页面的初始数据
  data: {
    orderList: [], // 订单列表
    page: 1, // 页码
    limit: 10, // 每页展示的条数
    total: 0, // 订单列表总条数
    isLoading: false // 判断数据是否记载完毕
  },

  // 获取订单列表
  async getOrderList() {
    // 解构获取数据
    const {page, limit} = this.data

    // 数据正在请求中
    this.data.isLoading = true

    // 调用接口获取订单列表数据
    try {
      const res = await wx.cloud.callFunction({
        name: 'listOrder',
        data: {page, limit} // 传递请求参数
      });

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

    // 数据加载完毕
    this.data.isLoading = false

    this.setData({
      orderList: [...this.data.orderList, ...res.data.records],
      total: res.data.total
    })
  },

  // 页面上拉触底事件的处理函数
  onReachBottom() {
    // 解构数据
    const {page, total, orderList, isLoading} = this.data

    // 判断是否加载完毕，如果 isLoading 等于 true
    // 说明数据还没有加载完毕，不加载下一页数据
    if (isLoading) return

    // 数据总条数 和 订单列表长度进行对比
    if (total === orderList.length) {
      wx.toast({title: '数据加载完毕'})
      return
    }

    // 更新 page
    this.setData({
      page: page + 1
    })

    // 重新发送请求
    this.getOrderList()
  },

  // 生命周期函数--监听页面加载
  onLoad() {
    this.getOrderList()
  }
})
