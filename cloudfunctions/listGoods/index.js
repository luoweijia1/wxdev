// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
const commodityCollection = db.collection('goods')

// 云函数入口函数
exports.main = async (event, context) => {
  const { categoryId } = event

  try {
    // 查询商品集合，匹配 category1Id 或 category2Id
    const res = await commodityCollection.where({
      categoryId: categoryId
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