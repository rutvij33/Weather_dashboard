// No API key needed: Open-Meteo is free and open
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const $ = id => document.getElementById(id);
let unit = localStorage.getItem("unit") || "C";
let lastData = null; // { label, data } so the unit can switch without refetching

// Weather code -> icon, description, background theme
const getWeatherInfo = code => {
  if (code === 0) return { icon: "☀️", text: "Clear sky", bg: "sunny" };
  if (code <= 3) return { icon: "⛅", text: "Partly cloudy", bg: "cloudy" };
  if (code <= 48) return { icon: "🌫️", text: "Foggy", bg: "cloudy" };
  if (code <= 57) return { icon: "🌦️", text: "Drizzle", bg: "rainy" };
  if (code <= 67) return { icon: "🌧️", text: "Rain", bg: "rainy" };
  if (code <= 77) return { icon: "❄️", text: "Snow", bg: "snow" };
  if (code <= 82) return { icon: "🌧️", text: "Rain showers", bg: "rainy" };
  if (code <= 86) return { icon: "🌨️", text: "Snow showers", bg: "snow" };
  return { icon: "⛈️", text: "Thunderstorm", bg: "storm" };
};

// ---------- Fetch ----------
const fetchJSON = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server error (HTTP ${res.status}). Please try again.`);
  return res.json();
};

const getCoordinates = async city => {
  const data = await fetchJSON(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`);
  if (!data.results) throw new Error("NOT_FOUND");
  const { name, country, latitude, longitude } = data.results[0];
  return { label: `${name}, ${country}`, latitude, longitude };
};

const getWeather = (latitude, longitude) =>
  fetchJSON(`${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);

// ---------- Display ----------
const convertTemp = c => Math.round(unit === "C" ? c : c * 9 / 5 + 32);
const convertWind = kmh => unit === "C" ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621)} mph`;

const showLoading = () => {
  const box = $("status");
  box.className = "status";
  box.innerHTML = '<span class="spinner"></span>Fetching weather...';
  $("current").classList.add("hidden");
  $("forecast").innerHTML = "";
};

const showError = message => {
  const box = $("status");
  box.className = "status error";
  box.textContent = message;
  $("current").classList.add("hidden");
  $("forecast").innerHTML = "";
};

const displayWeather = ({ label, data }) => {
  const { current, daily } = data;
  const info = getWeatherInfo(current.weather_code);
  $("status").className = "status hidden";

  const card = $("current");
  card.className = "";
  card.dataset.weather = info.bg;
  card.innerHTML = `
    <h2>${label}</h2>
    <div class="main">
      <span class="icon">${info.icon}</span>
      <span class="temp">${convertTemp(current.temperature_2m)}°${unit}</span>
      <span>${info.text}</span>
    </div>
    <div class="details">
      <span>💨 Wind: ${convertWind(current.wind_speed_10m)}</span>
      <span>💧 Humidity: ${current.relative_humidity_2m}%</span>
    </div>`;

  const forecast = $("forecast");
  forecast.innerHTML = "";
  daily.time.forEach((date, i) => {
    const day = getWeatherInfo(daily.weather_code[i]);
    const name = new Date(`${date}T00:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    const el = document.createElement("div");
    el.className = "day";
    el.innerHTML = `
      <strong>${name}</strong>
      <span class="icon">${day.icon}</span>
      <div>${convertTemp(daily.temperature_2m_max[i])}° / <small>${convertTemp(daily.temperature_2m_min[i])}°</small></div>`;
    forecast.appendChild(el);
  });
};

// ---------- Main actions ----------
const handleError = err => {
  if (err instanceof TypeError) showError("No internet connection. Please check your network.");
  else if (err.message === "NOT_FOUND") showError("City not found. Check the spelling and try again.");
  else showError(err.message);
};

const searchCity = async city => {
  city = city.trim();
  if (!city) return showError("Please enter a city name.");
  showLoading();
  try {
    const { label, latitude, longitude } = await getCoordinates(city);
    lastData = { label, data: await getWeather(latitude, longitude) };
    displayWeather(lastData);
    saveRecent(label.split(",")[0]);
  } catch (err) {
    handleError(err);
  }
};

const useMyLocation = () => {
  if (!navigator.geolocation) return showError("Geolocation is not supported by your browser.");
  showLoading();
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      lastData = { label: "📍 Your location", data: await getWeather(coords.latitude, coords.longitude) };
      displayWeather(lastData);
    } catch (err) {
      handleError(err);
    }
  }, () => showError("Location access denied. Please search for a city instead."));
};

// ---------- Recent searches ----------
const getRecent = () => JSON.parse(localStorage.getItem("recent") || "[]");

function saveRecent(city) {
  const list = [city, ...getRecent().filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(list));
  renderRecent();
}

function renderRecent() {
  const box = $("recent");
  box.innerHTML = "";
  getRecent().forEach(city => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = city;
    chip.addEventListener("click", () => { $("city-input").value = city; searchCity(city); });
    box.appendChild(chip);
  });
}

// ---------- Theme & units ----------
const setTheme = theme => {
  document.documentElement.dataset.theme = theme;
  $("theme-btn").textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
};

// ---------- Events ----------
$("search-btn").addEventListener("click", () => searchCity($("city-input").value));
$("city-input").addEventListener("keydown", e => { if (e.key === "Enter") searchCity(e.target.value); });
$("geo-btn").addEventListener("click", useMyLocation);
$("theme-btn").addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
$("unit-btn").addEventListener("click", () => {
  unit = unit === "C" ? "F" : "C";
  localStorage.setItem("unit", unit);
  $("unit-btn").textContent = `°${unit}`;
  if (lastData) displayWeather(lastData);
});

// ---------- Init ----------
setTheme(localStorage.getItem("theme") ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("unit-btn").textContent = `°${unit}`;
renderRecent();
