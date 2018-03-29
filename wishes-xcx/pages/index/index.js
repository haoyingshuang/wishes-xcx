// uploadimg/uploadimg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    data: [],
    loading: false,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      page: 1,
      data: [],
      loading: false,
    });

    this.getList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    getApp().showLoading("");
    var that = this;

    wx.request({
      url: getApp().globalData.host + '/rest/api/req',
      data: { v: getApp().globalData.v },
      success: res => {
        //console.log(res.data.code);
        var code = res.data.code;
        getApp().globalData.code = code;
        //动态显示主图 和按钮
        var token = wx.getStorageSync("token");
        wx.getUserInfo({
          success: res => {
            if (!token) {
              //首次授权 获取 openid使用
              getApp().globalData.encryptedData = res.encryptedData;
              getApp().globalData.iv = res.iv;
              getApp().globalData.signature = res.signature;
              getApp().globalData.rawData = res.rawData;
              // 可以将 res 发送给后台解码出 unionId
              getApp().globalData.userInfo = res.userInfo
              //登录
              getApp().tologin();
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
            getApp().hideLoading();
          }, fail: res => {
            getApp().hideLoading();
            wx.showModal({
              title: '警告',
              content: '您点击了拒绝授权，将无法正常使用。请再次点击授权，或者删除小程序重新进入。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: (res) => {
                      res.authSetting = {
                        "scope.userInfo": true
                      }
                    }
                  })
                }
              }
            });
          }
        });

        if (!token) {
          getApp().showLoading("");
          var stime = Date.parse(new Date());
          var timmer = setInterval(function () {
            token = wx.getStorageSync("token");
            if (token) {
              getApp().hideLoading();
              clearInterval(timmer);
              that.setData({ hideAll: false })
            }
            var etime = Date.parse(new Date());
            if ((etime - stime) > 10000) {
              getApp().hideLoading();
              clearInterval(timmer);
            }
          }, 100);
        } else {
          clearInterval(timmer);
          that.setData({ hideAll: false })
        }
      }, fail() {
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();  
    this.setData({
      page: 1,
      data: [],
      loading: false,
    });

    this.getList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  },
  toastHide: function (event) {
    //console.log("触发bindchange，隐藏toast")
    status = true
    this.setData({ status: status })
  },
  getList: function () {
    var loading = this.data.loading;
    if (loading) {
      return;
    }
    //console.log("分页请求数据");
    var page = this.data.page;
    this.setData({
      loading: true,
    })
   /* wx.showLoading({
      title: '加载中...',
    })*/
    var that = this;
    wx.request({
      url: getApp().globalData.host + '/rest/api/hp/list',
      data: {
        page: page,
        token: wx.getStorageSync("token"),
      },
      success: res => {
        wx.hideLoading();
        //追加数据
        var relist = res.data.data;
        //console.log(relist)
        if (relist != null && relist.length > 0){
          //拼接list
          this.setData({
            data: that.data.data.concat(relist)
          });
          this.setData({
            loading: false,
          });
          page = page + 1;
          this.setData({ page: page });
        }
        wx.hideNavigationBarLoading();

          wx.stopPullDownRefresh();  

        
      },
      error: res => {
        wx.hideLoading();
        this.setData({
          loading: false,
        })
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();  
      }
    });
  },
  showDetail:function(e){
    var aid = e.currentTarget.id;
    wx.navigateTo({
      url: '../template/index?id=' + aid,
    })
  }
})