const cloud = require('wx-server-sdk')
cloud.init()
// 获取数据库实例
const db = cloud.database()
// 获取 address 集合
const addressCollection = db.collection('address')

exports.main = async (event, context) => {
  // 从 event 中获取传入的地址信息
  const {
    openId,
    name,
    phone,
    provinceName,
    provinceCode,
    cityName,
    cityCode,
    districtName,
    districtCode,
    address,
    fullAddress,
    isDefault
  } = event

  try {
    // 将地址信息插入到 address 集合中
    await addressCollection.add({
      data: {
        openId,
        name,
        phone,
        provinceName,
        provinceCode,
        cityName,
        cityCode,
        districtName,
        districtCode,
        address,
        fullAddress,
        isDefault,
        lastLoginTime: new Date().toISOString()
      }
    })

    // 返回插入结果
    return {
      success: true
    }
  } catch (error) {
    // 返回错误信息
    return {
      success: false
    }
  }
}