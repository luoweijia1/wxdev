Page({
  // 初始化数据
  data: {
    bannerList: [], // 轮播图数据
    categoryList: [], // 商品导航数据
    advertiseList: [], // 广告渲染区域
    loading: false // 是否显示骨架屏，后面看看怎么处理，不会的话体验差点也没办法
  },

  // 获取首页数据
  async getIndexData() {
    try {
      // 调用 listHomePage 云函数来获取所有数据
      const res = await wx.cloud.callFunction({
        name: 'listHomePage'
      });

      // 检查云函数返回的结果
      if (res.result && res.result.success) {
        const { bannerList, categoryList, advertiseList } = res.result.data;
        // 需要对数据进行赋值
        this.setData({
          bannerList,
          categoryList,
          advertiseList,
          loading: false
        });
      } else {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 捕获并处理调用云函数时的错误
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
      console.error('Error calling listHomePage:', error);
    }
  },
    // 处理图像加载失败的情况
    handleImageError: function (event) {
      const index = event.target.dataset.index; // 获取出错图片的索引
      const fileID = event.target.dataset.fileId; // 获取 fileID
  
      // 调用 getTmpUrl 方法获取新的 URL
      this.getTmpUrl(fileID, newUrl => {
        // 检查 newUrl 是否有效
        if (newUrl) {
          // 更新对应 item 的 imageUrl
          const advertiseList = this.data.advertiseList;
          advertiseList[index].imageUrl = newUrl;
          this.setData({
            advertiseList: advertiseList
          });
        } else {
          console.error('Failed to get new image URL');
        }
      });
    },
  
    // 获取临时文件 URL 的方法
    getTmpUrl: function (fileID, callback) {
      wx.cloud.getTempFileURL({
        fileList: [fileID],
        success: res => {
          if (res.fileList && res.fileList.length > 0) {
            const tempFileURL = res.fileList[0].tempFileURL;
            callback(tempFileURL);
          } else {
            console.error('Failed to get temp URL');
          }
        },
        fail: error => {
          console.error('Error getting temp file URL:', error);
          // 可以在这里添加更多的错误处理逻辑，例如显示默认图片
        }
      });
    },

  // 监听页面的加载
  onLoad() {
    // 在页面加载以后，调用获取首页数据的方法
    this.getIndexData()
  },

  // 转发功能，转发给好友、群聊
  onShareAppMessage() {
  },

  // 能够把小程序分享到朋友圈
  onShareTimeline() {
  }
})
