// Keep idle uncluttered, but show the complete attacking leg until recovery ends.
export function updateViewVisibility(rig,attack){
 const leg=attack?.type==='kick'?(attack.side?'R':'L'):null;
 for(const {mesh,link} of rig.parts)mesh.visible=['Lelbow','Relbow'].includes(link[0])||!!leg&&[leg+'hip',leg+'knee'].includes(link[0]);
 for(const [name,mesh]of Object.entries(rig.joints))mesh.visible=['Lelbow','Relbow','Lwrist','Rwrist'].includes(name)||!!leg&&[leg+'hip',leg+'knee',leg+'ankle'].includes(name);
 for(const [name,mesh]of Object.entries(rig.ends))mesh.visible=name===leg+'ankle';
 for(const s of['L','R'])if(rig.hands[s])rig.hands[s].group.visible=true;
}
