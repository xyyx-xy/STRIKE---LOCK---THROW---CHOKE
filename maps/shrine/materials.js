import * as THREE from '../../vendor/three.module.js';
const ramp = new THREE.DataTexture(new Uint8Array([110, 166, 211, 250]), 4, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
export const wind = { value: 0 };
export function toon(color, extra = {}) { return new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra }); }
export const mat = {
 red:toon('#be3d2b'), redLight:toon('#df5940'), dark:toon('#302f2b'), wood:toon('#685043'), woodLight:toon('#98714b'),
 wall:toon('#eee6cf'), roof:toon('#344447'), roofEdge:toon('#202e32'), stone:toon('#829189'), stoneLight:toon('#a5afa0'),
 earth:toon('#a9a185'), soil:toon('#737c58'), moss:toon('#657e49'), grass:toon('#738d4b', {side:THREE.DoubleSide}),
 leaf:toon('#3e7051'), leafLight:toon('#739454'), cedar:toon('#315d4f'), bark:toon('#564d3d'),
 maple:toon('#c07745'), rope:toon('#c8b58a'), paper:toon('#fff5d6',{side:THREE.DoubleSide}), gold:toon('#c1a25b'),
 glow:toon('#ffe0a0',{emissive:'#ffb943',emissiveIntensity:0.45}), water:toon('#638f89',{transparent:true,opacity:0.86}),
};
// Wind is in the vertex shader: thousands of blades retain one draw call.
for (const key of ['grass','leaf','leafLight','cedar','maple']) {
 mat[key].onBeforeCompile = shader => {
  shader.uniforms.uWind = wind;
  shader.vertexShader = 'uniform float uWind;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float phase = position.x * 1.7 + position.z * 2.1;
    #ifdef USE_INSTANCING
      phase += instanceMatrix[3].x * .7 + instanceMatrix[3].z * .3;
    #endif
    transformed.x += sin(uWind * .85 + phase) * .035 * max(position.y, 0.0);`);
 };
 mat[key].customProgramCacheKey = () => 'quiet-wind-v1';
}
