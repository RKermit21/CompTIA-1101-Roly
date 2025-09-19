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
  // ---------- Questions ----------
const questions = [
  // MCQs 1–30
  {type:"mcq", title:"Laptop Display", text:"Which of the following would be the MOST likely reason for a laptop display to be very dim, even when set to maximum brightness?", options:["Failed backlight","Disconnected antenna","Low refresh rate","Damaged LCD inverter"], answer:"Failed backlight"},
  {type:"mcq", title:"Networking Cables", text:"Which of the following network cables uses twisted pairs of copper wires and RJ45 connectors?", options:["Coaxial","Fiber","Twisted pair","Serial"], answer:"Twisted pair"},
  {type:"mcq", title:"RAID Levels", text:"Which RAID level provides fault tolerance through disk mirroring?", options:["RAID 0","RAID 1","RAID 5","RAID 10"], answer:"RAID 1"},
  {type:"mcq", title:"Laptop Memory", text:"Which of the following memory types is most commonly used in laptops?", options:["DIMM","SODIMM","SIMM","ECC"], answer:"SODIMM"},
  {type:"mcq", title:"CPU Sockets", text:"Which type of CPU socket uses pins on the motherboard instead of the CPU?", options:["LGA","PGA","ZIF","Slot 1"], answer:"LGA"},
  {type:"mcq", title:"Mobile Charging", text:"Which mobile device connector type is reversible?", options:["Lightning","Micro-USB","Mini-USB","Serial"], answer:"Lightning"},
  {type:"mcq", title:"Wireless Standards", text:"Which wireless standard operates only in the 5 GHz frequency range?", options:["802.11a","802.11b","802.11g","802.11n"], answer:"802.11a"},
  {type:"mcq", title:"Email Protocols", text:"Which of the following protocols is used to send email messages?", options:["SMTP","IMAP","POP3","HTTPS"], answer:"SMTP"},
  {type:"mcq", title:"Cloud Computing", text:"Which cloud service model provides virtualized hardware resources but requires customers to install and manage their own operating system and apps?", options:["IaaS","PaaS","SaaS","Hybrid"], answer:"IaaS"},
  {type:"mcq", title:"Printer Types", text:"Which type of printer uses toner cartridges and a fuser assembly?", options:["Laser","Inkjet","Thermal","Impact"], answer:"Laser"},
  {type:"mcq", title:"Wireless Security", text:"Which of the following provides the strongest wireless security?", options:["WEP","WPA","WPA2","WPA3"], answer:"WPA3"},
  {type:"mcq", title:"Networking Devices", text:"Which device forwards packets between networks based on IP address?", options:["Router","Switch","Hub","Bridge"], answer:"Router"},
  {type:"mcq", title:"Contactless Tech", text:"Which technology allows smartphones to be used for tap-to-pay purchases?", options:["NFC","Bluetooth","Infrared","Hotspot"], answer:"NFC"},
  {type:"mcq", title:"Expansion Slots", text:"Which of these motherboard expansion slots is commonly used for graphics adapters?", options:["PCIe","AGP","ISA","PCI"], answer:"PCIe"},
  {type:"mcq", title:"Fiber Connectors", text:"Which connector is commonly used with fiber optic cables?", options:["LC","RJ45","BNC","DB-9"], answer:"LC"},
  {type:"mcq", title:"Mobile OS", text:"Which of the following mobile operating systems is based on Linux?", options:["Android","iOS","Blackberry","Windows Mobile"], answer:"Android"},
  {type:"mcq", title:"Display Tech", text:"Which display technology uses organic compounds that emit light when voltage is applied?", options:["OLED","LCD","Plasma","LED"], answer:"OLED"},
  {type:"mcq", title:"Windows Commands", text:"Which Windows command displays the current IP configuration of the system?", options:["ipconfig","ifconfig","ping","netstat"], answer:"ipconfig"},
  {type:"mcq", title:"Ports", text:"Which port is the default for HTTPS traffic?", options:["443","80","21","25"], answer:"443"},
  {type:"mcq", title:"Virtualization", text:"Which CPU feature is required to support virtual machines?", options:["Intel VT/AMD-V","ECC RAM","UEFI","RAID"], answer:"Intel VT/AMD-V"},
  {type:"mcq", title:"Biometrics", text:"Which of the following is an example of biometric authentication?", options:["Fingerprint","PIN","Password","Token"], answer:"Fingerprint"},
  {type:"mcq", title:"Storage Performance", text:"Which storage type provides the fastest overall performance?", options:["NVMe SSD","SATA SSD","HDD","Tape"], answer:"NVMe SSD"},
  {type:"mcq", title:"Mobile Settings", text:"Which mobile device setting disables all wireless communication?", options:["Airplane mode","Hotspot","Tethering","Roaming"], answer:"Airplane mode"},
  {type:"mcq", title:"Networking Devices", text:"Which device is used to separate broadcast domains?", options:["Router","Hub","Switch","Repeater"], answer:"Router"},
  {type:"mcq", title:"Mobile Tracking", text:"Which feature can locate a lost or stolen smartphone?", options:["Find My Phone","Tethering","AirDrop","Hotspot"], answer:"Find My Phone"},
  {type:"mcq", title:"Cloud Services", text:"Which cloud model delivers fully managed software over the internet?", options:["SaaS","PaaS","IaaS","Hybrid"], answer:"SaaS"},
  {type:"mcq", title:"Firmware", text:"Which component stores BIOS/UEFI firmware?", options:["Flash memory","RAM","CMOS battery","HDD"], answer:"Flash memory"},
  {type:"mcq", title:"Impact Printers", text:"Which consumable is used in an impact printer?", options:["Ribbon","Toner","Ink cartridge","Drum"], answer:"Ribbon"},
  {type:"mcq", title:"Coax Connectors", text:"Which connector type is used with coaxial cables?", options:["BNC","RJ45","SC","LC"], answer:"BNC"},
  {type:"mcq", title:"Cellular Tech", text:"Which mobile technology provides internet access through cellular towers?", options:["Cellular","Infrared","Bluetooth","NFC"], answer:"Cellular"},

  // Matching 31–40
  {type:"match", title:"Networking Ports", text:"Match service to default port:", pairs:[
    {key:"HTTP", value:"80"},
    {key:"HTTPS", value:"443"},
    {key:"FTP", value:"21"},
    {key:"SMTP", value:"25"}
  ]},
  {type:"match", title:"Storage Media", text:"Match storage type to description:", pairs:[
    {key:"SSD", value:"Fast, no moving parts"},
    {key:"HDD", value:"Spinning platters"},
    {key:"Tape", value:"Sequential access"},
    {key:"Optical", value:"CD/DVD/Blu-ray"}
  ]},
  {type:"match", title:"Wireless Standards", text:"Match Wi-Fi standard to frequency:", pairs:[
    {key:"802.11a", value:"5 GHz"},
    {key:"802.11b", value:"2.4 GHz"},
    {key:"802.11g", value:"2.4 GHz"},
    {key:"802.11n", value:"2.4 and 5 GHz"}
  ]},
  {type:"match", title:"Connector Types", text:"Match connector to use:", pairs:[
    {key:"RJ45", value:"Ethernet"},
    {key:"RJ11", value:"Telephone"},
    {key:"LC", value:"Fiber"},
    {key:"HDMI", value:"Display"}
  ]},
  {type:"match", title:"Mobile Tech", text:"Match technology to description:", pairs:[
    {key:"NFC", value:"Tap-to-pay"},
    {key:"Bluetooth", value:"Short-range PAN"},
    {key:"Hotspot", value:"Share cellular data"},
    {key:"Airplane mode", value:"Disable wireless"}
  ]},
  {type:"match", title:"Printer Types", text:"Match printer to characteristic:", pairs:[
    {key:"Laser", value:"Uses toner"},
    {key:"Inkjet", value:"Sprays liquid ink"},
    {key:"Thermal", value:"Heated paper"},
    {key:"Impact", value:"Print head with ribbon"}
  ]},
  {type:"match", title:"Cables", text:"Match cable type to feature:", pairs:[
    {key:"Cat5e", value:"1 Gbps"},
    {key:"Cat6", value:"10 Gbps (short)"},
    {key:"RG6", value:"Coaxial"},
    {key:"USB-C", value:"Reversible connector"}
  ]},
  {type:"match", title:"Security Factors", text:"Match authentication factor to example:", pairs:[
    {key:"Something you know", value:"Password"},
    {key:"Something you have", value:"Smart card"},
    {key:"Something you are", value:"Fingerprint"},
    {key:"Somewhere you are", value:"Geolocation"}
  ]},
  {type:"match", title:"Cloud Models", text:"Match model to description:", pairs:[
    {key:"IaaS", value:"Customer manages OS/apps"},
    {key:"PaaS", value:"Customer manages apps only"},
    {key:"SaaS", value:"Fully managed apps"},
    {key:"Hybrid", value:"Combination of models"}
  ]},
  {type:"match", title:"Protocols", text:"Match protocol to purpose:", pairs:[
    {key:"DNS", value:"Resolves hostnames"},
    {key:"DHCP", value:"Assigns IPs"},
    {key:"SNMP", value:"Manages devices"},
    {key:"LDAP", value:"Directory services"}
  ]},

  // Ordering 41–50
  {type:"order", title:"PC Boot Process", text:"Put the steps of the PC boot process in order:", steps:["POST","BIOS initialization","Load OS","User login"]},
  {type:"order", title:"Software Troubleshooting", text:"Put software troubleshooting steps in correct order:", steps:["Reproduce issue","Check logs","Check updates","Apply fix"]},
  {type:"order", title:"No Internet", text:"Steps to troubleshoot no internet connectivity:", steps:["Check cables","Ping router","Check DNS","Restart PC"]},
  {type:"order", title:"Customer Ticket", text:"Steps to resolve a support ticket:", steps:["Acknowledge","Diagnose","Implement","Follow-up"]},
  {type:"order", title:"App Deployment", text:"Steps to deploy an app:", steps:["Build","Test","Deploy","Monitor"]},
  {type:"order", title:"Disk Maintenance", text:"Steps for disk maintenance:", steps:["Backup","Run chkdsk","Defragment","Verify integrity"]},
  {type:"order", title:"User Onboarding", text:"Steps for onboarding a new user:", steps:["Create account","Assign permissions","Train","Confirm access"]},
  {type:"order", title:"VPN Setup", text:"Steps to configure a VPN:", steps:["Install client","Add server","Authenticate","Connect"]},
  {type:"order", title:"Software Update", text:"Steps to update software:", steps:["Check update","Download","Install","Verify"]},
  {type:"order", title:"Incident Response", text:"Steps of incident response:", steps:["Identify","Contain","Eradicate","Recover"]}
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

