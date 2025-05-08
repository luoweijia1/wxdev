const cloud = require('wx-server-sdk')
cloud.init()
// 获取数据库实例
const db = cloud.database()
// 获取 address 集合
const addressCollection = db.collection('address')

exports.main = async (event, context) => {
  // 从 event 中获取传入的 openId
  const { openId } = event

  try {
    // 查询 address 集合中 openId 相等的记录
    const result = await addressCollection.where({
      openId: openId
    }).get()

    // 返回查询结果
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error
    }
  }
}