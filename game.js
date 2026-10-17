(() => {
  "use strict";
  const SAVE_KEY = "escapePrisonChapterSaveV1";
  const chapterData = [
    {name:"The Cell", code:"4312", goal:"Find the code and unlock the cell door.", items:["Bent Paperclip"], hint:"Inspect the bed, window, and desk. The desk hides a four-digit code."},
    {name:"Guard Station", code:"2580", goal:"Find a way to open the station exit.", items:["Guard Keycard"], hint:"Search the desk and window, then enter the code in the terminal."},
    {name:"Maintenance Tunnel", code:"7046", goal:"Restore the tunnel panel and reach the exit.", items:["Fuse"], hint:"The desk has a fuse. Collect it before trying the door."},
    {name:"Security Hub", code:"1963", goal:"Access the security console and unlock the door.", items:["Access Chip"], hint:"Inspect every object, collect the access chip, then solve the terminal challenge."},
    {name:"The Final Exit", code:"8251", goal:"Open the final gate and complete the escape.", items:["Freedom Badge"], hint:"You are almost out. Search the room and enter the final code."}
  ];
  const $ = (id) => document.getElementById(id);
  const readSave = () => {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {xp:0, unlocked:1, inventory:[], completed:[], inspected:[]}; }
    catch { return {xp:0, unlocked:1, inventory:[], completed:[], inspected:[]}; }
  };
  let save = readSave();
  function writeSave(){ localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
  function toast(title, message){
    const box=$("toast"); if(!box) return;
    $("toastTitle").textContent=title; $("toastMessage").textContent=message;
    box.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>box.classList.remove("show"),3000);
  }
  function renderHome(){
    if($("homeXP")) $("homeXP").textContent=save.xp;
    if($("homeUnlocked")) $("homeUnlocked").textContent=`${save.unlocked} / 5`;
    if($("homeItems")) $("homeItems").textContent=save.inventory.length;
    document.querySelectorAll("[data-chapter-card]").forEach(card=>{
      const n=Number(card.dataset.chapterCard), unlocked=n<=save.unlocked || save.completed.includes(n-1);
      card.classList.toggle("unlocked",unlocked); card.classList.toggle("locked",!unlocked);
      const status=card.querySelector(".card-bottom");
      if(status) status.innerHTML=unlocked?'AVAILABLE <b>↗</b>':'LOCKED <b>⌑</b>';
      card.setAttribute("aria-disabled",String(!unlocked));
      card.addEventListener("click",e=>{ if(n>save.unlocked && !save.completed.includes(n-1)){e.preventDefault();toast("CHAPTER LOCKED","Complete the previous chapter to unlock this one.");} });
    });
  }
  const chapterNo=Number(document.body.dataset.chapter||0);
  if(!chapterNo){ renderHome(); if($("resetProgress")) $("resetProgress").addEventListener("click",()=>{if(confirm("Reset all game progress on this device?")){localStorage.removeItem(SAVE_KEY);save=readSave();renderHome();toast("PROGRESS RESET","Your adventure is ready to begin again.");}}); return; }
  const chapter=chapterData[chapterNo-1];
  if(!chapter) return;
  if(chapterNo>save.unlocked && !save.completed.includes(chapterNo-1)){ location.href="../index.html"; return; }
  let seen=Array.isArray(save.inspected)?save.inspected:[]; let chapterSeen=new Set(seen.filter(x=>x.startsWith(chapterNo+":")).map(x=>x.split(":")[1]));
  let collected=save.inventory.includes(chapter.items[0]);
  let terminalSolved=save.completed.includes(chapterNo);
  let paused=false;
  if($("gameChapter")) $("gameChapter").textContent=`CHAPTER ${String(chapterNo).padStart(2,"0")}`;
  if($("gameTitle")) $("gameTitle").textContent=chapter.name;
  if($("objectiveText")) $("objectiveText").textContent=chapter.goal;
  if($("terminalOutput")) $("terminalOutput").textContent=`VERIDIS PRISON OS v2.1\nChapter ${chapterNo} terminal ready.\nType "help" to view commands.`;
  function inspectObject(which){
    const labels={bed:"Bed",window:"Window",desk:"Desk",door:"Door"};
    if(which==="bed"){
      markSeen(which); toast("BED INSPECTED",chapterNo===1?"A loose paperclip is tucked beneath the mattress.":"A small note is hidden in the bedding.");
      if(!collected && chapterNo===1) collectItem();
      else if(!collected && chapterNo>1) toast("CLUE FOUND","A useful clue, but the key item may be elsewhere.");
    } else if(which==="window"){
      markSeen(which); toast("WINDOW INSPECTED","The bars are secure. You notice scratches forming a pattern: "+chapter.code.split("").join(" · ")+".");
    } else if(which==="desk"){
      markSeen(which);
      if(!collected) collectItem();
      toast("DESK INSPECTED","You found a clue: the access code is "+chapter.code+". Try it in the terminal.");
      addTerminal(`Clue logged: access code ${chapter.code}.`);
    } else if(which==="door"){
      markSeen(which);
      if(terminalSolved){ completeChapter(); }
      else { toast("LOCKED DOOR","The lock needs a valid terminal code first."); addTerminal("Door status: LOCKED. Find the code and solve the terminal."); }
    }
    updateUI();
  }
  function markSeen(which){ const key=chapterNo+":"+which; if(!save.inspected.includes(key))save.inspected.push(key); chapterSeen.add(which); writeSave(); }
  function collectItem(){
    if(collected)return;
    collected=true;
    const item=chapter.items[0]; if(!save.inventory.includes(item))save.inventory.push(item);
    save.xp+=25; writeSave(); toast("ITEM COLLECTED",`${item} added to your inventory. +25 XP`);
    addTerminal(`Inventory update: ${item} acquired.`);
  }
  function updateUI(){
    if($("hudXP"))$("hudXP").textContent=save.xp;
    if($("hudItems"))$("hudItems").textContent=save.inventory.length;
    if($("inventoryList"))$("inventoryList").innerHTML=save.inventory.length?save.inventory.map(x=>`<span class="inventory-item">${escapeHTML(x)}</span>`).join(""):'<span class="empty-inventory">No items found yet.</span>';
    if($("objectiveList")) $("objectiveList").innerHTML=[
      {text:"Inspect at least two objects",done:chapterSeen.size>=2},
      {text:`Collect ${chapter.items[0]}`,done:collected},
      {text:"Solve the terminal code",done:terminalSolved}
    ].map(x=>`<div class="objective ${x.done?'done':''}">${x.text}</div>`).join("");
    if($("progressFill"))$("progressFill").style.width=((Number(chapterSeen.size>=2)+Number(collected)+Number(terminalSolved))/3*100)+"%";
    if($("completeButton"))$("completeButton").textContent=terminalSolved?"Chapter complete ✓":"Check the door";
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function addTerminal(line){const out=$("terminalOutput");if(!out)return;out.textContent+="\n> "+line;out.scrollTop=out.scrollHeight;}
  function runCommand(raw){
    const cmd=raw.trim().toLowerCase(); if(!cmd)return;
    addTerminal(cmd);
    if(cmd==="help") addTerminal("Commands: help, look, inventory, status, hint, clear, code ####");
    else if(cmd==="look")addTerminal("Objects: bed, window, desk, door. Tap objects in the room to inspect them.");
    else if(cmd==="inventory")addTerminal(save.inventory.length?save.inventory.join(", "):"Inventory empty.");
    else if(cmd==="status")addTerminal(`Chapter ${chapterNo}/5 | XP ${save.xp} | ${terminalSolved?"door unlocked":"door locked"}`);
    else if(cmd==="hint")addTerminal(chapter.hint);
    else if(cmd==="clear")$("terminalOutput").textContent="VERIDIS PRISON OS v2.1\nTerminal cleared.";
    else if(cmd.startsWith("code ")){
      const entered=cmd.slice(5).trim();
      if(entered===chapter.code){if(!terminalSolved){terminalSolved=true;save.completed=[...new Set([...save.completed,chapterNo])];save.xp+=50;writeSave();}addTerminal("ACCESS GRANTED. Door lock disengaged. +50 XP.");toast("ACCESS GRANTED","The lock is open. Click the door to continue.");updateUI();}
      else {addTerminal("ACCESS DENIED. Code incorrect.");toast("ACCESS DENIED","That code did not work. Inspect the room for another clue.");}
    } else if(cmd==='print("i will escape!")'||cmd==="print('i will escape!')"){addTerminal("I will escape!");}
    else addTerminal("Unknown command. Type help to see available commands.");
  }
  function completeChapter(){
    if(!terminalSolved){toast("DOOR LOCKED","Solve the terminal code first.");return;}
    if(chapterNo<5){
      save.unlocked=Math.max(save.unlocked,chapterNo+1);save.completed=[...new Set([...save.completed,chapterNo])];writeSave();
      showModal("CHAPTER COMPLETE",`You cleared ${chapter.name}. Chapter ${chapterNo+1} is now unlocked.`,[
        {label:"Next chapter →",primary:true,action:()=>location.href=`chapter-${chapterNo+1}.html`},
        {label:"Chapter select",action:()=>location.href="../index.html"}
      ]);
    } else {
      save.unlocked=5;save.completed=[...new Set([...save.completed,chapterNo])];writeSave();
      showModal("ESCAPE SUCCESSFUL", "You solved every puzzle and reached freedom. The adventure is complete!",[
        {label:"Play again",primary:true,action:()=>{localStorage.removeItem(SAVE_KEY);location.href="../index.html";}},
        {label:"Chapter select",action:()=>location.href="../index.html"}
      ]);
    }
  }
  function showModal(title,message,actions){
    const modal=$("modalBackdrop");if(!modal)return;
    $("modalTitle").textContent=title;$("modalMessage").textContent=message;
    const holder=$("modalActions");holder.innerHTML="";
    actions.forEach(a=>{const b=document.createElement("button");b.className="button "+(a.primary?"button-primary":"button-quiet");b.textContent=a.label;b.addEventListener("click",a.action);holder.appendChild(b);});
    modal.classList.add("show");
  }
  const scene=$("roomScene");let playerX=46;
  function move(dir){if(paused)return;playerX=Math.max(4,Math.min(84,playerX+dir*4));const p=$("stickman");if(p)p.style.left=playerX+"%";}
  if($("moveLeft"))$("moveLeft").addEventListener("click",()=>move(-1));
  if($("moveRight"))$("moveRight").addEventListener("click",()=>move(1));
  if($("inspectNearest"))$("inspectNearest").addEventListener("click",()=>{if(playerX>67)inspectObject("door");else if(playerX>30&&playerX<65)inspectObject("desk");else if(playerX<28)inspectObject("window");else inspectObject("bed");});
  document.querySelectorAll("[data-object]").forEach(el=>el.addEventListener("click",()=>inspectObject(el.dataset.object)));
  if($("terminalForm"))$("terminalForm").addEventListener("submit",e=>{e.preventDefault();runCommand($("terminalInput").value);$("terminalInput").value="";});
  if($("hintButton"))$("hintButton").addEventListener("click",()=>{toast("MISSION HINT",chapter.hint);addTerminal("Hint: "+chapter.hint);});
  if($("pauseButton"))$("pauseButton").addEventListener("click",()=>{paused=!paused;$("pauseButton").textContent=paused?"Resume":"Pause";toast(paused?"PAUSED":"RESUMED",paused?"Take a break.":"Back to the mission.");});
  if($("completeButton"))$("completeButton").addEventListener("click",completeChapter);
  document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")move(-1);if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")move(1);});
  updateUI();
})();