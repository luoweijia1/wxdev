// 导入 async-validator 对参数进行验证
import Schema from 'async-validator'
import { userStore } from '@/stores/userstore'

// 建表字段如下，还有一个id
Page({
  // 页面的初始数据
  data: {
    // 需要将请求参数放到 data 对象下，方便在模板中绑定数据
    name: '', // 收货人
    phone: '', // 手机号码
    provinceName: '', // 省
    provinceCode: '', // 省编码
    cityName: '', // 市
    cityCode: '', // 市编码
    districtName: '', // 区
    districtCode: '', // 市编码
    address: '', // 详细地址
    fullAddress: '', // 完整地址
    isDefault: false // 是否设置为默认地址，0 不设置为默认地址，1 设置为默认地址
  },

  // 保存收货地址
  async saveAddrssForm() {
    // 组织参数 (完整地址、是否设置为默认地址)
    const {provinceName, cityName, districtName, address, isDefault} = this.data

    // 最终需要发送的请求参数
    const params = {
      ...this.data,
      openId: userStore.openId,
      fullAddress: provinceName + cityName + districtName + address,
      isDefault: isDefault ? 1 : 0
    }

    // 对组织以后的参数进行验证，验证通过以后，需要调用新增的接口实现新增收货地址功能
    const {valid} = await this.validatorAddress(params)

    // 如果 valid 等于 false，说明验证失败，就不执行后续的逻辑
    if (!valid) return
    // 如果 valid 等于 true，说明验证成功调用新增的接口实现新增收货地址功能
    let res;
    if (this.addressId) {
      // 调用 updateAddress 云函数
      params.addressId = this.addressId
      res = await wx.cloud.callFunction({
        name: 'updateAddress',
        data: params
      });
    } else {
      // 调用 addAddress 云函数
      res = await wx.cloud.callFunction({
        name: 'addAddress',
        data: params
      });
    }
    console.log(res)

    if (res.result.success) {
      // 返回到收货地址列表页面
      wx.navigateBack({
        success: () => {
          // 需要给用户进行提示
          wx.toast({
            title: this.addressId ? '更新收货地址成功！' : '新增收货地址成功！'
          })
        }
      })
    }
  },

  // 对新增收货地址请求参数进行验证
  validatorAddress(params) {
    // 验证收货人，是否只包含大小写字母、数字和中文字符
    const nameRegExp = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$'

    // 验证手机号，是否符合中国大陆手机号码的格式
    const phoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$'

    // 创建验证规则
    const rules = {
      name: [
        {required: true, message: '请输入收货人姓名'},
        {pattern: nameRegExp, message: '收货人姓名不合法'}
      ],
      phone: [
        {required: true, message: '请输入收货人手机号'},
        {pattern: phoneReg, message: '收货人手机号不合法'}
      ],
      provinceName: {required: true, message: '请选择收货人所在地区'},
      address: {required: true, message: '请输入详细地址'}
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

  // 省市区选择
  onAddressChange(event) {
    console.log(event)

    // 解构省市区以及编码
    const [provinceName, cityName, districtName] = event.detail.value
    const [provinceCode, cityCode, districtCode] = event.detail.code

    this.setData({
      provinceName,
      cityName,
      districtName,
      provinceCode,
      cityCode,
      districtCode
    })
  },

  // 用来处理更新相关的逻辑
  async showAddressInfo(id) {
    // 判断是否存在 id，如果不存在 id，就不执行后续的逻辑
    if (!id) return

    // 将 id 挂载到当前页面的实例(this)上，方便在多个方法中使用 id
    this.addressId = id

    // 动态设置当前页面的标题
    wx.setNavigationBarTitle({
      title: '更新收货地址'
    })

    try {
      // 调用 getAddressDetail 云函数，传递 id 以获取地址详情
      const res = await wx.cloud.callFunction({
        name: 'getAddressDetail',
        data: {id}
      });

      // 检查云函数返回的结果
      if (res.result.success) {
        // 将详情数据进行赋值，赋值以后，页面上就会回显要更新的地址信息
        this.setData(res.result.data);
      } else {
        // 处理错误情况，例如显示错误提示
        wx.toast({title: '获取地址信息失败'})
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.toast({title: '获取地址信息失败'})
      console.error('Error calling getAddressDetail:', error);
    }
  },

  onLoad(options) {
    // 调用方法，实现更新的业务逻辑
    this.showAddressInfo(options.id)
  }
})
