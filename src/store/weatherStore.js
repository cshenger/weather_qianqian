import { observable } from 'mobx'

const weatherStore = observable({
  imgSrc: '',
  setImgSrc (imgsrc) {
    return this.imgSrc = imgsrc
  },
  userImg: '',
  setUserImg (userImg) {
    return this.userImg = userImg
  },
  userImgPath: '',
  setUserImgPath (userImgPath) {
    return this.userImgPath = userImgPath
  },
})

export default weatherStore
