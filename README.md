# Weather Dashboard

A responsive weather web app built with HTML, CSS and vanilla JavaScript. Search any city to see the current weather and a 5-day forecast, using the free [Open-Meteo](https://open-meteo.com/) API. No API key is required.

**Live demo:** <your-vercel-link>

## Features

- City search by clicking Search or pressing Enter
- Current temperature, weather condition, wind speed and humidity
- 5-day forecast with daily high and low
- Weather icons, and a card background that changes with the weather (sunny, cloudy, rainy, snow, storm)
- Switch between °C and °F (wind shows km/h or mph accordingly)
- "Use my location" button (Geolocation API)
- Recent searches saved in `localStorage` and shown as clickable chips
- Dark / Light theme toggle, saved in `localStorage` (defaults to the system theme)
- Loading spinner while data is fetched
- Friendly error messages for empty input, city not found, server errors and no internet
- Responsive layout: forecast cards in a row on desktop, stacked on phones

## Tech Stack

- HTML5
- CSS3 (custom properties, Grid, Flexbox, media queries)
- JavaScript (ES6+: async/await, arrow functions, destructuring, template strings)
- Fetch API with Open-Meteo Geocoding and Forecast endpoints

## Project Structure

```
weather-dashboard/
├── index.html   # Page structure
├── style.css    # Styling, themes, responsive layout
├── script.js    # API calls, rendering, error handling, storage
└── README.md
```

## How It Works

1. `getCoordinates()` converts the city name into latitude and longitude using the Geocoding API.
2. `getWeather()` fetches current conditions and the daily forecast for those coordinates.
3. `fetchJSON()` checks `response.ok`, throws on HTTP errors and returns the parsed JSON.
4. `displayWeather()` builds the current-weather card and forecast cards dynamically.
5. `showLoading()` and `showError()` update a status box; `try / catch` handles all failures.

## Run Locally

```bash
git clone https://github.com/<your-username>/weather-dashboard.git
cd weather-dashboard
```

Open `index.html` in a browser, or use a static server such as the VS Code Live Server extension.

## API Used

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
