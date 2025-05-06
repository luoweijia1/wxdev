// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 获取数据库实例
const db = cloud.database()
// 获取 users 集合
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  const { avatarUrl } = event;
  const filePath = path.resolve(avatarUrl);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      message: '文件不存在',
      error: '文件路径无效'
    };
  }

  // 创建可读流
  const fileStream = fs.createReadStream(filePath);

  if (!fileStream) {
    return {
      success: false,
      message: '无法创建文件流',
      error: '文件读取失败'
    };
  }

  try {
    const res = await cloud.uploadFile({
      cloudPath: 'example.png',
      fileContent: fileStream
    });
    return {
      success: true,
      fileID: res.fileID
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};