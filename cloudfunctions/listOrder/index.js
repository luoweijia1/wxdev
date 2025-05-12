// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 初始化数据库
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { openId, page, limit } = event
  const start = (page - 1) * limit

  try {
    // 获取订单总条目数
    const countResult = await orderCollection.where({
      openId: openId
    }).count()
    const total = countResult.total

    // 分页获取当前用户的所有订单基本信息
    const orderResult = await db.collection('order').where({
      openId: openId
    }).orderBy('id', 'asc') // 按 id 升序排序
      .skip(start) // 跳过 start 条记录
      .limit(limit) // 获取 limit 条记录
      .get()

    const orders = orderResult.data

    // 2. 遍历订单，获取每个订单的详情信息
    const orderList = await Promise.all(orders.map(async (order) => {
      const orderDetailsResult = await db.collection('orderDetail').where({
        orderId: order._id
      }).get()

      const orderDetails = orderDetailsResult.data

      return {
        total: total,
        orderNo: order._id,
        buyPhone: order.buyPhone,
        orderDetailList: orderDetails.map(detail => ({
          goodsId: detail.goodsId,
          blessing: detail.blessing,
          count: detail.goodCnt,
          createTime: detail.createTime,
          imageUrl: detail.imageUrl,
          isChecked: detail.isChecked,
          name: detail.goodName,
          price: detail.goodPrice,
          lastUpdateTime: detail.lastUpdateTime
        })),
        orderStatus: order.orderStatus,
        userAddressId: order.userAddressId
      }
    }))

    return {
      success: true,
      data: orderList
    }
  } catch (error) {
    console.error('获取订单失败', error)
    return {
      success: false,
      message: '获取订单失败',
      error: error
    }
  }
}