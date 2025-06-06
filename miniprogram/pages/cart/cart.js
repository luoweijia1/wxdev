import {ComponentWithStore} from 'mobx-miniprogram-bindings'
import {userStore} from '@/stores/userstore'

// 导入 debounce 防抖方法
import {debounce} from 'miniprogram-licia'

// 导入让删除滑块自动弹回的 behavior
import {swipeCellBehavior} from '@/behaviors/swipeCell'

// 导入 miniprogram-computed 提供的 behavior
const computedBehavior = require('miniprogram-computed').behavior

ComponentWithStore({
  // 注册 behavior
  behaviors: [swipeCellBehavior, computedBehavior],

  // 让页面和 Store 对象建立关联
  storeBindings: {
    store: userStore,
    fields: ['openId']
  },

  // 定义计算属性
  computed: {
    // 判断是否是全选，控制全选按钮的选中效果
    // 计算属性会被挂载到 data 对象中
    selectAllStatus(data) {
      // computed 函数不能使用 this 来访问 data 中的数据
      // 如果想访问 data 中的数据，需要使用形参
      return (
        data.cartList.length !== 0 && data.cartList.every((item) => item.isChecked === 1)
      )
    },

    // 计算订单总金额
    totalPrice(data) {
      // 用来对订单总金额进行累加
      let totalPrice = 0

      data.cartList.forEach((item) => {
        // 需要判断商品是否是选中的状态，isChecked 是否等于 1
        if (item.isChecked === 1) {
          totalPrice += item.price * item.count
        }
      })

      return totalPrice
    }
  },

  // 组件的初始数据
  data: {
    cartList: [],
    emptyDes: '还没有添加商品，快去添加吧～'
  },

  // 组件的方法列表
  methods: {
    // 跳转到订单结算页面
    toOrder() {
      // 判断用户是否勾选了商品，如果没有勾选商品，不进行跳转
      if (this.data.totalPrice === 0) {
        wx.toast({
          title: '请选择需要购买的商品'
        })
        return
      }

      wx.navigateTo({
        url: '/modules/orderPayModule/pages/order/detail/detail'
      })
    },

    // 更新购买的数量
    changeBuyNum: debounce(async function (event) {
      // 获取最新的购买数量
      // 如果用户输入的购买数量大于 200，需要把购买数量设置为 200
      // 最大购买数量是 200，目前购买数量是 1，假设用户输入了 666，666 - 1 = 665，665 + 1 = 666
      // 最大购买数量是 200，如果用户输入的购买数量是 666，重置为 200， 200 - 1 = 199，199 + 1 = 200
      const newBuyNum = event.detail > 200 ? 200 : event.detail

      // 获取商品的 id、索引、之前的购买数量
      const {id, index, oldbuynum} = event.target.dataset

      // 使用正则验证用户输入的购买数量，是否是 1-200 之间的正整数
      const reg = /^([1-9]|[1-9]\d|1\d{2}|200)$/

      // 对用户输入的值进行验证，验证通过 true，验证失败 false
      const regRes = reg.test(newBuyNum)

      // 如果验证没有通过，说明用户输入的购买数量不合法或者小于 1，需要还原为之前的购买数量
      if (!regRes) {
        this.setData({
          [`cartList[${index}].count`]: oldbuynum
        })

        // 如果验证没有通过，需要阻止代码继续往下运行
        return
      }

      // 如果验证通过，就需要计算差值，然后把差值发送给公司的服务器，让服务器进行逻辑处理
      const disCount = newBuyNum - oldbuynum

      // 判断购买数量是否发生了改变，如果购买数量没有发生改变，不发送请求
      if (disCount === 0) return

      // 如果购买数量发生了改变，需要调用接口，传递差值
      const res = await wx.cloud.callFunction({
        name: 'addCart', // 替换为你的云函数名称
        data: {goodsId: id, count: disCount} // 传递商品的 id 和数量
      });

      // 如果服务器更新购买数量成功，需要更新本地的购买数量
      if (res.result && res.result.success) {
        this.setData({
          [`cartList[${index}].count`]: newBuyNum,
          // 如果购买数量发生了变化，需要让当前商品变成选中的状态
          [`cartList[${index}].isChecked`]: 1
        })
      }
    }, 500),

    // 实现全选和全不选效果
    async selectAllStatus(event) {
      // 获取全选按钮的选中状态
      const {detail} = event
      // 需要将选中的状态转换后接口需要使用的数据
      const isChecked = detail ? 1 : 0

      try {
        // 调用 updateCartCheck 云函数来更新购物车中所有商品的选中状态
        const res = await wx.cloud.callFunction({
          name: 'updateCartCheck', // 替换为你的云函数名称
          data: {"openId": userStore.openId, "isChecked": isChecked} // 传递全选或全不选的状态
        });

        // 检查云函数返回的结果
        if (res.result && res.result.success) {
          // 对购物车列表数据进行深拷贝
          const newCartList = JSON.parse(JSON.stringify(this.data.cartList));
          newCartList.forEach((item) => (item.isChecked = isChecked));

          // 对 cartList 进行赋值，驱动视图更新
          this.setData({
            cartList: newCartList
          });

          wx.showToast({
            title: isChecked ? '全选成功' : '取消全选成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '更新状态失败',
            icon: 'none'
          });
        }
      } catch (error) {
        // 捕获并处理调用云函数时的错误
        wx.showToast({
          title: '更新状态失败',
          icon: 'none'
        });
        console.error('Error calling updateCartCheck:', error);
      }
    },

    // 更新商品的购买状态
    async updateChecked(event) {
      // 获取最新的购买状态
      const {detail} = event
      // 获取传递的 商品 ID 以及 索引
      const {id, index} = event.target.dataset
      // 将最新的购买状态转换成后端接口需要使用的 0 和 1
      const isChecked = detail ? 1 : 0

      try {
        // 调用 updateCartCheck 云函数来更新购物车商品的选中状态
        const res = await wx.cloud.callFunction({
          name: 'updateCartCheck', // 替换为你的云函数名称
          data: {"goodsId": id, "openId": userStore.openId, "isChecked": isChecked} // 传递商品的 id 和选中状态
        });

        // 检查云函数返回的结果
        if (res.result && res.result.success) {
          // 通过更新本地的数据来更新页面的购买状态
          this.setData({
            [`cartList[${index}].isChecked`]: isChecked
          });
          wx.showToast({
            title: '状态更新成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '更新状态失败',
            icon: 'none'
          });
        }
      } catch (error) {
        // 捕获并处理调用云函数时的错误
        wx.showToast({
          title: '更新状态失败',
          icon: 'none'
        });
        console.error('Error calling updateCartCheck:', error);
      }
    },

    // 展示文案同时获取购物车列表数据
    async showTipGetList() {
      // 解构数据
      const {openId} = this.data

      // 判断用户是否进行了登录
      if (!openId) {
        this.setData({
          emptyDes: '您尚未登录，点击登录获取更多权益',
          cartList: []
        })

        return
      }

      try {
        // 调用 listCarts 云函数来获取购物车列表
        const res = await wx.cloud.callFunction({
          name: 'listCarts', // 替换为你的云函数名称
          data: {"openId": openId} // 如果云函数需要参数，可以在这里传递
        });

        // 检查云函数返回的结果
        if (res.result && res.result.success) {
          const cartList = res.result.data;
          // 处理购物车列表数据
          this.setData({
            cartList,
            emptyDes: cartList.length === 0 && '还没有添加商品，快去添加吧～'
          });
        } else {
          // 处理错误情况，例如显示错误提示
          wx.showToast({
            title: '获取购物车列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        // 捕获并处理调用云函数时的错误
        wx.showToast({
          title: '获取购物车列表失败',
          icon: 'none'
        });
      }
    },

    // 删除购物车中的商品
    async delCartGoods(event) {
      // 获取需要删除商品的 id
      const {id} = event.currentTarget.dataset

      // 询问用户是否删除该商品
      const modalRes = await wx.modal({
        content: '您确认删除该商品吗 ?'
      })

      if (modalRes) {
        try {
          // 调用 deleteCart 云函数来删除商品
          const res = await wx.cloud.callFunction({
            name: 'deleteCart', // 替换为你的云函数名称
            data: {id} // 传递商品的 id
          });

          // 检查云函数返回的结果
          if (res.result && res.result.success) {
            wx.showToast({
              title: '商品删除成功',
              icon: 'success'
            });
            this.showTipGetList(); // 更新购物车列表
          } else {
            wx.showToast({
              title: '删除商品失败',
              icon: 'none'
            });
          }
        } catch (error) {
          // 捕获并处理调用云函数时的错误
          wx.showToast({
            title: '删除商品失败',
            icon: 'none'
          });
          console.error('Error calling deleteCart:', error);
        }
      }
    },

    // 处理图像加载失败的情况
    handleImageError: function (event) {
      const index = event.target.dataset.index; // 获取出错图片的索引
      const fileID = event.target.dataset.fileId; // 获取 fileID
  
      // 调用 getTmpUrl 方法获取新的 URL
      this.getTmpUrl(fileID, newUrl => {
        // 检查 newUrl 是否有效
        if (newUrl) {
          // 更新对应 item 的 imageUrl
          const cartList = this.data.cartList;
          cartList[index].imageUrl = newUrl;
          this.setData({
            cartList: cartList
          });
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

    // 如果使用 Component 方法来构建页面
    // 生命周期钩子函数需要写到 methods 中才可以
    onShow() {
      this.showTipGetList()
    },

    onHide() {
      // 在页面隐藏的时候，需要让删除滑块自动弹回
      this.onSwipeCellCommonClick()
    }
  }
})
