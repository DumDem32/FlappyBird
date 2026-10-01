const c=document.getElementById("game"),ctx=c.getContext("2d");
ctx.imageSmoothingEnabled=false;

const W=c.width,H=c.height;
const GROUND=70;
const bird={x:72,y:220,w:26,h:20,vy:0,rot:0};
const state={mode:"ready",score:0,best:Number(localStorage.flappyCloneBest||0),speed:2.5,frame:0};
let pipes=[],last=0;

function reset(){
  bird.y=220; bird.vy=0; bird.rot=0;
  pipes=[]; state.score=0; state.mode="ready"; state.frame=0;
}
function flap(){
  if(state.mode==="gameover"){reset(); state.mode="playing";}
  else if(state.mode==="ready") state.mode="playing";
  bird.vy=-7.2;
}
function addPipe(){
  const gap=104;
  const min=65,max=H-GROUND-gap-25;
  const top=min+Math.random()*(max-min);
  pipes.push({x:W+10,top,gap,passed:false});
}
function hit(){
  const bx=bird.x+3,by=bird.y+3,bw=bird.w-6,bh=bird.h-6;
  if(by+bh>=H-GROUND || by<=0)return true;
  for(const p of pipes){
    const inX=bx+bw>p.x && bx<p.x+52;
    const inY=by<p.top || by+bh>p.top+p.gap;
    if(inX&&inY)return true;
  }
  return false;
}
function update(dt){
  if(state.mode!=="playing")return;
  state.frame+=dt;
  bird.vy+=0.38*dt;
  bird.y+=bird.vy*dt;
  bird.rot=Math.max(-0.5,Math.min(1.35,bird.vy/10));

  if(state.frame>=92){addPipe();state.frame=0}
  for(const p of pipes){
    p.x-=state.speed*dt;
    if(!p.passed&&p.x+52<bird.x){p.passed=true;state.score++}
  }
  pipes=pipes.filter(p=>p.x>-60);
  if(hit()){
    state.mode="gameover";
    if(state.score>state.best){state.best=state.score;localStorage.flappyCloneBest=state.best}
  }
}
function rect(x,y,w,h,fill,stroke){
  ctx.fillStyle=fill;ctx.fillRect(Math.round(x),Math.round(y),w,h);
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(Math.round(x)+1,Math.round(y)+1,w-2,h-2)}
}
function drawBackground(){
  ctx.fillStyle="#70c5ce";ctx.fillRect(0,0,W,H);
  // simple pixel clouds
  ctx.fillStyle="#fff8";
  for(const q of [[20,70,42,12],[35,62,30,15],[205,105,45,12],[220,97,25,15]])rect(...q,"#fff");
  // distant hills
  ctx.fillStyle="#8bd46e";
  for(let x=-20;x<W;x+=80){ctx.beginPath();ctx.arc(x,455,60,Math.PI,0);ctx.fill()}
}
function drawPipe(p){
  const cap=58;
  // original pixel-art-inspired green pipe design
  rect(p.x,p.top-2,52,cap,"#55b83e","#287d27");
  rect(p.x-4,p.top-2,60,15,"#63c94a","#287d27");
  rect(p.x,p.top+p.gap,52,H-GROUND-(p.top+p.gap),"#55b83e","#287d27");
  rect(p.x-4,p.top+p.gap,60,15,"#63c94a","#287d27");
  ctx.fillStyle="#8be56d";ctx.fillRect(p.x+7,p.top+13,7,Math.max(0,p.gap-13));
}
function drawBird(){
  ctx.save();ctx.translate(bird.x+bird.w/2,bird.y+bird.h/2);ctx.rotate(bird.rot);
  // original pixel-art bird
  rect(-13,-8,23,16,"#ffd83d","#8f6c00");
  rect(-5,1,11,7,"#f0a52a","#8f6c00");
  rect(5,-7,8,8,"#fff","#333");
  rect(8,-6,4,4,"#222");
  rect(10,-1,10,5,"#f07b20","#8f3b00");
  rect(-14,-1,6,6,"#f6a62b","#8f6c00");
  ctx.restore();
}
function centerText(text,y,size,fill="#fff",stroke="#333"){
  ctx.font=`bold ${size}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.lineWidth=3;ctx.strokeStyle=stroke;ctx.strokeText(text,W/2,y);
  ctx.fillStyle=fill;ctx.fillText(text,W/2,y);
}
function draw(){
  drawBackground();
  for(const p of pipes)drawPipe(p);
  // ground
  rect(0,H-GROUND,W,18,"#ded895","#776b32");
  rect(0,H-GROUND+18,W,GROUND-18,"#e9c96c");
  for(let x=0;x<W;x+=32)rect(x,H-GROUND+20,16,4,"#d1ae54");
  drawBird();

  if(state.mode==="ready"){
    centerText("FLAPPY CLONE",150,25);
    centerText("CLICK / TAP / SPACE",180,13,"#fff");
    centerText("BEST: "+state.best,205,16,"#fff");
  }else{
    centerText(String(state.score),45,34);
  }
  if(state.mode==="gameover"){
    rect(43,185,202,125,"#f8f0d0","#704b2a");
    centerText("GAME OVER",215,25,"#d34b3e","#5b2d25");
    ctx.font="bold 14px Arial";ctx.textAlign="center";ctx.fillStyle="#333";
    ctx.fillText(`SCORE  ${state.score}`,W/2,245);
    ctx.fillText(`BEST  ${state.best}`,W/2,267);
    ctx.font="12px Arial";ctx.fillText("CLICK / TAP / SPACE",W/2,291);
  }
}
function loop(t){
  const dt=Math.min(2,(t-last)/16.666||1);last=t;
  update(dt);draw();requestAnimationFrame(loop);
}
function input(e){e.preventDefault();flap()}
addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp")input(e)});
c.addEventListener("pointerdown",input);
reset();requestAnimationFrame(loop);
