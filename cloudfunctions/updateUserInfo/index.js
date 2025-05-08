const cloud = require('wx-server-sdk')
cloud.init()
// 获取数据库实例
const db = cloud.database()
// 获取 users 集合
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  // 从 event 中获取需要更新的用户 ID 和新数据
  const { id, fileID, nickname } = event

  try {
    // 更新用户数据
    await usersCollection.doc(id).update({
      data: {
        fileID: fileID,
        nickname: nickname
      }
    })

    // 返回更新结果
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