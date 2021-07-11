const floor = Math.floor;

function loop(){
  setTimeout(()=>requestAnimationFrame(loop), 0);
  if(document.querySelector(".finished-countdowns-list").children.length === 0){
    document.querySelector(".finished-cds-part").classList.add("not-active");
  }
  if(document.querySelector(".countdowns-list").children.length === 0){
    document.querySelector(".no-countdowns-p").classList.remove("not-active");
  }

  const countdowns = JSON.parse(localStorage.getItem("countdowns"));
  const countdownElts = document.querySelector(".countdowns-list").children;

  if(!countdowns||!countdowns[0]){
    return;
  }
  
  const finishedCDsElt = document.querySelector(".finished-countdowns-list");

  for(let i=0;i<countdownElts.length;i++){
    const countdownEx = countdownElts[i].getAttribute("expiration-date");
    const timeLeft = calcTimeLeft(new Date(countdownEx));
    updateCD(countdownElts[i], timeLeft);

    if(timeLeft.isFinished){
      finishedCDsElt.appendChild(countdownElts[i]);
      document.querySelector(".finished-cds-part").classList.remove("not-active");
    }
  }

  const finishedCDsElts = finishedCDsElt.children;
  for(let i=0;i<finishedCDsElts.length;i++){
    const countdownEx = finishedCDsElts[i].getAttribute("expiration-date");
    const timePassed = calcTimeLeft(new Date(countdownEx));
    updateCD(finishedCDsElts[i], timePassed);
  }
}
requestAnimationFrame(loop);

function updateCD(cd, timeLeft){
  cd.querySelector(".days").innerText = "days: " + timeLeft.days;
  cd.querySelector(".hours").innerText = "hours: " + timeLeft.hours;
  cd.querySelector(".minutes").innerText = "mins: " + timeLeft.minutes;
  cd.querySelector(".seconds").innerText = "secs: " + timeLeft.seconds;
}
document.querySelector(".create-countdown").addEventListener("click", e=>{
  e.target.classList.add("not-active");
  const form = document.querySelector(".countdown-form form");
  form.classList.add("active");
})
document.querySelector(".countdown-form form").addEventListener("submit", e=>{
  e.preventDefault();
  const nameInput = document.querySelector(".countdown-name-input");
  const dateInput = document.querySelector(".countdown-expiration-date-input");
  const timeInput = document.querySelector(".countdown-expiration-time-input");

  const countdown = {
    name: nameInput.value,
    expiration: dateInput.value,
  }
  const match = timeInput.value.match(/[0-9]+:[0-9]+:[0-9]+/gim);
  if(match){
    countdown.expiration += " " + match[0];
  }
  if(!countdown.expiration||!countdown.name||new Date(countdown.expiration) == "Invalid Date"){
    alert("enter a proper name and expiration date :)");
    return;
  }
  
  const countdowns = JSON.parse(localStorage.getItem("countdowns"));
  localStorage.setItem("countdowns", JSON.stringify(countdowns.concat([countdown])));
  displayCountDowns();

  document.querySelector(".create-countdown").classList.remove("not-active");
  const form = document.querySelector(".countdown-form form");
  form.classList.remove("active");

  nameInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
})
document.querySelector(".cancel-countdown-btn").addEventListener("click", e=>{
  e.preventDefault();
  document.querySelector(".create-countdown").classList.remove("not-active");
  const form = document.querySelector(".countdown-form form");
  form.classList.remove("active");

  document.querySelector(".countdown-name-input").value = "";
  document.querySelector(".countdown-expiration-date-input").value = "";
  document.querySelector(".countdown-expiration-time-input").value = "";
})

const countdowns = localStorage.getItem("countdowns");

if(countdowns&&JSON.parse(countdowns)[0]){
  displayCountDowns();
}else{
  localStorage.setItem("countdowns", JSON.stringify([]));
}

function displayCountDowns(){
  document.querySelector(".no-countdowns-p").classList.add("not-active");

  const countdownElts = document.querySelector(".countdowns-list").children;
  for(let i=countdownElts.length-1;i>=0;i--){
    document.querySelector(".countdowns-list").removeChild(countdownElts[i]);
  }
  const finishedCountdownElts = document.querySelector(".finished-countdowns-list").children;
  for(let i=finishedCountdownElts.length-1;i>=0;i--){
    document.querySelector(".finished-countdowns-list").removeChild(finishedCountdownElts[i]);
  }

  const countdownsUnsorted = JSON.parse(localStorage.getItem("countdowns"));
  const countdowns = countdownsUnsorted.sort((a, b)=>new Date(a.expiration)-new Date(b.expiration));
  
  for(let i=0;i<countdowns.length;i++){
    const countdown = countdowns[i];
    const countdownElt = document.createElement("li");
    countdownElt.setAttribute("expiration-date", countdown.expiration);
    countdownElt.classList.add("countdown");
    const timeLeft = calcTimeLeft(new Date(countdown.expiration));
    const removeCD = e=>{
      console.log(e.target);
    }
    countdownElt.innerHTML = `
      <p class="countdown-name">${countdown.name}</p>
      <div class="countdown-expiration-date">
        <div class="days">days: ${timeLeft.days}</div>
        <div class="hours">hours: ${timeLeft.hours}</div>
        <div class="minutes">mins: ${timeLeft.minutes}</div>
        <div class="seconds">secs: ${timeLeft.seconds}</div>
      </div>
    `
    // <button onclick="removeCD(e)" class="remove-cd">x</button>
    const closingBtn = document.createElement("button");
    closingBtn.classList.add("remove-cd-btn");
    closingBtn.innerText = "x";
    closingBtn.addEventListener("click", e=>{
      const removeCDfromLocalStorage = ()=>{
        countdowns.splice(countdowns.indexOf(countdown), 1);
        localStorage.setItem("countdowns", JSON.stringify(countdowns));
      }
      try {
        document.querySelector(".countdowns-list").removeChild(countdownElt);
        removeCDfromLocalStorage();
      } catch(err) {
        document.querySelector(".finished-countdowns-list").removeChild(countdownElt);
        removeCDfromLocalStorage();
      }
    })
    countdownElt.appendChild(closingBtn);
    document.querySelector(".countdowns-list").appendChild(countdownElt);
  }
}
function calcTimeLeft(date){
  const isFinished = date <= new Date();
  const millis = Math.abs(new Date() - date);
  return {
    days: floor(millis/(1000*60*60*24)),
    hours: floor(millis/(1000*60*60))%24,
    minutes: floor(millis/(1000*60))%60,
    seconds: floor(millis/(1000))%60,
    isFinished
  }
}