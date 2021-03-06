import React, { Component } from 'react';
import CornerstoneViewport from '@cornerstone-viewport';

import cornerstone from 'cornerstone-core';

const { cv } = window;

function getRoiContours(contours) {
  const rois = [];
  for (let i = 0; i < contours.size(); i++) {
    const roi = {
      id: i,
      contour: getRoiContour(contours.get(i))
    };
    // if (roi.contour.length >= 3)
    rois.push(roi);
  }

  saveRois(rois);
  return rois;
};

function getRoiContour(contour) {
  const roiContour = [];
  for (let i = 0; i < contour.data32S.length; i += 2) {
    roiContour.push([contour.data32S[i], contour.data32S[i + 1]]);
  };
  return roiContour;
};

function saveRois(rois) {
  localStorage.setItem('rois', JSON.stringify(rois));
};

function addIdAttribute() {
  const canvas = document.querySelector('.cornerstone-canvas');
  canvas.setAttribute('id', 'original-canvas');
}

class ExamplePageBasic extends Component {
  constructor(props) {
    super(props);
    this.changeMinValue = this.changeMinValue.bind(this);
    this.changeMaxValue = this.changeMaxValue.bind(this);
    this.showImage = this.showImage.bind(this);
  }

  state = {
    tools: [
      // Mouse
      {
        name: 'Wwwc',
        mode: 'active',
        modeOptions: { mouseButtonMask: 1 },
      },
      {
        name: 'Zoom',
        mode: 'active',
        modeOptions: { mouseButtonMask: 2 },
      },
      {
        name: 'Pan',
        mode: 'active',
        modeOptions: { mouseButtonMask: 4 },
      },
      // Scroll
      { name: 'StackScrollMouseWheel', mode: 'active' },
      // Touch
      { name: 'PanMultiTouch', mode: 'active' },
      { name: 'ZoomTouchPinch', mode: 'active' },
      { name: 'StackScrollMultiTouch', mode: 'active' },
    ],
    imageIds: [
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
    ],
    minValue: 175,
    maxValue: 200
  };

  showImage() {
    console.clear();

    addIdAttribute();

    const enabledElement = cornerstone.getEnabledElements()[0];
    const element = enabledElement.element;

    // ???????????????????? ???????????? ???????????? ????????????
    const canvas = document.querySelector('.cornerstone-canvas');
    const ctx = canvas.getContext('2d');
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let canvasSrc = cv.matFromImageData(imgData);

    // ???????????? ???????????? ??????????????????-???????????? ?? ?????????? ????????????
    // ???????????????????????????? ?????????????????? ?? grayscale
    let canvasDst = cv.Mat.zeros(canvasSrc.rows, canvasSrc.cols, cv.CV_8UC3);
    cv.cvtColor(canvasSrc, canvasSrc, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(canvasSrc, canvasSrc, this.state.minValue, 255, cv.THRESH_TOZERO);
    cv.threshold(canvasSrc, canvasSrc, this.state.maxValue, 255, cv.THRESH_TOZERO_INV);

    // ?????????????? ?????????????? ?????? ???????????????? ????????????????
    let canvasContours = new cv.MatVector();
    let canvasHierarchy = new cv.Mat();

    // ?????????????? ???????????? ????????????????
    cv.findContours(canvasSrc, canvasContours, canvasHierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    // ???????????? ??????????????
    for (let i = 0; i < canvasContours.size(); ++i) {
      let color = new cv.Scalar(255, 0, 0);
      cv.drawContours(canvasDst, canvasContours, i, color, 1, cv.LINE_8, canvasHierarchy, 100);
    }

    // ???????????????? ?????????????????? ?????????????? ?? ???????????????????????????? ????????????
    cv.imshow('canvasOutput', canvasDst);

    // ?????????????? ????????????
    canvasContours.delete();
    canvasHierarchy.delete();
    canvasSrc.delete();
    canvasDst.delete();

    console.log('--------------------------------------------------');
    console.log('******** Canvas example has been rendered ********');
    console.log('---------------------------------------------------');

    console.log('--------------------------------------------------');
    console.log('******** Pixel data example start ********');
    console.log('---------------------------------------------------');

    const image = enabledElement.image;
    const pixels = image.getPixelData();

    // For example: let mat = cv.matFromArray(2, 2, cv.CV_8UC1, [1, 2, 3, 4]);
    // const pixels = cornerstone.getStoredPixels(element, 0, 0, 512, 512);
    // console.log(pixels);

    let src = cv.matFromArray(image.rows, image.columns, cv.CV_8U, pixels);
    console.log('srs', src);

    // Make treshold operation
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    console.log('dst', dst);
    // // cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, this.state.minValue, 255, cv.THRESH_TOZERO);
    cv.threshold(src, src, this.state.maxValue, 255, cv.THRESH_TOZERO_INV);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    console.log('count of contours', contours.size());

    for (let i = 0; i < contours.size(); ++i) {
      let color = new cv.Scalar(255, 0, 0);
      cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }

    cv.imshow('original-canvas', dst);

    // console.log('hierarchy', hierarchy);
    // const cont = contours.get(0);
    // console.log('contour size is: ', cont.size());
    // console.log('contour useful data is: ', cont.data32S);
    // cont.data32S.forEach(n => console.log(n));

    // const rois = getRoiContours(contours);
    // console.log(rois);



    // // To distinguish the input and output, we graying the image.
    // // You can try different conversions.
    // // cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

    console.log('--------------------------------------------------');
    console.log('******** Pixel data example end ********');
    console.log('---------------------------------------------------');

    cornerstone.draw(element);
  }

  changeMinValue(event) {
    console.log(event.target.value);
    this.setState({ minValue: Number(event.target.value) });
  }

  changeMaxValue(event) {
    this.setState({ maxValue: Number(event.target.value) });
  }

  render() {
    return (
      <div>
        <h2>Basic Demo</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <CornerstoneViewport
            tools={this.state.tools}
            imageIds={this.state.imageIds}
            style={{ minWidth: '100%', height: '512px', flex: '1' }}
          />
        </div>

        <div style={{ marginTop: '100px' }}>
          <div>
            <button onClick={this.showImage}>Render image</button>
            <input
              type='number'
              placeholder='min value'
              value={this.state.minValue}
              min='0'
              max='255'
              name='tets'
              onChange={this.changeMinValue} />
            <input
              type='number'
              placeholder='max value'
              value={this.state.maxValue}
              min='0'
              max='255'
              onChange={this.changeMaxValue} />
          </div>
          <canvas id='canvasOutput'></canvas>
        </div>
      </div>
    );
  }
}

export default ExamplePageBasic;
