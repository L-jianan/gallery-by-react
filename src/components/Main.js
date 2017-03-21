require('normalize.css/normalize.css');
require('styles/App.less');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片信息
let imageDatas = require('../data/imageDatas.json');

// 将图片信息转换成图片URL路径信息
// 本质就是为json里面的每个对象再添加一个属性
imageDatas = (function genImageURL(imageDataArr){
  for(let i = 0; i < imageDataArr.length; i++){
    let singleImageData = imageDataArr[i];
    singleImageData.imageURL = require('../images/'+singleImageData.fileName);
    imageDataArr[i] = singleImageData;
  }
  return imageDataArr;
})(imageDatas);

// 获取随机位置，根据传入的边界条件随机生成一个值
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
}

// 获取0-30之间的一个任意正负值
function get30DegRandom(){
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

// 每个图片子组件
var ImgFigure = React.createClass({

  // imgFigure的点击处理函数
  handleClick:function(e){

    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  },

  render:function(){

    // 每个子组件的定位信息
    var styleObj = {};

    // 如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    // 如果图片的旋转角度有值并且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['MozTransform','msTransform','WebkitTransform','transform']).forEach(function(value){

        styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      
      }.bind(this));
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    // 图片是否翻转
    var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse':'';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
})

var ControllerUnit = React.createClass({
  handleClick:function(e){
    // 如果点击时当前正在选中状态的按钮，则翻转图片，否则将对应的图片居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  },
  render:function(){
    var controllerUnitClassName = 'controller-unit';

    // 如果对应的是居中的图片，显示控制按钮的居中状态
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';

      // 如果同时对应的是翻转图片，显示控制按钮的翻转状态
      if(this.props.arrange.isInverse){
        controllerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    )
  }
});

let AppComponent = React.createClass({
  // 初始化/存储 每个图片组件的位置信息
  Constant:{
    centerPos:{ // 中间图片的位置信息
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

  // 翻转图片 输入当前被执行翻转操作的图片对应的图片信息数组的index值
  // 使用闭包，return一个真正待被执行的函数
  inverse:function(index){
    return function(){
      var imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr:imgsArrangeArr
      })

    }.bind(this);
  },

  // 重新布局所有图片  参数指定哪张图片垂直居中
  rearrange:function(centerIndex){
        // 获取初始状态存放每张图片位置信息的数组
    var imgsArrangeArr = this.state.imgsArrangeArr,

        // 每部分的位置对象
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,

        // 左右部分位置范围
        hPosRangLeftSecX = hPosRange.leftSecX,
        hPosRangRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,

        // 上半部分位置范围
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        // 存储上半部分的图片
        imgsArrangeTopArr = [],
        // 上半部分要么有一张要么没有
        topImgNum = Math.floor(Math.random()*2),
        // 上半部分那张图片的索引
        topImgSpliceIndex = 0,

        // 存储居中的那张图片
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        // // 设置居中图片的位置
        // imgsArrangeCenterArr[0].pos = centerPos;

        // // 居中的图片不需要旋转
        // imgsArrangeCenterArr[0].rotate = 0;

        imgsArrangeCenterArr[0] = {
          pos:centerPos,
          rotate:0,
          isCenter:true
        }

        // 随机获取一个上侧图片的索引
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));

        // 获取上侧那张图片
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        // 布局位于上栅的图片
        imgsArrangeTopArr.forEach(function(value,index){
          imgsArrangeTopArr[index] = {
            pos:{
              top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
              left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
            },
            rotate:get30DegRandom(),
            isCenter:false
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
          // 根据范围 随机一个值
          imgsArrangeArr[i] = {
            pos:{
              top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
              left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
            },
            rotate:get30DegRandom(),
            isCenter:false
          }
        }
        // debugger;
        // 如果上侧有图片
        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
          // 还把上侧的图片放回原数组
          imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
        }
        // 把中间的部分也放回原数组
        imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);
        // 存储着新的每张图片位置信息的数组 重新  赋值回去
        this.setState({
          imgsArrangeArr:imgsArrangeArr
        })
  },
  // 居中图片 传入需要被居中的图片对应的图片信息数组的index值
  center:function(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  },

  // 初始化位置信息状态
  getInitialState:function(){
    return{
      imgsArrangeArr:[
        {
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,  // 图片正反面  默认false为正面
          isCenter:false // 图片是否居中 默认不居中
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

    // 中心图片的位置
    this.Constant.centerPos = {
      left:halfStageW - halfImgW,
      top:halfStageH - halfImgH
    };

    // 图片在水平方向上的位置范围 左半部分的取值范围  右半部分的取值范围  Y的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    // 图片在垂直方向上的位置范围 上半部分 X的取值范围 Y的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH*3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageH;

    this.rearrange(0);
  },
  render:function(){

    // 存放中间的图片数组  和   小圆点
    var controllerUnits = [],
        ImgFigures = [];

    // 遍历给每个图片子组件添加 属性
    imageDatas.forEach(function(value,index){
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        }
      }
      ImgFigures.push(<ImgFigure data={value} key={index} ref={'ImgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

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
    );
  }
})

AppComponent.defaultProps = {
};

export default AppComponent;
