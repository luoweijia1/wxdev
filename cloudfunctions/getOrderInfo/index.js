// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init()

// 获取数据库实例
const db = cloud.database()
// 获取 goods 和 cart 集合
const goodsCollection = db.collection('goods')
const cartCollection = db.collection('cart')

// 云函数入口函数
exports.main = async (event, context) => {
  const { goodsId, openId } = event

  try {
    let cartVoList = []
    let totalAmount = 0
    let totalCount = 0

    if (goodsId) {
      // 如果传入了 goodsId，从 goods 表中获取商品信息
      const goodsRes = await goodsCollection.doc(goodsId).get()
      const goods = goodsRes.data

      cartVoList.push({
        goodsId: goods._id,
        lastUpdateTime: goods.lastUpdateTime,
        name: goods.name,
        imageUrl: goods.imageUrl,
        price: goods.price,
        count: 1,
        blessing: goods.blessing,
        isChecked: 1
      })

      totalAmount = goods.price
      totalCount = 1
    } else {
      // 如果没有传入 goodsId，通过 openId 从 cart 集合中获取商品信息
      const cartRes = await cartCollection.where({
        openId: openId,
        isChecked: 1
      }).get()

      cartVoList = cartRes.data.map(item => {
        totalAmount += item.price * item.count
        totalCount += item.count
        return {
          goodsId: item.goodsId,
          lastUpdateTime: item.lastUpdateTime,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          count: item.count,
          blessing: item.blessing,
          isChecked: item.isChecked
        }
      })
    }

    // 返回结果
    return {
      success: true,
      data: {
        totalAmount,
        cartVoList,
        totalCount
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