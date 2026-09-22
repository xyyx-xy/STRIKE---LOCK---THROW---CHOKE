import * as THREE from '../../vendor/three.module.js';
export function createSky(scene){
 const sky=new THREE.Mesh(new THREE.SphereGeometry(150,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{},vertexShader:'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vPos;void main(){float h=smoothstep(-.05,.65,normalize(vPos).y);gl_FragColor=vec4(mix(vec3(.23,.29,.43),vec3(.055,.09,.20),h),1.);}'}));scene.add(sky);
}
