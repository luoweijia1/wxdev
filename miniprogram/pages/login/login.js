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
      setStorage('openId', data._openid);
      this.setOpenId(data._openid);
      setStorage('userInfo', data);
      this.setUserInfo(data);
    }
  }
});