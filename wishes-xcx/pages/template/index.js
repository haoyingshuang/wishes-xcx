// pages/zfcontent/index.js
var WxParse = require('../wxParse/wxParse.js');
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidePauseImg:true,
    hidePlayImg:false,
    animationData:{},

    id:null,
    title:"",
    topGif: "",
    bgGif:"",
    content: "",
    voice: "",
    shareTitle: "",
    sharePic: "",

    showModel:1,
    hideIndexBtn:true,
    hideShareBtn:false,

    nick: "我",
    headImg: "",
    
    fid:null,//来源用户id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.id);//模板id
    //console.log(options.fid);//谁分享的
    //给aid赋值
    var scene = decodeURIComponent(options.id);
    //console.log("aid："+scene);
    var aid = scene;
    //将aid 放入缓存中 意思是从扫码过来的
    wx.setStorageSync('aid', aid);
    //console.log(wx.getStorageSync('aid'));

    this.setData({ id: aid});
    if (options.fid != undefined){
      this.setData({ fid: options.fid });
    }
    var that = this;
    var stime = Date.parse(new Date());
    var times = setInterval(function () {
      var token = getApp().globalData.token;

      if (token) {
        clearTimeout(times);
        that.getInfo(aid, token);
        //console.log(token);
      } else {
        var etime = Date.parse(new Date());
        if ((etime - stime) > 30000) {
          clearTimeout(times);
        }
      }
    }, 100);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //innerAudioContext.play();
    this.toPlay();
    console.log(innerAudioContext)
    var token = wx.getStorageSync("token");
    var uid = wx.getStorageSync("uid");
    wx.getUserInfo({
      success: res => {
        if (!token) {
          //console.log(res.encryptedData)
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
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //innerAudioContext.pause();
    this.toPause();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    innerAudioContext.src = "";
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    //console.log(getApp().globalData.userInfo);
    var that = this;
    return {
      title: getApp().globalData.userInfo.nickName + that.data.shareTitle,
      path: '/pages/template/index?id=' + that.data.id + "&fid=" + wx.getStorageSync("uid"),
      imageUrl: that.data.sharePic,
      success: function (res) {
        wx.showToast({
          title: '转发成功',
        });
        //innerAudioContext.play();
        this.toPlay();
      },
      fail: function (res) {
        // 转发失败

      }
    }
  },
  getInfo:function(aid, token, that){
    wx.hideLoading();
    //加载详情
    wx.request({
      url: getApp().globalData.host + '/rest/api/temp/detail',
      data: { token:token, id:aid , fid: this.data.fid},
      success: res => {
        //console.log(res.data);
        if(res.data.code == 0){
          var data = res.data.data;
          var article = data.content;
          var that = this;
          WxParse.wxParse('article', 'html', article, that, 5);
         // console.log(data.bgGif);
          //赋值
          that.setData({
            title: data.title,
            topGif: data.topGif,
            bgGif: data.bgGif,
           
            voice: data.voice,
            shareTitle: data.shareTitle,
            sharePic: data.sharePic,

            showModel: data.showModel,

            nick: data.nick,
            headImg: data.headImg,
          })

          //按钮模式
          var sm = data.showModel;
          if(sm == 1){
            //自己看自己的
            that.setData({
              hideIndexBtn: true,
              hideShareBtn: false,
            });
          }else{
            //看别人的
            that.setData({
              hideIndexBtn: false,
              hideShareBtn: true,
            });
          }


          this.anima_head_img();

          innerAudioContext.autoplay = true
          innerAudioContext.src = data.voice;
          innerAudioContext.onPlay(() => {
            console.log('开始播放')
          })
          innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
          })

        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel:false,
          })
        }
        wx.hideLoading();
      },
      errpr: res=>{
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '网络繁忙，请稍后再试',
          showCancel: false,
        })
      }
    });

  },
  anima_head_img:function(){
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    this.setData({
      animationData: animation.export()
    })
    var n = 0;
    //连续动画需要添加定时器,所传参数每次+1就行
    var inter = setInterval(function () {
      n = n + 1;
      this.animation.rotate(1 * (n)).step()
      this.setData({
        animationData: this.animation.export()
      })
    }.bind(this), 100);
  },
  toPause: function () {
    innerAudioContext.pause();
    this.setData({
      hidePauseImg: false,
      hidePlayImg: true,
    })
  },
  toPlay: function () {
    innerAudioContext.play();
    this.setData({
      hidePauseImg: true,
      hidePlayImg: false,
    })
  },
  toIndex: function (event) {
    getApp().collectFormId(event);
    wx.redirectTo ({
      url:"/pages/index/index"
    })
  },
  jumpToApp: function () {
    wx.navigateToMiniProgram({
      appId: 'wx9b2d3fef89d07d30',
      path: 'pages/index/index?ald_media_id=100&ald_link_key=b1bb0d56cab48144&ald_position_id=0',
      extraData: {

      },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  }
})