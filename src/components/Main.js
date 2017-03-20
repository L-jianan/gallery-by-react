require('normalize.css/normalize.css');
require('styles/App.less');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片信息
let imageDatas = require('../data/imageDatas.json');

// 将图片信息转换成图片URL路径信息
imageDatas = (function genImageURL(imageDataArr){
  for(let i = 0; i < imageDataArr.length; i++){
    let singleImageData = imageDataArr[i];
    singleImageData.imageURL = require('../images/'+singleImageData.fileName);
    imageDataArr[i] = singleImageData; 
  }
  return imageDataArr;
})(imageDatas);

// 获取随机位置
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
}

var ImgFigure = React.createClass({
  render:function(){

    var styleObj = {};

    // 如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    return (
      <figure className="img-figure" style={styleObj}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2>{this.props.data.title}</h2>
        </figcaption>
      </figure>
    )
  }
})

let AppComponent = React.createClass({
  Constant:{
    centerPos:{
      left:0,
      right:0
    },
    hPosRange:{ // 水平方向的取值范围
      leftSecX:[0,0],
      rightSecX:[0,0],
      y:[0,0]
    },
    vPosRange:{ // 垂直方向的取值范围
      x:[0,0],
      topY:[0,0]
    }
  },
  // 重新布局所有图片  参数指定哪张图片垂直居中
  rearrange:function(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangLeftSecX = hPosRange.leftSecX,
        hPosRangRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.ceil(Math.random()*2),
        topImgSpliceIndex = 0,
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        // 居中 centerIndex 的图片
        imgsArrangeCenterArr[0].pos = centerPos;

        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));

        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        // 布局位于上栅的图片
        imgsArrangeArr.forEach(function(value,index){
          imgsArrangeArr[index].pos = {
            top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
            left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
          }
        })

        // 布局左右两侧的图片
        for(var i = 0, j = imgsArrangeArr.length ,k = j / 2 ; i < j; i++){
          var hPosRangeLORX = null;
          // 前半部分布局左边，后半部分布局右边
          if(i < k){
            hPosRangeLORX = hPosRangLeftSecX;
          }else{
            hPosRangeLORX = hPosRangRightSecX;
          }

          imgsArrangeArr[i].pos = {
            top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
            left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
          }
        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
          imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

        this.setState({
          imgsArrangeArr:imgsArrangeArr
        })
  },
  getInitialState:function(){
    return{
      imgsArrangeArr:[
        {
          pos:{
            left:'0',
            top:'0'
          }
        }
      ]
    }
  },
  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount:function(){
    // 拿到舞台的大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW/2),
        halfStageH = Math.ceil(stageH/2);
    
    // 拿到一个imageFigure的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.ImgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2);

    this.Constant.centerPos = {
      left:halfStageW - halfImgW,
      top:halfStageH - halfImgH,
    }

    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH*3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageH;

    this.rearrange(0);
  },
  render:function(){

    var controllerUnits = [],
        ImgFigures = [];

    imageDatas.forEach(function(value,index){
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos:{
            left:0,
            top:0
          }
        }
      }
      ImgFigures.push(<ImgFigure data={value} key={index} ref={'ImgFigure'+index} arrange={this.state.imgsArrangeArr[index]} />);
    }.bind(this));

    return(
      <section className="stage" ref="stage">
        <section className="img-sec">
          {ImgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>     
    )
  }
})

AppComponent.defaultProps = {
};

export default AppComponent;
