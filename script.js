document.getElementById("dashboardTitle").addEventListener("click", (e) => {
  console.log(e);
});

updateClock();
function updateClock() {
  let date = new Date().toString().split(" ");
  let time = date[4].substring(0, 5);
  let displayDate = `${date[2]} ${date[1]} ${date[3]}`;
  document.getElementById("time").innerHTML = time;
  document.getElementById("date").innerHTML = displayDate;

  setTimeout(() => {
    updateClock();
  }, 60000 - new Date().getSeconds() * 1000);
}

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeather);
  } else {
    console.log("Location access denied");
  }
};
async function getWeather(position) {
  console.log(position);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&daily=weather_code,temperature_2m_max`;
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });

  console.log(url);
}
