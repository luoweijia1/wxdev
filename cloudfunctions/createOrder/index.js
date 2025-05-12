// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 初始化数据库
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { buyName, buyPhone, cartList, deliveryDate, totalAmout, userAddressId } = event

  try {
    // 1. 存储订单基本信息到 order 集合
    const orderResult = await db.collection('order').add({
      data: {
        openId: wxContext.OPENID,
        buyName: buyName,
        buyPhone: buyPhone,
        totalAmount: totalAmout,
        deliveryDate: deliveryDate,
        userAddressId: userAddressId,
        createTime: new Date(),
      }
    })

    const orderId = orderResult._id // 获取订单的主键 id

    // 2. 遍历 cartList，存储订单详情到 orderDetail 集合
    const orderDetailPromises = cartList.map(async (item) => {
      // 查找 cart 集合中是否存在对应的记录
      const cartRecord = await db.collection('cart').where({
        openId: wxContext.OPENID,
        goodsId: item.goodsId
      }).get()

      // 创建了订单，需要删除购物车记录
      if (cartRecord.data.length > 0) {
        const cartId = cartRecord.data[0]._id
        await db.collection('cart').doc(cartId).remove()
      }

      // 存储订单详情到 orderDetail 集合
      return db.collection('orderDetail').add({
        data: {
          orderId: orderId,
          goodsId: item.goodsId,
          goodCnt: item.count,
          goodPrice: item.price,
          goodName: item.name,
          blessing: item.blessing,
          imageUrl: item.imageUrl,
          createTime: item.createTime,
          lastUpdateTime: item.lastUpdateTime,
        }
      })
    })


    // 等待所有订单详情存储完成
    await Promise.all(orderDetailPromises)

    return {
      success: true,
      message: '订单及订单详情存储成功',
      orderId: orderId
    }
  } catch (error) {
    console.error('存储订单失败', error)
    return {
      success: false,
      message: '存储订单失败',
      error: error
    }
  }
}