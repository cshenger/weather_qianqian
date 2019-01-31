import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Canvas } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import weatherInfo from './weatherInfo'
import './weather.scss'
import getPermissions from '../../components/permissions'

@inject('weatherStore')
@observer
class Weather extends Component {
  config = {
    navigationBarTitleText: '天气信息'
  }

  constructor () {
    super(...arguments)
    this.state = {
      windowWidth: '',
      windowHeight: ''
    }
  }

  // 绘制圆形图片吧
  circleImg (ctx, img, x, y, r) {
    ctx.save();
    let d = 2 * r;
    let cx = x + r;
    let cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
  }

  componentDidMount () {
    const _this = this

    // 获取设备高宽
    Taro.getSystemInfo({
      success(res) {
        _this.setState({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })
      },
      fail(err) {
        Taro.showModal({
          title: '提示',
          content: JSON.stringify(err),
          showCancel: false
        })
      }
    })

    const context = Taro.createCanvasContext('canvas')
    let { weatherStore } = this.props
    let windowWidth = Taro.getSystemInfoSync().windowWidth
    let windowHeight = Taro.getSystemInfoSync().windowHeight
    let weekCity = weatherInfo.week + '  ' + weatherInfo.city
    let weaTem = weatherInfo.wea + '  ' + weatherInfo.tem
    // let userImgPath = ''
    let weatherIcon = ''

    // 请求天气图标
    let renderWeatherIcon = () => {
      return Taro.downloadFile({
        url: `https://tianqiapi.com/static/skin/cake/${weatherInfo.wea_img}.png`,
        success: (res) => {
          console.log(res)
          weatherIcon = res.tempFilePath
          context.fillText = '#FFF'
          // context.save()
          // context.drawImage(res.tempFilePath,  0, 0, 80, 80)
        },
        fail: (err) => {
          console.log(err)
          Taro.showModal({
            title: '提示',
            content: JSON.stringify(err) + '请退出微信重试！！',
            showCancel: false
          })
        }
      })
    }

    // 请求用户头像
    // let renderUserImg = () => {
    //   return Taro.downloadFile({
    //     url: weatherStore.userImg,
    //     success: (res) => {
    //       // console.log(res)
    //       userImgPath = res.tempFilePath
    //       // _this.circleImg(context, userImgPath, 10, windowHeight - 70, 30)
    //       // context.drawImage(userImgPath,  windowWidth - 60, windowHeight - 150, 50, 50)
    //     },
    //     fail: (err) => {
    //       Taro.showModal({
    //         title: '提示',
    //         content: JSON.stringify(err),
    //         showCancel: false
    //       })
    //     }
    //   })
    // }
    // userImgPath = weatherStore.userImgPath
    console.log('8888888888888888')
    console.log(weatherStore.userImgPath)

    // 设置星期颜色
    let setWeekStyle = (ctx, week) => {
      let setStyle = (color) => {
        ctx.fillStyle = color
        ctx.shadowColor = color
      }

      switch (week) {
        case '星期一':
          setStyle('rgba(233,16,16,0.85)')
          break
        case '星期二':
          setStyle('rgba(246,145,25,0.85)')
          break
        case '星期三':
          setStyle('rgba(239,232,40,0.85)')
          break
        case '星期四':
          setStyle('rgba(33,229,23,0.85)')
          break
        case '星期五':
          setStyle('rgba(28,236,238,0.85)')
          break
        case '星期六':
          setStyle('rgba(16,60,226,0.85)')
          break
        case '星期日':
          setStyle('rgba(199,39,245,0.85)')
          break
        default:
          break
      }
    }

    // 设置气温颜色
    let setTemColor = (tem) => {
      let num = parseInt(tem)
      if (num < 0) {
        return context.fillStyle = '#3057e7'
      } else if (num == 0) {
        return context.fillStyle = '#0099ff'
      } else if (num <= 18) {
        return context.fillStyle = '#00cccc'
      } else if (num > 18 && num <= 27) {
        return context.fillStyle = '#33ff99'
      } else if (num > 27 && num <= 35) {
        return context.fillStyle = '#ff9966'
      } else if (num > 35) {
        return context.fillStyle = '#ff3333'
      }
    }

    // 生成图片并保存
    Taro.showLoading({ title: '图片生成中...' })
    let renderCompleteImage = (ctx) => {
      let renderLastImage = () => {
        Taro.canvasToTempFilePath({
          canvasId: 'canvas',
          quality: 1,
          success(res) {
            Taro.hideLoading()
            console.log(res.tempFilePath)
          },
          fail(err) {
            console.log(err)
            Taro.hideLoading()
            Taro.showModal({
              title: '提示',
              content: JSON.stringify(err) + '请允许小程序获取图片读写权限',
              showCancel: false
            })
          }
        })
        .then((res) => {
          Taro.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(sures) {
              console.log(sures)
            },
            fail(err) {
              console.log(err)
              Taro.showModal({
                title: '提示',
                content: JSON.stringify(err),
                showCancel: false
              })
            }
          })
        })
      }

      ctx.draw(true, () => {
        setTimeout(() => {
          renderLastImage()
        }, 300)
      })
    }

    // 获取权限成功后绘制
    getPermissions('scope.writePhotosAlbum', '请允许小程序获取图片读写权限', '图片读写授权成功', '图片读写授权失败', () => {
      // context.drawImage('https://ww4.sinaimg.cn/mw1024/005C8msPjw1fb4cxrujlbj30qo13wq9h.jpg', 0, 0, windowWidth, windowHeight)
      context.drawImage(weatherStore.imgSrc, 0, 0, windowWidth, windowHeight)
      context.fillStyle = 'rgba(255,255,255,0.85)'
      context.shadowBlur = 8
      context.shadowColor = '#333'
      context.textAlign = 'left'
      context.font = '18px Arial'
      context.save()

      context.fillText(weatherInfo.date, 80, windowHeight - 19)
      context.fillText(weatherInfo.city, 145, windowHeight - 46)
      setWeekStyle(context, weatherInfo.week)
      context.fillText(weatherInfo.week, 80, windowHeight - 46)
      context.restore()

      context.fillStyle = 'rgba(255,255,255,0.9)'
      context.strokeStyle = '#FFF'
      context.shadowColor = '#FFF'
      context.shadowBlur = 0
      context.lineWidth = 2

      // console.log(textTem.width)
      context.globalAlpha = 0.45
      context.rect(windowWidth/2-65, windowHeight/2-220, 140, 200)
      context.fill()
      context.globalAlpha = 1
      context.beginPath()
      context.moveTo(windowWidth/2-70, windowHeight/2-100)
      context.lineTo(windowWidth/2-70, windowHeight/2-226)
      context.moveTo(windowWidth/2-70, windowHeight/2-225)
      context.lineTo(windowWidth/2-0, windowHeight/2-225)
      context.stroke()
      context.closePath()
      context.beginPath()
      context.moveTo(windowWidth/2+80, windowHeight/2-140)
      context.lineTo(windowWidth/2+80, windowHeight/2-14)
      context.moveTo(windowWidth/2+80, windowHeight/2-15)
      context.lineTo(windowWidth/2+10, windowHeight/2-15)
      context.stroke()
      context.closePath()

      context.font = '50px arial'
      context.globalAlpha = 1
      weatherInfo.tem = weatherInfo.tem.replace('℃','°')
      let textTem = context.measureText(weatherInfo.tem)
      setTemColor(weatherInfo.tem)
      context.fillText(weatherInfo.tem, windowWidth/2-textTem.width/2+3, windowHeight/2-50)
      context.fillText(weatherInfo.tem, windowWidth/2-textTem.width/2+4, windowHeight/2-50)
      context.fillText(weatherInfo.tem, windowWidth/2-textTem.width/2+5, windowHeight/2-50)
      context.fillText(weatherInfo.tem, windowWidth/2-textTem.width/2+6, windowHeight/2-50)

      // Promise.all([renderWeatherIcon()])
        renderWeatherIcon().then(res => {
          // console.log(res)
          context.drawImage(weatherIcon,  windowWidth/2-40, windowHeight/2-200, 100, 100)
          context.restore()
           _this.circleImg(context, weatherStore.userImgPath, 10, windowHeight - 70, 30)
        })
        .then(() => {
          renderCompleteImage(context)
        })

    })
  }

  render() {
    let { windowWidth, windowHeight } = this.state
    return (
      <View className="weather">
        <Canvas style={{width: `${windowWidth}px`, height: `${windowHeight}px`}} canvasId='canvas' />
      </View>
    )
  }

}

export default Weather
