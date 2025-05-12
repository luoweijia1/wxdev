// 云函数入口文件
const cloud = require('wx-server-sdk');
const tenpay = require('tenpay'); // 使用 tenpay 库来简化微信支付的调用

cloud.init();

const config = {
  appid: '你的小程序appid',
  mchid: '你的商户号',
  partnerKey: '你的商户密钥',
  notify_url: 'https://你的域名/notify', // 支付结果通知地址
  spbill_create_ip: '127.0.0.1' // 服务器 IP
};

const api = tenpay.init(config);

exports.main = async (event, context) => {
  const { description, totalFee } = event;

  try {
    const result = await api.getPayParams({
      out_trade_no: '订单号', // 生成唯一订单号
      body: description,
      total_fee: totalFee,
      openid: '用户的openid' // 从前端传递或从数据库获取
    });

    return {
      success: true,
      payment: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};