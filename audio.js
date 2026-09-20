// Procedural layered Foley: air, palm slap, low body impact, floor impact.
export class FightAudio {
 constructor(){this.volume=.65;}
 unlock(){try{if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=8;this.master.connect(limiter);limiter.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}this.master.gain.value=this.volume;this.ctx.resume();}catch{}}
 play(kind,side=0){this.unlock();if(!this.ctx)return;const c=this.ctx,t=c.currentTime,pan=c.createStereoPanner();pan.pan.value=side===0?-.18:.18;pan.connect(this.master);setTimeout(()=>pan.disconnect(),800);
 const tone=(hz,end,length,gain,delay=0)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(hz,t+delay);o.frequency.exponentialRampToValueAtTime(end,t+delay+length);g.gain.setValueAtTime(.001,t+delay);g.gain.linearRampToValueAtTime(gain,t+delay+.006);g.gain.exponentialRampToValueAtTime(.001,t+delay+length);o.connect(g);g.connect(pan);o.start(t+delay);o.stop(t+delay+length);o.onended=()=>{o.disconnect();g.disconnect();};};
 const noise=(hz,length,gain,delay=0,type='bandpass')=>{const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=this.noise;f.type=type;f.frequency.setValueAtTime(hz,t+delay);f.frequency.exponentialRampToValueAtTime(hz*.45,t+delay+length);f.Q.value=.65;g.gain.setValueAtTime(.001,t+delay);g.gain.linearRampToValueAtTime(gain,t+delay+.008);g.gain.exponentialRampToValueAtTime(.001,t+delay+length);n.connect(f);f.connect(g);g.connect(pan);n.start(t+delay,Math.random()*.5,length);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};};
 if(kind==='wave'){tone(110,110,.20,.17);tone(165,165,.24,.15,.14);}
 else if((kind==='swing-palm'||kind==='swing-punch'))noise(900,.12,.18,0,'highpass');
 else if(kind==='swing-kick')noise(900,.15,.24,0,'highpass');
else if((kind==='palm'||kind==='punch')){tone(85,38,.16,.65);noise(220,.10,.40,0,'lowpass');noise(2100,.045,.46);noise(950,.14,.30,.03);noise(150,.2,.24,.04,'lowpass');}
  else if(kind==='kick'){tone(85,32,.22,.85);noise(220,.13,.52,0,'lowpass');noise(1100,.065,.38);tone(62,25,.2,.20,.025);noise(950,.18,.34,.05);noise(120,.28,.3,.06,'lowpass');}
  else if(kind==='down'){tone(75,27,.34,.6,.04);noise(360,.22,.5,.04);noise(90,.5,.34,.05,'lowpass');noise(700,.3,.26,.06);tone(52,20,.4,.3,.08);}
 else if(kind==='hurt'){tone(100,40,.17,.35);noise(500,.11,.32);}
 }
}
