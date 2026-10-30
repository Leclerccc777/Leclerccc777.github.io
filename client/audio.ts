// Synthesized only. No audio assets, network calls or autoplay.
let ctx:AudioContext|undefined;
export function playSound(kind:'select'|'flip'|'drag'|'open'){
 try{ctx ||= new AudioContext();if(ctx.state==='suspended')void ctx.resume();const t=ctx.currentTime;
 const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.14);g.connect(ctx.destination);
 const o=ctx.createOscillator();o.type='triangle';o.frequency.setValueAtTime(kind==='flip'?380:kind==='open'?640:160,t);o.frequency.exponentialRampToValueAtTime(65,t+.11);o.connect(g);o.start(t);o.stop(t+.15);
 const buffer=ctx.createBuffer(1,ctx.sampleRate*.09,ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*6);
 const noise=ctx.createBufferSource();noise.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=kind==='drag'?800:1900;filter.Q.value=.7;noise.connect(filter);filter.connect(g);noise.start(t);noise.stop(t+.1);
 }catch{/* Audio support never blocks navigation. */}
}
export function suspendAudio(){if(ctx)void ctx.suspend();}
