// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 category 和 goods 集合
const categoryCollection = db.collection('category')
const goodsCollection = db.collection('goods')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取所有分类列表
    const categoryRes = await categoryCollection.get()
    const categories = categoryRes.data

    // 初始化返回数据结构
    const result = []

    // 遍历分类列表
    for (const category of categories) {
      // 根据 categoryId 获取对应的商品列表
      const goodsRes = await goodsCollection.where({
        categoryId: category.categoryId
      }).get()

      // 构建分类及其商品列表的结构
      result.push({
        goods: goodsRes.data,
        imageUrl: category.imageUrl,
        name: category.name,
        categoryId: category.categoryId
      })
    }

    // 返回结果
    return {
      success: true,
      data: result
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}