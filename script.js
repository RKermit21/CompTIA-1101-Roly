document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const scoreEl = document.getElementById("score");
  const passFailEl = document.getElementById("passFail");
  const submitBtn = document.getElementById("submitBtn");
  const showAnswersBtn = document.getElementById("showAnswersBtn");
  const resetBtn = document.getElementById("resetBtn");
  const fireworksCanvas = document.getElementById("fireworks");
  const ctx = fireworksCanvas.getContext("2d");

  // ---------- Sound placeholders ----------
  const passSound = new Audio("pass.mp3");
  const failSound = new Audio("fail.mp3");

  // ---------- Timer ----------
  let timerEl = document.getElementById("timer");
  let totalSeconds = 20 * 60;
  let timerInterval;

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      totalSeconds--;
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      timerEl.textContent = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
      if(totalSeconds <= 180) timerEl.classList.add("strobe");
      if(totalSeconds <= 0) clearInterval(timerInterval);
    },1000);
  }

  function stopTimer(){ clearInterval(timerInterval); }

  // ---------- Fireworks ----------
  let fireworks = [];
  let fireworksActive = false;
  function startFireworks() {
    fireworksActive = true;
    fireworks = [];
    fireworksCanvas.style.opacity = "1";
    function loop() {
      if(!fireworksActive) return;
      ctx.clearRect(0,0,fireworksCanvas.width,fireworksCanvas.height);
      if(Math.random() < 0.05) fireworks.push(new Firework());
      fireworks.forEach((f,i)=>{
        f.update();
        f.draw(ctx);
        if(f.done) fireworks.splice(i,1);
      });
      requestAnimationFrame(loop);
    }
    loop();
    setTimeout(()=>{fireworksActive=false; fireworksCanvas.style.opacity="0";},10000);
  }

  class Firework { /* same as before */ 
    constructor(){this.x=Math.random()*window.innerWidth; this.y=window.innerHeight; this.vy=-(4+Math.random()*4); this.color=`hsl(${Math.random()*360},100%,50%)`; this.exploded=false; this.particles=[];}
    update(){if(!this.exploded){this.y+=this.vy; this.vy+=0.1; if(this.vy>=0){this.exploded=true; for(let i=0;i<50;i++) this.particles.push(new Particle(this.x,this.y,this.color));}} else {this.particles.forEach(p=>p.update()); this.particles=this.particles.filter(p=>!p.done);}}
    draw(ctx){if(!this.exploded){ctx.fillStyle=this.color; ctx.fillRect(this.x,this.y,2,8);} else this.particles.forEach(p=>p.draw(ctx));}
    get done(){return this.exploded && this.particles.length===0;}
  }

  class Particle { /* same as before */
    constructor(x,y,color){this.x=x; this.y=y; this.vx=(Math.random()-0.5)*6; this.vy=(Math.random()-0.5)*6; this.life=60; this.color=color;}
    update(){this.x+=this.vx; this.y+=this.vy; this.vy+=0.05; this.life--;}
    draw(ctx){ctx.fillStyle=this.color; ctx.globalAlpha=Math.max(this.life/60,0); ctx.fillRect(this.x,this.y,3,3); ctx.globalAlpha=1;}
    get done(){return this.life<=0;}
  }

  // ---------- Questions placeholder ----------
   const questions = [
    // MCQs 1-20 (scenario style)
    {type:"mcq", title:"Laptop Performance", text:"A user complains their laptop is slow after installing multiple apps. First step?", options:["Restart laptop","Reinstall OS","Replace HDD","Ignore issue"], answer:"Restart laptop"},
    {type:"mcq", title:"Battery Issue", text:"Laptop battery drains quickly even after full charge. First action?", options:["Check running processes","Replace battery","Update BIOS","Ignore"], answer:"Check running processes"},
    {type:"mcq", title:"No Internet", text:"User cannot access Wi-Fi. What is the first check?", options:["Physical connection","Replace router","Reset modem","Call ISP"], answer:"Physical connection"},
    {type:"mcq", title:"Blue Screen", text:"Laptop shows BSOD after update. Recommended step?", options:["Boot to safe mode","Reinstall OS","Replace RAM","Ignore"], answer:"Boot to safe mode"},
    {type:"mcq", title:"Software Install", text:"New software fails installation. First troubleshooting?", options:["Check system requirements","Reinstall OS","Replace HDD","Ignore"], answer:"Check system requirements"},
    {type:"mcq", title:"Printer Issue", text:"Printer won't print but is online. First step?", options:["Check print queue","Replace printer","Update driver","Ignore"], answer:"Check print queue"},
    {type:"mcq", title:"Email Issue", text:"User cannot send emails. First action?", options:["Check SMTP settings","Replace PC","Reinstall Office","Ignore"], answer:"Check SMTP settings"},
    {type:"mcq", title:"External Drive", text:"External HDD not recognized. Initial troubleshooting?", options:["Check cable/port","Replace drive","Format HDD","Ignore"], answer:"Check cable/port"},
    {type:"mcq", title:"Slow Boot", text:"Laptop takes 5+ minutes to boot. Likely cause?", options:["Too many startup programs","Faulty RAM","Damaged HDD","Ignore"], answer:"Damaged HDD"},
    {type:"mcq", title:"Network Latency", text:"Ping to internal server is high. First check?", options:["Check cabling","Replace switch","Update NIC driver","Ignore"], answer:"Check cabling"},
    {type:"mcq", title:"Malware", text:"Suspicious pop-ups after browsing. First step?", options:["Run antivirus scan","Reinstall OS","Replace browser","Ignore"], answer:"Run antivirus scan"},
    {type:"mcq", title:"Peripheral Issue", text:"Mouse intermittently not working. First action?", options:["Try different USB port","Replace mouse","Reinstall driver","Ignore"], answer:"Try different USB port"},
    {type:"mcq", title:"OS Update", text:"User cannot install updates. First step?", options:["Check disk space","Reinstall OS","Replace SSD","Ignore"], answer:"Check disk space"},
    {type:"mcq", title:"Wi-Fi Drops", text:"Laptop frequently loses Wi-Fi. First troubleshooting step?", options:["Check router signal","Replace NIC","Update firmware","Ignore"], answer:"Check router signal"},
    {type:"mcq", title:"File Corruption", text:"Documents cannot open, files corrupted. Initial troubleshooting?", options:["Run chkdsk","Replace HDD","Restore OS","Ignore"], answer:"Run chkdsk"},
    {type:"mcq", title:"Audio Issue", text:"No sound on laptop. First check?", options:["Check audio settings","Replace speakers","Reinstall driver","Ignore"], answer:"Check audio settings"},
    {type:"mcq", title:"Display Issue", text:"Screen flickers randomly. Initial step?", options:["Update GPU driver","Replace display","Reboot PC","Ignore"], answer:"Update GPU driver"},
    {type:"mcq", title:"USB Device", text:"USB device not detected. First step?", options:["Try different port","Replace device","Reinstall driver","Ignore"], answer:"Try different port"},
    {type:"mcq", title:"VPN Issue", text:"User cannot connect to VPN. First action?", options:["Check credentials","Replace PC","Reinstall VPN client","Ignore"], answer:"Check credentials"},
    {type:"mcq", title:"Browser Crash", text:"Browser crashes on multiple sites. First troubleshooting?", options:["Clear cache and cookies","Reinstall OS","Update router","Ignore"], answer:"Clear cache and cookies"},

    // Matching 21-35
    {type:"match", title:"RAID Types", text:"Match RAID type to characteristic:", pairs:[
      {key:"RAID 0", value:"Striping for speed, no redundancy"},
      {key:"RAID 1", value:"Mirroring for redundancy"},
      {key:"RAID 5", value:"Striping with parity"},
      {key:"RAID 10", value:"Striping + mirroring"}
    ]},
    {type:"match", title:"Ports", text:"Match port to device:", pairs:[
      {key:"HDMI", value:"Monitor"},
      {key:"USB-C", value:"Phone/External drive"},
      {key:"Ethernet", value:"Network"},
      {key:"3.5mm Audio", value:"Headphones"}
    ]},
    {type:"match", title:"Processor Types", text:"Match processor to use:", pairs:[
      {key:"i3", value:"Basic office use"},
      {key:"i5", value:"Midrange performance"},
      {key:"i7", value:"High performance"},
      {key:"i9", value:"Extreme performance"}
    ]},
    {type:"match", title:"Storage Types", text:"Match storage to feature:", pairs:[
      {key:"HDD", value:"High capacity, slower"},
      {key:"SSD", value:"Fast, less capacity"},
      {key:"NVMe", value:"Very fast, expensive"},
      {key:"Hybrid", value:"Combo of SSD+HDD"}
    ]},
    {type:"match", title:"Network Types", text:"Match network type to speed:", pairs:[
      {key:"Ethernet", value:"1 Gbps"},
      {key:"Wi-Fi 5", value:"300 Mbps"},
      {key:"Wi-Fi 6", value:"1 Gbps+"},
      {key:"Fiber", value:"10 Gbps"}
    ]},
    {type:"match", title:"Cable Types", text:"Match cable to use:", pairs:[
      {key:"Cat5e", value:"Standard ethernet"},
      {key:"Cat6", value:"High speed ethernet"},
      {key:"HDMI", value:"Video/audio"},
      {key:"USB", value:"Peripheral devices"}
    ]},
    {type:"match", title:"IP Classes", text:"Match IP class to usage:", pairs:[
      {key:"Class A", value:"Large networks"},
      {key:"Class B", value:"Medium networks"},
      {key:"Class C", value:"Small networks"},
      {key:"Class D", value:"Multicast"}
    ]},
    {type:"match", title:"Troubleshooting Steps", text:"Match step to scenario:", pairs:[
      {key:"Check logs", value:"App crash"},
      {key:"Reboot device", value:"Frozen system"},
      {key:"Replace hardware", value:"Faulty RAM"},
      {key:"Update drivers", value:"Device malfunction"}
    ]},

    // Ordering 36-50
    {type:"order", title:"PC Boot Steps", text:"Order PC boot steps correctly:", steps:["POST","BIOS initialization","Load OS","User login"]},
    {type:"order", title:"Software Troubleshooting", text:"Order steps to troubleshoot app crash:", steps:["Reproduce issue","Check logs","Check updates","Apply fix"]},
    {type:"order", title:"Network Troubleshooting", text:"Order steps for no internet:", steps:["Check cables","Ping router","Check DNS","Restart PC"]},
    {type:"order", title:"Customer Ticket Resolution", text:"Order steps to resolve ticket:", steps:["Acknowledge ticket","Diagnose issue","Implement solution","Follow-up with user"]},
    {type:"order", title:"App Deployment Steps", text:"Order steps to deploy app:", steps:["Build","Test","Deploy","Monitor"]},
    {type:"order", title:"Disk Maintenance", text:"Order disk maintenance steps:", steps:["Backup data","Run chkdsk","Defragment","Verify integrity"]},
    {type:"order", title:"User Onboarding", text:"Order user onboarding steps:", steps:["Create account","Assign permissions","Provide training","Confirm access"]},
    {type:"order", title:"VPN Setup", text:"Order steps to configure VPN:", steps:["Install client","Add server info","Authenticate","Connect"]},
    {type:"order", title:"Software Update", text:"Order steps to update software:", steps:["Check update","Download","Install","Verify"]},
    {type:"order", title:"Incident Response", text:"Order incident response steps:", steps:["Identify","Contain","Eradicate","Recover"]},
    {type:"order", title:"New PC Setup", text:"Order new PC setup steps:", steps:["Unbox","Install OS","Install drivers","Verify functionality"]},
    {type:"order", title:"Printer Troubleshooting", text:"Order steps for printer not printing:", steps:["Check cables","Check drivers","Restart printer","Test print"]}
  ];

  // ---------- Helpers ----------
  function shuffleArray(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]];}}

  function createQuiz(){
    quizContainer.innerHTML="";
    questions.forEach((q,idx)=>{
      const card = document.createElement("div");
      card.className="question-card";
      const h2 = document.createElement("h2"); h2.textContent=`${idx+1}. ${q.title}`; card.appendChild(h2);
      const p = document.createElement("p"); p.textContent=q.text; card.appendChild(p);

      if(q.type==="mcq"){
        const options=[...q.options]; shuffleArray(options);
        options.forEach((opt,i)=>{
          const div=document.createElement("div"); div.className="option"; div.innerHTML=`<b>${String.fromCharCode(65+i)}. </b>${opt}`;
          div.addEventListener("click",()=>{ card.querySelectorAll(".option").forEach(o=>o.classList.remove("selected")); div.classList.add("selected"); });
          card.appendChild(div);
        });
      }

      if(q.type==="match" || q.type==="order"){
        const container=document.createElement("div"); container.className=(q.type==="match")?"match-container":"order-container";
        const bank=document.createElement("div"); bank.className=(q.type==="match")?"match-bank":"order-bank";
        const targets=document.createElement("div"); targets.className=(q.type==="match")?"match-targets":"order-targets";
        let items=(q.type==="match")?q.pairs.map(p=>({key:p.key,value:p.value})):q.steps.map(s=>({key:s,value:s}));
        let shuffledItems=[...items]; shuffleArray(shuffledItems);

        shuffledItems.forEach((item)=>{
          const itemDiv=document.createElement("div"); itemDiv.className="drag-item"; itemDiv.draggable=true; itemDiv.textContent=item.key; itemDiv.dataset.value=item.value;
          itemDiv.addEventListener("dragstart", e=>e.dataTransfer.setData("text", item.key));
          bank.appendChild(itemDiv);
        });

        items.forEach(t=>{
          const target=document.createElement("div"); target.className="drag-target"; target.dataset.correct=t.key; target.dataset.value=t.value;
          if(q.type==="match"){ const charSpan=document.createElement("span"); charSpan.className="drag-characteristic"; charSpan.textContent=t.value; target.appendChild(charSpan);}
          target.addEventListener("dragover", e=>e.preventDefault());
          target.addEventListener("drop", e=>{
            e.preventDefault(); const draggedKey=e.dataTransfer.getData("text"); if(!draggedKey) return;
            const existingKey = target.querySelector(".drag-key"); if(existingKey){ const oldKey=existingKey.textContent; const bankItem=Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===oldKey); if(bankItem) bankItem.style.display="block"; existingKey.remove();}
            const bankItem = Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===draggedKey); if(bankItem) bankItem.style.display="none";
            const keySpan=document.createElement("span"); keySpan.className="drag-key"; keySpan.textContent=draggedKey; keySpan.dataset.key=draggedKey; keySpan.draggable=true;
            keySpan.addEventListener("dragstart", ev=>ev.dataTransfer.setData("text", draggedKey));
            target.insertBefore(keySpan,target.firstChild);
          });
          targets.appendChild(target);
        });

        bank.addEventListener("dragover", e=>e.preventDefault());
        bank.addEventListener("drop", e=>{
          e.preventDefault(); const val=e.dataTransfer.getData("text"); if(!val) return;
          const spans=targets.querySelectorAll(".drag-key"); spans.forEach(s=>{if(s.textContent===val) s.remove();});
          const bankItem=Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===val); if(bankItem) bankItem.style.display="block";
        });

        container.appendChild(bank); container.appendChild(targets); card.appendChild(container);
      }

      quizContainer.appendChild(card);
    });
  }

  // ---------- Submit ----------
  function calculateScore(){
    stopTimer(); // stop timer on submit
    let score=0;
    questions.forEach((q,idx)=>{
      const card=quizContainer.children[idx];

      if(q.type==="mcq"){
        let selected = card.querySelector(".option.selected");
        card.querySelectorAll(".option").forEach(o=>o.classList.remove("correct","incorrect"));
        if(selected){
          if(selected.textContent.includes(q.answer)){ selected.classList.add("correct"); score++; }
          else { selected.classList.add("incorrect"); }
        } else { card.querySelectorAll(".option").forEach(o=>o.classList.add("incorrect")); }
      }

      if(q.type==="match" || q.type==="order"){
        const targets = card.querySelectorAll(".drag-target");
        let allCorrect=true;
        targets.forEach(t=>{ const keySpan=t.querySelector(".drag-key"); if(!keySpan || keySpan.textContent!==t.dataset.correct) allCorrect=false; });
        targets.forEach(t=>t.classList.remove("correct","incorrect"));
        if(allCorrect){ targets.forEach(t=>t.classList.add("correct")); score++; }
        else targets.forEach(t=>t.classList.add("incorrect"));
      }
    });

    scoreEl.textContent=`Score: ${score} / ${questions.length}`;
    if(score>=Math.floor(questions.length*0.8)){ passFailEl.textContent="PASS ✅"; startFireworks(); passSound.play(); }
    else { passFailEl.textContent="FAIL ❌"; failSound.play(); }
  }

  // ---------- Show Answers ----------
  function showAnswers(){
    stopTimer(); // stop timer when showing answers
    questions.forEach((q,idx)=>{
      const card=quizContainer.children[idx];

      if(q.type==="mcq"){ card.querySelectorAll(".option").forEach(o=>{ o.classList.remove("correct","incorrect"); if(o.textContent.includes(q.answer)) o.classList.add("correct"); }); }

      if(q.type==="match" || q.type==="order"){
        const targets = card.querySelectorAll(".drag-target");
        targets.forEach(t=>{ t.classList.remove("correct","incorrect");
          let correctSpan = t.querySelector(".drag-key.correct-answer");
          if(!correctSpan){ correctSpan = document.createElement("span"); correctSpan.className="drag-key correct correct-answer"; correctSpan.textContent=t.dataset.correct; correctSpan.style.color="#000"; correctSpan.style.fontWeight="bold"; t.appendChild(correctSpan);}
          t.classList.add("correct");
        });
      }
    });
  }

  // ---------- Reset ----------
  resetBtn.addEventListener("click", ()=>{
    createQuiz();
    scoreEl.textContent="";
    passFailEl.textContent="";
    totalSeconds=20*60;
    timerEl.classList.remove("strobe");
    startTimer();
  });

  submitBtn.addEventListener("click", calculateScore);
  showAnswersBtn.addEventListener("click", showAnswers);

  // ---------- Initialize ----------
  createQuiz();
  startTimer();
  function resizeCanvas(){fireworksCanvas.width=window.innerWidth; fireworksCanvas.height=window.innerHeight;}
  resizeCanvas(); window.addEventListener("resize", resizeCanvas);
});

const feedbackBtn = document.getElementById('feedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeModal = document.getElementById('closeModal');

feedbackBtn.addEventListener('click', () => {
  feedbackModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  feedbackModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === feedbackModal) feedbackModal.style.display = 'none';
});

