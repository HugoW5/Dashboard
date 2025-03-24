document.getElementById("dashboardTitle").addEventListener("click", (e) => {
  console.log(e);
  e.target.style.display = "none";
  document.getElementById("dashboardTitleInput").value = e.target.innerHTML;
  document.getElementById("dashboardTitleInput").style.display = "block";
  document.getElementById("dashboardTitleInput").focus();
});
document
  .getElementById("dashboardTitleInput")
  .addEventListener("focusout", (e) => {
    e.target.style.display = "none";
    if (e.target.value != "") {
      document.getElementById("dashboardTitle").innerHTML = e.target.value;
      localStorage.setItem("dashboardTitle", e.target.value);
    }
    document.getElementById("dashboardTitle").style.display = "block";
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
  document.getElementById("notes").value = localStorage.getItem("notes");
  renderLinks();
  const dashboardTitle = localStorage.getItem("dashboardTitle");
  if (dashboardTitle != null) {
    document.getElementById("dashboardTitle").innerHTML = dashboardTitle;
  } else {
    document.getElementById("dashboardTitle").innerHTML = "John Doe Dashboard";
  }
  getNews();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeather);
  } else {
    console.log("Location access denied");
    document.getElementById('wheater').innerHTML += '<p class="error-msg">Plats åtkomst nekad, kan inte hitta väder information</p>';
  }
};

async function getNews() {
  let limit = 10;
  let count = 0;

  let url = `https://polisen.se/api/events?DateTime=${new Date()
    .toISOString()
    .substring(0, 10)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    data.forEach((element) => {
      if (count >= limit) {
        return;
      }
      let container = document.createElement("div");
      container.className = "dashboard-items";

      let title = document.createElement("strong");
      title.innerHTML = element.name;

      let p = document.createElement("p");
      p.innerHTML = element.summary;

      container.append(title, p);
      container.innerHTML =
        container.innerHTML +
        `<a href="https://polisen.se${element.url}" target="_blank"><button>Läs mer<i class='bx bx-link-external'></i></button></a>`;
      document.getElementById("news").appendChild(container);
      count++;
    });
  } catch (error) {
    console.error(error);
  }
}
document.getElementById("newBackground").addEventListener("click", () => {
  const randomNum = Math.floor(Math.random() * 1000);
  document.body.style.backgroundImage = `url('https://picsum.photos/1920/1080?random=${randomNum}')`;
});

document.getElementById("addLink").addEventListener("click", () => {
  const link = prompt("Länk");
  console.log(link);
  if (!link) return;
  let links = JSON.parse(localStorage.getItem("links")) || [];
  links.push(link);
  localStorage.setItem("links", JSON.stringify(links));
  renderLinks();
});
function renderLinks() {
  document.getElementById("fastLinks").innerHTML = "";

  const links = JSON.parse(localStorage.getItem("links")) || [];
  
  links.forEach((link, index) => {
    const linkDiv = document.createElement("div");
    linkDiv.classList.add("link", "dashboard-items");
    
    const anchor = document.createElement("a");
    anchor.href = link;
    anchor.textContent = link;
    
    const deleteButton = document.createElement("button");
    deleteButton.title = "Ta bort";
    
    const icon = document.createElement("i");
    icon.classList.add("bx", "bxs-trash");
    deleteButton.appendChild(icon);
    
    deleteButton.addEventListener("click", () => {
      links.splice(index, 1);
            localStorage.setItem("links", JSON.stringify(links));
            renderLinks();
    });
    
    linkDiv.appendChild(anchor);
    linkDiv.appendChild(deleteButton);
        document.getElementById("fastLinks").appendChild(linkDiv);
  });
}


async function getWeather(position) {
  let whetherData = localStorage.getItem("whetherData");

  if (whetherData) {
    whetherData = JSON.parse(whetherData);

    if (
      new Date().toDateString() ===
      new Date(whetherData.daily.time[0]).toDateString()
    ) {
      console.log("Using cached weather data");
      templateWhetherData(whetherData);
      return;
    }
  }

  console.log("Fetching new weather data...");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&daily=weather_code,temperature_2m_max`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    localStorage.setItem("whetherData", JSON.stringify(data));
    templateWhetherData(data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

document.getElementById("notes").addEventListener("input", (e) => {
  localStorage.setItem("notes", e.target.value);
});

function templateWhetherData(data) {
  for (let i = 0; i < 4; i++) {
    console.log(data.daily.time[i]);

    const container = document.createElement("div");
    container.className = "dashboard-items wheater-info";
    const wmoPhrase = wmoCodeToPhrase(data.daily.weather_code[i]);
    const temperature = data.daily.temperature_2m_max[i];
    container.innerHTML = `<i class="${wmoPhrase.icon} bx-lg"></i>`;

    const wheaterContainer = document.createElement("div");
    if (i == 0) {
      wheaterContainer.innerHTML = "<strong>Idag</strong>";
    }
    if (i == 1) {
      wheaterContainer.innerHTML = "<strong>Imorgon</strong>";
    }
    if (i > 1) {
      wheaterContainer.innerHTML = `<strong>${getDayOfWeek(
        data.daily.time[i]
      )}</strong>`;
    }
    wheaterContainer.className = "wheater-container";

    const description = document.createElement("span");
    description.className = "info-box";
    description.innerHTML = wmoPhrase.text;

    const tempBox = document.createElement("span");
    tempBox.className = "info-box";
    tempBox.innerHTML = temperature + "°C";

    container.append(wheaterContainer, description, tempBox);
    document.getElementById("wheater").appendChild(container);
  }
}

function wmoCodeToPhrase(code) {
  switch (true) {
    case code === 0:
      return { text: "Klart väder", icon: "bx bx-sun" };
    case [1, 2, 3].includes(code):
      return { text: "Mestadels klart till mulet", icon: "bx bx-cloud" };
    case [45, 48].includes(code):
      return { text: "Dimma", icon: "bx bx-cloud-fog" };
    case [51, 53, 55].includes(code):
      return { text: "Duggregn", icon: "bx bx-cloud-drizzle" };
    case [56, 57].includes(code):
      return { text: "Underkylt duggregn", icon: "bx bx-cloud-drizzle" };
    case [61, 63, 65].includes(code):
      return { text: "Regn", icon: "bx bx-cloud-rain" };
    case [66, 67].includes(code):
      return { text: "Underkylt regn", icon: "bx bx-cloud-rain" };
    case [71, 73, 75].includes(code):
      return { text: "Snöfall", icon: "bx bx-cloud-snow" };
    case code === 77:
      return { text: "Snökorn", icon: "bx bx-cloud-snow" };
    case [80, 81, 82].includes(code):
      return { text: "Regnskurar", icon: "bx bx-cloud-light-rain" };
    case [85, 86].includes(code):
      return { text: "Snöbyar", icon: "bx bx-cloud-snow" };
    case code === 95:
      return { text: "Åskväder", icon: "bx bx-bolt-circle" };
    case [96, 99].includes(code):
      return { text: "Åskväder med hagel", icon: "bx bx-bolt" };
    default:
      return { text: "Okänt väder", icon: "bx bx-question-mark" };
  }
}

function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "long" };
  return date.toLocaleDateString("sv-SE", options);
}
