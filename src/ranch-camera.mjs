// Screen-space pan and zoom: preserve the point under the mouse while zooming.
export function zoomCameraAt(camera,delta,x,y){const zoom=Math.min(2.5,Math.max(.45,camera.zoom*Math.exp(-Math.max(-300,Math.min(300,delta))*.0015))),ratio=zoom/camera.zoom;return {zoom,x:x-(x-camera.x)*ratio,y:y-(y-camera.y)*ratio}}

// Keep the viewport center within the finite original island cluster. When the
// viewport exceeds a world axis, center that axis instead of exposing infinity.
export function clampWorldCamera(camera,width,height,fit,bounds){
 const scale=fit*camera.zoom,halfX=width/(2*scale),halfY=height/(2*scale);
 const axis=(offset,min,max,half)=>{const lo=min+half,hi=max-half;return -scale*(lo>hi?(min+max)/2:Math.max(lo,Math.min(hi,-offset/scale)));};
 return {...camera,x:axis(camera.x,bounds.left,bounds.right,halfX),y:axis(camera.y,bounds.top,bounds.bottom,halfY)};
}
