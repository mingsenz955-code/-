// Screen-space pan and zoom: preserve the point under the mouse while zooming.
export function zoomCameraAt(camera,delta,x,y){const zoom=Math.min(2.5,Math.max(.45,camera.zoom*Math.exp(-Math.max(-300,Math.min(300,delta))*.0015))),ratio=zoom/camera.zoom;return {zoom,x:x-(x-camera.x)*ratio,y:y-(y-camera.y)*ratio}}
