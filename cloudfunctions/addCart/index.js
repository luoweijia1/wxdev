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

    // 查询是否已存在相同 openId 和 goodsId 的记录
    const queryResult = await cartCollection.where({
      openId: openId,
      goodsId: goodsId
    }).get()

    if (queryResult.data.length > 0) {
      // 如果存在，更新 count 字段
      const existingData = queryResult.data[0]
      const newCount = existingData.count + count

      // 更新记录
      await cartCollection.doc(existingData._id).update({
        data: {
          count: newCount,
          lastUpdateTime: lastUpdateTime
        }
      })

      // 返回更新结果
      return {
        success: true,
        message: '更新成功',
        data: existingData._id
      }
    } else {
      // 如果不存在，新增一条记录
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

      const res = await cartCollection.add({
        data: cartData
      })

      // 返回添加结果
      return {
        success: true,
        message: '添加成功',
        data: res._id
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