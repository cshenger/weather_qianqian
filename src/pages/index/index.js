import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Image, Camera } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import './index.scss'
import getPermissions from '../../components/permissions'

@inject('weatherStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }

  componentDidMount () {
    // 页面一进来先获取相关权限
    const setOneRenderPremission = (res, permission) => {
      if (!res.authSetting[permission]) {
        Taro.showLoading({ title: '相关权限获取中...' })
        Taro.authorize({
          scope: permission,
          success(res) {
            Taro.hideLoading()
            console.log(res)
          },
          fail(err) {
            Taro.hideLoading()
            Taro.showModal({
              title: '提示',
              content: JSON.stringify(err),
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
                  callback()
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
    }

    Taro.getSetting({
      success(res) {
        setOneRenderPremission(res, 'scope.userInfo')
        setOneRenderPremission(res, 'scope.userLocation')
        setOneRenderPremission(res, 'scope.writePhotosAlbum')
      }
    })

    // 用户权限
    // getPermissions('scope.userInfo', '请允许小程序获取用户权限', '用户信息授权成功', '用户信息授权失败', () => { getUserInfo() })
  }

  // 获取用户信息
  getUserInfoNaive (callback) {
    let { weatherStore } = this.props
    Taro.getUserInfo({
      success: (res) => {
        // console.log(res)
        weatherStore.setUserImg(res.userInfo.avatarUrl)
        Taro.downloadFile({
          url: res.userInfo.avatarUrl,
          success: (res) => {
            // console.log(res)
            weatherStore.setUserImgPath(res.tempFilePath)
            // _this.circleImg(context, userImgPath, 10, windowHeight - 70, 30)
            // context.drawImage(userImgPath,  windowWidth - 60, windowHeight - 150, 50, 50)
            callback && callback()
          },
          fail: (err) => {
            Taro.showModal({
              title: '提示',
              content: JSON.stringify(err),
              showCancel: false
            })
          }
        })
      },
      fail: (err) => {
        Taro.showModal({
          title: '提示',
          content: JSON.stringify(e) + '请允许小程序获取用户信息权限',
          showCancel: false
        })
      }
    })
  }

  pageToWeather () {
    Taro.navigateTo({
      url: '/pages/weather/weather'
    })
  }

  takePhoto () {
    let { weatherStore } = this.props
    const cameraContext = Taro.createCameraContext()

    this.getUserInfoNaive(() => {
      cameraContext.takePhoto({
        quality: 'high',
        success: (res) => {
          weatherStore.setImgSrc(res.tempImagePath)
          this.pageToWeather()
        }
      })
      // this.pageToWeather()
    })
  }

  cameraError (e) {
    console.log(e.detail)
  }

  render () {
    return (
      <View className='index'>
        <Camera className="camera" flash="off" onError={this.cameraError} style="width: 100%; height: 90%;" />
        <Button className="camera_button" open-type="getUserInfo" lang="zh_CN" onClick={this.takePhoto}>📷 拍一张</Button>
      </View>
    )
  }
}

export default Index
