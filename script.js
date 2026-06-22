// ═══════════ PETALS ═══════════
(function(){
  for(let i=0;i<14;i++){
    const d=document.createElement('div');d.className='petal';
    const s=Math.random()*9+4,h=330+Math.random()*24;
    d.style.cssText=`width:${s}px;height:${s*2}px;background:hsl(${h},50%,78%);left:${Math.random()*100}%;top:-30px;animation-duration:${Math.random()*9+8}s;animation-delay:${Math.random()*8}s`;
    document.body.appendChild(d);
  }
})();

// ═══════════ AUDIO / MINI PLAYER ═══════════
const song = document.getElementById('loveSong');

function saveState(){
  sessionStorage.setItem('mp_time',    song.currentTime);
  sessionStorage.setItem('mp_playing', !song.paused);
  sessionStorage.setItem('mp_volume',  song.volume);
}
document.getElementById('navBack').addEventListener('click',(e)=>{e.preventDefault();saveState();window.location.href='reveal.html';});
window.addEventListener('beforeunload', saveState);
window.addEventListener('pagehide', saveState);

const savedTime  = parseFloat(sessionStorage.getItem('mp_time')    || '0');
const wasPlaying = sessionStorage.getItem('mp_playing') === 'true';
const savedVol   = parseFloat(sessionStorage.getItem('mp_volume')  || '1');
song.volume = savedVol;

function fmt(s){if(!s||isNaN(s))return'0:00';const m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}

song.addEventListener('loadedmetadata',()=>{ document.getElementById('mpDur').textContent=fmt(song.duration); });
song.addEventListener('timeupdate',()=>{
  const pct=song.duration?(song.currentTime/song.duration)*100:0;
  document.getElementById('mpSeek').value=pct;
  document.getElementById('mpCur').textContent=fmt(song.currentTime);
});
document.getElementById('mpSeek').addEventListener('input',e=>{ song.currentTime=(e.target.value/100)*song.duration; });
document.getElementById('mpVol').value=savedVol;
document.getElementById('mpVol').addEventListener('input',e=>{ song.volume=e.target.value; });

window.mpToggle=function(){const b=document.getElementById('mpPlayBtn');if(song.paused){song.play();b.textContent='||';}else{song.pause();b.textContent='▶';}};
window.mpRestart=function(){song.currentTime=0;song.play();document.getElementById('mpPlayBtn').textContent='||';};
window.mpStop=function(){song.pause();song.currentTime=0;document.getElementById('mpPlayBtn').textContent='▶';};

song.addEventListener('canplay',function onR(){
  song.removeEventListener('canplay',onR);
  if(savedTime>0)song.currentTime=savedTime;
  if(wasPlaying){song.play().catch(()=>{});document.getElementById('mpPlayBtn').textContent='||';}
},{once:true});

setTimeout(()=>document.getElementById('miniPlayer').classList.add('show'),500);

// ═══════════ BOUQUET CANVAS ═══════════
let W,H,CX,BASE;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
function resizeCanvas(){const w=document.getElementById('canvas-wrap');W=w.clientWidth;H=w.clientHeight;cv.width=W;cv.height=H;CX=W/2;BASE=H-50;}
const SD=[
  {aF:-.38,lF:.44,b:{n:6,col:'#e8a0b8',cen:'#f5d0b0',rF:.060},lAt:.55,lS:1,d:0},
  {aF:-.15,lF:.49,b:{n:6,col:'#d47a92',cen:'#f0c8a8',rF:.067},lAt:.50,lS:-1,d:180},
  {aF:.05, lF:.52,b:{n:7,col:'#c96080',cen:'#f2cdb5',rF:.074},lAt:.48,lS:1,d:60},
  {aF:.22, lF:.46,b:{n:6,col:'#dfa0ba',cen:'#f8d8b8',rF:.062},lAt:.52,lS:-1,d:280},
  {aF:-.55,lF:.39,b:{n:5,col:'#e8b4c4',cen:'#fce8d0',rF:.050},lAt:.60,lS:-1,d:350},
  {aF:.42, lF:.41,b:{n:5,col:'#d490a8',cen:'#f0d0c0',rF:.053},lAt:.58,lS:1,d:420},
  {aF:-.28,lF:.54,b:{n:6,col:'#c07888',cen:'#f5c8b8',rF:.064},lAt:.45,lS:1,d:130},
  {aF:.32, lF:.50,b:{n:6,col:'#e098b0',cen:'#f8d0b0',rF:.060},lAt:.50,lS:-1,d:240},
  {aF:-.68,lF:.35,b:{n:5,col:'#f0b8c8',cen:'#fde8d8',rF:.047},lAt:.62,lS:1,d:480},
  {aF:.60, lF:.37,b:{n:5,col:'#cc7890',cen:'#f2ccc0',rF:.049},lAt:.60,lS:-1,d:510},
];
function getStems(){return SD.map(s=>({angle:s.aF,len:H*s.lF,bloom:{...s.b,r:H*s.b.rF},leafAt:s.lAt,leafSide:s.lS,delay:s.d}));}
let startT=null,raf=null,STEMS=[];
const eO=t=>1-Math.pow(1-t,3),eOB=t=>{const c=1.4,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
function tip(s,p){const e=eO(Math.min(1,p));return{x:CX+Math.sin(s.angle)*s.len*e,y:BASE-s.len*e*Math.cos(s.angle)};}
function dStem(s,p){
  const e=eO(Math.min(1,p)),l=s.len*e,tx=CX+Math.sin(s.angle)*l,ty=BASE-l*Math.cos(s.angle);
  ctx.save();ctx.strokeStyle='#88a870';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(CX,BASE);
  ctx.bezierCurveTo(CX+Math.sin(s.angle)*l*.25,BASE-l*.35,CX+Math.sin(s.angle)*l*.7,BASE-l*.72,tx,ty);
  ctx.stroke();ctx.restore();
}
function dLeaf(s,sp,lp){
  if(lp<=0)return;
  const e=eO(Math.min(1,sp)),l=s.len*e,t=s.leafAt;
  const c1x=CX+Math.sin(s.angle)*l*.25,c1y=BASE-l*.35,c2x=CX+Math.sin(s.angle)*l*.7,c2y=BASE-l*.72;
  const tx=CX+Math.sin(s.angle)*l,ty=BASE-l*Math.cos(s.angle);
  const bx=Math.pow(1-t,3)*CX+3*Math.pow(1-t,2)*t*c1x+3*(1-t)*t*t*c2x+Math.pow(t,3)*tx;
  const by=Math.pow(1-t,3)*BASE+3*Math.pow(1-t,2)*t*c1y+3*(1-t)*t*t*c2y+Math.pow(t,3)*ty;
  const el=eO(Math.min(1,lp)),ll=60*el,pp=s.angle+Math.PI/2*s.leafSide;
  ctx.save();ctx.globalAlpha=el;ctx.fillStyle='#7ab870';
  ctx.beginPath();ctx.moveTo(bx,by);
  ctx.quadraticCurveTo(bx+Math.cos(pp)*ll,by+Math.sin(pp)*ll,bx+Math.cos(pp)*ll*.3,by+Math.sin(pp)*ll*.3+14*s.leafSide);
  ctx.fill();ctx.restore();
}
function dBloom(s,bp){
  if(bp<=0)return;
  const tp=tip(s,1),p=eOB(Math.min(1,bp)),n=s.bloom.n,r=s.bloom.r*p,spin=(1-bp)*Math.PI*1.2;
  ctx.save();ctx.translate(tp.x,tp.y);
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2-Math.PI/2+spin;
    ctx.save();ctx.rotate(a);ctx.fillStyle=s.bloom.col;ctx.globalAlpha=.82*Math.min(1,bp*1.5);
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.bezierCurveTo(-r*.42,-r*.35,-r*.38,-r*.92,0,-r*1.15);
    ctx.bezierCurveTo(r*.38,-r*.92,r*.42,-r*.35,0,0);ctx.fill();
    ctx.strokeStyle=shade(s.bloom.col,-18);ctx.lineWidth=1;ctx.globalAlpha=.3*Math.min(1,bp*1.5);ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha=Math.min(1,bp*1.8);
  const g=ctx.createRadialGradient(0,0,0,0,0,r*.5);
  g.addColorStop(0,s.bloom.cen);g.addColorStop(1,s.bloom.col);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*.42,0,Math.PI*2);ctx.fill();
  for(let i=0;i<n;i++){
    const sa=(i/n)*Math.PI*2+spin;
    ctx.strokeStyle='#b05060';ctx.lineWidth=1.2;ctx.globalAlpha=.45*Math.min(1,bp*2);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(sa)*r*.7,Math.sin(sa)*r*.7);ctx.stroke();
    ctx.fillStyle='#c06080';ctx.globalAlpha=.7*Math.min(1,bp*2);
    ctx.beginPath();ctx.arc(Math.cos(sa)*r*.72,Math.sin(sa)*r*.72,2.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function shade(hex,amt){let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgb(${Math.max(0,Math.min(255,r+amt))},${Math.max(0,Math.min(255,g+amt))},${Math.max(0,Math.min(255,b+amt))})`;}
function dRibbon(){
  ctx.save();ctx.strokeStyle='#e8b0b8';ctx.lineWidth=5;ctx.lineCap='round';ctx.globalAlpha=.5;
  ctx.beginPath();ctx.moveTo(CX-22,BASE+5);ctx.bezierCurveTo(CX-44,BASE-18,CX+44,BASE-18,CX+22,BASE+5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(CX-17,BASE+8);ctx.bezierCurveTo(CX-12,BASE+34,CX+12,BASE+34,CX+17,BASE+8);ctx.stroke();
  ctx.restore();
}
function frame(ts){
  if(!startT)startT=ts;
  const el=ts-startT;
  ctx.clearRect(0,0,W,H);
  dRibbon();let done=true;
  STEMS.forEach(s=>{
    const lc=el-s.delay;if(lc<0){done=false;return;}
    const sp=Math.min(1,lc/900),lp=Math.min(1,Math.max(0,(lc-550)/400)),bp=Math.min(1,Math.max(0,(lc-820)/750));
    dStem(s,sp);dLeaf(s,sp,lp);if(sp>=1)dBloom(s,bp);
    if(sp<1||lp<1||bp<1)done=false;
  });
  if(!done)raf=requestAnimationFrame(frame);
  else document.getElementById('again').style.opacity='1';
}
// Inside your go() function, add:
function go(){
  document.getElementById('landingStage').style.display='none';
  document.getElementById('garden').classList.add('on');

  setTimeout(()=>{
    document.getElementById('discordCard').classList.add('show');
    document.getElementById('robloxCard').classList.add('show');
    // Show the read letter button after cards appear
    document.getElementById('readLetterBtn').classList.add('show');
  },700);

  fetchLanyard();
  loadRobloxSection();
  rebloom();
}

// Add these functions at the bottom of your script:
function openLetter() {
  document.getElementById('letterModal').style.display = 'flex';
  document.getElementById('letterModal').style.animation = 'modalPop 0.5s ease';
}

function closeLetter() {
  document.getElementById('letterModal').style.display = 'none';
}

// Add click event for the read letter button
document.getElementById('readLetterBtn').addEventListener('click', openLetter);
function rebloom(){
  cancelAnimationFrame(raf);document.getElementById('again').style.opacity='0';
  resizeCanvas();STEMS=getStems();startT=null;raf=requestAnimationFrame(frame);
}

// ═══════════ LANYARD / DISCORD ═══════════
const DISCORD_ID='1447285371091288206';
const SL={online:'Online 🌸',idle:'Idle 🌙',dnd:'Do Not Disturb',offline:'Offline'};
function applyDcStatus(s){
  const dot=document.getElementById('dcDot'),pd=document.getElementById('dcPillDot'),pt=document.getElementById('dcPillText');
  ['online','idle','dnd','offline'].forEach(c=>{dot.classList.remove(c);pd.classList.remove(c);});
  dot.classList.add(s);pd.classList.add(s);pt.textContent=SL[s]||'Offline';
}
function fetchLanyard(){
  fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
    .then(r=>r.json()).then(d=>{
      if(!d.success)return;
      const u=d.data;
      document.getElementById('dcAvatarImg').src=`https://cdn.discordapp.com/avatars/${u.discord_user.id}/${u.discord_user.avatar}.png?size=128`;
      if(u.discord_user.global_name)document.getElementById('dcDisplayName').textContent=u.discord_user.global_name;
      applyDcStatus(u.discord_status||'offline');
      const ca=u.activities&&u.activities.find(a=>a.type===4);
      const cs=document.getElementById('dcCustom');
      if(ca&&ca.state){document.getElementById('dcCustEmoji').textContent=ca.emoji?ca.emoji.name||'💭':'💭';document.getElementById('dcCustText').textContent=ca.state;cs.style.display='flex';}
      else cs.style.display='none';
      const sp=document.getElementById('dcSpot');
      if(u.listening_to_spotify&&u.spotify){
        document.getElementById('dcSpotSong').textContent=u.spotify.song;
        document.getElementById('dcSpotArtist').textContent=u.spotify.artist;
        if(u.spotify.album_art_url)document.getElementById('dcSpotArt').src=u.spotify.album_art_url;
        sp.classList.add('show');
      } else sp.classList.remove('show');
    }).catch(()=>{});
  setTimeout(fetchLanyard,30000);
}

// ═══════════ ROBLOX (FIXED FOR RENDER) ═══════════

const API = window.location.origin; 
const TARGET_USER = "tanqr_headchot";

/* ================= SAFE FETCH ================= */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("Fetch failed:", url);
    return null;
  }
}

/* ================= GET USER ID ================= */
async function getUserId(username) {
  const data = await safeFetch(`${API}/userId`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  return data?.data?.[0]?.id || null;
}

/* ================= GET COUNTS ================= */
async function getFriendsCount(userId) {
  const data = await safeFetch(`${API}/friends/${userId}`);
  return data?.count ?? 0;
}

async function getFollowersCount(userId) {
  const data = await safeFetch(`${API}/followers/${userId}`);
  return data?.count ?? 0;
}

async function getFollowingCount(userId) {
  const data = await safeFetch(`${API}/following/${userId}`);
  return data?.count ?? 0;
}

/* ================= IMAGES ================= */
async function getHeadshot(userId) {
  const data = await safeFetch(
    `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`
  );

  return data?.data?.[0]?.imageUrl || null;
}

async function getAvatar(userId) {
  const data = await safeFetch(
    `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`
  );

  return data?.data?.[0]?.imageUrl || null;
}

/* ================= USER INFO ================= */
async function getUserInfo(userId) {
  return await safeFetch(`${API}/user/${userId}`);
}

/* ================= MAIN ================= */
async function loadRobloxSection() {
  try {
    // 1. GET TARGET USER ID
    const targetId = await getUserId(TARGET_USER);

    if (!targetId) {
      console.error("❌ Target user not found");
      return;
    }

    // 2. FETCH ALL DATA IN PARALLEL
    const [userInfo, friendsCount, followersCount, followingCount, headshot, avatar] =
      await Promise.all([
        getUserInfo(targetId),
        getFriendsCount(targetId),
        getFollowersCount(targetId),
        getFollowingCount(targetId),
        getHeadshot(targetId),
        getAvatar(targetId)
      ]);

    // 3. APPLY UI
    document.getElementById("rbDisplayName").textContent =
      userInfo?.displayName || TARGET_USER;

    document.getElementById("rbUsername").textContent =
      "@" + (userInfo?.name || TARGET_USER);

    document.getElementById("rbFriends").textContent = friendsCount;
    document.getElementById("rbFollowers").textContent = followersCount;
    document.getElementById("rbFollowing").textContent = followingCount;

    document.getElementById("rbJoined").textContent =
      `Joined ${userInfo?.created
        ? new Date(userInfo.created).toLocaleDateString()
        : "Unknown"}`;

    if (headshot) document.getElementById("rbHeadshot").src = headshot;
    if (avatar) document.getElementById("rbFullAvatar").src = avatar;

    document.getElementById("rbLastSeen").textContent =
      "Loaded from Render backend ✔";
  } catch (err) {
    console.error("Roblox section failed:", err);
  }
}
