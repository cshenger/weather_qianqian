import Taro, { Component } from '@tarojs/taro'
import getPermissions from '../../components/permissions'

let weatherInfo = {
  city: '圣弗朗西斯科',
  date: '2019-01-01 12:00',
  week: '星期五',
  wea: '小雨转大雨',
  tem: '-99℃',
  wea_img: 'yun'
}

const getTheIsTem = (arrs) => {
  let hour = (new Date()).getHours()
  if (arrs.length == 8) {
    if (hour < 11) {
      return arrs[0].tem
    } else if (hour < 14) {
      return arrs[1].tem
    } else if (hour < 17) {
      return arrs[2].tem
    } else if (hour < 20) {
      return arrs[3].tem
    } else if (hour < 23) {
      return arrs[4].tem
    } else if (hour >= 23) {
      return arrs[5].tem
    }
  } else if (arrs.length == 6) {
    if (hour < 17) {
      return arrs[0].tem
    } else if (hour < 20) {
      return arrs[1].tem
    } else if (hour < 23) {
      return arrs[2].tem
    } else if (hour >= 23) {
      return arrs[3].tem
    }
  } else if (arrs.length == 4) {
    if (hour < 23) {
      return arrs[0].tem
    } else if (hour >= 23) {
      return arrs[2].tem
    }
  }
}

const getWeather = () => {
  // 获取本地当天的天气信息
  const getCityEnd = async () => {
    Taro.showLoading({ title: '定位获取中请稍后操作' })
    let location = await Taro.getLocation({
      type: 'gcj02',
      success: function (res) {
        Taro.hideLoading()
        return {
          latitude: res.latitude,
          longitude: res.longitude,
        }
      },
      fail: function (e) {
        Taro.hideLoading()
        Taro.showToast({
          title: '检测到您未授权使用位置权限，请先开启哦',
          icon: 'none',
          duration: 10000
        })
        Taro.showModal({
          title: '提示',
          content: JSON.stringify(e) + '请允许小程序获取位置权限并在手机上开启定位',
          showCancel: false
        })
      }
    })

    let cityname = await Taro.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1',
      data: {
        location: `${location.latitude},${location.longitude}`,
        key: 'BHYBZ-HF6R5-HL2IO-QG6GI-E5EZQ-IUBGC',
        get_poi: 1
      },
      header: {
        'content-type': 'application/json'
      }
    })
    .then(res => {
      let city = res.data.result.address_component.city
      let cityname = city.substring(0, city.length-1)
      weatherInfo.city = cityname
      return cityname
    })

    await Taro.request({
      url: 'https://tianqiapi.com/api',
      data: {
        version: 'v1',
        city: cityname
      },
      header: {
        'content-type': 'application/json'
      }
    })
    .then(res => {
      // console.log(res)
      let date = new Date()
      let hour = date.getHours()
      let minu = date.getMinutes() > 9 ? date.getMinutes() : '0'+date.getMinutes()
      weatherInfo.date = res.data.data[0].date + ' ' + hour + ':' + minu
      weatherInfo.week = res.data.data[0].week
      weatherInfo.wea = res.data.data[0].wea
      weatherInfo.tem = getTheIsTem(res.data.data[0].hours)
      weatherInfo.wea_img = res.data.data[0].wea_img
    })
  }

  // 位置权限
  getPermissions('scope.userLocation', '请允许小程序获取位置权限', '地理位置授权成功', '位置权限授权失败', () => { getCityEnd() })
}

getWeather()

export default weatherInfo
