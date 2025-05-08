const cloud = require('wx-server-sdk')
cloud.init()
// 获取数据库实例
const db = cloud.database()
// 获取 address 集合
const addressCollection = db.collection('address')

exports.main = async (event, context) => {
  const { id, openId } = event

  try {
    if (id) {
      // 如果传入了 id，直接根据 id 查询
      const result = await addressCollection.doc(id).get()
      return {
        success: true,
        data: result.data
      }
    } else if (openId) {
      // 如果传入了 openId，根据 openId 查询所有地址
      const result = await addressCollection.where({
        openId: openId
      }).get()

      const addresses = result.data

      if (addresses.length === 0) {
        return {
          success: false,
          message: 'No addresses found for this openId'
        }
      }

      // 查找第一个 isDefault 为 1 的地址
      const defaultAddress = addresses.find(address => address.isDefault === 1)

      // 如果没有 isDefault 为 1 的地址，返回第一条地址
      return {
        success: true,
        data: defaultAddress || addresses[0]
      }
    } else {
      return {
        success: false,
        message: 'Please provide either an id or an openId'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error
    }
  }
}