const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 address 集合
const cartCollection = db.collection('cart')

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event

  try {
    // 删除指定 id 的地址记录
    const res = await cartCollection.doc(id).remove()

    // 返回删除结果
    return {
      success: true,
      data: res
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}