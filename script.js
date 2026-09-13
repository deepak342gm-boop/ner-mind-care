/* =========================================
   NER MINDCARE
   Developed by DIPAK MAURYA
========================================= */


/* ---------- LOGIN ---------- */

async function login() {

    const email = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!email || !password) {
        msg.textContent = "Please enter email and password.";
        return;
    }

    try {

        const result = await firebase.auth()
            .signInWithEmailAndPassword(email, password);

        console.log("Login successful:", result.user.email);

        localStorage.setItem("mindcareLogin", "true");

        document.getElementById("loginScreen")
            .classList.add("hidden");

        document.getElementById("app")
            .classList.remove("hidden");

        msg.textContent = "";

        if (typeof updateDashboard === "function") {
            updateDashboard();
        }

    } catch (error) {

        console.error("Login error:", error);

        msg.textContent = "Email ya password galat hai.";
    }
}


function otpLogin(){

  const phone = prompt("Enter your mobile number:");

  if(!phone) return;

  const otp = Math.floor(100000 + Math.random()*900000);

  alert(
    "Demo OTP: " + otp +
    "\n\nProduction app me Firebase Authentication se real OTP connect karein."
  );

  const entered = prompt("Enter OTP:");

  if(entered == otp){

    localStorage.setItem("mindcareLogin","true");

    document.getElementById("loginScreen")
      .classList.add("hidden");

    document.getElementById("app")
      .classList.remove("hidden");

    updateDashboard();

  }else{

    alert("Incorrect OTP");

  }
}


function logout(){

  localStorage.removeItem("mindcareLogin");

  location.reload();

}


/* ---------- START APP ---------- */

window.onload = function(){

  if(localStorage.getItem("mindcareLogin") === "true"){

    document.getElementById("loginScreen")
      .classList.add("hidden");

    document.getElementById("app")
      .classList.remove("hidden");

  }

  loadReminders();
  updateDashboard();
  updateClock();

  setInterval(updateClock,1000);
  setInterval(checkReminders,1000);

};


/* ---------- CLOCK ---------- */

function updateClock(){

  const now = new Date();

  let h = now.getHours();
  let m = now.getMinutes();

  let ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;
  h = h || 12;

  document.getElementById("clock").textContent =
    String(h).padStart(2,"0") + ":" +
    String(m).padStart(2,"0") + " " +
    ampm;


  if(new Date().getHours() < 12){

    document.getElementById("helloText")
      .textContent = "Good Morning 👋";

  }else if(new Date().getHours() < 18){

    document.getElementById("helloText")
      .textContent = "Good Afternoon 👋";

  }else{

    document.getElementById("helloText")
      .textContent = "Good Evening 👋";

  }

}


/* ---------- NAVIGATION ---------- */

function showSection(id,button){

  document.querySelectorAll(".page")
    .forEach(page => page.classList.add("hidden"));

  document.getElementById(id)
    .classList.remove("hidden");

  document.querySelectorAll(".tab")
    .forEach(tab => tab.classList.remove("active"));

  button.classList.add("active");

}


function openGames(){

  document.querySelectorAll(".page")
    .forEach(page => page.classList.add("hidden"));

  document.getElementById("games")
    .classList.remove("hidden");

}


/* ---------- WATER ---------- */

function drinkWater(){

  let water =
    Number(localStorage.getItem("water") || 0);

  water++;

  localStorage.setItem("water",water);

  updateDashboard();

  alert("💧 Great! Water intake recorded.");

}


/* ---------- REMINDERS ---------- */

function addReminder(){

  const title =
    document.getElementById("reminderTitle").value.trim();

  const time =
    document.getElementById("reminderTime").value;

  const type =
    document.getElementById("reminderType").value;

  if(!title || !time){

    alert("Please enter reminder name and time.");

    return;

  }

  const reminders =
    JSON.parse(localStorage.getItem("reminders") || "[]");


  reminders.push({

    id:Date.now(),

    title:title,

    time:time,

    type:type,

    triggered:false

  });


  localStorage.setItem(
    "reminders",
    JSON.stringify(reminders)
  );


  document.getElementById("reminderTitle").value="";

  document.getElementById("reminderTime").value="";

  loadReminders();

  updateDashboard();

}


function loadReminders(){

  const list =
    document.getElementById("reminderList");

  if(!list) return;

  const reminders =
    JSON.parse(localStorage.getItem("reminders") || "[]");


  list.innerHTML="";


  if(reminders.length === 0){

    list.innerHTML = `
      <div class="reminder-item">
        <div>
          <h3>No reminders yet</h3>
          <p>Add your first reminder above.</p>
        </div>
      </div>
    `;

    return;

  }


  reminders.forEach(r => {

    const item = document.createElement("div");

    item.className="reminder-item";

    item.innerHTML = `

      <div class="reminder-info">

        <h3>${r.type} ${escapeHTML(r.title)}</h3>

        <p>⏰ ${r.time}</p>

      </div>

      <button
        class="delete-btn"
        onclick="deleteReminder(${r.id})">
        Delete
      </button>

    `;

    list.appendChild(item);

  });

}


function deleteReminder(id){

  let reminders =
    JSON.parse(localStorage.getItem("reminders") || "[]");

  reminders =
    reminders.filter(r => r.id !== id);

  localStorage.setItem(
    "reminders",
    JSON.stringify(reminders)
  );

  loadReminders();

  updateDashboard();

}


function quickReminder(type){

  const now = new Date();

  const time =
    String(now.getHours()).padStart(2,"0") +
    ":" +
    String((now.getMinutes()+1)%60).padStart(2,"0");

  document.getElementById("reminderTitle").value =
    type;

  document.getElementById("reminderTime").value =
    time;

  document.querySelectorAll(".page")
    .forEach(p => p.classList.add("hidden"));

  document.getElementById("reminders")
    .classList.remove("hidden");

}


/* ---------- REMINDER CHECK ---------- */

function checkReminders(){

  const reminders =
    JSON.parse(localStorage.getItem("reminders") || "[]");

  const now = new Date();

  const currentTime =
    String(now.getHours()).padStart(2,"0") +
    ":" +
    String(now.getMinutes()).padStart(2,"0");


  let changed = false;


  reminders.forEach(reminder => {

    if(reminder.time === currentTime){

      const lastTrigger =
        localStorage.getItem(
          "alarm_" + reminder.id
        );

      const today =
        new Date().toDateString();


      if(lastTrigger !== today){

        showAlarm(reminder);

        localStorage.setItem(
          "alarm_" + reminder.id,
          today
        );

      }

    }

  });

}


/* ---------- ALARM ---------- */

let alarmAudio = null;


function showAlarm(reminder){

  document.getElementById("alarmTitle")
    .textContent = reminder.title;

  document.getElementById("alarmDescription")
    .textContent =
      reminder.type +
      " reminder — it's time for your activity.";


  document.getElementById("alarmModal")
    .classList.remove("hidden");


  playAlarm();

  if("Notification" in window &&
     Notification.permission === "granted"){

    new Notification(
      "NER MindCare Reminder",
      {
        body:reminder.title
      }
    );

  }

}


function playAlarm(){

  try{

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const ctx = new AudioContext();

    let count = 0;

    function beep(){

      if(count >= 8){

        ctx.close();

        return;

      }

      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      oscillator.frequency.value =
        count % 2 === 0 ? 850 : 650;

      oscillator.connect(gain);

      gain.connect(ctx.destination);

      oscillator.start();

      gain.gain.setValueAtTime(
        0.2,
        ctx.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + .35
      );

      oscillator.stop(
        ctx.currentTime + .35
      );

      count++;

      setTimeout(beep,500);

    }

    beep();

  }catch(error){

    console.log(error);

  }

}


function stopAlarm(){

  document.getElementById("alarmModal")
    .classList.add("hidden");

}


/* ---------- NOTIFICATION ---------- */

function requestNotifications(){

  if(!("Notification" in window)){

    alert("Browser notifications are not supported.");

    return;

  }

  Notification.requestPermission()
    .then(permission => {

      if(permission === "granted"){

        alert("🔔 Notifications enabled.");

      }

    });

}


/* ---------- MEMORY GAME ---------- */

function startMemoryGame(){

  const area =
    document.getElementById("gameArea");

  const symbols =
    ["🍎","🍎","🌸","🌸","⭐","⭐"];

  symbols.sort(() => Math.random()-.5);

  let first = null;

  let matches = 0;


  area.innerHTML = `

    <h2>🃏 Memory Match</h2>

    <p>Find all matching objects.</p>

    <div id="memoryGrid"
      style="
      display:grid;
      grid-template-columns:repeat(3,80px);
      gap:12px;
      justify-content:center;
      margin-top:25px;">
    </div>

  `;


  const grid =
    document.getElementById("memoryGrid");


  symbols.forEach((symbol,index)=>{

    const card =
      document.createElement("button");

    card.textContent="❓";

    card.style.cssText=`
      width:80px;
      height:80px;
      font-size:35px;
      border-radius:15px;
      background:#e5f5f7;
    `;


    card.onclick=function(){

      if(card.dataset.open === "true")
        return;


      card.textContent=symbol;

      card.dataset.open="true";


      if(first === null){

        first={
          symbol:symbol,
          card:card
        };

      }else{

        if(first.symbol === symbol){

          matches++;

          first=null;

          if(matches === 3){

            addScore(20);

            setTimeout(()=>{
              alert("🎉 Excellent! Memory game completed.");
            },300);

          }

        }else{

          const previous=first.card;

          setTimeout(()=>{

            previous.textContent="❓";
            card.textContent="❓";

            previous.dataset.open="false";
            card.dataset.open="false";

          },700);

          first=null;

        }

      }

    };


    grid.appendChild(card);

  });

}


/* ---------- NUMBER GAME ---------- */

function startNumberGame(){

  const area =
    document.getElementById("gameArea");

  const number =
    Math.floor(1000 + Math.random()*9000);


  area.innerHTML=`

    <h2>🔢 Number Memory</h2>

    <h1 id="memoryNumber"
      style="font-size:45px;margin:30px;">
      ${number}
    </h1>

    <p>Remember this number...</p>

  `;


  setTimeout(()=>{

    area.innerHTML=`

      <h2>What was the number?</h2>

      <input
        id="numberAnswer"
        type="number"
        placeholder="Enter number"
        style="max-width:300px;margin-top:25px;">

      <br>

      <button
        onclick="checkNumber(${number})"
        style="
        background:#176b87;
        color:white;
        padding:14px 25px;
        border-radius:12px;
        margin-top:15px;">
        Check
      </button>

    `;

  },3000);

}


function checkNumber(correct){

  const answer =
    Number(document.getElementById("numberAnswer").value);

  if(answer === correct){

    addScore(25);

    alert("🎉 Correct! Great memory.");

  }else{

    alert("Not quite. Try again tomorrow.");

  }

}


/* ---------- PATTERN GAME ---------- */

function startPatternGame(){

  const area =
    document.getElementById("gameArea");

  const patterns=[
    ["🔵","🔴","🔵","❓"],
    ["⭐","🌙","⭐","❓"],
    ["🟢","🟢","🔴","❓"]
  ];

  const pattern =
    patterns[Math.floor(Math.random()*patterns.length)];


  let answer;

  if(pattern[0] === "🔵")
    answer="🔴";
  else if(pattern[0] === "⭐")
    answer="🌙";
  else
    answer="🟢";


  area.innerHTML=`

    <h2>🎨 Pattern Game</h2>

    <div style="font-size:45px;margin:25px;">
      ${pattern.join(" ")}
    </div>

    <p>What comes next?</p>

    <div style="margin-top:20px;">

      <button onclick="checkPattern('🔴')"
        class="primary-btn"
        style="width:auto;margin:5px;">
        🔴
      </button>

      <button onclick="checkPattern('🌙')"
        class="primary-btn"
        style="width:auto;margin:5px;">
        🌙
      </button>

      <button onclick="checkPattern('🟢')"
        class="primary-btn"
        style="width:auto;margin:5px;">
        🟢
      </button>

    </div>

    <input
      type="hidden"
      id="correctPattern"
      value="${answer}">

  `;

}


function checkPattern(answer){

  const correct =
    document.getElementById("correctPattern").value;

  if(answer === correct){

    addScore(20);

    alert("🎉 Correct pattern!");

  }else{

    alert("Try again!");

  }

}


/* ---------- SCORE ---------- */

function addScore(points){

  let score =
    Number(localStorage.getItem("score") || 0);

  score += points;

  localStorage.setItem("score",score);


  let games =
    Number(localStorage.getItem("games") || 0);

  games++;

  localStorage.setItem("games",games);


  updateDashboard();

}


function updateDashboard(){

  const score =
    Number(localStorage.getItem("score") || 0);

  const games =
    Number(localStorage.getItem("games") || 0);

  const water =
    Number(localStorage.getItem("water") || 0);

  const reminders =
    JSON.parse(
      localStorage.getItem("reminders") || "[]"
    );


  document.getElementById("score").textContent =
    score;

  document.getElementById("gamesPlayed").textContent =
    games;

  document.getElementById("waterCount").textContent =
    water;

  document.getElementById("reminderCount").textContent =
    reminders.length;


  if(document.getElementById("progressScore"))
    document.getElementById("progressScore")
      .textContent = Math.min(score,100);


  if(document.getElementById("memoryBar"))
    document.getElementById("memoryBar").style.width =
      Math.min(score,100)+"%";


  if(document.getElementById("attentionBar"))
    document.getElementById("attentionBar").style.width =
      Math.min(games*10,100)+"%";


  if(document.getElementById("activityBar"))
    document.getElementById("activityBar").style.width =
      Math.min(water*15,100)+"%";

}


/* ---------- VOICE ASSISTANT ---------- */

function startVoice(){

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if(!SpeechRecognition){

    alert(
      "Voice recognition is not supported in this browser. Chrome Android try karein."
    );

    return;

  }


  const recognition =
    new SpeechRecognition();

  recognition.lang =
    document.getElementById("language").value === "hi"
    ? "hi-IN"
    : "en-IN";


  recognition.start();


  recognition.onresult=function(event){

    const text =
      event.results[0][0].transcript.toLowerCase();


    alert("You said: " + text);


    if(
      text.includes("reminder") ||
      text.includes("remind") ||
      text.includes("रिमाइंडर") ||
      text.includes("याद")
    ){

      alert(
        "Reminder command detected. Please add the reminder from the Reminders section."
      );

      showReminderPage();

    }

  };

}


function showReminderPage(){

  document.querySelectorAll(".page")
    .forEach(p => p.classList.add("hidden"));

  document.getElementById("reminders")
    .classList.remove("hidden");

}


/* ---------- LANGUAGE ---------- */

const translations={

  en:{
    hello:"Good Morning 👋"
  },

  hi:{
    hello:"सुप्रभात 👋"
  },

  as:{
    hello:"সুপ্ৰভাত 👋"
  },

  bn:{
    hello:"সুপ্রভাত 👋"
  },

  mni:{
    hello:"ꯍꯨꯟꯗꯣꯛ ꯅꯨꯃꯤꯠ 👋"
  },

  kh:{
    hello:"Khublei 👋"
  },

  lus:{
    hello:"Tukchhuah nuam 👋"
  },

  brx:{
    hello:"सुबुं हरखौ 👋"
  },

  nag:{
    hello:"Good Morning 👋"
  }

};


function changeLanguage(){

  const lang =
    document.getElementById("language").value;

  if(translations[lang]){

    document.getElementById("helloText")
      .textContent =
      translations[lang].hello;

  }

  localStorage.setItem(
    "language",
    lang
  );

}


/* ---------- EMERGENCY ---------- */

function emergency(){

  const confirmed =
    confirm(
      "Emergency support request send karna hai?"
    );

  if(confirmed){

    alert(
      "🚨 Demo alert created.\n\nProduction version me registered caregiver / emergency service backend se connect hoga."
    );

  }

}


/* ---------- SECURITY ---------- */

function escapeHTML(text){

  const div =
    document.createElement("div");

  div.textContent=text;

  return div.innerHTML;

}