// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event.openid

  try {
    // 从云数据库中查询用户基本数据
    const res = await db.collection('users').where({
      openid: openid
    }).get()

    if (res.data.length > 0) {
      return {
        userInfo: res.data[0]
      }
    } else {
      return {
        errMsg: '未找到用户信息'
      }
    }
  } catch (error) {
    return {
      errMsg: '查询出错：' + error.message
    }
  }
}