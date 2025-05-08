// pages/profile/profile.js
import {userBehavior} from './behavior'
import {setStorage} from '@/utils/storage'
import {toast} from '@/utils/extendApi'

Page({
  // 注册 behavior
  behaviors: [userBehavior],

  // 页面的初始数据
  data: {
    isShowPopup: false // 控制更新用户昵称的弹框显示与否
  },

  // 更新用户信息
  async updateUserInfo() {
    // 调用云函数 更新fileID
    // const res = await reqUpdateUserInfo(this.data.userInfo)

    if (res.code === 200) {
      // 用户信息更新成功以后，需要将最新的用户信息存储到本地
      setStorage('userInfo', this.data.userInfo)

      // 用户信息更新成功以后，同时同步到 Store
      this.setUserInfo(this.data.userInfo)

      // 给用户进行提示
      toast({title: '用户信息更新成功'})
    }
  },

  // 更新用户头像
  async chooseAvatar(event) {
    console.log(event)

    // 获取头像的临时路径
    const {avatarUrl} = event.detail

    try {
      console.log(this.data.userInfo);

      // 将 wx.cloud.uploadFile 封装为 Promise
      const uploadPromise = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'avatar/' + this.data.userInfo._openid + '.png',
          filePath: avatarUrl,
          success: res => resolve(res),
          fail: err => reject(err)
        });
      });

      // 使用 await 等待上传完成
      const res = await uploadPromise;
      console.log('文件上传成功，fileID:', res.fileID);

    } catch (error) {
      console.error('调用云函数出错：', error)
    }
  },

  // 获取用户昵称
  getNickName(event) {
    // console.log(event.detail.value)
    // 解构最新的用户昵称
    const {nickname} = event.detail.value
    // console.log(nickname)
    this.setData({
      'userInfo.nickname': nickname,
      isShowPopup: false
    })
  },

  // 显示修改昵称弹框
  onUpdateNickName() {
    this.setData({
      isShowPopup: true,
      'userInfo.nickname': this.data.userInfo.nickname
    })
  },

  // 弹框取消按钮
  cancelForm() {
    this.setData({
      isShowPopup: false
    })
  }
})
