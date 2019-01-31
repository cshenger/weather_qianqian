import Taro, { Component } from '@tarojs/taro'

const getPermissions = (permission, content, sucTitle, faiTitle, callback) => {
  Taro.getSetting({
    success(res) {
      if (!res.authSetting[permission]) {
        Taro.authorize({
          scope: permission,
          success(res) {
            console.log(res)
            callback()
          }
        })
      } else {
        callback()
      }
    },
    fail(err) {
      Taro.showModal({
        title: '提示',
        content: JSON.stringify(err) + content,
        showCancel: false
      })
      Taro.openSetting({
        success: function (dataAu) {
          if (dataAu.authSetting[permission] == true) {
            Taro.showToast({
              title: sucTitle,
              icon: 'success',
              duration: 1000
            })
          } else {
            Taro.showToast({
              title: faiTitle,
              icon: 'none',
              duration: 1000
            })
          }
        }
      })
    }
  })
}

export default getPermissions

/*
"permission": {
  "scope.userLocation": {
    "desc": "小程序想获取您的位置信息"
  },
  "scope.userInfo": {
    "desc": "小程序想获取您的用户信息"
  },
  "scope.writePhotosAlbum": {
    "desc": "小程序想获取您的图片读写权限"
  }
}
*/
