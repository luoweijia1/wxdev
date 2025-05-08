// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
// 获取 users 集合
const db = cloud.database();
const usersCollection = db.collection('users');

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  // 检查 wxContext 是否存在
  if (!wxContext) {
    return {
      errMsg: '无法获取wxContext'
    };
  }
  const OPENID = wxContext.OPENID;

  try {
    // 使用 OPENID 字段在 users 集合中进行 where get 操作
    const res = await usersCollection.where({
      _openid: OPENID
    }).get();

    if (res.data.length > 0) {
      // 如果能够获取到内容，根据 _id 字段更新 lastLoginTime 字段
      const userId = res.data[0]._id;
      await usersCollection.doc(userId).update({
        data: {
          lastLoginTime: new Date().toISOString()
        }
      });
      return {
        success: true,
        message: '用户信息更新成功',
        data: res.data[0]
      };
    } else {
      // 否则往 users 表中加入一条数据
      const newUser = {
        _openid: OPENID,
        nickname: "",
        fileID: "",
        lastLoginTime: new Date().toISOString()
      };
      await usersCollection.add({
        data: newUser
      });
      return {
        success: true,
        message: '用户信息添加成功',
        data: newUser
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '操作失败',
      error: error.message
    };
  }
};