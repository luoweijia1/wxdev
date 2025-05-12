// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 order 集合
const orderCollection = db.collection('order')

// 云函数入口函数
exports.main = async (event, context) => {
  const { orderId } = event

  try {
    // 更新 orderStatus 字段为 1
    const res = await orderCollection.doc(orderId).update({
      data: {
        orderStatus: 1
      }
    })

    // 返回更新结果
    return {
      success: true,
      updated: res.stats.updated // 返回更新的记录数
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}