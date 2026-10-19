import {sourceLayout,showSource} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {profileOf} from './player-profile.mjs';
import {gameAudio} from './audio.mjs';
export async function openOriginalSettings(state){
 const layout=await sourceLayout('panel_userinfo'),p=profileOf(state),{music,sound}=gameAudio.preferences,on=music||sound;
 const icon=(name,image)=>{layout.children.find(n=>n.name===name).img_normal='#'+image;};
 icon('musicOn',on?'ui_main_music_on_highlight.png':'ui_main_music_on.png');icon('musicOff',on?'ui_main_music_off.png':'ui_main_music_off_highlight.png');
 for(const name of ['musicOnBtn','musicOffBtn'])layout.children.find(n=>n.name===name).children.find(n=>n.type==='btn').img_normal=name==='musicOnBtn'&&on||name==='musicOffBtn'&&!on?'#ui_common_btn_3.png':'#ui_common_btn_4.png';
 return showSource('sourceSettings',renderSourceLayout(layout,{values:{txt_name:'游戏设置',txt:'当前账号:',player_name:p.name,userid:'您的ID:',userid_num:p.id,'musicOnBtn/txt_name':'声音开','musicOffBtn/txt_name':'声音关','qiehuanzhanghao/txt_name':'切换账号','node_btn_wtfk/txt_name':'联系客服'},hidden:new Set([on?'musicOffGou':'musicOnGou']),disabled:new Set([...(music&&sound?['musicOn','musicOnBtn/btn']:[]),...(!music&&!sound?['musicOff','musicOffBtn/btn']:[])]),actions:{close:{type:'close',label:'关闭设置'},musicOn:{type:'settingsSoundOn',label:'声音开'},musicOff:{type:'settingsSoundOff',label:'声音关'},'musicOnBtn/btn':{type:'settingsSoundOn',label:'声音开'},'musicOffBtn/btn':{type:'settingsSoundOff',label:'声音关'},'qiehuanzhanghao/btn':{type:'openLocalArchive',label:'切换账号'},'node_btn_wtfk/btn':{type:'settingsSupport',label:'联系客服'}}}),'source-original-settings');
}
export async function openSettingsSupport(version){
 const l=await sourceLayout('panel_msg_act');return showSource('sourceSettingsSupport',renderSourceLayout(l,{values:{txt_name:'联系客服','btn_QueDing/txt_name':'问题反馈'},hidden:new Set(['txt']),slots:{huadong:`<div class="source-activity-help-scroll"><p>御龙高手 v${version}</p><p>请向发包的维护者反馈问题，或前往项目问题反馈页面。</p><p>请附上游戏版本、问题截图和复现步骤。不要公开上传玩家存档。</p></div>`},actions:{btn_close:{type:'settings',label:'返回设置'},'btn_QueDing/btn':{type:'settingsFeedback',label:'打开项目问题反馈页面'}}}));
}
