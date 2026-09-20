import {CONTROLS,BINDING_MOVES,DEFAULT_BINDINGS,BINDINGS_KEY,loadBindings,validateBindings} from './bindings.js';

export function mountBindingEditor(onSave) {
  let storage;
  try { storage = localStorage; } catch {}
  let saved = loadBindings(storage);
  const panel = document.createElement('section');
  panel.id = 'binding-editor';
  const title = document.createElement('h3');
  title.textContent = '按键单招';
  const help = document.createElement('p');
  help.textContent = '每个按键独立选择一个单招。攻击按一次出一招；防守按住维持、松开解除。保存后生效。';
  const grid = document.createElement('div');
  grid.className = 'binding-grid';
  const selects = {};
  for (const [key,label] of Object.entries(CONTROLS)) {
    const row = document.createElement('label');
    row.textContent = label;
    const select = document.createElement('select');
    select.id = 'bind-' + key;
    select.setAttribute('aria-label', label + '单招');
    for (const [id,move] of Object.entries(BINDING_MOVES)) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = move.label;
      select.append(option);
    }
    select.value = saved[key];
    select.onchange = () => message.textContent = '按键设置尚未保存';
    selects[key] = select;
    row.append(select);
    grid.append(row);
  }
  const message = document.createElement('p');
  message.id = 'binding-message';
  message.setAttribute('role','status');
  const save = document.createElement('button');
  save.type = 'button'; save.textContent = '保存按键设置';
  save.onclick = () => {
    saved = validateBindings(Object.fromEntries(Object.entries(selects).map(([key,select]) => [key,select.value])));
    onSave(saved);
    try { storage.setItem(BINDINGS_KEY,JSON.stringify(saved)); message.textContent = '按键设置已保存'; }
    catch { message.textContent = '本次游戏已生效；浏览器不允许持久保存'; }
  };
  const reset = document.createElement('button');
  reset.type = 'button'; reset.textContent = '填入默认按键';
  reset.onclick = () => {
    for (const key of Object.keys(CONTROLS)) selects[key].value = DEFAULT_BINDINGS[key];
    message.textContent = '已填入默认值，保存后生效';
  };
  panel.append(title,help,grid,save,reset,message);
  document.querySelector('#combo-editor > p').after(panel);
  return saved;
}
