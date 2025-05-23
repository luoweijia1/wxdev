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
    await wx.cloud.callFunction({
      name: 'updateUserInfo',
      data: {
        id : this.data.userInfo._id,
        nickname: this.data.userInfo.nickname,
        fileID: this.data.userInfo.fileID,
      }
    });
    
    // 用户信息更新成功以后，需要将最新的用户信息存储到本地
    setStorage('userInfo', this.data.userInfo)

    // 用户信息更新成功以后，同时同步到 Store
    this.setUserInfo(this.data.userInfo)

    // 给用户进行提示
    toast({title: '用户信息更新成功'})
  },

  // 更新用户头像
  async chooseAvatar(event) {
    console.log(event)

    // 获取头像的临时路径
    const {avatarUrl} = event.detail

    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })

    try {
      // 将 wx.cloud.uploadFile 封装为 Promise
      const uploadPromise = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'avatar/' + this.data.userInfo._openid + '.png',
          filePath: this.data.userInfo.avatarUrl,
          success: res => resolve(res),
          fail: err => reject(err)
        });
      });

      // 使用 await 等待上传完成
      const res = await uploadPromise;
      this.data.userInfo.fileID =  res.fileID;

    } catch (error) {
      console.error('文件上传出错', error)
    }
  },

  // 获取用户昵称
  getNickName(event) {
    // 解构最新的用户昵称
    const {nickname} = event.detail.value
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
  },

  // 处理图像加载失败的情况
  handleImageError: function (event) {
    const fileID = event.target.dataset.fileId; // 获取 fileID

    // 调用 getTmpUrl 方法获取新的 URL
    this.getTmpUrl(fileID, newUrl => {
      // 检查 newUrl 是否有效
      if (newUrl) {
        // 更新对应 item 的 imageUrl
        this.setData({
          'userInfo.avatarUrl': newUrl
        })
      } else {
        console.error('Failed to get new image URL');
      }
    });
  },

  // 获取临时文件 URL 的方法
  getTmpUrl: function (fileID, callback) {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        if (res.fileList && res.fileList.length > 0) {
          const tempFileURL = res.fileList[0].tempFileURL;
          callback(tempFileURL);
          console.log('New temp URL:', tempFileURL);
        } else {
          console.error('Failed to get temp URL');
        }
      },
      fail: error => {
        console.error('Error getting temp file URL:', error);
        // 可以在这里添加更多的错误处理逻辑，例如显示默认图片
      }
    });
  },
})
