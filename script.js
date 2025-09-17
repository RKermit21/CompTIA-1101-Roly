document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const scoreEl = document.getElementById("score");
  const passFailEl = document.getElementById("passFail");
  const submitBtn = document.getElementById("submitBtn");
  const showAnswersBtn = document.getElementById("showAnswersBtn");
  const resetBtn = document.getElementById("resetBtn");

  const fireworksCanvas = document.getElementById("fireworks");
  const ctx = fireworksCanvas.getContext("2d");
  let fireworks = [];
  let fireworksActive = false;
  let fireworksTimer;

  // ---------- Questions ----------
  const questions = [
    // ---------- MCQs 1-20 ----------
    {type:"mcq", title:"Laptop Display", text:"A user’s laptop screen is very dim, even after increasing brightness in the OS. Which component is MOST likely failing?", options:["Inverter","Backlight","LCD panel","Video card"], answer:"Backlight"},
    {type:"mcq", title:"Networking", text:"Which of these connections uses twisted pair cabling and RJ45 connectors?", options:["HDMI","USB","Ethernet","DisplayPort"], answer:"Ethernet"},
    {type:"mcq", title:"RAID", text:"A workstation needs RAID 1. What’s the minimum number of drives required?", options:["1","2","3","4"], answer:"2"},
    {type:"mcq", title:"Wireless", text:"Which wireless standard operates only in the 5 GHz band and supports max throughput of 1.3 Gbps?", options:["802.11n","802.11ac","802.11g","802.11b"], answer:"802.11ac"},
    {type:"mcq", title:"Storage Media", text:"Which storage media is MOST resistant to magnetic fields?", options:["HDD","SSD","Tape drive","Floppy disk"], answer:"SSD"},
    {type:"mcq", title:"Networking", text:"Which port is used by HTTPS?", options:["21","25","443","110"], answer:"443"},
    {type:"mcq", title:"Mobile Devices", text:"What type of device would use TRRS connectors?", options:["Keyboard","Headset with microphone","External HDD","Printer"], answer:"Headset with microphone"},
    {type:"mcq", title:"Storage", text:"A customer needs to store large video archives and access them sequentially. Which is BEST?", options:["SSD","NVMe","HDD","Tape drive"], answer:"Tape drive"},
    {type:"mcq", title:"Networking", text:"Which is a characteristic of fiber optic cabling?", options:["Susceptible to EMI","Transmits with light","Maximum 100 meters","Uses RJ45 connectors"], answer:"Transmits with light"},
    {type:"mcq", title:"External Devices", text:"Which connector is MOST commonly used for external hard drives?", options:["HDMI","USB","VGA","PS/2"], answer:"USB"},
    {type:"mcq", title:"Mobile", text:"Which mobile connection allows payments by tapping at a checkout terminal?", options:["Bluetooth","NFC","IR","Wi-Fi"], answer:"NFC"},
    {type:"mcq", title:"Laptop Hardware", text:"Which laptop component is considered a Field Replaceable Unit (FRU)?", options:["CPU","LCD screen","GPU","Motherboard chipset"], answer:"LCD screen"},
    {type:"mcq", title:"Cabling", text:"Which cable would provide the FASTEST network speed?", options:["Cat 3","Cat 5","Cat 6a","Coaxial"], answer:"Cat 6a"},
    {type:"mcq", title:"Virtualization", text:"What is the function of a hypervisor?", options:["Encrypt data","Manage VMs","Connect peripherals","Defragment drives"], answer:"Manage VMs"},
    {type:"mcq", title:"Power", text:"Which device converts AC to DC inside a PC?", options:["CPU","PSU","UPS","Transformer"], answer:"PSU"},
    {type:"mcq", title:"Display Tech", text:"Which mobile display type has no backlight requirement?", options:["LCD","OLED","LED","Plasma"], answer:"OLED"},
    {type:"mcq", title:"RAID", text:"Which RAID provides fault tolerance with mirroring?", options:["RAID 0","RAID 1","RAID 5","RAID 10"], answer:"RAID 1"},
    {type:"mcq", title:"Tools", text:"Which tool would BEST test laptop battery health?", options:["Multimeter","POST card","PSU tester","Tone generator"], answer:"Multimeter"},
    {type:"mcq", title:"Mobile", text:"Which mobile connection provides the fastest short-range file transfer?", options:["NFC","Bluetooth","Wi-Fi Direct","IR"], answer:"Wi-Fi Direct"},
    {type:"mcq", title:"Expansion Cards", text:"Which expansion card provides hardware-accelerated 3D graphics?", options:["NIC","GPU","RAID","Sound card"], answer:"GPU"},

    // ---------- Matching 21-25 ----------
    {type:"match", title:"Storage Types", text:"Match storage type to characteristic:", pairs:[
      {key:"HDD", value:"High capacity, slower"},
      {key:"SSD", value:"Fast, less capacity"},
      {key:"NVMe", value:"Very fast, expensive"},
      {key:"Tape", value:"Sequential storage, archival use"}
    ]},
    {type:"match", title:"Ports", text:"Match port number to service:", pairs:[
      {key:"21", value:"FTP"},
      {key:"25", value:"SMTP"},
      {key:"80", value:"HTTP"},
      {key:"443", value:"HTTPS"}
    ]},
    {type:"match", title:"Connectors", text:"Match connector to device:", pairs:[
      {key:"HDMI", value:"Display"},
      {key:"RJ45", value:"Network"},
      {key:"TRRS", value:"Headset"},
      {key:"USB-C", value:"Charging / Data"}
    ]},
    {type:"match", title:"RAID Types", text:"Match RAID type to description:", pairs:[
      {key:"RAID 0", value:"Striping, no redundancy"},
      {key:"RAID 1", value:"Mirroring"},
      {key:"RAID 5", value:"Striping + parity"},
      {key:"RAID 10", value:"Striping + mirroring"}
    ]},
    {type:"match", title:"Mobile Tech", text:"Match mobile technology to feature:", pairs:[
      {key:"NFC", value:"Tap-to-pay"},
      {key:"Bluetooth", value:"Wireless headset"},
      {key:"IR", value:"TV remote"},
      {key:"Hotspot", value:"Share cellular data"}
    ]},

    // ---------- Ordering 26-30 ----------
    {type:"order", title:"PC Boot", text:"Order the steps of the PC boot process:", steps:["POST","BIOS/UEFI initialization","OS bootloader loads","User login"]},
    {type:"order", title:"App Troubleshooting", text:"Order the steps to troubleshoot an app crash:", steps:["Reproduce issue","Check logs","Apply patches/updates","Test fix"]},
    {type:"order", title:"Network Troubleshooting", text:"Order the steps for network troubleshooting:", steps:["Check physical connections","Ping local gateway/router","Check DNS resolution","Contact ISP"]},
    {type:"order", title:"Ticket Resolution", text:"Order the steps for customer ticket resolution:", steps:["Acknowledge receipt","Diagnose problem","Implement solution","Follow up with customer"]},
    {type:"order", title:"App Deployment", text:"Order the steps to deploy an app:", steps:["Build","Test","Deploy","Monitor"]}
  ];

  // ---------- Helpers ----------
  function shuffleArray(array){
    for(let i=array.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createCorrectLabel(){
    const span = document.createElement("span");
    span.className = "correct-label";
    span.textContent = "Correct!";
    return span;
  }

  // ---------- Fireworks ----------
  function random(min, max){ return Math.random()*(max-min)+min; }

  function createFirework(){
    const x = random(0, fireworksCanvas.width);
    const y = random(0, fireworksCanvas.height/2);
    const count = 100;
    const colors = [
      [255,0,0],[0,255,0],[0,0,255],
      [255,255,0],[255,0,255],[0,255,255]
    ];
    const color = colors[Math.floor(random(0, colors.length))];

    for(let i=0;i<count;i++){
      fireworks.push({
        x, y,
        angle: random(0, Math.PI*2),
        speed: random(2,7),
        radius: 2,
        alpha: 1,
        color
      });
    }
  }

  function drawFireworks(){
    ctx.clearRect(0,0,fireworksCanvas.width,fireworksCanvas.height);
    fireworks.forEach((p,i)=>{
      const vx = Math.cos(p.angle)*p.speed;
      const vy = Math.sin(p.angle)*p.speed + 0.05;
      p.x += vx; p.y += vy;
      p.alpha -= 0.015;
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
      ctx.fill();
      if(p.alpha<=0) fireworks.splice(i,1);
    });
    if(fireworksActive) requestAnimationFrame(drawFireworks);
  }

  function startFireworks(){
    fireworksActive = true;
    fireworksCanvas.style.opacity = "1";
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
    createFirework();
    drawFireworks();
    fireworksTimer = setInterval(createFirework, 500);
    setTimeout(stopFireworks, 15000);
  }

  function stopFireworks(){
    fireworksActive = false;
    clearInterval(fireworksTimer);
    fireworksCanvas.style.opacity = "0";
    fireworks = [];
  }

  // ---------- Build Quiz ----------
  function createQuiz(){
    quizContainer.innerHTML = "";
    questions.forEach((q, idx)=>{
      const card = document.createElement("div");
      card.className = "question-card";

      const h2 = document.createElement("h2");
      h2.textContent = `${idx+1}. ${q.title}`;
      card.appendChild(h2);

      const p = document.createElement("p");
      p.textContent = q.text;
      card.appendChild(p);

      const feedback = document.createElement("div");
      feedback.className = "feedback";

      // MCQs
      if(q.type==="mcq"){
        const options = [...q.options];
        shuffleArray(options);
        options.forEach((opt,i)=>{
          const div = document.createElement("div");
          div.className = "option";
          div.innerHTML = `<b>${String.fromCharCode(65+i)}. </b>${opt}`;
          div.addEventListener("click", ()=>{
            card.querySelectorAll(".option").forEach(o=>o.classList.remove("selected"));
            div.classList.add("selected");
            feedback.innerHTML="";
            if(opt===q.answer){
              feedback.appendChild(createCorrectLabel());
              div.classList.add("correct");
            } else {
              feedback.textContent = `Incorrect. Correct: ${q.answer}`;
            }
          });
          card.appendChild(div);
        });
      }

      // Matching / Ordering
      if(q.type==="match" || q.type==="order"){
        const container = document.createElement("div");
        container.className = (q.type==="match")?"match-container":"order-container";

        const bank = document.createElement("div");
        bank.className = (q.type==="match")?"match-bank":"order-bank";

        const targets = document.createElement("div");
        targets.className = (q.type==="match")?"match-targets":"order-targets";

        let items = (q.type==="match")?q.pairs.map(p=>({key:p.key,value:p.value})):q.steps.map(s=>({key:s,value:s}));
        let shuffledItems = [...items];
        shuffleArray(shuffledItems);

        shuffledItems.forEach((item,i)=>{
          const itemDiv = document.createElement("div");
          itemDiv.className = "drag-item";
          itemDiv.draggable = true;
          itemDiv.textContent = item.key;
          itemDiv.dataset.value = item.value;
          itemDiv.id = `${q.type}-item-${item.key}-${i}`;
          itemDiv.addEventListener("dragstart", e=>{
            e.dataTransfer.setData("text", item.key);
          });
          bank.appendChild(itemDiv);
        });

        items.forEach(t=>{
          const target = document.createElement("div");
          target.className = "drag-target";
          target.dataset.correct = t.key;
          target.dataset.value = t.value;

          if(q.type==="match"){
            const charSpan = document.createElement("span");
            charSpan.className="drag-characteristic";
            charSpan.textContent = t.value;
            target.appendChild(charSpan);
          }

          target.addEventListener("dragover", e=>e.preventDefault());
          target.addEventListener("drop", e=>{
            e.preventDefault();
            const draggedKey = e.dataTransfer.getData("text");
            const existingKey = target.querySelector(".drag-key");
            if(existingKey){
              const bankItem = Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===existingKey.dataset.key);
              if(bankItem) bankItem.style.display="block";
              existingKey.remove();
            }
            const bankItem = Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===draggedKey);
            if(bankItem) bankItem.style.display="none";
            const keySpan = document.createElement("span");
            keySpan.className="drag-key";
            keySpan.textContent = draggedKey;
            keySpan.dataset.key = draggedKey;
            keySpan.draggable = true;
            keySpan.addEventListener("dragstart", ev=>{
              ev.dataTransfer.setData("text", draggedKey);
            });
            target.insertBefore(keySpan,target.firstChild);
          });

          bank.addEventListener("dragover", e=>e.preventDefault());
          bank.addEventListener("drop", e=>{
            e.preventDefault();
            const val = e.dataTransfer.getData("text");
            const bankItem = Array.from(bank.querySelectorAll(".drag-item")).find(b=>b.textContent===val);
            if(bankItem) bankItem.style.display="block";
            const spans = targets.querySelectorAll(".drag-key");
            spans.forEach(s=>{if(s.textContent===val) s.remove();});
          });

          targets.appendChild(target);
        });

        container.appendChild(bank);
        container.appendChild(targets);
        card.appendChild(container);
      }

      card.appendChild(feedback);
      quizContainer.appendChild(card);
    });
  }

  // ---------- Score ----------
  function calculateScore(){
    let score=0;
    questions.forEach((q, idx)=>{
      const card = quizContainer.children[idx];
      const feedback = card.querySelector(".feedback");
      feedback.innerHTML = "";

      if(q.type==="mcq"){
        const selected = card.querySelector(".option.selected");
        if(selected && selected.textContent.includes(q.answer)){
          score++;
          feedback.appendChild(createCorrectLabel());
          selected.classList.add("correct");
        } else {
          feedback.textContent = `Incorrect. Correct: ${q.answer}`;
          if(selected) selected.classList.add("incorrect");
        }
      }

      if(q.type==="match"){
        const targets = card.querySelectorAll(".drag-target");
        let correct=true;
        targets.forEach(t=>{
          const keySpan = t.querySelector(".drag-key");
          if(keySpan && keySpan.textContent===t.dataset.correct){
            t.classList.add("correct");
          } else {
            t.classList.add("incorrect");
            correct=false;
          }
        });
        if(correct){
          score++;
          feedback.appendChild(createCorrectLabel());
        } else {
          let correctPairs = q.pairs.map(p=>`${p.key} → ${p.value}`).join(", ");
          feedback.textContent = `Incorrect. Correct: ${correctPairs}`;
        }
      }

      if(q.type==="order"){
        const targets = card.querySelectorAll(".drag-target");
        let order=[];
        targets.forEach(t=>{
          const keySpan = t.querySelector(".drag-key");
          if(keySpan) order.push(keySpan.textContent);
        });
        const correctOrder = q.steps;
        if(JSON.stringify(order)===JSON.stringify(correctOrder)){
          score++;
          feedback.appendChild(createCorrectLabel());
          targets.forEach(t=>t.classList.add("correct"));
        } else {
          feedback.textContent = `Incorrect. Correct order: ${correctOrder.join(" → ")}`;
          targets.forEach((t,i)=>{
            const keySpan = t.querySelector(".drag-key");
            if(keySpan && keySpan.textContent===correctOrder[i]){
              t.classList.add("correct");
            } else {
              t.classList.add("incorrect");
            }
          });
        }
      }
    });

    scoreEl.textContent = `Score: ${score} / ${questions.length}`;
    const passed = score>=Math.floor(questions.length*0.8);
    passFailEl.textContent = passed?"PASS ✅":"FAIL ❌";

    if(passed){ startFireworks(); }
  }

  // ---------- Init ----------
  createQuiz();
  submitBtn.addEventListener("click", calculateScore);
  resetBtn.addEventListener("click", ()=>{
    createQuiz();
    scoreEl.textContent = "";
    passFailEl.textContent = "";
    stopFireworks();
  });
  showAnswersBtn.addEventListener("click", ()=>{
    questions.forEach((q,idx)=>{
      const card = quizContainer.children[idx];
      if(q.type==="mcq"){
        card.querySelectorAll(".option").forEach(o=>{
          if(o.textContent.includes(q.answer)) o.classList.add("correct");
        });
      }
      if(q.type==="match" || q.type==="order"){
        const targets = card.querySelectorAll(".drag-target");
        targets.forEach(t=>{
          const keySpan = t.querySelector(".drag-key");
          if(keySpan && keySpan.textContent===t.dataset.correct) keySpan.classList.add("correct");
        });
      }
    });
  });
});
