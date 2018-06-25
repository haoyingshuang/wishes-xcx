
/** 阿拉丁 统计 */
var aldstat = require("./utils/ald-stat.js");

//app.js
const app = getApp();
App({
  onShow: function () {

  },
  wxUserInfoAuth: function (obj) {
    //console.log(obj);
  },
  onLaunch: function (options) {
    var that = this;
    wx.getSetting({
      success: res => {
        var ui = res.authSetting['scope.userInfo'];
        if (ui) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.globalData.userInfo = res.userInfo
              that.globalData.signature = res.signature;
              that.globalData.rawData = res.rawData;
              //登录
              getApp().tologin();
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          });
        } else {
          /*wx.showLoading({
            title: '', mask: true
          })*/
        }
      }
    });

    // 设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.screenWidth = res.windowWidth;
        that.screenHeight = res.windowHeight;
        that.pixelRatio = res.pixelRatio;
      }
    });
  },
  tologin: function () {
    // 登录 获取token
    //console.log(1);
    //console.log(getApp().globalData.encryptedData);
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code;
        if (code) {
          //console.log('获取用户登录凭证：' + code);
          // console.log('globalData:' + getApp().globalData.encryptedData);
          //console.log('iv：' + getApp().globalData.iv);
          // --------- 发送凭证 ------------------
          wx.request({
            url: getApp().globalData.host + '/rest/api/login',
            data: {
              code: code,
              signature: getApp().globalData.signature,
              rawData: getApp().globalData.rawData,
              encryptedData: getApp().globalData.encryptedData,
              iv: getApp().globalData.iv
            },
            success: res2 => {
              var token = res2.data.data.token;
              var uid = res2.data.data.id;
              if (token == null || token == "") {
                wx.showModal({
                  title: '提示',
                  content: '获取用户信息失败，请通过小程序列表删除图个赞小程序，再重新进入试试',
                  showCancel: false,
                })
              }
              //console.log("服务器分发的通讯token：" + token);
              getApp().globalData.token = token;
              wx.setStorageSync("token", token);
              wx.setStorageSync("uid", uid);
            }, fail: function (res) {
              //console.log("error");
              wx.showModal({
                title: '提示',
                content: '参数错误，删除小程序重新进入试试',
                showCancel: false,
              })
            }
          })
          // ------------------------------------

        } else {
          //console.log('获取用户登录态失败：' + res.errMsg);
          wx.showModal({
            title: '提示',
            content: '获取用户登录态失败：' + res.errMsg,
            showCancel: false,
          })
        }
      }
    })
  },
  globalData: {
    host: "https://wishes.hisean.cn/",
    userInfo: null,
    signature: "",
    rawData: "",
    token: "",
    encryptedData: "",
    iv: "",
    code: 1,
    v: 113,
  },
  refreshToken: function () {
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        getApp().globalData.userInfo = res.userInfo;
        getApp().globalData.signature = res.signature;
        getApp().globalData.rawData = res.rawData;
        //登录
        getApp().tologin();
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
        }
      }
    });
  },
  showLoading: function (message) {
    /*if (wx.showLoading) {
      // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
      wx.showLoading({
        title: message,
        mask: true
      });
    } else {
      // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
      wx.showToast({
        title: message,
        icon: 'loading',
        mask: true,
        duration: 5000
      });
    }*/
  },
  hideLoading: function () {
    if (wx.hideLoading) {
      // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
      wx.hideLoading();
    } else {
      wx.hideToast();
    }
  },
  collectFormId: function (event) {
    //收集formId
    let formId = event.detail.formId;
    //console.log('form发生了submit事件1，推送码为：', formId)
    //wx.showModal({title: 'formid',content: formId,});

    wx.request({
      url: getApp().globalData.host + '/rest/api/uc/collectFormId',
      data: {
        token: wx.getStorageSync("token"),
        formId: formId
      },
      success: res2 => {

      }
    });
  },
  jumpToHomePage: function () {
    wx.switchTab({
      url: '../index/index'
    })
  }
})
