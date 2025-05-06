// observable 创建被监测的对象，对象中的属性会被转换为响应式数据
// action 函数用来显式的定义 action 方法
import { observable, action } from 'mobx-miniprogram'
import { getStorage } from '../utils/storage'

export const userStore = observable({
  // 定义响应式数据

  // openId 用户id
  openId: getStorage('openId') || '',

  // 用户信息
  userInfo: getStorage('userInfo') || {},

  // 定义 action
  setOpenId: action(function (openId) {
    this.openId = openId
  }),

  // 对用户信息进行赋值
  setUserInfo: action(function (userInfo) {
    this.userInfo = userInfo
  })
})
