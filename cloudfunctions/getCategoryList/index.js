const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
const categoryCollection = db.collection('category')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 查询轮播数据集合
    const res = await categoryCollection.get()

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