// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 cart 集合
const cartCollection = db.collection('cart')

// 云函数入口函数
exports.main = async (event, context) => {
  const { openId, goodsId, count, blessing, isChecked, name, price, imageUrl } = event

  try {
    // 获取当前时间
    const lastUpdateTime = new Date().toISOString()

    // 构建购物车数据
    const cartData = {
      openId,
      goodsId,
      count,
      lastUpdateTime,
      blessing,
      isChecked,
      name,
      price,
      imageUrl
    }

    // 将购物车数据存入 cart 集合
    const res = await cartCollection.add({
      data: cartData
    })

    // 返回添加结果
    return {
      success: true,
      data: res._id // 返回新添加记录的 ID
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}