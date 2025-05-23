// pages/info/info.js

import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { userStore } from '@/stores/userstore'

ComponentWithStore({
  // 页面的初始数据
  data: {
    // 初始化第二个面板数据
    initpanel: [
      {
        url: '/modules/orderPayModule/pages/order/list/list',
        title: '商品订单',
        iconfont: 'icon-dingdan'
      },
      {
        url: '/modules/orderPayModule/pages/order/list/list',
        title: '礼品卡订单',
        iconfont: 'icon-lipinka'
      },
      {
        url: '/modules/orderPayModule/pages/order/list/list',
        title: '退款/售后',
        iconfont: 'icon-tuikuan'
      }
    ]
  },

  storeBindings: {
    store: userStore,
    fields: ['openId', 'userInfo']
  },

  methods: {
    // 跳转到登录页面
    toLoginPage() {
      wx.navigateTo({
        url: '/pages/login/login'
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
    }

  }
})
