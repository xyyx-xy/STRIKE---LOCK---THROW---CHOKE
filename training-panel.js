import {loadTraining,validateTraining} from './training.js';
export function mountTrainingPanel(storage,onChange,onReset) {
  let config=loadTraining(storage);
  const panel=document.createElement('section');panel.id='training-panel';panel.hidden=true;
  panel.innerHTML=`<h3>训练控制 <small>TRAINING LAB</small></h3><p>设置自动保存；修改后重置练习。人数设为 0 可独自演示动作。</p>
    <div class="training-grid">
      <label>敌人数量 <input name="count" type="number" min="0" max="10" step="1"></label>
      <label>敌人招式 <select name="move"><option value="punch">直拳</option><option value="palm">掌击</option><option value="hook">摆拳</option><option value="uppercut">勾拳</option><option value="kick">正蹬</option><option value="snapKick">弹腿</option><option value="mixed">混合招式</option></select></label>
      <label>敌人防守 <select name="guard"><option value="none">不防守</option><option value="head">头部防守</option><option value="torso">三战躯干防守</option><option value="auto">自动防守</option></select></label>
      <label><input name="moving" type="checkbox">敌人主动追击</label>
      <label><input name="attacking" type="checkbox">敌人主动出招</label>
      <label><input name="invincible" type="checkbox">玩家无限生命</label>
      <label><input name="respawn" type="checkbox">敌人倒地 3 秒后补充</label>
    </div><button type="button" id="training-reset">重置练习 · 恢复双方 / 清理场地</button><p role="status" id="training-status"></p>`;
  document.querySelector('.preferences').before(panel);
  const controls=[...panel.querySelectorAll('[name]')];
  const render=()=>{for(const el of controls){if(el.type==='checkbox')el.checked=config[el.name];else el.value=config[el.name];}};
  panel.addEventListener('change',()=>{
    config=validateTraining(Object.fromEntries(controls.map(el=>[el.name,el.type==='checkbox'?el.checked:el.value])));render();
    let message='已自动保存 · 练习已重置';
    try{storage.setItem('da-ji-tou-jiao.training',JSON.stringify(config));}catch{message='本次已生效，浏览器未能保存设置';}
    onChange(config);panel.querySelector('[role=status]').textContent=message;
  });
  panel.querySelector('button').onclick=()=>{onReset();panel.querySelector('[role=status]').textContent='双方已恢复，血迹与倒地角色已清理';};
  render();return {get config(){return config;},setVisible(value){panel.hidden=!value;}};
}
