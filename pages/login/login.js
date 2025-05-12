// pages/login/login.js
const app = getApp()
const APPID = 'wx628e8ede74faf509' // 替换为你的小程序 AppID
const SECRET = '4f90f89d52dfe3138d6c45880871d545' // 替换为你的小程序 AppSecret

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  getUserInfo(e) {
    var _this = this
    wx.showModal({
      title: '温馨提示',
      content: '亲，授权微信登录后才能正常使用小程序功能',
      success(res) {
        console.log(res)
        //如果用户点击了确定按钮
        if (res.confirm) {
          wx.getUserProfile({
            desc: '获取你的昵称、头像、地区及性别',
            success: res => {
              _this.setData({
                userInfo: res.userInfo,
              })
              console.log(res);
              console.log(1);
            },
            fail: res => {
              console.log(res)
              //拒绝授权
              wx.showToast({
                title: '您拒绝了请求,不能正常使用小程序',
                icon: 'error',
                duration: 2000
              });
              return;
            }
          });
        } else if (res.cancel) {
          //如果用户点击了取消按钮
          wx.showToast({
            title: '您拒绝了请求,不能正常使用小程序',
            icon: 'error',
            duration: 2000
          });
          return;
        }
      }
    })
  },

  handleLogin(e) {
    console.log(e)
    if (e.detail.userInfo) {
      // 用户同意授权
      wx.login({
        success: (res) => {
          console.log(res)
          if (res.code) {
            // 调用微信的 code2Session 接口
            wx.request({
              url: 'https://api.weixin.qq.com/sns/jscode2session',
              method: 'GET',
              data: {
                appid: APPID,
                secret: SECRET,
                js_code: res.code,
                grant_type: 'authorization_code'
              },
              success: (response) => {
                console.log('code2Session response:', response)
                if (response.data.openid) {
                  
                  // 更新全局数据
                  app.globalData.userInfo = e.detail.userInfo;
                  app.globalData.openid = response.data.openid;
                  
                  // 返回上一页
                  wx.navigateBack({
                    delta: 1,
                    success: () => {
                      wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 2000
                      });
                    }
                  });
                } else {
                  console.error('获取openid失败：', response.data);
                  wx.showToast({
                    title: '登录失败',
                    icon: 'error',
                    duration: 2000
                  });
                }
              },
              fail: (error) => {
                console.error('code2Session请求失败：', error);
                wx.showToast({
                  title: '登录失败',
                  icon: 'error',
                  duration: 2000
                });
              }
            });
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'error',
              duration: 2000
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '登录失败',
            icon: 'error',
            duration: 2000
          });
        }
      });
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '请授权后继续',
        icon: 'none',
        duration: 2000
      });
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              console.log(app.globalData.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  }
})