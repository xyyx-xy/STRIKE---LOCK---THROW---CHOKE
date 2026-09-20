// Full-resolution, multisampled scene composite. No vertex snapping or palette quantization.
import * as T from './vendor/three.module.js';
export function snapify(material){return material;} // Compatibility for older local imports.
export class ScenePass {
 constructor(renderer){this.renderer=renderer;this.rt=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter});this.rt.samples=Math.min(4,renderer.capabilities.maxSamples);const clear=new T.DataTexture(new Uint8Array([255,255,255,0]),1,1);clear.needsUpdate=true;
 this.mat=new T.ShaderMaterial({uniforms:{tDiffuse:{value:this.rt.texture},tBlood:{value:clear},blood:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D tDiffuse,tBlood;uniform float blood;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;vec4 b=texture2D(tBlood,vUv);float edge=smoothstep(.16,.65,length(vUv-.5));c=mix(c,c*vec3(.65,.12,.10),b.a*blood*edge*.6);gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,depthTest:false,depthWrite:false});
 // Shader chunk directives must start on their own line.
 this.mat.fragmentShader=this.mat.fragmentShader.replace(';#include',';\n#include');this.scene=new T.Scene();this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.mat));this.camera=new T.Camera();}
 resize(){const size=this.renderer.getDrawingBufferSize(new T.Vector2());this.rt.setSize(size.x,size.y);}
 begin(){this.renderer.setRenderTarget(this.rt);this.renderer.clear();}
 present(){this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);}
}
export {ScenePass as Retro};
