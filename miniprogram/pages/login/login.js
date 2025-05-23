// pages/login/login.js

// 导入本地存储 api
import { setStorage } from '@/utils/storage';

// 导入 ComponentWithStore 方法
import { ComponentWithStore } from 'mobx-miniprogram-bindings';
// 导入 store 对象
import { userStore } from '@/stores/userstore';

// 导入防抖函数
import { debounce } from 'miniprogram-licia';

// 使用 ComponentWithStore 方法替换 Component 方法构造页面
ComponentWithStore({
  // 让页面和 Store 对象建立关联
  storeBindings: {
    store: userStore,
    fields: ['openId', 'userInfo'],
    actions: ['setOpenId', 'setUserInfo']
  },

  methods: {
    // 授权登录
    login: debounce(async function () {
      try {
        // 调用云函数
        const cloudFunctionRes = await wx.cloud.callFunction({
          name: "login"
        });

        // 判断云函数调用结果
        const { data } = cloudFunctionRes.result;
        if (data && data._openid) {
          console.log('登录成功', cloudFunctionRes.result);
          this.handleLoginSuccess(data);
          wx.navigateBack();
        } else {
          console.log('登录失败', cloudFunctionRes);
        }

      } catch (error) {
        console.error('登录过程中出现错误', error);
      }
    }, 500),

    // 处理登录成功
    handleLoginSuccess(data) {
      if (data.fileID) {
        wx.cloud.getTempFileURL({
          fileList: [data.fileID], // 替换为实际的文件 ID 数组
          success: res => {
            // 检查 res.fileList 是否存在且不为空
            if (res.fileList && res.fileList.length > 0) {
              data.avatarUrl = res.fileList[0].tempFileURL
              setStorage('userInfo', data);
              this.setUserInfo(data);
            } else {
              setStorage('userInfo', data);
              this.setUserInfo(data);
            }
          },
          fail: err => {
            console.error('获取临时文件 URL 失败:', err);
          }
        });
      } else {
        setStorage('userInfo', data);
        this.setUserInfo(data);
      } 
      
      setStorage('openId', data._openid);
      this.setOpenId(data._openid);
    }
  }
});