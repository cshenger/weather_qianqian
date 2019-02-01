# 天气签签小程序 


那天老板心血来潮得告诉我，我们明年要做小程序，让我这两天看看先。然后我就打算看一下，又想到市面上现在有很多这种面向多端小程序的开发框架。几番选择之后，我决定使用腾讯凹凸实验室开发的[Taro](https://taro.aotu.io/)进行小程序的学习与开发。

为啥选择这个而不是什么**mpvue**或者**WePY**呢？主要是因为之前我们公司的主流前端开发选择的就是Vue，我想借此机会正好熟悉一下React的语法，状态管理选择的是**Mobx**，主要是因为**redux**我看不太懂o(╥﹏╥)o，虽然我照着redux的文档边敲边学了一下思路大概明白意思，但真正上手感觉好痛苦，还是从我认为有点像vuex的mobx开始吧。

厚颜无耻的贴个二维码，使用之前请先开启手机定位，不然报错，额，暂时只能做个提醒临时处理了，毕竟处于学习阶段，有些东西自己还没摸透。

<img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/erweima.png" alt="icon"  width="200" height="200" align="center">

功能很简单，在获取相应权限后点击拍照按钮会生成一张带有自己头像和当天天气水印的照片并保存到本地。

<img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/2.jpg" width="200" height="400"><img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/1.jpg" width="200" height="400"><img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/3.jpg" width="200" height="400">
<img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/4.jpg" width="200" height="400"><img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/5.jpg" width="200" height="400"><img src="https://raw.githubusercontent.com/cshenger/all_image_demo_package/master/images/weather_qianqian/6.jpg" width="200" height="400">

介绍就到此结束，后面写一点我初学小程序和taro的一些心得笔记吧。我尽量精简。


----------

## 关于Taro
多端开发的框架大同小异都是为了解决目前市面上各个厂商不同小程序开发之间的壁垒，希望做到一次开发处处运行。Taro就是这样的例子，目前除了快应用没得到支持，其他小程序都有支持。其语法风格与React类似并且支持redux和mobx，有了状态管理开发起来就容易多了，我这个例子就是，后文会说。当然选择哪一种多端开发得看自己的喜好和公司的技术栈。更多内容就去[官网](https://taro.aotu.io/)看看吧。

## Mobx
我不太清楚原生小程序是怎样处理状态的，但是taro支持redux和mobx则可以让你在处理状态上得心应手，我这里的需求是在小程序进入首页之后首先获取到用户的头像，然后利用downloadFile将头像路径包装成本地路径，以及用户点击拍照之后获取拍照的图片路径。之后我会将这两个路径带到图片生成页面，利用mobx可以很容易实现这样的功能
```javascript
// weatherStore.js

const weatherStore = observable({
  imgSrc: '', // 拍照之后的图片路径
  setImgSrc (imgsrc) {
    return this.imgSrc = imgsrc
  },
  userImg: '', // 用户头像网络路径
  setUserImg (userImg) {
    return this.userImg = userImg
  },
  userImgPath: '', // 用户头像本地路径
  setUserImgPath (userImgPath) {
    return this.userImgPath = userImgPath
  },
})
```
在首页里，我们在写好的组件上注入自己写的==store==，添加mobx的==observer==监听，就实现了mobx的发布订阅功能调用事先设置好的方法就可以了。这里也就是mobx的大体流程，store（我这里叫weatherStore）定义数据方法，通过方法触发行为，也就是我这里的setImgSrc等，最后，利用observer监听事件触发实现数据的更新。关于mobx的更多内容，查看[官网](https://cn.mobx.js.org/)了解了解就好了。
![Mobx流程图](https://cn.mobx.js.org/flow.png)
```javascript
@inject('weatherStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: '首页'
  }
  ...
}
```
```javascript
let { weatherStore } = this.props

// 获取用户信息
Taro.getUserInfo({
  success: (res) => {
	weatherStore.setUserImg(res.userInfo.avatarUrl) // 存储用户网络头像路径
	Taro.downloadFile({
	  url: res.userInfo.avatarUrl,
	  success: (res) => {
		weatherStore.setUserImgPath(res.tempFilePath) //存储用户本地头像路径
		callback && callback()
	  },
	})
  },
```
点击拍照按钮调用相关摄像头的方法将生成的照片路径存储下来就可以了
```javascript
takePhoto () {
    let { weatherStore } = this.props
    const cameraContext = Taro.createCameraContext()

    this.getUserInfoNaive(() => {
      cameraContext.takePhoto({
        quality: 'high',
        success: (res) => {
          weatherStore.setImgSrc(res.tempImagePath) // 存储拍照的图片路径
          this.pageToWeather()
        }
      })
    })
  }
```
这样在首页我们就获取并存储了我们之后要获得的信息。之后，在图片生成页里面，注入weatherStore，我们就可以直接拿到首页传过来的数据直接使用就好了。
```javascript
context.drawImage(weatherStore.imgSrc, 0, 0, windowWidth, windowHeight)
```
关于mobx就介绍这么多。

## 路由
跳转必然涉及路由，taro的路由很简单，在app.js里面配置好路由页面
```javascript
  config = {
    pages: [
      'pages/index/index',
      'pages/weather/weather'
    ],
	...
}
```
然后通过事件触发跳转就行。
```javascript
Taro.navigateTo({ url: '/pages/weather/weather'})
```
当然也可以通过路由传递些参数，如果不用状态管理就可以考虑将相关信息带到路由参数里，这里不做展开，可自行查看Taro的路由部分[文档](https://nervjs.github.io/taro/docs/router.html)。

## 天气获取和异步编程
我所使用的天气接口是将城市中文名称传给后端然后拿到对应城市天气信息。那么在我这个小程序里实现的思路就是这样的：

 1. 通过小程序的getLocation获得手机经纬度
 2. 使用拿到的经纬度请求腾讯地图的逆地址解析接口获取城市名称
 3. 将城市名称发给天气接口获取相应天气数据

这样的一套流程如果用request一路then下去也可以，但感觉怪怪的，所以我使用了async/await实现，在taro要是使用这个功能必须先安装@tarojs/async-await包之后导入才可以使用。
接着我利用async/awiat分别获取经纬度，城市名，最后获取天气信息。
```javascript
// 获取本地当天的天气信息
const getCityEnd = async () => {
  let location = await Taro.getLocation({ ... })
  
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
}

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
.then(res => { ... })
```

## 小程序的权限
在当初开发的时候我没有想那么严谨，就是有一些的权限是在图片生成页面才去获取的，这就导致用户点击了拍照之后才会获取对应的权限，如果初次使用小程序，那么图片在获得权限之前就生成了，自然生成的图片是错误的。所以经验就是最好在首页就去获取小程序的相关权限，然后在权限允许之后才去调用后续的程序，我这里因为后期才改的，就没写那么严谨了。目前至少实现了所有权限在首页就获取。这一部分涉及到很多小程序的API，taro只是做了层封装，所以具体的使用方法需要去查看微信小程序的相关文档。
```javascript
// index.js

  componentDidMount () {
    // 页面一进来先获取相关权限
    const setOneRenderPremission = (res, permission) => {
      if (!res.authSetting[permission]) { // 判断是否拥有相关权限
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
            Taro.openSetting({ // 如果没有相关权限则尝试让用户打开相关权限
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
	
  }
```
### 权限的一个小坑
1.如果设置获取小程序的位置信息，则必须要在小程序的配置文件app.json里添加permission明确说明你需要调用位置信息。如果不这么做的话我试了一下，在Android五点几的版本可能会直接获取不到位置信息，即使用户开了GPS也是不行的。额，这个发现是因为我爸的手机是安卓5，他就不行，后来网上查了下就是这个问题。
```javascript
"permission": {
	"scope.userLocation": {
	  "desc": "你的位置信息将用于小程序位置接口的效果展示"
	}
}
```

## Taro的一个问题
小程序的代码是通过==npm run dev:weapp==实时生成的，但是每次生成之后会覆盖原先小程序app.json中的permission导致之前设置的permission丢失这也是我后来提交代码审核发现的。所以只能每次生成之后再手动把permission添加进去，目前我还没找到解决办法不知道Taro官方文档是不是有关这个问题的解释，后续再看看吧。

## 其他
开发的时候在做canvas生成并保存图片的操作有时候总是会发现设置的样式没能生效，后来查了下网上的说法是小程序的==draw==之后就回调有一定概率在canvas没有完全绘制完成就生成图片了，解决的办法是最传统的setTimeout大发。恩，先这样吧。
```javascript
ctx.draw(true, () => {
  setTimeout(() => {
    renderLastImage()
  }, 300)
})
```

## 总结
以上差不多就是我的一些学习总结吧，基本上照着Taro和微信小程序的文档就可以比较顺利的开发相关应用，其实代码上还有些优化的地方就没去想那么细了。通过这个小练习我也大概摸清了Taro+小程序的开发流程了。以后要是碰到什么新的问题再说吧。
