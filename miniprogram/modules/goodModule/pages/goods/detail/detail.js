// 导入创建的 behavior
import {userBehavior} from '../../../behaviors/userBehavior'

Page({
  behaviors: [userBehavior],

  // 页面的初始数据
  data: {
    goodsInfo: {}, // 商品详情
    show: false, // 加入购物车和立即购买时显示的弹框
    count: 1, // 商品购买数量，默认是 1
    blessing: '', // 祝福语
    buyNow: 0, // 控制是加入购物车还是立即购买，0 加入购物车，1 立即购买
    allCount: '' // 商品的购买数量
  },

  // 加入购物车
  handleAddcart() {
    this.setData({
      show: true,
      buyNow: 0
    })
  },

  // 立即购买
  handeGotoBuy() {
    this.setData({
      show: true,
      buyNow: 1
    })
  },

  // 点击关闭弹框时触发的回调
  onClose() {
    this.setData({show: false})
  },

  // 监听是否更改了购买数量
  onChangeGoodsCount(event) {
    this.setData({
      count: Number(event.detail)
    })
  },

  // 弹框的确定按钮触发的事件处理函数
  async handlerSubmit() {
    // 解构相关的数据
    const {openId, count, blessing, buyNow} = this.data
    // 获取商品的 id
    const goodsId = this.goodsId

    // 判断用户是否进行了登录，如果没有登录，需要跳转到登录页面
    if (!openId) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    // 区分处理加入购物车已经立即购买
    // 如果 buyNow === 0，说明是加入购物车，
    // 如果 buyNow === 1，说明是立即购买
    if (buyNow === 0) {
      // 如果购买数量发生了改变，需要调用接口，传递差值
      const res = await wx.cloud.callFunction({
        name: 'addCart', // 替换为你的云函数名称
        data: {goodsId: id, count: disCount} // 传递商品的 id 和数量
      });

      // 如果服务器更新购买数量成功，需要更新本地的购买数量
      if (res.result && res.result.success) {
        wx.toast({title: '加入购物车成功'})

        // 在加入购物车成功以后，需要重新计算购物车商品的购买数量
        this.getCartCount()

        this.setData({
          show: false
        })
      }
    } else {
      wx.navigateTo({
        url: `/modules/orderPayModule/pages/order/detail/detail?goodsId=${goodsId}&blessing=${blessing}`
      })
    }
  },

  // 全屏预览图片
  previewImage() {
    wx.previewImage({
      urls: this.data.goodsInfo.detailList
    })
  },

  // 获取商品详情的数据
  async getGoodsInfo() {
    try {
      // 调用 getGoodDetail 云函数来获取商品详情
      const res = await wx.cloud.callFunction({
        name: 'getGoodDetail',
        data: {id: this.goodsId} // 传递商品 ID 作为参数
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        // 将商品详情数据进行赋值
        this.setData({
          goodsInfo: res.result.data
        });
      } else {
        // 处理错误情况，例如显示错误提示
        toast({title: '获取商品信息失败'})
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      toast({title: '获取商品信息失败'})
      console.error('Error calling getGoodDetail:', error);
    }
  },

  // 计算购物车商品的数量
  async getCartCount() {
    // 使用 openId 来判断用户是否进行了登录，
    // 如果没有 openId，说明用户没有登录，就不执行后续的逻辑
    if (!this.data.openId) return

    // 如果存在 openId，说明用户进行了登录，获取购物车列表的数据
    // 然后计算得出购买的数量
    try {
      // 调用 listCarts 云函数来获取购物车列表
      const res = await wx.cloud.callFunction({
        name: 'listCarts',
        data: {} // 如果需要传递参数，可以在这里添加
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        // 将购物车列表数据进行赋值
        this.setData({
          cartList: res.result.data
        });
      } else {
        // 处理错误情况，例如显示错误提示
        toast({title: '获取购物车列表失败'})
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      toast({title: '获取购物车列表失败'})
      console.error('Error calling listCarts:', error);
    }

    // 判断购物车中是否存在商品
    if (res.data.length !== 0) {
      // 累加得出的商品购买数量
      let allCount = 0

      res.data.forEach((item) => {
        allCount += item.count
      })

      this.setData({
        // info 属性的属性值要求是 字符串类型
        // 而且如果购买的数量大于 99，页面上需要展示 99+
        allCount: (allCount > 99 ? '99+' : allCount) + ''
      })
    }
  },

  onLoad(options) {
    // 接收传递的商品 ID，并且将 商品 ID 挂载到 this 上面
    this.goodsId = options.goodsId

    // 调用获取商品详情数据的方法
    this.getGoodsInfo()

    // 计算购买的数量
    this.getCartCount()
  },

  // 转发功能，转发给好友、群聊
  onShareAppMessage() {
    return {
      title: '所有的怦然心动，都是你',
      path: '/pages/index/index',
      imageUrl: '../../../../../assets/images/love.jpg'
    }
  },

  // 能够把小程序分享到朋友圈
  onShareTimeline() {
  }
})
