import cornerstone from 'cornerstone-core';

// function transformContour(contour, element) {
//   const newCont = contour.map(p => {
//     const point = transformPoint(p, element);
//     return point;
//   })
//   return newCont;
// }

// function transformPoint(point, element) {
//   const newPoint = cornerstone.pageToPixel(element, point[0], point[1]);
//   return [newPoint.x, newPoint.y];
// };

function drawPolygon(ctx, contour) {
  const startPoint = contour[0];

  if (contour.length === 1) {
    ctx.rect(startPoint[0], startPoint[1], 1, 1);
    return;
  }

  ctx.moveTo(startPoint[0], startPoint[1]);
  contour.forEach(point => {
    ctx.lineTo(point[0], point[1]);
  });
}

export function drawRoi(ctx, roi) {
  ctx.beginPath();

  // if (roi.subtracted_contours) {
  //   roi.subtracted_contours.forEach(holeContour => {
  //     drawPolygon(ctx, holeContour);
  //   });
  // }

  const contour = roi.contour;
  drawPolygon(ctx, contour);

  ctx.closePath();
  ctx.fill('evenodd');
}

export function renderer(eventData) {
  const enabledElement = eventData.enabledElement;
  const ctx = eventData.canvasContext;

  // ctx.lineCap = getLineCap();
  // ctx.lineJoin = getLineJoin();

  // cornerstone.setToPixelCoordinateSystem(enabledElement, ctx);

  const rois = JSON.parse(localStorage.getItem('rois'));
  if (!rois || !rois.length) {
    console.warn('rois not found');
    return;
  }

  const filteredRois = rois;

  filteredRois.forEach(roi => {
    ctx.fillStyle = 'red';
    ctx.lineWidth = 3;

    drawRoi(ctx, roi);
  });
};
