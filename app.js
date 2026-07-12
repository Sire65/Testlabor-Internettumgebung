const FRITZ_PROFILES=[{"id": "6690-cable", "name": "FRITZ!Box 6690 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DVB-C", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6670-cable", "name": "FRITZ!Box 6670 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6660-cable", "name": "FRITZ!Box 6660 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6591-cable", "name": "FRITZ!Box 6591 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 5", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DVB-C", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "7690-dsl", "name": "FRITZ!Box 7690", "access": "dsl", "docsis": null, "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["DSL", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "7590ax-dsl", "name": "FRITZ!Box 7590 AX", "access": "dsl", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DSL", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5690pro-fiber", "name": "FRITZ!Box 5690 Pro", "access": "fiber-dsl", "docsis": null, "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "DSL", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5590-fiber", "name": "FRITZ!Box 5590 Fiber", "access": "fiber", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5530-fiber", "name": "FRITZ!Box 5530 Fiber", "access": "fiber", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "4060-wan", "name": "FRITZ!Box 4060", "access": "wan", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}];
const $=id=>document.getElementById(id);
const EXTRA_ROUTER_PROFILES=[
 {id:"speedport-smart4",name:"Telekom Speedport Smart 4",access:"dsl-wan",docsis:null,wifi:"Wi-Fi 6",tr064:false,defaultHost:"speedport.ip",features:["DSL","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"vodafone-station",name:"Vodafone Station",access:"cable",docsis:"3.1",wifi:"Wi-Fi 5/6",tr064:false,defaultHost:"192.168.0.1",features:["DOCSIS","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"easybox-805",name:"Vodafone EasyBox 805",access:"dsl-wan",docsis:null,wifi:"Wi-Fi 5",tr064:false,defaultHost:"easy.box",features:["DSL","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"tp-link-archer",name:"TP-Link Archer / Deco",access:"wan-mesh",docsis:null,wifi:"modellabhaengig",tr064:false,defaultHost:"tplinkwifi.net",features:["WAN","Mesh","WLAN"],recommended:{interval:15,deep:60}},
 {id:"custom-router",name:"Eigenes Routermodell",access:"custom",docsis:null,wifi:"unbekannt",tr064:false,defaultHost:"192.168.1.1",features:["WAN","DNS","Ping"],recommended:{interval:15,deep:60}}
];

// V4.2.7 - ruhigerer Normalpuls, deutlicher Herzschlag, Leitstand/Buero regressionsgeschuetzt
let lagState={last:performance.now(),current:0,max:0,history:[],longTasks:0};
let operationState={active:false,title:"SYSTEMBEREITSCHAFT",detail:"Warte auf ersten Messzyklus ...",result:"Noch kein Ergebnis",next:"FRITZ!Box pruefen",last:"-",step:0};
let deepTimer=null;
function testOn(id){return S.settings.master!==false&&S.settings[id]!==false}
function animationsOn(){return S.settings.master!==false&&S.settings.animations!==false}
try{
 new PerformanceObserver(list=>{lagState.longTasks+=list.getEntries().length}).observe({type:"longtask",buffered:false});
}catch{}
function lagTick(){
 const now=performance.now();
 if(!testOn("lag")){lagState.last=now;lagState.current=0;renderLag();return}
 const delay=Math.max(0,now-lagState.last-1000);
 lagState.last=now;lagState.current=delay;lagState.max=Math.max(lagState.max,delay);
 lagState.history.push(delay);if(lagState.history.length>90)lagState.history.shift();
 renderLag();
}
setInterval(lagTick,1000);
function renderLag(){
 const stopped=!testOn("lag"),v=lagState.current,l=stopped?"gray":v>=1000?"red":v>=250?"yellow":"green";
 if($("lagValue")){$("lagValue").textContent=stopped?"AUS":Math.round(v)+" ms";$("lagValue").className="lag-value "+l}
 if($("lagFill"))$("lagFill").style.width=Math.min(100,v/15)+"%";
 if($("lagExplain"))$("lagExplain").textContent=stopped?"Lag-Test ausgeschaltet - es wird nichts aufgezeichnet.":l==="green"?"Der Leitstand reagiert normal.":l==="yellow"?"Spuerbare Verzoegerung erkannt.":"Starker Haenger im PC oder Browser erkannt.";
 const c=$("lagHistory");if(c){const x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.strokeStyle="#28495b";for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,h*i/4);x.lineTo(w,h*i/4);x.stroke()}const max=Math.max(250,...lagState.history);x.strokeStyle=l==="red"?"#ff4c3e":l==="yellow"?"#ffd02f":"#2cdb74";x.lineWidth=2;x.beginPath();lagState.history.forEach((n,i)=>{let px=i/(lagState.history.length-1||1)*w,py=h-Math.min(1,n/max)*h*.9;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
}
const OP_STEPS=[
 ["FRITZ!BOX PRUEFEN","Erreichbarkeit und Antwortzeit im Heimnetz","Internetziele vergleichen"],
 ["INTERNETZIELE PRUEFEN","Cloudflare, Google und Quad9 werden verglichen","IPv4 und IPv6 pruefen"],
 ["IP-PROTOKOLLE PRUEFEN","IPv4 und IPv6 werden getrennt getestet","DNS-Aufloesung pruefen"],
 ["DNS PRUEFEN","Namensaufloesung und Antwortzeiten werden kontrolliert","Paketverlust und Jitter messen"],
 ["VERBINDUNGSQUALITAET PRUEFEN","Paketverlust, Jitter, P95 und P99 werden berechnet","PC-System pruefen"],
 ["PC-SYSTEM PRUEFEN","CPU, RAM und Datentraeger werden abgefragt","Ergebnisse bewerten"],
 ["URSACHE BEWERTEN","Alle Messkreise werden zeitlich verglichen","Naechsten Zyklus vorbereiten"]
];
function setOperation(step,status="running",result=""){
 operationState.step=step%OP_STEPS.length;const o=OP_STEPS[operationState.step];
 operationState.title=o[0];operationState.detail=o[1];operationState.next=o[2];operationState.active=status==="running";
 if(result)operationState.result=result;
 if(status==="done"){operationState.last=o[0]+" abgeschlossen";operationState.lastTime=new Date().toLocaleTimeString("de-DE");}
 renderOperation();
}

let ekgPhase=0;
let vitalsMemory={everHadData:false,lastDataAt:0,lastState:"standby"};
function alarmLoad(d=S.latest.snapshot||{}){
 const q=d.quality||{},sys=d.system||{},targets=Object.values(d.targets||{});
 let red=0,yellow=0;
 if(d.ok===false)yellow++;
 if(d.router?.ok===false)red++;
 if(targets.length&&targets.filter(x=>x.ok).length===0)red++;
 if((q.lossPct||0)>=5)red++;else if((q.lossPct||0)>0)yellow++;
 if((q.p95JitterMs||0)>=50)red++;else if((q.p95JitterMs||0)>=20)yellow++;
 if((sys.cpuPct||0)>=95)red++;else if((sys.cpuPct||0)>=80)yellow++;
 if((sys.memPct||0)>=95)red++;else if((sys.memPct||0)>=85)yellow++;
 if((sys.diskPct||0)>=95)red++;else if((sys.diskPct||0)>=80)yellow++;
 if(S.deep)yellow++;
 return {red,yellow,total:red*2+yellow};
}
function snapshotTime(d){
 const raw=d.ts??d.timestamp??d.at??d.measuredAt??d.createdAt;
 if(typeof raw==="number")return raw<1e12?raw*1000:raw;
 const parsed=raw?Date.parse(raw):NaN;
 return Number.isFinite(parsed)?parsed:0;
}
function classifyVitals(d=S.latest.snapshot||{}){
 const a=alarmLoad(d),hasData=Object.keys(d||{}).length>0;
 if(hasData){vitalsMemory.everHadData=true;vitalsMemory.lastDataAt=snapshotTime(d)||Date.now()}
 const stale=vitalsMemory.everHadData&&vitalsMemory.lastDataAt&&Date.now()-vitalsMemory.lastDataAt>90000;
 let state="normal",label="NORMALER SYSTEMRHYTHMUS",bpm=60,color="#2cdb74";
 if(S.settings.master===false){state="off";label="MESSUNGEN AUS";bpm=0;color="#71818b"}
 else if(stale){state="signal";label="MESSSIGNAL VERLOREN";bpm=0;color="#ff9d36"}
 else if(!hasData){state="standby";label="WARTET AUF MESSDATEN";bpm=0;color="#5aa7c7"}
 else if(a.red>=5){state="asystole";label="KEINE SYSTEMAKTIVITAET";bpm=0;color="#ff6658"}
 else if(a.red>=2||(a.red>=1&&a.yellow>=2)){state="vf";label="KRITISCHER SYSTEMRHYTHMUS";bpm=Math.min(220,175+a.red*7+a.yellow*3);color="#ff4c3e"}
 else if(a.red===1||a.yellow>0){state="warning";label="SYSTEMBELASTUNG ERHOEHT";bpm=Math.min(125,82+a.yellow*8+a.red*20+(S.deep?8:0));color="#ffd02f"}
 vitalsMemory.lastState=state;
 return {...a,state,label,bpm,color};
}
function syncVitals(d=S.latest.snapshot||{}){
 const v=classifyVitals(d);
 const speed=v.bpm>0?60/v.bpm:1.2;
 const scan=Math.max(.42,3.2-v.yellow*.25-v.red*.48-(S.deep?0.25:0));
 document.documentElement.style.setProperty("--heart-speed",speed+"s");
 document.documentElement.style.setProperty("--scan-speed",scan+"s");
 document.documentElement.style.setProperty("--glass-speed",Math.max(.7,3.4-v.total*.24)+"s");
 document.documentElement.style.setProperty("--scan-color",v.color);
 document.body.classList.toggle("heart-red",v.state==="vf"||v.state==="asystole");
 document.body.classList.toggle("heart-yellow",v.state==="warning");
 document.body.classList.toggle("heart-flat",v.state==="asystole"||v.state==="signal"||v.state==="off"||v.state==="standby");
 document.body.classList.toggle("heart-vf",v.state==="vf");
 document.body.classList.toggle("animations-off",!animationsOn());
 if($("pulseBpm"))$("pulseBpm").textContent=v.bpm?`Puls ${Math.round(v.bpm)}/min · ${v.label}`:v.label;
 const box=document.querySelector(".head-pulse");if(box){box.dataset.rhythm=v.state;box.setAttribute("aria-label",v.label)}
 return v;
}
function ekgWave(phase,amplitude){
 const g=(center,width,height)=>height*Math.exp(-Math.pow((phase-center)/width,2));
 return g(.18,.035,-.10*amplitude)+g(.365,.012,.18*amplitude)+g(.395,.010,-1.00*amplitude)+g(.425,.014,.42*amplitude)+g(.68,.060,-.24*amplitude);
}
function deterministicNoise(t){
 return Math.sin(t*.019)*.48+Math.sin(t*.047+1.2)*.31+Math.sin(t*.113+2.7)*.21+Math.sin(t*.271+.4)*.12;
}
function drawGrid(x,w,h){
 x.strokeStyle="#17394a";x.lineWidth=1;
 for(let gx=0;gx<w;gx+=16){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h);x.stroke()}
 for(let gy=0;gy<h;gy+=16){x.beginPath();x.moveTo(0,gy);x.lineTo(w,gy);x.stroke()}
}
function drawScanHead(x,w,py,color,intensity=1){
 const gx=x.createRadialGradient(w-5,py,0,w-5,py,18);
 gx.addColorStop(0,color);gx.addColorStop(.22,color);gx.addColorStop(1,"transparent");
 x.fillStyle=gx;x.globalAlpha=.8*intensity;x.fillRect(w-28,Math.max(0,py-22),28,44);x.globalAlpha=1;
 x.fillStyle=color;x.beginPath();x.arc(w-5,py,2.2*intensity,0,Math.PI*2);x.fill();
}
function drawEKG(ts=0){
 const c=$("ekgCanvas");if(!c){requestAnimationFrame(drawEKG);return}
 const x=c.getContext("2d"),w=c.width=c.clientWidth||210,h=c.height=c.clientHeight||52;
 x.clearRect(0,0,w,h);drawGrid(x,w,h);
 const v=syncVitals(),now=ts||performance.now(),running=animationsOn()&&v.state!=="off",base=h*.55;
 const heart=document.querySelector(".head-heart");
 let heartScale=.92,heartOpacity=.5,heartGlow=0;
 if(v.state==="normal"||v.state==="warning"){
   const beatMs=60000/Math.max(30,v.bpm),phase=(now%beatMs)/beatMs;
   const p1=Math.exp(-Math.pow((phase-.08)/.040,2)),p2=.52*Math.exp(-Math.pow((phase-.22)/.060,2));
   heartScale=.88+.34*p1+.14*p2;heartOpacity=.70+.30*p1+.14*p2;heartGlow=12+34*p1+12*p2;
 }else if(v.state==="vf"){
   const irregular=Math.max(0,deterministicNoise(now*.75));
   heartScale=.90+.16*irregular;heartOpacity=.68+.30*irregular;heartGlow=12+20*irregular;
 }else if(v.state==="asystole"||v.state==="signal"){
   heartScale=.90;heartOpacity=.34;heartGlow=4;
 }
 if(heart){
   heart.style.animation="none";heart.style.transform=`scale(${heartScale.toFixed(4)})`;
   heart.style.opacity=String(Math.min(1,heartOpacity));heart.style.filter=`drop-shadow(0 0 ${heartGlow.toFixed(1)}px ${v.color})`;
   heart.style.background=v.state==="signal"?"#9c7049":v.state==="off"||v.state==="standby"?"#667782":v.color;
 }
 let color=v.color,shadow=v.state==="asystole"?15:v.state==="vf"?12:v.state==="warning"?10:8;
 x.strokeStyle=color;x.shadowColor=color;x.shadowBlur=running?shadow:0;x.lineWidth=v.state==="asystole"?2.7:2;x.beginPath();
 if(v.state==="off"||v.state==="standby"){
   x.moveTo(0,base);x.lineTo(w,base);x.stroke();x.shadowBlur=0;requestAnimationFrame(drawEKG);return;
 }
 if(v.state==="signal"){
   x.setLineDash([8,6]);x.moveTo(0,base);x.lineTo(w,base);x.stroke();x.setLineDash([]);drawScanHead(x,w,base,color,.8);x.shadowBlur=0;requestAnimationFrame(drawEKG);return;
 }
 const windowMs=v.state==="vf"?1900:3200;
 let lastY=base;
 for(let px=0;px<w;px++){
   const sampleTime=now-windowMs+(px/w)*windowMs;
   let py=base;
   if(v.state==="asystole")py=base+Math.sin(sampleTime*.004)*.35+deterministicNoise(sampleTime*.03)*.22;
   else if(v.state==="vf"){
     const chaos=deterministicNoise(sampleTime*.24)+.55*Math.sin(sampleTime*.073)+.35*Math.sin(sampleTime*.137+1.7);
     const envelope=.72+.28*Math.sin(sampleTime*.011);
     py=base+chaos*Math.min(h*.28,14)*envelope;
   }else{
     const beatMs=60000/Math.max(30,v.bpm),phase=((sampleTime%beatMs)+beatMs)%beatMs/beatMs;
     py=base+ekgWave(phase,Math.min(h*.34,v.state==="warning"?21:18));
   }
   lastY=py;px?x.lineTo(px,py):x.moveTo(px,py);
 }
 x.stroke();drawScanHead(x,w,lastY,color,v.state==="asystole"?1.25:1);x.shadowBlur=0;requestAnimationFrame(drawEKG);
}
function renderOperation(){
 if($("opTitle"))$("opTitle").innerHTML=operationState.title+'<span class="cursor"></span>';
 if($("opDetail"))$("opDetail").textContent=operationState.detail;
 if($("opResult"))$("opResult").textContent=operationState.result;
 if($("opNext"))$("opNext").textContent="Naechster Schritt: "+operationState.next;
 if($("lastOperation"))$("lastOperation").textContent="Letzte Operation: "+operationState.last;
 if($("monitorClock"))$("monitorClock").textContent=operationState.lastTime||"--:--:--";
 if($("monitorLamp")){$("monitorLamp").style.background=operationState.active?"var(--blue)":"var(--green)";$("monitorLamp").style.boxShadow="0 0 9px "+(operationState.active?"var(--blue)":"var(--green)")}
 if($("opQueue"))$("opQueue").innerHTML=OP_STEPS.map((q,i)=>`<div class="queue-row ${i===operationState.step?"active":i<operationState.step?"done":""}"><span>${q[0]}</span><span>${i===operationState.step?"LAEUFT":i<operationState.step?"FERTIG":"WARTET"}</span></div>`).join("");requestAnimationFrame(()=>document.querySelector("#opQueue .active")?.scrollIntoView({block:"nearest",behavior:"smooth"}));
}


const NAV=[["dashboard","HOME","Leitstand"],["current","WARN","Aktuelle Stoerung"],["internet","NET","Internet / Vodafone"],["fritz","RTR","Router / FRITZ!Box"],["docsis","DOC","Kabel / DOCSIS"],["wifi","WLAN","WLAN / Mesh"],["dns","DNS","DNS / IPv4 / IPv6"],["devices","DEV","Geraete"],["pc","SMART","PC / SMART"],["measurements","TAB","Messverlauf"],["incidents","LOG","Stoerprotokoll"],["reports","REP","Berichte"],["tests","TEST","Teststeuerung"],["settings","SET","Einstellungen"],["help","HELP","Hilfe"]];
const TESTS=[["router","FRITZ!Box","Erreichbarkeit im Heimnetz","5 s"],["multiPing","Multi-Ziel-Ping","Router, Cloudflare, Google, Quad9","15 s"],["ipStack","IPv4 / IPv6","Beide Protokollwege getrennt","30 s"],["dns","DNS-Vergleich","System-DNS und unabhaengige Ziele","30 s"],["tcp","TCP / HTTPS","Echter Verbindungsaufbau statt nur Ping","30 s"],["loss","Loss-Burst / Jitter","Median, P95, P99, Max und Verlustserien","15 s"],["route","Routing / Hop-Watch","Pfadaenderungen sparsam erkennen","5 min"],["stream","Streaming-Watch","Kleine kontinuierliche Datenflussprobe","60 s"],["buffer","Bufferbloat-Korrelation","Nur ereignisgesteuerte Kurzprobe","bei Stoerung"],["fritz","FRITZ!Box WAN","WAN-Status und Uptime","15 s"],["system","PC-System","CPU, RAM und Datentraeger","5 s"],["devices","Geraete-Matrix","Manuelle Geraete-Korrelation","ereignisbezogen"]];
let S={settings:{master:true,model:"6690-cable",host:"fritz.box",interval:15,deepSeconds:60,autoDeep:true,persist:true,density:"normal",animations:true,infoCards:false,sectionDefault:"remember",hints:true,rows:1000,scrollbars:true,markDeep:true,sectionsLocked:false},latest:{},samples:[],events:[],docsis:[],fritzdiag:null,routerImport:null,routerDetect:null,smart:null,wifiSurvey:null,devices:{},deep:false,stage:1,assistant:{active:false,step:0}};
let sortAsc=false;
let cycle={seconds:15,left:15,running:false,last:null,count:0,phase:"Warte auf naechsten Messzyklus"};
const LIVE_SENSORS=[["router","FRITZ!Box"],["multiPing","Internetziele"],["ipStack","IPv4 / IPv6"],["dns","DNS"],["loss","Paketverlust"],["system","PC-System"]];

const STATUS_LED_MAP=[
 ["router","FRITZ!Box","router"],["wan","WAN","internet"],["multiPing","Internet","internet"],
 ["ipv4","IPv4","ipStack"],["ipv6","IPv6","ipStack"],["dns","DNS","dns"],
 ["loss","Paketverlust","loss"],["jitter","Jitter","loss"],["mesh","WLAN/Mesh","router"],
 ["docsis","DOCSIS","docsis"],["system","PC-System","system"],["lag","Browser-Lag","lag"]
];
function ledState(id){
 if(S.settings.master===false)return "off";
 if(cycle.running){
   const activeMap=["router","multiPing","ipStack","dns","loss","system"];
   let active=activeMap[Math.min(activeMap.length-1,Math.floor((Date.now()/650)%activeMap.length))];
   let group={wan:"multiPing",ipv4:"ipStack",ipv6:"ipStack",jitter:"loss",mesh:"router"}[id]||id;
   if(group===active)return "testing";
 }
 if(id==="lag"){let v=lagState.current;return v>=1000?"red":v>=250?"yellow":"green"}
 let d=S.latest?.snapshot||{},q=d.quality||{};
 if(id==="router")return d.router?.ok===false?"red":d.router?"green":"gray";
 if(id==="wan"||id==="multiPing")return d.internet?.ok===false?"red":d.internet?"green":"gray";
 if(id==="ipv4")return d.ip?.ipv4===false?"yellow":d.ip?"green":"gray";
 if(id==="ipv6")return d.ip?.ipv6===false?"yellow":d.ip?"green":"gray";
 if(id==="dns")return d.dns?.ok===false?"red":d.dns?"green":"gray";
 if(id==="loss")return (q.lossPct||0)>=5?"red":(q.lossPct||0)>0?"yellow":Object.keys(q).length?"green":"gray";
 if(id==="jitter")return (q.p95JitterMs||0)>=50?"red":(q.jitterMs||0)>=20?"yellow":Object.keys(q).length?"green":"gray";
 if(id==="system")return d.system?"green":"gray";
 if(id==="docsis"||id==="mesh")return "gray";
 return "gray"
}
function ledLabel(state){return {off:"AUS",testing:"TEST",green:"OK",yellow:"WARN",red:"FEHLER",gray:"-"}[state]||"-"}
function renderStatusLEDs(){
 if(!$("statusLedRail"))return;
 $("statusLedRail").innerHTML=STATUS_LED_MAP.map(([id,label,test])=>{let st=S.settings.master===false||S.settings[test]===false?"off":ledState(id);return `<button class="status-led ${st}" data-led="${id}" data-target-test="${test}" title="${label}: ${ledLabel(st)} - klicken zum Bereich"><b></b><span>${label}</span><span class="led-state">${ledLabel(st)}</span></button>`}).join("");
 document.querySelectorAll("[data-led]").forEach(b=>b.onclick=()=>focusTestArea(b.dataset.targetTest,b.dataset.led));
}
function findTestCard(test){
 const names={router:"FRITZ!BOX",internet:"INTERNET",multiPing:"INTERNET",ipStack:"IP",dns:"DNS",loss:"PAKETVERLUST",system:"PC-SYSTEM",lag:"PERMANENTER LAG-TEST",docsis:"DOCSIS"};
 return [...document.querySelectorAll("#dashboard .foldable")].find(x=>(x.textContent||"").toUpperCase().includes(names[test]||test.toUpperCase()));
}
function focusTestArea(test,led){
 let el=findTestCard(test)||$("causePanel");if(!el)return;
 el.classList.remove("collapsed");el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("focus-problem");
 setTimeout(()=>el.classList.remove("focus-problem"),1900);
 if(ledState(led)==="red")operationState.result="Stoerung fokussiert: "+led.toUpperCase()+" - Details im markierten Bereich";
 renderOperation();storeSectionState();
}
function attachFieldSwitches(){
 const map=[["FRITZ!BOX","router"],["INTERNET","multiPing"],["JITTER","loss"],["PAKETVERLUST","loss"],["DNS","dns"],["IPV4","ipStack"],["PC-SYSTEM","system"],["PERMANENTER LAG-TEST","lag"]];
 document.querySelectorAll("#dashboard .foldable").forEach(el=>{
  let head=el.querySelector(":scope > .fold-head");if(!head||head.querySelector(".field-tools"))return;
  let text=(head.textContent||"").toUpperCase(), hit=map.find(([n])=>text.includes(n));if(!hit)return;
  let box=document.createElement("div");box.className="field-tools";
  box.innerHTML=`<label class="mini-switch" title="${hit[0]} ein/aus"><input type="checkbox" data-field-test="${hit[1]}" ${S.settings[hit[1]]!==false?"checked":""}><span></span></label>`;
  head.insertBefore(box,head.querySelector(".fold-toggle"));
  box.onclick=e=>e.stopPropagation();
  box.querySelector("input").onchange=e=>{S.settings[hit[1]]=e.target.checked;save();renderLive();renderSwitches();renderStatusLEDs();syncFieldSwitches()};
 });
}
function syncFieldSwitches(){document.querySelectorAll("[data-field-test]").forEach(x=>x.checked=S.settings[x.dataset.fieldTest]!==false)}
function attachInstrumentSwitches(){
 document.querySelectorAll("[data-instrument]").forEach(el=>{
  if(el.querySelector(".instrument-switch"))return;
  const id=el.dataset.instrument,label=el.querySelector("b")?.textContent||id;
  const box=document.createElement("label");box.className="mini-switch instrument-switch";box.title=label+" ein/aus";
  box.innerHTML=`<input type="checkbox" data-instrument-test="${id}" ${S.settings[id]!==false?"checked":""}><span></span>`;
  box.onclick=e=>e.stopPropagation();
  box.querySelector("input").onchange=e=>{S.settings[id]=e.target.checked;save();renderLive();renderSwitches();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges()};
  el.appendChild(box);
  el.setAttribute("data-info",infoText(id));
 });
}
function syncInstrumentSwitches(){document.querySelectorAll("[data-instrument-test]").forEach(x=>x.checked=S.settings[x.dataset.instrumentTest]!==false)}
function dedupeDisplaySwitches(){
 // Pro sichtbarer Anzeige bleibt exakt ein Ein-/Ausschalter erhalten.
 document.querySelectorAll("[data-instrument]").forEach(el=>{
   const switches=[...el.querySelectorAll(".instrument-switch")];switches.slice(1).forEach(x=>x.remove());
 });
 document.querySelectorAll(".cockpit-instrument").forEach(el=>{
   const switches=[...el.querySelectorAll(".only-switch")];switches.slice(1).forEach(x=>x.remove());
 });
 document.querySelectorAll(".foldable").forEach(el=>{
   const field=el.querySelector(":scope > .fold-head .field-tools");if(!field)return;
   const local=[...el.querySelectorAll("[data-instrument-test],[data-tile-test]")];
   const fieldInput=field.querySelector("[data-field-test]");
   if(fieldInput&&local.some(x=>(x.dataset.instrumentTest||x.dataset.tileTest)===fieldInput.dataset.fieldTest))field.remove();
 });
}

function renderLive(){
 document.body.classList.toggle("master-stopped",S.settings.master===false);
 document.body.classList.toggle("animations-off",!animationsOn());
 if(S.settings.master===false){cycle.running=false;S.deep=false;S.deepUntil=null;cycle.phase="Hauptschalter aus - alle Pruefungen angehalten";operationState.active=false;operationState.title="ANLAGE ANGEHALTEN";operationState.detail="Hauptschalter ist AUS";operationState.result="Keine Tests laufen";operationState.next="Hauptschalter einschalten";renderOperation();}

 let on=S.settings.master!==false, pct=cycle.running?100:Math.max(0,(cycle.seconds-cycle.left)/cycle.seconds*100);
 $("scanRing")?.classList.toggle("paused",!animationsOn());
 if($("autoState")){$("autoState").textContent=on?(cycle.running?"MESSUNG LAEUFT JETZT":"AUTOMATISCHE TESTS LAUFEN"):"AUTOMATISCHE TESTS AUS";$("autoState").className="bigstate "+(on?"green":"yellow")}
 if($("testPhase"))$("testPhase").textContent=on?cycle.phase:"Hauptschalter ist ausgeschaltet";
 if($("cycleFill"))$("cycleFill").style.width=pct+"%";
 if($("cycleText"))$("cycleText").textContent=!on?"PAUSIERT":cycle.running?"Sensoren pruefen das Netzwerk ...":"Naechste Messung in "+cycle.left+" s";
 if($("cycleInfo"))$("cycleInfo").textContent="Letzte Messung: "+(cycle.last?new Date(cycle.last).toLocaleTimeString("de-DE"):"-")+" - Messzyklus Nr. "+cycle.count;
 renderDeepProgress();renderStatusLEDs();syncFieldSwitches();syncInstrumentSwitches();dedupeDisplaySwitches();if($("sensorLamps")){
 $("sensorLamps").innerHTML=LIVE_SENSORS.map(([id,t],i)=>`<div class="sensor-lamp ${!testOn(id)?"off":cycle.running&&animationsOn()?(i===Math.floor((Date.now()/650)%LIVE_SENSORS.length)?"running":"done"):"done"}" data-info="${infoText(id)}"><i></i><span>${t}</span><label class="mini-switch" title="${t} ein/aus"><input type="checkbox" data-live-test="${id}" ${S.settings[id]!==false?"checked":""}><span></span></label></div>`).join("");
 document.querySelectorAll("[data-live-test]").forEach(x=>x.onchange=()=>{S.settings[x.dataset.liveTest]=x.checked;save();renderLive();renderSwitches()});
}
}
setInterval(()=>{if(S.settings.master!==false&&!cycle.running){cycle.left--;if(cycle.left<0)cycle.left=cycle.seconds}renderLive()},1000);


function enhanceFoldables(){
 document.querySelectorAll(".page").forEach(page=>{
  page.querySelectorAll(".card,.lag-panel,.operation-monitor,.cycle-panel,.gauge").forEach((el,i)=>{
   if(el.dataset.foldReady||el.closest(".settings-grid"))return;el.dataset.foldReady="1";el.classList.add("foldable");
   let title=el.querySelector(":scope > h2,:scope > .monitor-head,:scope > .lag-title,:scope > .cycle-title,:scope > b");
   if(!title)return;
   let head=document.createElement("div");head.className="fold-head";
   let clone=title.cloneNode(true);title.style.display="none";
   let btn=document.createElement("button");btn.className="fold-toggle";btn.textContent="v";btn.title="Bereich ein-/ausklappen";
   head.append(clone,btn);
   let body=document.createElement("div");body.className="fold-body";
   [...el.children].filter(x=>x!==title).forEach(x=>body.appendChild(x));
   el.append(head,body);
   head.onclick=e=>{if(e.target.closest("button")&&e.target!==btn)return;if(S.settings.sectionsLocked)return;el.classList.toggle("collapsed");storeSectionState();};
  })
 });
 applySectionDefault();attachFieldSwitches();dedupeDisplaySwitches();
}
function sectionKey(el){let page=el.closest(".page")?.id||"page";let idx=[...el.parentElement.children].indexOf(el);return page+":"+idx}
function storeSectionState(){if(S.settings.sectionDefault!=="remember")return;let st={};document.querySelectorAll(".foldable").forEach(x=>st[sectionKey(x)]=x.classList.contains("collapsed"));S.settings.sectionState=st;save()}
function applySectionDefault(){
 document.querySelectorAll(".foldable").forEach(x=>{
  let c=S.settings.sectionDefault==="closed"||S.settings.sectionDefault==="remember"&&S.settings.sectionState?.[sectionKey(x)];
  if(S.settings.sectionDefault==="open")c=false;x.classList.toggle("collapsed",!!c)
 })
}
function setAllSections(collapsed){if(S.settings.sectionsLocked)return;document.querySelectorAll(".page.active .foldable").forEach(x=>x.classList.toggle("collapsed",collapsed));storeSectionState()}
function updateSectionLock(){let c=$("mainContent");c?.classList.toggle("sections-locked",!!S.settings.sectionsLocked);$("lockSections")?.classList.toggle("active",!!S.settings.sectionsLocked);if($("lockSections"))$("lockSections").textContent=S.settings.sectionsLocked?"LOCK":"LOCK"}
function allProfiles(){return [...FRITZ_PROFILES,...EXTRA_ROUTER_PROFILES]}
function profile(){
 const p=allProfiles().find(x=>x.id===S.settings.model)||FRITZ_PROFILES[0];
 if(p.id==="custom-router"&&S.settings.customModel)return {...p,name:S.settings.customModel,defaultHost:S.settings.host||p.defaultHost,features:S.settings.customFeatures||p.features};
 return p;
}
function renderSettings(){
 if(!$("setModel"))return;
 $("setModel").innerHTML=allProfiles().map(x=>`<option value="${x.id}" ${x.id===S.settings.model?"selected":""}>${x.name}</option>`).join("");
 if($("setCustomModel"))$("setCustomModel").value=S.settings.customModel||"";
 $("setHost").value=S.settings.host||"fritz.box";$("setAccess").value=profile().access;
 $("setInterval").value=String(S.settings.interval||15);$("setDeep").value=String(S.settings.deepSeconds||60);
 $("setAutoDeep").checked=S.settings.autoDeep!==false;$("setPersist").checked=S.settings.persist!==false;
 $("setDensity").value=S.settings.density||"normal";$("setAnimations").checked=S.settings.animations!==false;
 if($("setInfoCards"))$("setInfoCards").checked=S.settings.infoCards===true;
 $("setSectionDefault").value=S.settings.sectionDefault||"remember";$("setHints").checked=S.settings.hints!==false;
 $("setRows").value=String(S.settings.rows||1000);$("setScrollbars").checked=S.settings.scrollbars!==false;$("setMarkDeep").checked=S.settings.markDeep!==false;
 $("profileInfo").innerHTML=`<div class="profile-chip"><b>${profile().wifi}</b><small>WLAN-Generation</small></div><div class="profile-chip"><b>${profile().docsis||"-"}</b><small>DOCSIS</small></div><div class="profile-chip"><b>${profile().features.join(", ")}</b><small>Diagnosemodule</small></div><div class="router-profile-note">Profilstand lokal. Internet-Ergaenzung spaeter nur nach Freigabe und mit Pruefvorschau.</div>`;
 renderRouterProfileRegistry();renderSwitchAudit();
}
function showSettingsPanel(id="general"){
 document.querySelectorAll(".settings-panel").forEach(p=>p.classList.toggle("active",p.id.toLowerCase().includes(String(id).toLowerCase())));
 document.querySelectorAll(".settings-tab").forEach(b=>b.classList.toggle("active",b.dataset.settingsPanel===id));
 renderRouterProfileRegistry();renderSwitchAudit();
}
function renderRouterProfileRegistry(){
 const host=$("routerProfileRegistry");if(!host)return;
 const entries=[
  {title:"Aktives Profil",model:profile().name,kind:profile().access,source:"Einstellungen",score:"festgelegt",details:(profile().features||[]).join(", ")},
  S.routerDetect?{title:"Erkannt",model:S.routerDetect.model,kind:S.routerDetect.kind,source:"Router erkennen",score:S.routerDetect.score+" %",details:S.routerDetect.notes.join(" | ")}:null,
  S.routerImport?{title:"Importiert",model:S.routerImport.model||S.routerImport.kind,kind:S.routerImport.kind,source:S.routerImport.fileName,score:S.routerImport.level,details:S.routerImport.summary}:null,
  S.fritzdiag?{title:"FRITZ-Diagnose",model:"FRITZ!Box Diagnose",kind:"fritzdiag",source:S.fritzdiag.fileName||"Import",score:S.fritzdiag.meshError?"Warnung":"OK",details:"FRITZ!OS "+(S.fritzdiag.fritzOS||"-")}:null
 ].filter(Boolean);
 host.innerHTML=entries.map(x=>`<article class="router-profile-card"><h3>${x.title}</h3><b>${x.model}</b><small>Typ: ${x.kind} - Quelle: ${x.source}</small><small>Bewertung: ${x.score}</small><p>${x.details||"-"}</p></article>`).join("");
}
function renderSwitchAudit(){
 const host=$("switchAuditView");if(!host)return;
 const rows=[
  ["masterSwitch","Hauptschalter Teststeuerung","alle Tests ein/aus"],
  ["masterHomeSwitch","Hauptschalter Startseite","alle Tests ein/aus"],
  ["setAnimations","Animationen","Herz/Sanduhr/Scanring"],
  ["setInfoCards","Infofenster","Infofenster an/aus"],
  ["setAutoDeep","Automatisch bei Rot","Tiefenanalyse"],
  ["setPersist","Verlauf speichern","Messdaten lokal"],
  ["setHints","Hinweise","Erklaertexte"],
  ["setScrollbars","Scrollbalken","Anzeige"],
  ["setMarkDeep","Stoerungsmarke startet Tiefentest","Stoerungsablauf"]
 ];
 const dynamic=[...document.querySelectorAll("[data-test],[data-live-test],[data-tile-test],[data-field-test]")].map(x=>[x.dataset.test||x.dataset.liveTest||x.dataset.tileTest||x.dataset.fieldTest,"Messkreis "+(x.dataset.test||x.dataset.liveTest||x.dataset.tileTest||x.dataset.fieldTest),"S.settings"]);
 const all=[...rows,...dynamic],seen=new Set();
 const out=all.filter(r=>{let k=r[0]+r[1];if(seen.has(k))return false;seen.add(k);return true}).map(r=>{let el=$(r[0])||document.querySelector(`[data-test="${r[0]}"],[data-live-test="${r[0]}"],[data-tile-test="${r[0]}"],[data-field-test="${r[0]}"]`),ok=!!el;return `<tr><td>${r[1]}</td><td>${r[2]}</td><td class="${ok?"ok":"warn"}">${ok?"verdrahtet":"nicht sichtbar"}</td></tr>`}).join("");
 host.innerHTML=`<div class="table-wrap"><table class="switch-audit-table"><thead><tr><th>Schalter</th><th>Funktion</th><th>Status</th></tr></thead><tbody>${out}</tbody></table></div>`;
}
function applySettings(){
 document.body.classList.toggle("compact",S.settings.density==="compact");
 document.body.classList.toggle("reduced-motion",S.settings.animations===false);
 document.body.classList.toggle("hide-hints",S.settings.hints===false);
 document.body.classList.toggle("info-cards-off",S.settings.infoCards!==true);
 cycle.seconds=Number(S.settings.interval)||15;
 document.documentElement.style.setProperty("--scroll-width",S.settings.scrollbars===false?"0px":"14px");
 updateSectionLock();renderSettings();
}
function readSettings(){
 S.settings.model=$("setModel").value;S.settings.customModel=$("setCustomModel")?.value||"";S.settings.host=$("setHost").value||"fritz.box";S.settings.interval=+$("setInterval").value;S.settings.deepSeconds=+$("setDeep").value;
 S.settings.autoDeep=$("setAutoDeep").checked;S.settings.persist=$("setPersist").checked;S.settings.density=$("setDensity").value;S.settings.animations=$("setAnimations").checked;
 S.settings.infoCards=$("setInfoCards")?.checked===true;
 S.settings.sectionDefault=$("setSectionDefault").value;S.settings.hints=$("setHints").checked;S.settings.rows=+$("setRows").value;S.settings.scrollbars=$("setScrollbars").checked;S.settings.markDeep=$("setMarkDeep").checked;
 save();applySettings();restartPollTimer();applySectionDefault();event("blue","Einstellungen gespeichert","settings");render();
}

function initNav(){ if(window.NetworkNavigationCoreAdapter) window.NetworkNavigationCoreAdapter.bind(page) }
function page(id){
 if(document.body.classList.contains("office-mode")){document.body.classList.remove("office-mode")}
 if(S.settings.officeMode&&$("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"}
 const target=$(id)||$("dashboard");
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 target?.classList.add("active");
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
 const title=NAV.find(x=>x[0]===id)?.[2]||target?.querySelector("h2")?.textContent||"NETZWERK-LEITSTAND";
 $("pageTitle").textContent=title.toUpperCase();
}
function showOffice(){
 S.settings.officeMode=true;save();
 const overlay=$("officeOverlay");
 if(overlay) overlay.hidden=false;
 if($("officeView"))$("officeView").hidden=true;
 if($("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"};
 $("officeModeBtn")?.classList.add("active");
 if($("officeModeBtn"))$("officeModeBtn").textContent=$("officeModeBtn").dataset.labelOn||"Büromodus aktiv";
 $("officeChairExit")?.focus();
}
function leaveOffice(){
 const overlay=$("officeOverlay");
 if(overlay) overlay.hidden=true;
 if($("backToOffice"))$("backToOffice").hidden=!S.settings.officeMode;
}
function officeCommand(command){
 const note=$("officeLiveNote");
 const setNote=text=>{if(note)note.textContent=text};
 const openPage=id=>{leaveOffice();page(id);if($("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"}};
 if(command==="dashboard"){setNote("Dashboard wird geoeffnet");openPage("dashboard")}
 else if(command==="devices"){setNote("Geraeteverwaltung wird geoeffnet");openPage("devices")}
 else if(command==="address"){setNote("Stammdaten werden geoeffnet");openPage("settings");setTimeout(()=>showSettingsPanel("routerProfiles"),0)}
 else if(command==="console"){setNote("Teststeuerung wird geoeffnet");openPage("tests")}
 else if(command==="protocol"||command==="clock"){setNote("Messprotokoll wird geoeffnet");openPage("measurements")}
 else if(command==="search"){setNote("Live-Diagnose wird geoeffnet");openPage("current")}
 else if(command==="lamp"){setNote("Anzeigeeinstellungen werden geoeffnet");openPage("settings")}
 else if(command==="reports"){setNote("Berichte werden geoeffnet");openPage("reports")}
 else if(command==="exit"){
   setNote("Ausgang gewaehlt");
   if(confirm("Netzwerk-Leitstand wirklich verlassen? Nicht gespeicherte Browserdaten koennen verloren gehen.")){
     window.close();
     setTimeout(()=>{leaveOffice();page("dashboard");alert("Der Browser verhindert das automatische Schliessen. Du kannst den Tab jetzt sicher schliessen.")},250)
   }
 }
}
function pill(l){return `<span class="pill ${l}">${l==="green"?"GRUEN":l==="yellow"?"GELB":l==="red"?"ROT":"INFO"}</span>`}
function time(t){return t?new Date(t).toLocaleTimeString("de-DE"):"-"}function n(v,d=0){return Number.isFinite(+v)?(+v).toFixed(d):"-"}
function level(ok,v,y,r){if(ok===false)return"red";if(v==null)return"yellow";return v>=r?"red":v>=y?"yellow":"green"}
function gauge(id,val,max,label,l){
 let c=$(id);if(!c)return;let x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);
 const cx=w/2,cy=h*.78,r=Math.min(w*.36,h*.58),start=Math.PI*.78,end=Math.PI*2.22;
 let grd=x.createLinearGradient(0,0,w,h);grd.addColorStop(0,"#061721");grd.addColorStop(1,"#15384c");x.fillStyle=grd;x.beginPath();x.arc(cx,cy,r+22,0,Math.PI*2);x.fill();
 x.lineCap="round";x.lineWidth=15;x.strokeStyle="#223f50";x.beginPath();x.arc(cx,cy,r,start,end);x.stroke();
 let noValue=val==null||Number.isNaN(Number(val));
 let stopped=S.settings.master===false;
 let rawP=(stopped||noValue) ? 0 : Math.max(0,Math.min(1,(val||0)/max));
 let sensitiveP=(stopped||noValue)?0:Math.pow(rawP,.62);
 let pulse=animationsOn()?Math.sin(Date.now()/520+id.length)*.032:0;
 let p=(stopped||noValue)?0:Math.max(0,Math.min(1,sensitiveP+pulse));
 let col=l==="gray"?"#65727a":l==="red"?"#ff4c3e":l==="yellow"?"#ffd02f":l==="blue"?"#40adff":"#2cdb74";
 let glow=x.createLinearGradient(cx-r,0,cx+r,0);glow.addColorStop(0,col);glow.addColorStop(1,"#dffcff");x.strokeStyle=glow;x.shadowColor=col;x.shadowBlur=10;x.beginPath();x.arc(cx,cy,r,start,start+(end-start)*p);x.stroke();x.shadowBlur=0;
 for(let i=0;i<=10;i++){let a=start+(end-start)*i/10;x.strokeStyle=i%5?"#477084":"#8eb4c9";x.lineWidth=i%5?1:2;x.beginPath();x.moveTo(cx+Math.cos(a)*(r-10),cy+Math.sin(a)*(r-10));x.lineTo(cx+Math.cos(a)*(r+4),cy+Math.sin(a)*(r+4));x.stroke()}
 let needle=start+(end-start)*p;x.strokeStyle="#e9f7ff";x.lineWidth=3;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(needle)*(r-17),cy+Math.sin(needle)*(r-17));x.stroke();x.fillStyle=col;x.beginPath();x.arc(cx,cy,5,0,Math.PI*2);x.fill();
 x.fillStyle="#e2edf4";x.font="bold 22px Segoe UI";x.textAlign="center";x.fillText(label,cx,cy-18);x.font="11px Segoe UI";x.fillStyle="#8fa9b9";x.fillText(stopped?"AUS · NULLSTELLUNG":noValue?"STANDBY":l.toUpperCase(),cx,cy+20)
}
async function api(path,opt={}){try{let r=await fetch("http://127.0.0.1:8765"+path,{cache:"no-store",...opt});return await r.json()}catch(e){return {ok:false,error:"Pruefdienst nicht aktiv"}}}
async function load(){let x=localStorage.getItem("NLV4");if(x){try{let old=JSON.parse(x);S={...S,...old,settings:{...S.settings,...old.settings}}}catch{}}S.routerImport=S.routerImport||null;S.routerDetect=S.routerDetect||null;S.smart=S.smart||null;S.wifiSurvey=S.wifiSurvey||null;if(!S.assistant)S.assistant={active:false,step:0};if(S.settings.infoCards===undefined)S.settings.infoCards=false;if(S.settings.uiFixVersion!=="4.1.9"){S.settings.animations=true;S.settings.uiFixVersion="4.1.9"}renderSwitches();renderDevices()}
function save(){localStorage.setItem("NLV4",JSON.stringify(S))}
function addSample(type,data){let row={ts:Date.now(),type,...data};S.samples.push(row);if(S.samples.length>12000)S.samples.splice(0,S.samples.length-12000);S.latest[type]=row}
function event(level,text,source="system"){let last=S.events.at(-1);if(last&&last.text===text&&Date.now()-last.ts<30000)return;S.events.push({ts:Date.now(),level,text,source});if(S.events.length>2000)S.events.shift()}
function analyze(d){
 let r=d.router||{},inet=d.targets?.cloudflare||{},loss=d.quality?.lossPct,j=d.quality?.p95JitterMs,cpu=d.system?.cpuPct;
 let title="Anlage arbeitet normal",text="Derzeit kein eindeutiger Fehler erkennbar.",score=96,l="green";
 if(!d.ok){title="Pruefdienst nicht aktiv";text="Der lokale Windows-Pruefdienst muss gestartet sein.";score=70;l="yellow"}
 else if(!r.ok){title="Verdacht: Heimnetz oder FRITZ!Box";text="Die FRITZ!Box antwortet nicht. Router, LAN oder WLAN sind zuerst zu pruefen.";score=20;l="red"}
 else if(r.ok && d.targets && Object.values(d.targets).filter(x=>x.ok).length===0){title="Hoher Verdacht: Vodafone / Kabel / WAN";text="Die FRITZ!Box ist erreichbar, aber mehrere unabhaengige Internetziele gleichzeitig nicht.";score=15;l="red"}
 else if((loss||0)>=5){title="Instabile Leitung erkannt";text="Deutlicher Paketverlust. Das kann Fernseher-Sanduhren und Chat-Abbrueche erklaeren.";score=35;l="red"}
 else if((j||0)>=50){title="Verbindung schwankt stark";text="Seltene starke Verzoegerungen sind hoch. Streaming kann dadurch stocken.";score=55;l="yellow"}
 else if((cpu||0)>=95){title="PC stark ausgelastet";text="Das Netzwerk wirkt erreichbar, aber der PC ist fast vollstaendig ausgelastet.";score=60;l="yellow"}
 if(S.deep){title="Stoerungs-Tiefenanalyse laeuft";text="Messstufe 3 sammelt fuer 60 Sekunden dichter aufgeloeste Vergleichswerte.";l="yellow"}
 return {title,text,score,l}
}
function chart(){
 let c=$("timeline");if(!c)return;let x=c.getContext("2d"),w=c.width=c.clientWidth*devicePixelRatio,h=c.height=210*devicePixelRatio,now=Date.now();x.clearRect(0,0,w,h);x.strokeStyle="#34586d";for(let i=1;i<5;i++){x.beginPath();x.moveTo(0,h*i/5);x.lineTo(w,h*i/5);x.stroke()}
 if(S.settings.master===false){
  x.strokeStyle="#65727a";x.lineWidth=2*devicePixelRatio;x.beginPath();x.moveTo(0,h*.82);x.lineTo(w,h*.82);x.stroke();
  x.fillStyle="#8fa9b9";x.font=14*devicePixelRatio+"px Segoe UI";x.fillText("ALLE MESSUNGEN AUS · ANZEIGE 0",16*devicePixelRatio,32*devicePixelRatio);return;
 }
 let a=S.samples.filter(q=>q.type==="quality").slice(-180),max=Math.max(100,...a.map(q=>Math.max(q.p99Ms||0,(q.p95JitterMs||0)*3,(q.lossPct||0)*80)));x.strokeStyle="#40adff";x.lineWidth=2*devicePixelRatio;
 if(!a.length){x.strokeStyle=animationsOn()?"#40adff":"#65727a";x.beginPath();for(let px=0;px<w;px++){let py=h*.58+Math.sin((px+now/28)/28)*h*.055+Math.sin((px+now/47)/67)*h*.025;px?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.fillStyle="#8fa9b9";x.font=14*devicePixelRatio+"px Segoe UI";x.fillText("Live-Bereitschaft - Messwerte erscheinen nach dem ersten Pruefdienst-Zyklus",16*devicePixelRatio,32*devicePixelRatio);return}
 x.beginPath();a.forEach((q,i)=>{let px=i/(a.length-1||1)*w,py=h-(q.p99Ms||0)/max*h*.82-h*.08;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();
 a.forEach((q,i)=>{
  const spike=Math.max(q.p99Ms||0,(q.p95JitterMs||0)*3,(q.lossPct||0)*80),bad=(q.lossPct||0)>=5||(q.p95JitterMs||0)>=50||(q.ok===false),warn=!bad&&((q.lossPct||0)>0||(q.p95JitterMs||0)>=20);
  if(!bad&&!warn)return;
  const px=i/(a.length-1||1)*w,base=h-18*devicePixelRatio,top=h-spike/max*h*.82-h*.08;
  x.strokeStyle=bad?"#ff4c3e":"#ffd02f";x.lineWidth=(bad?3:2)*devicePixelRatio;x.beginPath();x.moveTo(px,base);x.lineTo(px,top);x.stroke();
  x.fillStyle=x.strokeStyle;x.beginPath();x.arc(px,top,(bad?4:3)*devicePixelRatio,0,Math.PI*2);x.fill();
 });
 const last=a.at(-1),px=w-12*devicePixelRatio,py=h-(last.p99Ms||0)/max*h*.9,pulse=animationsOn()?Math.abs(Math.sin(Date.now()/450))*7*devicePixelRatio:3*devicePixelRatio;
 x.fillStyle=S.settings.master===false?"#65727a":"#ffd02f";x.beginPath();x.arc(px,py,4*devicePixelRatio+pulse,0,Math.PI*2);x.fill();
 x.fillStyle="#b8cedb";x.font=12*devicePixelRatio+"px Segoe UI";x.fillText((S.settings.master===false?"PAUSIERT":"LIVE")+" - Verlauf mit Fehlerspitzen, P99 "+n(last.p99Ms)+" ms",16*devicePixelRatio,h-12*devicePixelRatio);
}
function bars(){let c=$("bars"),x=c.getContext("2d"),w=c.width=c.clientWidth*devicePixelRatio,h=c.height=210*devicePixelRatio;x.clearRect(0,0,w,h);if(S.settings.master===false){x.strokeStyle="#65727a";x.lineWidth=2*devicePixelRatio;x.beginPath();x.moveTo(0,h-22*devicePixelRatio);x.lineTo(w,h-22*devicePixelRatio);x.stroke();x.fillStyle="#8fa9b9";x.font=14*devicePixelRatio+"px Segoe UI";x.fillText("ALLE MESSUNGEN AUS · 0",16*devicePixelRatio,28*devicePixelRatio);return;}let names=["router","internet","dns","quality","system","fritz"],v=names.map(k=>S.events.filter(e=>e.source===k&&e.level!=="blue").length),mx=Math.max(1,...v),bw=w/(names.length*1.7);names.forEach((q,i)=>{let bh=v[i]/mx*(h-35);x.fillStyle="#ff9348";x.fillRect((i*1.7+.35)*bw,h-bh-22,bw,bh);x.fillStyle="#b8cedb";x.textAlign="center";x.fillText(q,(i*1.7+.85)*bw,h-5)})}
function metric(title,value,explain,l="green"){return `<article class="card"><h2>${title}</h2><div class="metric ${l}">${value}</div><div class="sub">${explain}</div></article>`}
function pcHealth(sys={}){
 let cpu=Number(sys.cpuPct||0),ram=Number(sys.memPct||0),disk=Number(sys.diskPct||0),score=100;
 if(cpu>=95)score-=35;else if(cpu>=80)score-=18;
 if(ram>=95)score-=30;else if(ram>=85)score-=15;
 if(disk>=95)score-=30;else if(disk>=80)score-=15;
 let l=score<55?"red":score<80?"yellow":"green";
 return {score:Math.max(0,score),l,cpu,ram,disk}
}
function assistantPlan(d,a){
 const q=d.quality||{},sys=d.system||{},r=d.router||{},cf=d.targets?.cloudflare||{},health=pcHealth(sys),steps=[];
 let summary=a.title+" - "+a.text;
 if(!d.ok){steps.push(["1. Pruefdienst starten","Im Ordner `probe` die Datei `PRUEFDIENST_STARTEN.cmd` starten. Danach 30 Sekunden warten und den Leitstand neu messen lassen.","Wenn der Pruefdienst nicht laeuft, kann die Webseite nur eingeschraenkt bewerten."])}
 if(d.ok&&r.ok===false){steps.push(["2. Router erreichbar machen","Routeradresse pruefen, WLAN/LAN-Verbindung kontrollieren und testweise `fritz.box` beziehungsweise die Router-IP oeffnen.","Wenn der Router selbst nicht antwortet, sind Internet-Tests dahinter nicht aussagekraeftig."])}
 if(r.ok&&d.targets&&Object.values(d.targets).filter(x=>x.ok).length===0){steps.push(["3. WAN / Anbieter pruefen","FRITZ!Box ist erreichbar, externe Ziele aber nicht. Router-Oberflaeche oeffnen und Internetstatus, Kabel/DOCSIS und Anbieterstatus pruefen.","Das spricht eher fuer WAN/Kabel/Provider als fuer den PC."])}
 if((q.lossPct||0)>=5){steps.push(["4. Paketverlust eingrenzen","Tiefenanalyse starten. Danach schauen, ob Paketverlust bei allen Zielen oder nur bei einem Ziel auftritt.","Paketverlust verursacht Aussetzer, Sanduhr, Telefonie- und Streamingprobleme."])}
 if((q.p95JitterMs||0)>=50){steps.push(["5. Jitter untersuchen","Am selben Standort einmal per WLAN und einmal per LAN testen. Parallel Streaming/TV beobachten.","Jitter bedeutet schwankende Laufzeit. Der Durchschnitt kann gut aussehen, obwohl kurze Haenger auftreten."])}
 if(health.l!=="green"){steps.push(["6. PC-Gesundheit pruefen",`CPU ${n(health.cpu)} %, RAM ${n(health.ram)} %, Datentraeger ${n(health.disk)} %. Programme schliessen und SMART-/PC-Bericht importieren.`,"Hohe PC-Last kann lokale Haenger erzeugen, obwohl das Netz stabil ist."])}
 steps.push(["7. Ergebnis sichern","Stoerung markieren und JSON-Bericht exportieren, wenn der Fehler wieder auftritt.","So kann spaeter genau der Zeitpunkt mit Router-, Internet- und PC-Werten verglichen werden."]);
 if(cf.ok&&health.l==="green"&&(q.lossPct||0)<1&&(q.p95JitterMs||0)<20){steps.unshift(["Aktuell kein harter Fehler","Werte sind unauffaellig. Bei erneutem Haenger Stoerung markieren und danach den Assistenten starten.","Der Assistent bleibt vorbereitet."])}
 return {summary,steps:steps.slice(0,7)}
}
function renderAssistant(d,a){
 const p=assistantPlan(d,a);
 if($("assistantSummary"))$("assistantSummary").textContent=p.summary;
 if(!S.assistant)S.assistant={active:false,step:0};
 S.assistant.step=Math.max(0,Math.min(S.assistant.step,p.steps.length-1));
 if($("assistantSteps"))$("assistantSteps").innerHTML=S.assistant.active?"":p.steps.slice(0,3).map(([h,t])=>`<li><b>${h}:</b> ${t}</li>`).join("");
 if($("assistantWalk")){
  if(!S.assistant.active){$("assistantWalk").innerHTML=`<div class="finding gray"><b>Assistent bereit.</b><br>Klicke auf Assistent starten, dann fuehrt dich der Leitstand Schritt fuer Schritt durch die Pruefung.</div>`}
  else{let s=p.steps[S.assistant.step];$("assistantWalk").innerHTML=`<div class="assistant-step"><small>Schritt ${S.assistant.step+1} von ${p.steps.length}</small><h3>${s[0]}</h3><p>${s[1]}</p><em>${s[2]||""}</em></div>`}
 }
 if($("assistantPrev"))$("assistantPrev").disabled=!S.assistant.active||S.assistant.step===0;
 if($("assistantNext"))$("assistantNext").disabled=!S.assistant.active||S.assistant.step>=p.steps.length-1;
}
function infoText(key){
 const m={
  router:"Prueft, ob der Router im Heimnetz erreichbar ist. Wenn dieser Test aus ist, werden Routeranzeige und zugehoerige Statuslampen nicht aktiv bewertet.",
  multiPing:"Vergleicht mehrere Internetziele. So erkennt der Leitstand, ob nur ein Ziel oder der Internetzugang insgesamt betroffen ist.",
  ipStack:"Prueft IPv4 und IPv6 getrennt. Manche Stoerungen betreffen nur einen der beiden Protokollwege.",
  dns:"DNS uebersetzt Namen wie google.de in IP-Adressen. Fehler hier wirken wie Internetprobleme, obwohl die Leitung noch stehen kann.",
  loss:"Paketverlust bedeutet, dass Datenpakete unterwegs verloren gehen. Schon kleine Werte koennen Streaming, Telefonie und Chat stoeren.",
  jitter:"Jitter ist die Schwankung der Laufzeit. Hoher Jitter macht Verbindungen unruhig, auch wenn der Durchschnitt gut aussieht.",
  system:"PC-Systemwerte helfen zu unterscheiden, ob das Netz haengt oder der Rechner selbst ueberlastet ist.",
  lag:"Der Lag-Test misst, ob die Bedienoberflaeche oder der PC kurz einfriert. Ist er ausgeschaltet, wird nichts aufgezeichnet.",
  docsis:"DOCSIS ist der Kabelanschluss-Teil. Wichtig sind Pegel, Signalqualitaet und nicht korrigierbare Fehler.",
  smart:"SMART meldet Festplatten-/SSD-Gesundheit. Kritisch sind Reallocated, Pending, Uncorrectable und hohe Temperatur.",
  wifi:"WLAN-Werte wie Signal oder Kanal darf die Browser-App nicht direkt lesen. Sie kommen ueber Routerimport oder lokalen Pruefdienst."
 };
 return m[key]||"Kurzerklaerung zum Messwert. Details erscheinen, wenn echte Messdaten oder Importdaten vorhanden sind.";
}
function stateWord(l){return l==="green"?"OK":l==="yellow"?"WARN":l==="red"?"FEHLER":l==="blue"?"AKTIV":"OFFEN"}
function dial(title,value,max,label,state,testId="",infoKey=""){
 const p=value==null?18:Math.max(0,Math.min(100,Number(value)/max*100)),key=infoKey||testId,off=testId&&!testOn(testId);
 return `<article class="cockpit-instrument ${off?"is-off":""}" data-info="${key?infoText(key):label}"><header><b>${title}</b>${testId?`<label class="mini-switch only-switch" title="${title} ein/aus"><input data-tile-test="${testId}" type="checkbox" ${S.settings[testId]!==false?"checked":""}><span></span></label>`:""}</header><div class="dial ${state}" style="--p:${p}%"><span>${label}</span></div><small>${off?"ausgeschaltet":stateWord(state)}</small></article>`
}
function barRow(name,value,max,state,info){
 const p=value==null?0:Math.max(0,Math.min(100,Number(value)/max*100));
 return `<div class="cockpit-bar" data-info="${info}"><span>${name}</span><i><b class="${state}" style="width:${p}%"></b></i><em>${value??"-"}</em></div>`
}
function actionButton(id,label,info){return `<button class="btn cockpit-action" data-action="${id}" data-info="${info}">${label}</button>`}
function renderDiagnosticTabs(d){
 const q=d.quality||{},sys=d.system||{},r=d.router||{},cf=d.targets?.cloudflare||{},health=pcHealth(sys);
 const active=document.querySelector(".diag-tab.active")?.dataset.diagTab||"internet";
 const data={
  internet:`${dial("Internet-Ping",cf.avgMs,300,cf.ok?n(cf.avgMs)+" ms":"offline",level(cf.ok,cf.avgMs,80,250),"multiPing")}${dial("Paketverlust",q.lossPct,10,n(q.lossPct,1)+" %",level(d.ok,q.lossPct,1,5),"loss")}${dial("Jitter P95",q.p95JitterMs,100,n(q.p95JitterMs)+" ms",level(d.ok,q.p95JitterMs,20,50),"loss","jitter")}${dial("DNS",d.dns?Object.keys(d.dns).length:0,4,d.dns?Object.keys(d.dns).length+" Resolver":"offen",d.dns?"green":"gray","dns")}<section class="cockpit-detail">${barRow("IPv4",d.ip?.ipv4?.ok?100:0,100,d.ip?.ipv4?.ok?"green":"yellow","IPv4 getrennt bewertet")}${barRow("IPv6",d.ip?.ipv6?.ok?100:0,100,d.ip?.ipv6?.ok?"green":"yellow","IPv6 getrennt bewertet")}<table><tr><th>Ziel</th><th>Wert</th><th>Bewertung</th></tr><tr><td>Cloudflare</td><td>${cf.ok?n(cf.avgMs)+" ms":"nicht erreichbar"}</td><td>${stateWord(level(cf.ok,cf.avgMs,80,250))}</td></tr><tr><td>Loss/Jitter</td><td>${n(q.lossPct,1)} % / ${n(q.p95JitterMs)} ms</td><td>Streaming/Telefonie relevant</td></tr></table></section>`,
  router:`${dial("Router erreichbar",r.ok?100:0,100,r.ok?"OK":"keine Antwort",r.ok?"green":"red","router")}${dial("Antwortzeit",r.avgMs,120,r.avgMs!=null?n(r.avgMs)+" ms":"offen",r.ok?level(r.ok,r.avgMs,20,100):"gray","router")}${dial("Routerprofil",profile().features.length,6,profile().name,"blue")}${dial("Erkennung",S.routerDetect?.score||0,100,S.routerDetect?S.routerDetect.score+" %":"offen",S.routerDetect?.level||"gray","","router")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("detectRouter","Router erkennen","Router jetzt aus Profil, erreichbarer Adresse und Importen erkennen")}${actionButton("openRouter","Router oeffnen","Router-Oberflaeche im Browser oeffnen")}</div><table><tr><th>Router-Test</th><th>Ergebnis</th></tr><tr><td>Adresse</td><td>${S.settings.host||profile().defaultHost}</td></tr><tr><td>Profil</td><td>${profile().name}</td></tr><tr><td>Erkennung</td><td>${S.routerDetect?S.routerDetect.model:"noch nicht ausgefuehrt"}</td></tr></table></section>`,
  imports:`${dial("FRITZ-Diagnose",S.fritzdiag?100:0,100,S.fritzdiag?"vorhanden":"offen",S.fritzdiag?"green":"gray")}${dial("Routerdatei",S.routerImport?100:0,100,S.routerImport?S.routerImport.kind:"offen",S.routerImport?.level||"gray")}${dial("DOCSIS-Zaehler",S.routerImport?.uncorr??null,10000,S.routerImport?.uncorr!=null?"unkorr. "+S.routerImport.uncorr:"offen",S.routerImport?.uncorr>0?"yellow":S.routerImport?"green":"gray")}${dial("Kanalwerte",S.routerImport?.channels??null,64,S.routerImport?.channels?S.routerImport.channels+" Kanaele":"offen",S.routerImport?.channels?"green":"gray")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("importDiag","FRITZ-Diagnose importieren","FRITZ!Box-Funktionsdiagnose auswerten")}${actionButton("importRouter","Routerdatei importieren","Router- oder DOCSIS-Datei importieren")}</div><table><tr><th>Import/DOCSIS</th><th>Status</th><th>Nutzen</th></tr><tr><td>FRITZ-Diagnose</td><td>${S.fritzdiag?"vorhanden":"offen"}</td><td>Router- und WLAN-Hinweise</td></tr><tr><td>Routerdatei</td><td>${S.routerImport?S.routerImport.kind:"offen"}</td><td>Router-/DOCSIS-Daten</td></tr><tr><td>Nicht korrigierbare Fehler</td><td>${S.routerImport?.uncorr??"-"}</td><td>Kabelsignal bewerten</td></tr></table></section>`,
  wifi:`${dial("WLAN-Status",S.fritzdiag?.weakWifi?75:20,100,S.fritzdiag?.weakWifi?"schwach":"offen",S.fritzdiag?.weakWifi?"yellow":"gray","wifi")}${dial("Mesh",S.fritzdiag?.meshError?90:20,100,S.fritzdiag?.meshError?"Fehler":"offen",S.fritzdiag?.meshError?"red":S.fritzdiag?"green":"gray","wifi")}${dial("Kanal",S.fritzdiag?.sameChannel24?70:15,100,S.fritzdiag?.sameChannel24?"auffaellig":"offen",S.fritzdiag?.sameChannel24?"yellow":"gray","wifi")}${dial("LAN/WLAN",S.wifiSurvey?100:0,100,S.wifiSurvey?"Vergleich":"vorbereitet",S.wifiSurvey?"green":"gray","wifi")}<section class="cockpit-detail">${barRow("Signal",S.fritzdiag?.weakWifi?45:null,100,S.fritzdiag?.weakWifi?"yellow":"gray","Signalwerte kommen ueber Import oder lokalen Pruefdienst")}${barRow("Mesh",S.fritzdiag?.meshError?90:null,100,S.fritzdiag?.meshError?"red":"gray","Mesh-Hinweise aus FRITZ-Diagnose")}<p>Der Browser darf WLAN-Hardware nicht direkt lesen. Der echte Test laeuft ueber Routerimport, FRITZ-Diagnose oder lokalen Pruefdienst.</p></section>`,
  pc:`${dial("CPU",sys.cpuPct,100,n(sys.cpuPct)+" %",level(true,sys.cpuPct,80,95),"system")}${dial("RAM",sys.memPct,100,n(sys.memPct)+" %",level(true,sys.memPct,85,95),"system")}${dial("Datentraeger",sys.diskPct,100,n(sys.diskPct)+" %",level(true,sys.diskPct,80,95),"system")}${dial("UI-Lag",Math.min(100,lagState.current/10),100,Math.round(lagState.current)+" ms",lagState.current>=1000?"red":lagState.current>=250?"yellow":"green","lag")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("importSmart","SMART-/PC-Bericht importieren","SMART- oder Windows-Gesundheitsbericht importieren")}</div>${barRow("SMART",S.smart?100:null,100,S.smart?.level||"gray","SMART meldet Festplatten-/SSD-Gesundheit")}${barRow("PC-Gesundheit",health.score,100,health.l,"Zusammenfassung aus CPU, RAM und Datentraeger")}<p>${S.smart?("SMART: "+S.smart.status):"Noch kein SMART-Bericht importiert."}</p></section>`,
  protocol:`${dial("Messwerte",Math.min(S.samples.length,1000),1000,S.samples.length+" Eintraege","green")}${dial("Stoerungen",Math.min(S.events.length,100),100,S.events.length+" Meldungen",S.events.some(e=>e.level==="red")?"red":S.events.some(e=>e.level==="yellow")?"yellow":"green")}${dial("Export",100,100,"JSON","green")}${dial("Tiefenanalyse",S.deep?100:0,100,S.deep?"laeuft":"bereit",S.deep?"yellow":"gray")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("exportReport","Bericht exportieren","JSON-Diagnosebericht erstellen")}${actionButton("startAssistant","Assistent starten","Gefuehrte Problemloesung starten")}</div><table><tr><th>Bereich</th><th>Anzahl</th></tr><tr><td>Messwerte</td><td>${S.samples.length}</td></tr><tr><td>Ereignisse</td><td>${S.events.length}</td></tr></table></section>`
 };
 const host=$("diagTabPanels");if(!host)return;
 host.innerHTML=Object.entries(data).map(([id,html])=>`<div class="tab-panel register-cockpit ${id===active?"active":""}" data-panel="${id}">${html}</div>`).join("");
 document.querySelectorAll("[data-tile-test]").forEach(x=>x.onchange=()=>{S.settings[x.dataset.tileTest]=x.checked;save();renderLive();renderSwitches();renderDiagnosticTabs(S.latest.snapshot||{})});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>runAction(b.dataset.action));
}
function initDiagnosticTabs(){
 $("diagTabs")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-diag-tab]");if(!b)return;
  document.querySelectorAll(".diag-tab").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("active",x.dataset.panel===b.dataset.diagTab));
 });
}
function render(){
 let d=S.latest.snapshot||{},r=d.router||{},cf=d.targets?.cloudflare||{},q=d.quality||{},sys=d.system||{},a=analyze(d);
 $("diagTitle").textContent=a.title;$("diagText").textContent=a.text;$("score").textContent=a.score+"%";$("score").style.borderColor=a.l==="red"?"var(--red)":a.l==="yellow"?"var(--yellow)":"var(--green)";
 $("plant").className="plant "+a.l;$("plant").textContent=a.l==="red"?"STOERUNG ERKANNT":a.l==="yellow"?"ANLAGE AUFFAELLIG":"ANLAGE STABIL";
 let rl=level(r.ok,r.avgMs,20,100),il=level(cf.ok,cf.avgMs,80,250),jl=level(d.ok,q.p95JitterMs,20,50),ll=level(d.ok,q.lossPct,1,5),health=pcHealth(sys),storageLevel=level(true,sys.diskPct,80,95);
 redrawGauges();
 $("vRouter").textContent=testOn("router")?(r.ok?"Router erreichbar":"keine Antwort"):"ausgeschaltet";$("vInternet").textContent=testOn("multiPing")?(cf.ok?"Internet erreichbar":"Internet gestoert"):"ausgeschaltet";$("vPcHealth").textContent=testOn("system")?(health.l==="green"?"PC gesund":health.l==="yellow"?"PC auffaellig":"PC kritisch"):"ausgeschaltet";$("vStorage").textContent=testOn("system")?(sys.diskPct==null?"noch nicht gemessen":sys.diskPct<80?"Speicher ok":"Speicher pruefen"):"ausgeschaltet";$("vLoss").textContent=testOn("loss")?(q.lossPct==null?"noch nicht gemessen":q.lossPct<1?"Qualitaet stabil":"Qualitaet auffaellig"):"ausgeschaltet";
 renderAssistant(d,a);
 renderDiagnosticTabs(d);
 let rows=[["FRITZ!Box",rl,r.ok?n(r.avgMs)+" ms":"keine Antwort",r.ok?"Router im Heimnetz erreichbar":"Router/Heimnetz pruefen"],["Internet",il,cf.ok?n(cf.avgMs)+" ms":"nicht erreichbar",cf.ok?"mehrere externe Ziele werden verglichen":"Vodafone/Kabel/WAN verdaechtig"],["Paketverlust",ll,n(q.lossPct,1)+" %",q.lossPct<1?"unauffaellig":"Datenpakete gehen verloren"],["Jitter P95",jl,n(q.p95JitterMs)+" ms",q.p95JitterMs<20?"stabil":"Verbindung schwankt"],["IPv4",d.ip?.ipv4?.ok?"green":"red",d.ip?.ipv4?.ok?"verbunden":"gestoert","IPv4 separat geprueft"],["IPv6",d.ip?.ipv6?.ok?"green":"yellow",d.ip?.ipv6?.ok?"verbunden":"nicht bestaetigt","IPv6 separat geprueft"],["PC CPU",level(true,sys.cpuPct,80,95),n(sys.cpuPct)+" %",sys.cpuPct<80?"PC nicht ueberlastet":"PC-Auslastung auffaellig"]];
 $("statusRows").innerHTML=rows.map(v=>`<tr><td>${v[0]}</td><td>${pill(v[1])}</td><td>${v[2]}</td><td>${v[3]}</td><td>${time(d.ts)}</td></tr>`).join("");
 $("incidentNow").innerHTML=`<div class="finding ${a.l}"><b>${a.title}</b><p>${a.text}</p><small>Messstufe ${S.deep?3:S.stage} - ${time(d.ts)}</small></div>`;
 $("deepMetrics").innerHTML=metric("Messstufe",S.deep?"3 - TIEFENANALYSE":"1 - DAUERBETRIEB",S.deep?"dichte Messung zeitlich begrenzt":"sehr geringe Zusatzlast",S.deep?"yellow":"green")+metric("Loss-Burst",q.maxLossBurst??"-",q.maxLossBurst?"aufeinanderfolgende verlorene Pakete":"keine Verlustserie erkannt",q.maxLossBurst>2?"red":"green")+metric("P99-Latenz",n(q.p99Ms)+" ms","99 % der Messungen liegen darunter",level(true,q.p99Ms,150,500));
 $("internetMetrics").innerHTML=metric("IPv4",d.ip?.ipv4?.ok?"ERREICHBAR":"GESTOERT","separater Protokollweg",d.ip?.ipv4?.ok?"green":"red")+metric("IPv6",d.ip?.ipv6?.ok?"ERREICHBAR":"NICHT BESTAETIGT","separater Protokollweg",d.ip?.ipv6?.ok?"green":"yellow")+metric("WAN-Uptime",d.wan?.uptime?Math.floor(d.wan.uptime/3600)+" h":"-","Zeit seit WAN-Verbindungsaufbau");
 $("targets").innerHTML=Object.entries(d.targets||{}).map(([k,v])=>`<div class="finding ${v.ok?"green":"red"}"><b>${k}</b> - ${v.ok?n(v.avgMs)+" ms":"nicht erreichbar"} - Verlust ${n(v.lossPct,1)} %</div>`).join("")||"Pruefdienst starten.";
 $("fritzState").innerHTML=`<div class="finding ${r.ok?"green":"red"}"><b>Router ${r.ok?"erreichbar":"nicht erreichbar"}</b><br>WAN: ${d.wan?.connected===true?"verbunden":d.wan?.connected===false?"getrennt":"nicht verfuegbar"} - Uptime ${d.wan?.uptime??"-"} s</div>${S.fritzdiag?`<div class="finding ${S.fritzdiag.meshError?"red":"green"}">FRITZ-Import: FRITZ!OS ${S.fritzdiag.fritzOS||"-"} - ${S.fritzdiag.rxChannels??"-"} Empfang / ${S.fritzdiag.txChannels??"-"} Senden - Mesh ${S.fritzdiag.meshError?"Fehlerhinweis":"kein Fehlertext"}</div>`:""}${S.routerImport?`<div class="finding ${S.routerImport.level}">Routerdatei: ${S.routerImport.model||S.routerImport.kind} - ${S.routerImport.summary}</div>`:""}`;
 $("wifiState").innerHTML=S.fritzdiag||S.routerImport?`${S.fritzdiag?`<div class="finding ${S.fritzdiag.meshError?"red":"green"}"><b>Mesh / Repeater:</b> ${S.fritzdiag.meshError?"Fehlerhinweis erkannt":"kein Fehlertext erkannt"}</div><div class="finding ${S.fritzdiag.weakWifi?"yellow":"green"}"><b>WLAN-Signal:</b> ${S.fritzdiag.weakWifi?"schwache Verbindung gemeldet":"kein Schwachsignaltext"}</div><div class="finding ${S.fritzdiag.sameChannel24?"yellow":"green"}"><b>2,4 GHz:</b> ${S.fritzdiag.sameChannel24?"Kanalbelegung auffaellig":"kein Kanalhinweis erkannt"}</div>`:""}<div class="finding gray"><b>WLAN-Test:</b> Direkte Signalstaerke und Kanalwerte kommen erst ueber lokalen Windows-Pruefdienst oder importierte Router-/WLAN-Datei.</div>`:"Funktionsdiagnose oder Router-/WLAN-Bericht importieren, damit Mesh-/WLAN-Hinweise ausgewertet werden.";
 $("dnsState").innerHTML=Object.entries(d.dns||{}).map(([k,v])=>`<div class="finding ${v.ok?"green":"red"}"><b>${k}</b> - ${v.ok?n(v.ms)+" ms":"Fehler"} - ${v.explain||""}</div>`).join("")||"Noch keine DNS-Messung.";
 $("systemMetrics").innerHTML=metric("CPU",n(sys.cpuPct)+" %","Prozessorauslastung",level(true,sys.cpuPct,80,95))+metric("RAM",n(sys.memPct)+" %","Arbeitsspeicher",level(true,sys.memPct,85,95))+metric("Datentraeger",n(sys.diskPct)+" %","Datentraegerauslastung",level(true,sys.diskPct,80,95));
 $("pcExplain").innerHTML=`<div class="finding ${sys.cpuPct>95?"yellow":"green"}">${sys.cpuPct>95?"PC ist stark ausgelastet. Lokale Haenger sind moeglich.":"Der PC zeigt aktuell keine CPU-Vollauslastung."}</div>`;
 renderRouterDetectState();renderRouterImportState();renderSmartState();renderDocsis();renderTables();chart();bars();save()
}
function renderTables(){let f=($("measureFilter")?.value||"").toLowerCase(),typ=$("measureType")?.value||"";let a=S.samples.filter(x=>(!typ||x.type===typ)&&JSON.stringify(x).toLowerCase().includes(f)).slice().reverse().slice(0,S.settings.rows||1000);$("measurementRows").innerHTML=a.map(x=>`<tr><td>${new Date(x.ts).toLocaleString("de-DE")}</td><td>${x.type}</td><td>${pill(x.ok===false?"red":"green")}</td><td>${x.value??x.avgMs??x.p95JitterMs??"-"}</td><td>${JSON.stringify(x).slice(0,180)}</td></tr>`).join("");let types=[...new Set(S.samples.map(x=>x.type))];let cur=$("measureType").value;$("measureType").innerHTML='<option value="">Alle Pruefkreise</option>'+types.map(x=>`<option ${x===cur?"selected":""}>${x}</option>`).join("");let ef=($("eventFilter")?.value||"").toLowerCase();$("eventRows").innerHTML=S.events.filter(e=>JSON.stringify(e).toLowerCase().includes(ef)).slice().reverse().map(e=>`<tr><td>${new Date(e.ts).toLocaleString("de-DE")}</td><td>${pill(e.level)}</td><td>${e.text}</td><td>${e.source}</td></tr>`).join("")}
function renderSwitches(){
 $("masterSwitch").checked=S.settings.master!==false;
 if($("masterHomeSwitch"))$("masterHomeSwitch").checked=S.settings.master!==false;
 $("switchGrid").innerHTML=`<div class="test-control-table"><table><thead><tr><th>Messkreis</th><th>Status</th><th>Intervall</th><th>Schalter</th></tr></thead><tbody>${TESTS.map(([id,t,p,intv])=>`<tr data-info="${infoText(id)}"><td><b>${t}</b><small>${p}</small></td><td>${S.settings.master===false||S.settings[id]===false?pill("gray"):pill("green")}</td><td>${intv}</td><td><label class="switch compact-switch"><input data-test="${id}" type="checkbox" ${S.settings[id]!==false?"checked":""}><span></span></label></td></tr>`).join("")}</tbody></table></div>`;
 document.querySelectorAll("[data-test]").forEach(x=>x.onchange=()=>{S.settings[x.dataset.test]=x.checked;save();renderLive();renderLag();renderStatusLEDs();syncFieldSwitches();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges()});
 $("masterSwitch").onchange=()=>{
  S.settings.master=$("masterSwitch").checked;
  TESTS.forEach(([id])=>S.settings[id]=S.settings.master);
  if(S.settings.master===false){lagState.current=0;lagState.max=0;lagState.history=[];cycle.running=false;S.deep=false;S.deepUntil=null;if(deepTimer)clearTimeout(deepTimer)}
  save();renderSwitches();renderLive();renderLag();renderStatusLEDs();syncFieldSwitches();renderOperation();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges();chart();bars();syncVitals()
 }
 if($("masterHomeSwitch"))$("masterHomeSwitch").onchange=()=>{$("masterSwitch").checked=$("masterHomeSwitch").checked;$("masterSwitch").onchange()};
}
function renderDevices(){let names=["Fernseher","Fire TV","PC / ChatGPT","iPhone"];$("deviceMatrix").innerHTML=names.map(nm=>`<div class="switch-card"><div><h2>${nm}</h2><p>${S.devices[nm]?"Stoerung markiert":"kein Problem markiert"}</p></div><label class="switch"><input data-device="${nm}" type="checkbox" ${S.devices[nm]?"checked":""}><span></span></label></div>`).join("");document.querySelectorAll("[data-device]").forEach(x=>x.onchange=()=>{S.devices[x.dataset.device]=x.checked;if(x.checked)event("blue",x.dataset.device+" als gestoert markiert","devices");let c=Object.values(S.devices).filter(Boolean).length;if(c>=3)event("red",c+" Geraete gleichzeitig betroffen - zentrale Netzursache sehr wahrscheinlich","devices");save();renderDevices()})}
function renderDocsis(){if(!S.docsis.length){$("docsisView").innerHTML="Noch kein Schnappschuss.";return}let a=S.docsis.slice().reverse(),last=a[0],prev=a[1],delta=prev?last.uncorr-prev.uncorr:null;$("docsisView").innerHTML=`<div class="finding ${delta>1000?"red":delta>0?"yellow":"green"}"><b>Letzte AEnderung nicht korrigierbarer Fehler:</b> ${delta==null?"Vergleich nach zweitem Schnappschuss":(delta>=0?"+":"")+delta}</div><div class="table-wrap"><table><thead><tr><th>Zeit</th><th>Nicht korr.</th><th>Korr.</th><th>Downstream</th><th>Upstream</th></tr></thead><tbody>${a.map(x=>`<tr><td>${new Date(x.ts).toLocaleString("de-DE")}</td><td>${x.uncorr}</td><td>${x.corr}</td><td>${x.down??"-"}</td><td>${x.up??"-"}</td></tr>`).join("")}</tbody></table></div>`}
function renderDeepProgress(){
 if(!$("deepProgress"))return;
 const total=(S.settings.deepSeconds||60)*1000,remain=S.deep&&S.deepUntil?Math.max(0,S.deepUntil-Date.now()):0,pct=S.deep?Math.max(0,Math.min(100,remain/total*100)):0;
 $("deepProgress").classList.toggle("active",!!S.deep);
 $("deepFill").style.width=pct+"%";
 $("deepRemain").textContent=S.deep?Math.ceil(remain/1000)+" s":"-- s";
 $("deepLabel").textContent=S.deep?"Tiefenanalyse laeuft - dichter Messmodus":"Tiefenanalyse bereit";
}
function parseDiag(raw,name){let t=raw.replace(/\r/g,""),os=/FRITZ!OS\s*([0-9.]+)/i.exec(t),rx=/(\d+)\s*Empfangskanaele/i.exec(t),tx=/(\d+)\s*Sendekanaele/i.exec(t);return {fileName:name,ts:Date.now(),fritzOS:os?.[1]||null,rxChannels:rx?+rx[1]:null,txChannels:tx?+tx[1]:null,meshError:/(Fehler.{0,100}Mesh|Mesh.{0,100}Fehler|unterbrochene WLAN-Verbindung)/is.test(t),weakWifi:/schwache WLAN-Verbindung/is.test(t),sameChannel24:/2,4.{0,120}(drei|3)\s+(andere\s+)?WLAN-Netze.{0,80}(selben|gleichen)\s+Kanal/is.test(t)}}
function findNum(t,patterns){for(const p of patterns){let m=p.exec(t);if(m)return Number(String(m[1]).replace(",",".").replace(/[^\d.-]/g,""))}return null}
function detectRouterKind(t,name){
 let low=(t+" "+name).toLowerCase();
 if(low.includes("fritz!box")||low.includes("fritzbox"))return "FRITZ!Box";
 if(low.includes("vodafone station"))return "Vodafone Station";
 if(low.includes("speedport"))return "Speedport";
 if(low.includes("easybox"))return "EasyBox";
 if(low.includes("tp-link")||low.includes("tplink")||low.includes("deco"))return "TP-Link/Deco";
 return "Allgemeiner Router";
}
function parseRouterFile(raw,name){
 let t=raw.replace(/\r/g," "),kind=detectRouterKind(t,name),json=null;
 try{json=JSON.parse(raw)}catch{}
 let model=/((FRITZ!Box|Vodafone Station|Speedport|EasyBox|TP-?Link|Deco)[^<\n\r]{0,60})/i.exec(t)?.[1]?.trim()||json?.settings?.customModel||json?.settings?.model||kind;
 let os=/FRITZ!OS\s*([0-9.]+)/i.exec(t)?.[1]||null;
 let uncorr=findNum(t,[/nicht\s*korrigierbare[^0-9]{0,40}([0-9][0-9.,]*)/i,/uncorrect(?:able|ed)[^0-9]{0,40}([0-9][0-9.,]*)/i,/unerrored[^0-9]{0,80}uncorrect[^0-9]{0,40}([0-9][0-9.,]*)/i]);
 let corr=findNum(t,[/korrigierbare[^0-9]{0,40}([0-9][0-9.,]*)/i,/correct(?:able|ed)[^0-9]{0,40}([0-9][0-9.,]*)/i]);
 let down=findNum(t,[/downstream[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i,/empfang[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i]);
 let up=findNum(t,[/upstream[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i,/senden[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i]);
 let snr=findNum(t,[/(?:SNR|MSE)[^0-9-]{0,40}(-?[0-9]+(?:[,.][0-9]+)?)/i]);
 let channels=(t.match(/(?:Empfangskanal|Downstream|DOCSIS)/gi)||[]).length;
 let docsisDetected=/DOCSIS|Kabel-Informationen|Empfangskanaele|Sendekanaele|nicht korrigierbar/i.test(t)||kind==="Vodafone Station";
 let warnings=[];
 if(docsisDetected&&uncorr!=null&&uncorr>0)warnings.push("Nicht korrigierbare DOCSIS-Fehler erkannt.");
 if(snr!=null&&snr<30)warnings.push("Signalqualitaet/SNR wirkt niedrig.");
 if(down!=null&&(down<-12||down>12))warnings.push("Downstream-Pegel ausserhalb typischer Zielbereiche.");
 if(up!=null&&up>51)warnings.push("Upstream-Pegel hoch.");
 if(/schwache WLAN|Mesh.{0,80}Fehler|Radar|DFS|Kanalbelegung/i.test(t))warnings.push("WLAN-/Mesh-Hinweis erkannt.");
 let level=warnings.some(w=>/unkorrigierbare|niedrig|ausserhalb|hoch/i.test(w))?"yellow":"green";
 let summary=docsisDetected?`DOCSIS ${uncorr==null?"ohne Zaehler":"unkorr. "+uncorr}${snr==null?"":", SNR "+snr}`:"Routerprofil ohne DOCSIS-Pflichtfelder";
 return {fileName:name,ts:Date.now(),kind,model,os,docsisDetected,uncorr,corr,down,up,snr,channels,warnings,level,summary,rawSize:raw.length};
}
function parseSmartFile(raw,name){
 let t=raw.replace(/\r/g," "),json=null;try{json=JSON.parse(raw)}catch{}
 let temp=findNum(t,[/Temperature[^0-9]{0,40}([0-9]{2,3})/i,/Temperatur[^0-9]{0,40}([0-9]{2,3})/i]);
 let realloc=findNum(t,[/Reallocated[^0-9]{0,50}([0-9]+)/i,/Wiederzugewiesene[^0-9]{0,50}([0-9]+)/i]);
 let pending=findNum(t,[/Pending[^0-9]{0,50}([0-9]+)/i,/Ausstehende[^0-9]{0,50}([0-9]+)/i]);
 let uncorrect=findNum(t,[/Uncorrectable[^0-9]{0,50}([0-9]+)/i,/nicht korrigierbar[^0-9]{0,50}([0-9]+)/i]);
 let wear=findNum(t,[/Wear[^0-9]{0,50}([0-9]+)/i,/Media Wearout[^0-9]{0,50}([0-9]+)/i]);
 let status=json?.health||json?.status||(/Pred Fail|Bad|Caution|Critical|Kritisch/i.test(t)?"kritisch":/OK|Healthy|Gut|Normal/i.test(t)?"ok":"unbekannt");
 let warnings=[];
 if(/Pred Fail|Bad|Critical|Kritisch/i.test(t))warnings.push("Datentraegerstatus kritisch gemeldet.");
 if((realloc||0)>0)warnings.push("Reallocated-Sektoren vorhanden.");
 if((pending||0)>0)warnings.push("Pending-Sektoren vorhanden.");
 if((uncorrect||0)>0)warnings.push("Uncorrectable-Fehler vorhanden.");
 if(temp!=null&&temp>=55)warnings.push("Temperatur hoch.");
 if(wear!=null&&wear>=80)warnings.push("SSD-Verschleisswert auffaellig.");
 let level=warnings.length?"yellow":status==="unbekannt"?"gray":"green";
 return {fileName:name,ts:Date.now(),status,temperature:temp,reallocated:realloc,pending,uncorrectable:uncorrect,wear,level,warnings,rawSize:raw.length};
}
function renderRouterImportState(){
 if(!$("routerImportState"))return;
 let x=S.routerImport;
 if(!x){$("routerImportState").innerHTML=`<div class="finding gray"><b>Noch keine Routerdatei importiert.</b><p>FRITZ!Box, Vodafone Station, Speedport oder andere Router koennen ueber gespeicherte Diagnose-/Statusdateien ausgewertet werden. Direkter Routerzugriff im Browser bleibt aus Sicherheitsgruenden begrenzt.</p></div>`;return}
 $("routerImportState").innerHTML=`<div class="finding ${x.level}"><b>${x.model||x.kind}</b><br>${x.summary}<br><small>${x.fileName} - ${new Date(x.ts).toLocaleString("de-DE")}</small></div><div class="mini-grid">${miniStat("Typ",x.kind,"erkannter Routertyp","blue")}${miniStat("DOCSIS",x.docsisDetected?"erkannt":"nicht erkannt",x.docsisDetected?"Kabelwerte koennen bewertet werden":"DSL/Fiber/WAN-Profil ohne DOCSIS","blue")}${miniStat("Nicht korr.",x.uncorr??"-","DOCSIS-Fehlerzaehler",x.uncorr>0?"yellow":"green")}${miniStat("SNR/MSE",x.snr??"-","Signalqualitaet aus Import",x.snr!=null&&x.snr<30?"yellow":"green")}</div>${x.warnings.length?x.warnings.map(w=>`<div class="finding yellow">${w}</div>`).join(""):`<div class="finding green">Keine harten Router-/DOCSIS-Warnungen im Importtext erkannt.</div>`}`;
}
function routerDetection(){
 const d=S.latest.snapshot||{},p=profile(),imp=S.routerImport,diag=S.fritzdiag;
 let score=20,model=p.name,kind=p.access||"unbekannt",notes=[];
 if(p.id!=="custom-router"){score+=20;notes.push("Eingestelltes Routerprofil: "+p.name)}
 if(d.router?.ok){score+=25;notes.push("Routeradresse erreichbar: "+(S.settings.host||p.defaultHost))}
 if(imp){score+=35;model=imp.model||model;kind=imp.kind||kind;notes.push("Routerdatei erkannt: "+imp.kind)}
 if(diag){score+=25;model=model.includes("FRITZ")?model:"FRITZ!Box / "+model;notes.push("FRITZ!Box-Funktionsdiagnose importiert")}
 if(p.docsis||imp?.docsisDetected)notes.push("Kabel/DOCSIS-Felder relevant.");
 else notes.push("Keine DOCSIS-Pflichtfelder fuer dieses Profil.");
 score=Math.min(100,score);
 return {ts:Date.now(),score,model,kind,level:score>=75?"green":score>=45?"yellow":"gray",notes};
}
function renderRouterDetectState(){
 if(!$("routerDetectState"))return;
 let x=S.routerDetect;
 if(!x){$("routerDetectState").innerHTML=`<div class="finding gray"><b>Router noch nicht erkannt.</b><p>Nutze 'Router erkennen'. Der Assistent bewertet lokale Messwerte, Profil und importierte Dateien.</p></div>`;return}
 $("routerDetectState").innerHTML=`<div class="finding ${x.level}"><b>Router-Erkennung: ${x.model}</b><br>Trefferqualitaet ${x.score} % - ${x.kind}<br><small>${new Date(x.ts).toLocaleString("de-DE")}</small></div>${x.notes.map(n=>`<div class="finding blue">${n}</div>`).join("")}`;
}
function showRouterDetectPanel(stage,x=null){
 const panel=$("routerDetectPanel");if(!panel)return;
 panel.hidden=false;
 const msg=$("routerDetectMsg"),fill=$("routerDetectFill"),res=$("routerDetectResult");
 if(stage==="running"){
  msg.textContent="Router wird erkannt: Profil, Routeradresse, Live-Messung und importierte Dateien werden abgeglichen ...";
  fill.style.width="18%";
  res.innerHTML=`<div class="result-line">Start: ${new Date().toLocaleTimeString("de-DE")}</div>`;
  setTimeout(()=>{if(!panel.hidden)fill.style.width="52%"},220);
  setTimeout(()=>{if(!panel.hidden)fill.style.width="82%"},520);
  return;
 }
 if(stage==="done"&&x){
  msg.textContent="Router-Erkennung abgeschlossen.";
  fill.style.width="100%";
  const cls=x.level==="green"?"good":"warn";
  res.innerHTML=`<div class="result-line ${cls}"><b>${x.model}</b><br>Trefferqualitaet ${x.score} % - ${x.kind}</div>${x.notes.map(n=>`<div class="result-line">${n}</div>`).join("")}`;
 }
}
function runRouterDetect(){
 showRouterDetectPanel("running");
 setTimeout(()=>{
  S.routerDetect=routerDetection();
  event(S.routerDetect.level==="green"?"blue":"yellow","Router-Erkennung ausgefuehrt: "+S.routerDetect.model,"router-detect");
  save();render();showRouterDetectPanel("done",S.routerDetect);
 },850);
}
function startAssistant(){
 S.assistant={active:true,step:0};
 event("blue","Gefuehrter Assistent gestartet","assistant");
 render();
 const card=document.querySelector(".ai-assistant");
 if(card){card.classList.add("assistant-running");card.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>card.classList.remove("assistant-running"),2200)}
}
function runAction(action){
 if(action==="detectRouter")return runRouterDetect();
 if(action==="openRouter")return window.open("http://"+(S.settings.host||profile().defaultHost||"fritz.box"),"_blank");
 if(action==="importRouter")return $("routerFile")?.click();
 if(action==="importDiag")return $("diagFile")?.click();
 if(action==="importSmart")return $("smartFile")?.click();
 if(action==="exportReport")return exportReport();
 if(action==="startAssistant")return startAssistant();
}
function renderSmartState(){
 if(!$("smartState"))return;
 let x=S.smart;
 if(!x){$("smartState").innerHTML=`<div class="finding gray"><b>Noch kein SMART-/PC-Bericht importiert.</b><p>SMART-Werte kommen spaeter aus dem lokalen Pruefdienst oder aus Exporten von Windows, CrystalDiskInfo, Hersteller-Tools oder PowerShell.</p></div>`;return}
 $("smartState").innerHTML=`<div class="finding ${x.level}"><b>SMART-/PC-Bericht: ${x.status}</b><br><small>${x.fileName} - ${new Date(x.ts).toLocaleString("de-DE")}</small></div><div class="mini-grid">${miniStat("Temperatur",x.temperature??"-","Grad Celsius",x.temperature>=55?"yellow":"green")}${miniStat("Reallocated",x.reallocated??"-","ersetzte Sektoren",x.reallocated>0?"yellow":"green")}${miniStat("Pending",x.pending??"-","ausstehende Sektoren",x.pending>0?"yellow":"green")}${miniStat("Uncorrectable",x.uncorrectable??"-","nicht korrigierbare Medienfehler",x.uncorrectable>0?"yellow":"green")}</div>${x.warnings.length?x.warnings.map(w=>`<div class="finding yellow">${w}</div>`).join(""):`<div class="finding green">Keine SMART-Warnungen im Importtext erkannt.</div>`}`;
}
function miniStat(title,value,explain,l="green"){return `<div class="mini-stat ${l}"><b>${title}</b><strong>${value}</strong><span>${explain}</span></div>`}
function redrawGauges(){
 if(S.settings.master===false){
  gauge("gRouter",0,100,"0 ms","gray");
  gauge("gInternet",0,300,"0 ms","gray");
  gauge("gPcHealth",0,100,"0 %","gray");
  gauge("gStorage",0,100,"0 %","gray");
  gauge("gLoss",0,10,"0,0 %","gray");
  return;
 }
 let d=S.latest.snapshot||{},r=d.router||{},cf=d.targets?.cloudflare||{},q=d.quality||{},sys=d.system||{},health=pcHealth(sys);
 gauge("gRouter",testOn("router")?r.avgMs:0,100,testOn("router")&&r.ok?n(r.avgMs)+" ms":"0 ms",testOn("router")?level(r.ok,r.avgMs,20,100):"gray");
 gauge("gInternet",testOn("multiPing")?cf.avgMs:0,300,testOn("multiPing")&&cf.ok?n(cf.avgMs)+" ms":"0 ms",testOn("multiPing")?level(cf.ok,cf.avgMs,80,250):"gray");
 gauge("gPcHealth",testOn("system")?100-health.score:0,100,testOn("system")?health.score+" %":"0 %",testOn("system")?health.l:"gray");
 gauge("gStorage",testOn("system")?sys.diskPct:0,100,testOn("system")&&sys.diskPct!=null?n(sys.diskPct)+" %":"0 %",testOn("system")?level(true,sys.diskPct,80,95):"gray");
 gauge("gLoss",testOn("loss")?Math.max(q.lossPct||0,(q.p95JitterMs||0)/10):0,10,testOn("loss")&&q.lossPct!=null?n(q.lossPct,1)+" %":"0,0 %",testOn("loss")?level(d.ok,q.lossPct,1,5):"gray");
}

async function poll(){if(S.settings.master===false){renderLive();return;}cycle.running=true;cycle.phase=S.deep?"Tiefenanalyse: Messpunkte werden dicht geprueft":"FRITZ!Box, Internet, DNS und PC werden geprueft";renderLive();
setOperation(0,"running","FRITZ!Box wird angesprochen ...");
let seqTimers=[
 setTimeout(()=>setOperation(1,"running","Mehrere Internetziele werden parallel verglichen ..."),700),
 setTimeout(()=>setOperation(2,"running","IPv4 und IPv6 werden getrennt geprueft ..."),1400),
 setTimeout(()=>setOperation(3,"running","DNS-Antwortzeiten werden gemessen ..."),2100),
 setTimeout(()=>setOperation(4,"running","Paketverlust und Laufzeitschwankung werden berechnet ..."),2800),
 setTimeout(()=>setOperation(5,"running","CPU, RAM und Datentraeger werden geprueft ..."),3500)
];
let d=await api(S.deep?"/deep":"/status");seqTimers.forEach(clearTimeout);addSample("snapshot",d);if(d.quality&&testOn("loss"))addSample("quality",{ok:d.ok,...d.quality});if(d.router&&testOn("router"))addSample("router",d.router);if(testOn("multiPing"))Object.entries(d.targets||{}).forEach(([k,v])=>addSample("target:"+k,v));if(d.ok&&testOn("router")&&testOn("multiPing")&&d.router?.ok&&d.targets&&Object.values(d.targets).filter(x=>x.ok).length===0)event("red","FRITZ!Box erreichbar, mehrere Internetziele gleichzeitig ausgefallen","internet");if(testOn("loss")&&(d.quality?.lossPct||0)>=5)event("red","Deutlicher Paketverlust: "+d.quality.lossPct+" %","quality");if(testOn("loss")&&(d.quality?.p95JitterMs||0)>=50)event("yellow","Hohe Laufzeitschwankung P95: "+d.quality.p95JitterMs+" ms","quality");setOperation(6,"running","Messwerte werden zur Ursachenbewertung zusammengefuehrt ...");
setTimeout(()=>{operationState.result=d.ok?"Messzyklus erfolgreich abgeschlossen":"Pruefdienst nicht erreichbar";setOperation(6,"done",operationState.result);renderOperation()},450);
cycle.running=false;cycle.last=Date.now();cycle.count++;cycle.left=cycle.seconds;cycle.phase="Messzyklus abgeschlossen - Ergebnisse werden angezeigt";renderLive();render()}
async function deep(){
 if(S.deep||S.settings.master===false)return;
 S.deep=true;S.stage=3;S.deepUntil=Date.now()+(S.settings.deepSeconds||60)*1000;
 event("blue",(S.settings.deepSeconds||60)+"-Sekunden-Tiefenanalyse gestartet","system");
 render();renderDeepProgress();await api("/trigger-deep",{method:"POST"});
 if(deepTimer)clearTimeout(deepTimer);
 deepTimer=setTimeout(()=>{S.deep=false;S.stage=1;S.deepUntil=null;event("blue","Tiefenanalyse beendet","system");render();renderDeepProgress()},(S.settings.deepSeconds||60)*1000)
}
function openWindow(title,body){let w=document.createElement("div");w.className="window";w.style.left=(90+Math.random()*180)+"px";w.style.top=(50+Math.random()*100)+"px";w.innerHTML=`<div class="window-head"><b>${title}</b><div class="window-controls"><button data-min>-</button><button data-max>[]</button><button class="close" data-close>x</button></div></div><div class="window-body">${body}</div>`;$("windowLayer").appendChild(w);let h=w.querySelector(".window-head"),drag=false,ox=0,oy=0;h.onmousedown=e=>{if(e.target.tagName==="BUTTON")return;drag=true;ox=e.clientX-w.offsetLeft;oy=e.clientY-w.offsetTop};document.addEventListener("mousemove",e=>{if(drag&&!w.classList.contains("max")){w.style.left=e.clientX-ox+"px";w.style.top=e.clientY-oy+"px"}});document.addEventListener("mouseup",()=>drag=false);w.querySelector("[data-close]").onclick=()=>w.remove();w.querySelector("[data-min]").onclick=()=>w.classList.toggle("min");w.querySelector("[data-max]").onclick=()=>w.classList.toggle("max");h.ondblclick=()=>w.classList.toggle("max")}
function attachInfoCards(){
 let card=document.createElement("div");card.className="info-card";document.body.appendChild(card);
 function show(el,e){if(S.settings.hints===false||S.settings.infoCards!==true)return;let t=el.dataset.info||el.title;if(!t)return;card.textContent=t;card.classList.add("show");let x=(e.clientX||20)+14,y=(e.clientY||20)+14;card.style.left=Math.min(innerWidth-340,x)+"px";card.style.top=Math.min(innerHeight-120,y)+"px"}
 function hide(){card.classList.remove("show")}
 const ensureTitles=()=>document.querySelectorAll("[data-info]").forEach(el=>{if(!el.title)el.title=el.dataset.info});
 ensureTitles();setInterval(ensureTitles,2500);
 document.addEventListener("mouseover",e=>{let el=e.target.closest("[data-info]");if(el)show(el,e)});
 document.addEventListener("mousemove",e=>{let el=e.target.closest("[data-info]");if(el&&card.classList.contains("show"))show(el,e)});
 document.addEventListener("mouseout",e=>{if(e.target.closest("[data-info]"))hide()});
 document.addEventListener("click",e=>{let el=e.target.closest("[data-info]");if(el){show(el,e);setTimeout(hide,4500)}});
}
function exportReport(){let report={product:"Netzwerk-Leitstand V4.2.7",frameworkBasis:"Framework Studio V1.38.22",exportedAt:new Date().toISOString(),assessment:analyze(S.latest.snapshot||{}),settings:S.settings,devices:S.devices,fritzdiag:S.fritzdiag,routerImport:S.routerImport,routerDetect:S.routerDetect,smart:S.smart,docsis:S.docsis,events:S.events,samples:S.samples};let b=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="Netzwerk_Leitstand_V4_Bericht_"+new Date().toISOString().replaceAll(":","-")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
$("markIncident").onclick=()=>{let t=prompt("Was haengt gerade?","Fernseher / Fire TV / Internet / ChatGPT");if(t){event("blue","MANUELLE STOERUNG: "+t,"manual");if(S.settings.markDeep!==false)deep();render()}};$("deepNow").onclick=deep;$("openFritz").onclick=()=>window.open("http://fritz.box","_blank");$("importDiag").onclick=()=>$("diagFile").click();$("diagFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.fritzdiag=parseDiag(await f.text(),f.name);event(S.fritzdiag.meshError?"red":"blue","FRITZ!Box-Funktionsdiagnose importiert","fritz");render()}e.target.value=""};$("saveDocsis").onclick=()=>{S.docsis.push({ts:Date.now(),uncorr:+$("uncorr").value||0,corr:+$("corr").value||0,down:$("down").value===""?null:+$("down").value,up:$("up").value===""?null:+$("up").value});event("blue","DOCSIS-Schnappschuss gespeichert","docsis");render()};$("exportBtn").onclick=$("reportExport").onclick=exportReport;$("measureFilter").oninput=$("measureType").onchange=$("eventFilter").oninput=renderTables;
if($("detectRouter"))$("detectRouter").onclick=runRouterDetect;
if($("detectRouterHome"))$("detectRouterHome").onclick=runRouterDetect;
if($("routerDetectClose"))$("routerDetectClose").onclick=()=>{$("routerDetectPanel").hidden=true};
if($("importRouterFile"))$("importRouterFile").onclick=()=>$("routerFile").click();
if($("routerFile"))$("routerFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.routerImport=parseRouterFile(await f.text(),f.name);if(S.routerImport.docsisDetected&&S.routerImport.uncorr!=null)S.docsis.push({ts:Date.now(),uncorr:S.routerImport.uncorr||0,corr:S.routerImport.corr||0,down:S.routerImport.down,up:S.routerImport.up,source:"router-import"});event(S.routerImport.level==="yellow"?"yellow":"blue","Routerdatei importiert: "+S.routerImport.kind,"router-import");render()}e.target.value=""};
if($("importSmartFile"))$("importSmartFile").onclick=()=>$("smartFile").click();
if($("smartFile"))$("smartFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.smart=parseSmartFile(await f.text(),f.name);event(S.smart.level==="yellow"?"yellow":"blue","SMART-/PC-Bericht importiert","smart");render()}e.target.value=""};

$("expandAll").onclick=()=>setAllSections(false);
$("collapseAll").onclick=()=>setAllSections(true);
if($("toggleAllSections"))$("toggleAllSections").onclick=()=>{let anyOpen=[...document.querySelectorAll(".page.active .foldable")].some(x=>!x.classList.contains("collapsed"));setAllSections(anyOpen);$("toggleAllSections").textContent=anyOpen?"A":"V"};
$("lockSections").onclick=()=>{S.settings.sectionsLocked=!S.settings.sectionsLocked;save();updateSectionLock()};
if($("assistantStart"))$("assistantStart").onclick=startAssistant;
if($("assistantStartTop"))$("assistantStartTop").onclick=startAssistant;
if($("assistantPrev"))$("assistantPrev").onclick=()=>{if(S.assistant?.active){S.assistant.step=Math.max(0,S.assistant.step-1);render()}};
if($("assistantNext"))$("assistantNext").onclick=()=>{if(S.assistant?.active){S.assistant.step++;render()}};
document.querySelectorAll(".nav-group-toggle").forEach(btn=>btn.onclick=e=>{e.stopPropagation();btn.closest(".nav-group")?.classList.toggle("closed")});
document.querySelectorAll(".settings-tab").forEach(b=>b.onclick=()=>showSettingsPanel(b.dataset.settingsPanel));
document.addEventListener("click",e=>{let b=e.target.closest("[data-settings-tab]");if(b)setTimeout(()=>showSettingsPanel(b.dataset.settingsTab),0)});
if($("officeModeBtn"))$("officeModeBtn").addEventListener("click",()=>{if($("officeModeBtn").classList.contains("active"))showOffice();else{S.settings.officeMode=false;save();leaveOffice();$("backToOffice").hidden=true}});
if($("backToOffice"))$("backToOffice").onclick=showOffice;
if($("officeChairExit"))$("officeChairExit").onclick=()=>{S.settings.officeMode=false;save();leaveOffice();$("officeModeBtn")?.classList.remove("active");if($("officeModeBtn"))$("officeModeBtn").textContent=$("officeModeBtn").dataset.labelOff||"Büromodus starten";if($("backToOffice"))$("backToOffice").hidden=true};
document.querySelectorAll("[data-office-command]").forEach(el=>{
 el.addEventListener("click",()=>officeCommand(el.dataset.officeCommand));
 el.addEventListener("mouseenter",()=>{
   el.classList.add("office-active");
   const note=$("officeLiveNote"); if(note) note.textContent=el.dataset.label||"Aktion bereit";
   if(el.dataset.officeCommand==="console") document.querySelector(".office-console-actions")?.classList.add("office-visible");
 });
 el.addEventListener("mouseleave",()=>{
   el.classList.remove("office-active");
   if(el.dataset.officeCommand==="console") setTimeout(()=>{
     const actions=document.querySelector(".office-console-actions");
     if(actions && !actions.matches(":hover") && !actions.matches(":focus-within")) actions.classList.remove("office-visible");
   },120);
 });
 el.addEventListener("focus",()=>{el.classList.add("office-active"); if(el.dataset.officeCommand==="console") document.querySelector(".office-console-actions")?.classList.add("office-visible")});
 el.addEventListener("blur",()=>{el.classList.remove("office-active")});
});
const officeActions=document.querySelector(".office-console-actions");
if(officeActions){
 officeActions.addEventListener("mouseenter",()=>officeActions.classList.add("office-visible"));
 officeActions.addEventListener("mouseleave",()=>officeActions.classList.remove("office-visible"));
}
document.querySelectorAll("[data-office-action]").forEach(button=>button.addEventListener("click",event=>{
 event.stopPropagation();
 const action=button.dataset.officeAction;
 const note=$("officeLiveNote");
 const say=text=>{if(note)note.textContent=text};
 if(action==="start-all"){
  if($("masterSwitch")){ $("masterSwitch").checked=true; $("masterSwitch").onchange(); }
  say("Alle Messungen gestartet");
 }else if(action==="stop-all"){
  if($("masterSwitch")){ $("masterSwitch").checked=false; $("masterSwitch").onchange(); }
  say("Alle Messungen gestoppt · Anzeigen auf 0");
 }else if(action==="deep"){
  if(S.settings.master===false){say("Tiefenanalyse nicht möglich · zuerst Messungen starten");return;}
  deep();say("Tiefenanalyse gestartet");
 }else if(action==="report"){exportReport();say("Bericht erzeugt");}
}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("officeOverlay")?.hidden)$("officeChairExit")?.click()});

$("setModel").onchange=()=>{S.settings.model=$("setModel").value;let p=profile();$("setAccess").value=p.access;$("setHost").value=p.defaultHost;S.settings.host=p.defaultHost;renderSettings()};
if($("suggestRouterProfile"))$("suggestRouterProfile").onclick=()=>{
 let name=($("setCustomModel")?.value||"").toLowerCase(),id=name.includes("speedport")?"speedport-smart4":name.includes("vodafone")?"vodafone-station":name.includes("easybox")?"easybox-805":name.includes("tp-link")||name.includes("deco")?"tp-link-archer":"custom-router";
 S.settings.model=id;S.settings.customModel=$("setCustomModel")?.value||"";let p=profile();S.settings.host=p.defaultHost;$("setModel").value=id;event("blue","Routerprofil lokal abgeleitet: "+p.name,"settings");renderSettings();save();
};
$("saveSettings").onclick=readSettings;
$("resetSettings").onclick=()=>{if(confirm("Alle Bedien- und Messeinstellungen auf Standard zuruecksetzen?")){S.settings={...S.settings,model:"6690-cable",host:"fritz.box",interval:15,deepSeconds:60,autoDeep:true,persist:true,density:"normal",animations:true,infoCards:false,sectionDefault:"remember",hints:true,rows:1000,scrollbars:true,markDeep:true,sectionsLocked:false,officeMode:false,uiFixVersion:"4.1.9"};save();applySettings();applySectionDefault();leaveOffice();render()}};

let pollTimer=null;
function restartPollTimer(){
 if(pollTimer) clearInterval(pollTimer);
 pollTimer=setInterval(poll,Math.max(5,Number(S.settings.interval)||15)*1000);
}
setInterval(redrawGauges,1200);
setInterval(chart,1000);
initNav();initDiagnosticTabs();enhanceFoldables();attachInstrumentSwitches();attachInfoCards();applySettings();renderOperation();renderLag();drawEKG();load().then(()=>{render();poll();restartPollTimer()});












