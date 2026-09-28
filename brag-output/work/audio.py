import numpy as np, wave
sr=44100; T=20.0; n=int(sr*T); t=np.arange(n)/sr
out=np.zeros(n)
def note(f,a,b,amp,atk=.6,rel=.8):
    s,e=int(a*sr),min(n,int(b*sr)); tt=np.arange(e-s)/sr; d=b-a
    env=np.minimum(1,tt/atk)*np.clip((d-tt)/rel,0,1)
    w=sum(np.sin(2*np.pi*f*k*tt+k)/k**1.6 for k in (1,2,3))
    out[s:e]+=amp*env*w
# pad: Am F C G, 5s each (A minor)
chords=[[220,261.63,329.63],[174.61,220,261.63],[196*1.3348,261.63,329.63],[196,246.94,293.66]]
for i,c in enumerate(chords):
    for f in c: note(f,i*5,i*5+5.4,.05,atk=1.2,rel=1.5); note(f/2,i*5,i*5+5.4,.03,atk=1.2,rel=1.5)
# soft pulse 120bpm from 3.2 to 18.4
for b in np.arange(3.2,18.4,.5):
    s=int(b*sr); L=int(.25*sr); tt=np.arange(L)/sr
    out[s:s+L]+=.12*np.sin(2*np.pi*(55+60*np.exp(-tt*30))*tt)*np.exp(-tt*14)
# arp plucks on highlights
arp=[440,523.25,659.25,523.25]
for j,b in enumerate(np.arange(6.8,15.6,.25)):
    note(arp[j%4]*(0.75 if b>=11.8 else 1),b,b+.3,.025,atk=.005,rel=.28)
rng=np.random.default_rng(1)
def whoosh(c,d=.7,amp=.18):
    s=int((c-d/2)*sr); L=int(d*sr); x=rng.standard_normal(L)
    x=np.convolve(x,np.ones(30)/30,'same'); env=np.sin(np.pi*np.arange(L)/L)**2
    out[s:s+L]+=amp*x*env
for c in (3.2,6.8,15.8): whoosh(c)
# typing ticks
for k in range(9):
    s=int((.25+k*.8/9)*sr); L=int(.03*sr); out[s:s+L]+=.05*rng.standard_normal(L)*np.exp(-np.arange(L)/sr*200)
# stale flip: soft low two-note
note(329.63,11.8,12.6,.06,atk=.01,rel=.7); note(311.13,12.0,12.9,.05,atk=.01,rel=.8)
# outro swell + resolve on A
note(110,18.4,20,.08,atk=.3,rel=1.2); note(440,18.7,20,.04,atk=.02,rel=1.2); note(659.25,18.7,20,.03,atk=.02,rel=1.2)
# simple reverb-ish echo
for dl,g in ((.11,.25),(.23,.15),(.37,.08)):
    k=int(dl*sr); out[k:]+=g*out[:-k].copy()
out*=np.minimum(1,t/.3)*np.clip((T-t)/.8,0,1)
out=np.tanh(out*1.4); out/=np.abs(out).max()/.85
w=wave.open('audio.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
