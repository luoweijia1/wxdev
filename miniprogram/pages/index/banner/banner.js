// pages/index/banner/banner.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 轮播图数据
    bannerList: {
      type: Array,
      value: [
        '../../../assets/images/banner.jpg',
        '../../../assets/images/banner.jpg',
        '../../../assets/images/banner.jpg'
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeIndex: 0 // 被激活的轮播图索引，默认是 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取被激活的轮播图索引
    getSwiperIndex(event) {
      // console.log(event)
      const { current } = event.detail

      this.setData({
        activeIndex: current
      })
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
          const bannerList = this.data.bannerList;
          bannerList[index].imageUrl = newUrl;
          this.setData({
            bannerList: bannerList
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
  }
})
