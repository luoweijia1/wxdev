// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 banner、category 和 advertise 集合
const bannerCollection = db.collection('banner')
const categoryCollection = db.collection('category')
const advertiseCollection = db.collection('advertise')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取 banner 集合中的所有数据
    const bannerRes = await bannerCollection.get()
    const bannerList = bannerRes.data

    // 获取 category 集合中的所有数据
    const categoryRes = await categoryCollection.get()
    const categoryList = categoryRes.data

    // 获取 advertise 集合中的所有数据
    const advertiseRes = await advertiseCollection.get()
    const advertiseList = advertiseRes.data

    // 返回结果
    return {
      success: true,
      data: {
        bannerList,
        categoryList,
        advertiseList
      }
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false,
      error: error.message
    }
  }
}