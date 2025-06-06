import {swipeCellBehavior} from '@/behaviors/swipeCell'
import { userStore } from '@/stores/userstore'

// 获取应用实例
const app = getApp()

Page({
  behaviors: [swipeCellBehavior],

  // 页面的初始数据
  data: {
    addressList: []
  },

  // 删除收货地址
  async delAddress(event) {
    // 解构传递的 id
    const {id} = event.currentTarget.dataset

    // 询问用户是否确认删除
    const modalRes = await wx.modal({
      content: '您确认删除该收货地址吗 ?'
    })

    // 同时需要给用户提示，并且要重新获取收货地址列表
    if (modalRes) {
      wx.cloud.callFunction({
        name: 'deleteAddress',
        data: {
          id: id
        }
      })
      .then(res => {
        if (res.result.success) {
          wx.toast({
            title: "地址删除成功"
          })
          this.getAddressList()
        } else {
          wx.showToast({
            title: res.result.error
          })
        }
      })
      .catch(err => {
        console.error('调用云函数出错:', err)
        wx.showToast({
          title: '调用云函数出错'
        })
      })
    }
  },

  // 去编辑页面
  toEdit(event) {
    // 获取要更新的收货地址 id
    const {id} = event.currentTarget.dataset

    wx.navigateTo({
      url: `/modules/settingModule/pages/address/add/index?id=${id}`
    })
  },

  // 获取收货地址列表数据
  async getAddressList() {
    try {
      // 调用 listAddress 云函数来获取地址列表
      const res = await wx.cloud.callFunction({
        name: 'listAddress',
        data: {
          openId: userStore.openId
        } // 如果需要传递参数，可以在这里添加
      });

      // 检查云函数返回的结果
      if (res.result.success) {
        // 将地址列表数据进行赋值
        this.setData({
          addressList: res.result.data
        });
      } else {
        // 处理错误情况，例如显示错误提示
        wx.toast({title: '获取地址列表失败'})
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.toast({title: '获取地址列表失败'})
      console.error('Error calling listAddress:', error);
    }
  },

  // 更新收货地址
  changeAddress(event) {
    // 需要判断是否是从结算支付页面进入的收货地址列表页面
    // 如果是，才能够获取点击的收货地址，否则，不执行后续的逻辑，不执行切换收货地址的逻辑
    if (this.flag !== '1') return

    // 如果是从结算支付页面进入的收货地址列表页面，需要获取点击的收货地址详细信息
    const addressId = event.currentTarget.dataset.id

    // 需要从收货地址列表中根据 收货地址 ID 查找到点击的收货地址详情、详细信息
    const selectAddress = this.data.addressList.find((item) => item._id === addressId)

    if (selectAddress) {
      // 如果获取收货地址成功以后，需要赋值给全局共享的数据
      app.globalData.address = selectAddress

      wx.navigateBack()
    }
  },

  onShow() {
    this.getAddressList()
  },

  // onLoad 是在页面加载时触发
  // 如果当前页面没有销毁，onLoad 钩子函数只会执行一次
  // 如果点击了新增、编辑，不会销毁当前页面然后进行新增、编辑页面
  // 在新增、编辑以后，返回到列表页面，这时候 onLoad 不会触发执行
  // 就不会获取最新的数据
  onLoad(options) {
    // 接收传递的参数，挂载到页面的实例上，方便在其他方法中使用
    this.flag = options.flag
  }
})
