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
  const { openId, goodsId, isChecked } = event

  try {
    // 构建更新条件
    let updateCondition = { openId }

    // 如果传入了 goodsId，则只更新对应的商品
    if (goodsId) {
      updateCondition.goodsId = goodsId
    }

    // 更新 isChecked 字段
    const res = await cartCollection.where(updateCondition).update({
      data: {
        isChecked: isChecked
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