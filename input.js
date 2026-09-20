export const INPUT_RE=/^(Mouse\d+|Pad\d+|[A-Za-z][A-Za-z0-9]*)$/;
export function inputLabel(id){
  if(/^Mouse[0-4]$/.test(id))return['鼠标左键','鼠标中键','鼠标右键','鼠标侧键4','鼠标侧键5'][Number(id.slice(5))];
  if(/^Mouse\d+$/.test(id))return'鼠标键 '+id.slice(5);
  if(/^Pad\d+$/.test(id))return'手柄按键 '+(Number(id.slice(3))+1);
  const special={Space:'空格',Enter:'回车',Tab:'Tab',Backspace:'退格',ShiftLeft:'左Shift',ShiftRight:'右Shift',ControlLeft:'左Ctrl',ControlRight:'右Ctrl',AltLeft:'左Alt',AltRight:'右Alt',ArrowUp:'上箭头',ArrowDown:'下箭头',ArrowLeft:'左箭头',ArrowRight:'右箭头',Comma:'逗号',Period:'句号',Slash:'斜杠',Semicolon:'分号',Quote:'引号',BracketLeft:'左括号',BracketRight:'右括号',Backslash:'反斜杠',Minus:'减号',Equal:'等号',Backquote:'反引号'};
  if(special[id])return special[id];
  if(/^Digit\d$/.test(id))return id.slice(5);
  if(/^Key[A-Z]$/.test(id))return id.slice(3);
  return id;
}
export function captureInput(onInput){
  let raf=0,stopped=false;
  const stop=()=>{if(stopped)return;stopped=true;window.removeEventListener('keydown',key,true);window.removeEventListener('mousedown',mouse,true);cancelAnimationFrame(raf);};
  const key=e=>{e.preventDefault();e.stopPropagation();stop();onInput(e.code);};
  const mouse=e=>{e.preventDefault();e.stopPropagation();stop();onInput('Mouse'+e.button);};
  const pad=()=>{if(stopped)return;for(const g of(navigator.getGamepads?navigator.getGamepads():[]))if(g)for(let i=0;i<g.buttons.length;i++)if(g.buttons[i]&&g.buttons[i].pressed){stop();onInput('Pad'+i);return;}raf=requestAnimationFrame(pad);};
  window.addEventListener('keydown',key,true);window.addEventListener('mousedown',mouse,true);raf=requestAnimationFrame(pad);
  return stop;
}
