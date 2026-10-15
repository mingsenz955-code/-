// Completion is tied to actual loaded source frames, including terminal clips.
// Closing or replacing the dialog cancels the wait without finishing gameplay.
export function waitForSourceMotion(canvas,name,live){
 if(!canvas)return Promise.resolve(live());
 return new Promise((resolve,reject)=>{
  let poll,timeout,settled=false;
  const finish=(value,error)=>{if(settled)return;settled=true;clearInterval(poll);clearTimeout(timeout);canvas.removeEventListener('dragon-clip-complete',done);if(error)reject(error);else resolve(value)};
  const done=e=>{if(e.detail.clip===name)finish(live())};
  canvas.addEventListener('dragon-clip-complete',done);
  poll=setInterval(()=>{if(!live()||!canvas.isConnected)finish(false);else if(canvas.dataset.modelError)finish(false,new Error(canvas.dataset.modelError))},50);
  timeout=setTimeout(()=>finish(false,new Error('原版动作载入或播放超时，请重新进入此页面。')),15000);
 });
}
