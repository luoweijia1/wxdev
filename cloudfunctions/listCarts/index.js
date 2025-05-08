// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
const cartsCollection = db.collection('carts')

// 云函数入口函数
exports.main = async (event, context) => {
  const { openId } = event

  try {
    // 查询购物车集合，匹配 openId
    const res = await cartsCollection.where({
      openId: openId
    }).get()

    // 返回查询结果
    return {
      success: true,
      data: res.data
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}