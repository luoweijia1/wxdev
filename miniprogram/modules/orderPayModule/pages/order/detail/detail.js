// 导入 async-validator 对参数进行验证
import Schema from 'async-validator'
// 导入格式化时间的方法
import {formatTime} from '../../../utils/formatTime'

// 导入防抖函数
import {debounce} from 'miniprogram-licia'
import {userStore} from '@/stores/userstore'

// 获取应用实例
const app = getApp()

Page({
  data: {
    buyName: '', // 订购人姓名
    buyPhone: '', // 订购人手机号
    deliveryDate: '', // 期望送达日期
    blessing: '', // 祝福语
    show: false, // 期望送达日期弹框
    orderAddress: {}, // 收货地址
    orderInfo: {}, // 订单商品详情
    minDate: new Date().getTime()
  },

  // 处理提交订单
  submitOrder: debounce(async function () {
    // 需要从 data 中解构数据
    const {
      buyName,
      buyPhone,
      deliveryDate,
      blessing,
      orderAddress,
      orderInfo
    } = this.data
    
    // 需要根据接口要求组织请求参数
    const params = {
      totalAmount: orderInfo.totalAmount,
      buyName,
      buyPhone,
      cartList: orderInfo.cartVoList,
      deliveryDate,
      userAddressId: orderAddress._id
    }

    // 对请求参数进行验证
    const {valid} = await this.validatorPerson(params)

    // 如果请求参数验证失败，直接 return ，不执行后续的逻辑
    if (!valid) return

    // 调用云函数，创建平台订单
    wx.cloud.callFunction({
      name: 'createOrder',
      data: params,
      success: res => {
        if (res.result.success) {
          // 在平台订单创建成功以后，需要将服务器、后端返回的订单编号挂载到页面实例上
          this.orderNo = res.result.orderId

          // 获取预付单信息、支付参数
          this.advancePay(this.orderNo)
        } else {
          console.error('订单创建失败', res.result.message)
        }
      },
      fail: err => {
        console.error('调用订单创建云函数失败', err)
      }
    })
  }, 500),

  // 获取预付单信息、支付参数
  async advancePay(orderNo) {
    wx.cloud.callFunction({
      // 云函数名称
      name: 'wxpayFunctions',
      data: {
        // 调用云函数中的下单方法
        type: 'wxpay_order',
        outTradeNo: orderNo
      },
      success: (res) => {
        console.log('下单结果: ', res);
        const paymentData = res.result?.data;
        // 唤起微信支付组件，完成支付
        wx.requestPayment({
          timeStamp: paymentData?.timeStamp,
          nonceStr: paymentData?.nonceStr,
          package: paymentData?.packageVal,
          paySign: paymentData?.paySign,
          signType: 'RSA', // 该参数为固定值
          success(res) {
            // 支付成功回调，实现自定义的业务逻辑
            console.log('唤起支付组件成功：', res);
          },
          fail(err) {
            // 支付失败回调
            console.error('唤起支付组件失败：', err);
          },
        });
      },
    });
  },

  // 对收货人、订购人信息进行验证
  validatorPerson(params) {
    // 验证订购人，是否只包含大小写字母、数字和中文字符
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$'

    // 验证订购人手机号，是否符合中国大陆手机号码的格式
    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$'

    // 创建验证规则
    const rules = {
      userAddressId: {
        required: true,
        message: '请选择收货地址'
      },
      buyName: [
        {required: true, message: '请输入订购人姓名'},
        {pattern: nameRegExp, message: '订购人姓名不合法'}
      ],
      buyPhone: [
        {required: true, message: '请输入订购人手机号'},
        {pattern: phoneReg, message: '订购人手机号不合法'}
      ],
      deliveryDate: {required: true, message: '请选择送达日期'}
    }

    // 传入验证规则进行实例化
    const validator = new Schema(rules)

    // 调用实例方法对请求参数进行验证
    // 注意：我们希望将验证结果通过 Promise 的形式返回给函数的调用者
    return new Promise((resolve) => {
      validator.validate(params, (errors) => {
        if (errors) {
          // 如果验证失败，需要给用户进行提示
          wx.toast({title: errors[0].message})
          // 如果属性值是 false，说明验证失败
          resolve({valid: false})
        } else {
          // 如果属性值是 true，说明验证成功
          resolve({valid: true})
        }
      })
    })
  },

  // 选择期望送达日期
  onShowDateTimerPopUp() {
    this.setData({
      show: true
    })
  },

  // 期望送达日期确定按钮
  onConfirmTimerPicker(event) {
    // 使用 Vant 提供的时间选择组件，获取的时间是时间戳
    // 需要将时间戳转换成年月日在页面中进行展示才可以
    // 可以调用小程序给提供的日期格式化方法对时间进行转换
    // console.log(event.detail)

    // formatTime 方法接收 JS 的日期对象作为参数
    // 因此需要将时间戳转换成 JS 的日期对象
    const timeRes = formatTime(new Date(event.detail))

    this.setData({
      show: false,
      deliveryDate: timeRes
    })
  },

  // 期望送达日期取消按钮 以及 关闭弹框时触发
  onCancelTimePicker() {
    this.setData({
      show: false,
      minDate: new Date().getTime(),
      currentDate: new Date().getTime()
    })
  },

  // 跳转到收货地址
  toAddress() {
    wx.navigateTo({
      url: '/modules/settingModule/pages/address/list/index'
    })
  },

  // 获取订单页面的收货地址
  async getAddress() {
    // 判断全局共享的 address 中是否存在数据，
    // 如果存在数据，就需要从全局共享的 address 中取到数据进行赋值
    const addressId = app.globalData.address._id
    console.log(addressId)

    if (addressId) {
      this.setData({
        orderAddress: app.globalData.address
      })

      return
    }

    // 如果全局共享的 address 中没有数据，就需要调用接口获取收货地址数据进行渲染
    try {
      // 调用 getAddressDetail 云函数来获取订单地址
      const res = await wx.cloud.callFunction({
        name: 'getAddressDetail', // 替换为你的云函数名称
        data: {openId: userStore.openId}
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        const orderAddress = res.result.data;
        // 处理订单地址数据
        this.setData({
          orderAddress
        });
      } else {
        wx.showToast({
          title: '获取地址失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.showToast({
        title: '获取地址失败',
        icon: 'none'
      });
      console.error('Error calling getAddressDetail:', error);
    }
  },

  // 获取订单详情数据
  async getOrderInfo() {
    const {goodsId, blessing} = this.data

    try {
      // 调用 getOrderInfo 云函数
      const res = await wx.cloud.callFunction({
        name: 'getOrderInfo', // 替换为你的云函数名称
        data: {
          goodsId: goodsId, 
          openId: userStore.openId
        } 
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        const orderInfo = res.result.data;
        const orderGoods = orderInfo.cartVoList.find((item) => item.blessing !== '')

        this.setData({
          orderInfo,
          blessing: !orderGoods ? '' : orderGoods.blessing
        })
      } else {
        wx.showToast({
          title: '获取订单信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.showToast({
        title: '获取订单信息失败',
        icon: 'none'
      });
      console.error('Error calling getOrderInfo:', error);
    }
  },

  // 在页面加载的时候触发
  onLoad(options) {
    // 获取立即购买商品传递的参数
    // 然后把参数赋值给 data 中的状态
    this.setData({
      ...options
    })
  },

  // 在页面展示的时候进行触发
  onShow() {
    // 获取收货地址
    this.getAddress()

    // 获取需要下单商品的详细信息
    this.getOrderInfo()
  },

  onUnload() {
    // 在页面销毁以后，需要将全局共享的 address 也进行重置
    // 如果用户再次进入结算支付页面，需要从接口地址获取默认的收货地址进行渲染
    // 需要和产品多沟通
    app.globalData.address = {}
  }
})
