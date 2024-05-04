//API key for OpenWeatherMap
const apiKey = "f655b4a9b39daf83da57038f0d454ebf";

//Get DOM elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const cityNameElement = document.getElementById("city-name");
const tempElement = document.getElementById("temp");
const windElement = document.getElementById("wind");
const humidityElement = document.getElementById("humidity");
const forecastCardsContainer = document.querySelector(".forecast-cards");
const historyList = document.getElementById("history-list");

//Add event listener to search button
searchBtn.addEventListener("click", searchWeather);

// Function to search for weather data
function searchWeather() {
  const cityName = cityInput.value.trim();
  if (cityName !== "") {
    getWeatherData(cityName);
    cityInput.value = "";
  }
}

//Function to fetch weather data from API
function getWeatherData(cityName) {
  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  fetch(geocodingUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

        fetch(weatherUrl)
          .then((response) => response.json())
          .then((weatherData) => {
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            saveSearchHistory(cityName);
          })
          .catch((error) => console.log("Error fetching weather data:", error));
      } else {
        console.log("City not found");
      }
    })
    .catch((error) => console.log("Error fetching geocoding data:", error));
}

// Function to display current weather data
function displayCurrentWeather(weatherData) {
  const cityName = weatherData.city.name;
  const temperature = weatherData.list[0].main.temp;
  const windSpeed = weatherData.list[0].wind.speed;
  const humidity = weatherData.list[0].main.humidity;

  cityNameElement.textContent = `${cityName} (${formatDate(
    weatherData.list[0].dt_txt
  )})`;
  tempElement.textContent = `${temperature}°F`;
  windElement.textContent = `${windSpeed} MPH`;
  humidityElement.textContent = `${humidity} %`;
}

// Function to display 5-day forecast
function displayForecast(weatherData) {
  forecastCardsContainer.innerHTML = "";

  for (let i = 0; i < weatherData.list.length; i += 8) {
    const forecast = weatherData.list[i];
    const date = formatDate(forecast.dt_txt);
    const temperature = forecast.main.temp;
    const windSpeed = forecast.wind.speed;
    const humidity = forecast.main.humidity;
    const iconCode = forecast.weather[0].icon;

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p>${date}</p>
      <img src="http://openweathermap.org/img/w/${iconCode}.png" alt="Weather Icon">
      <p>Temp: ${temperature}°F</p>
      <p>Wind: ${windSpeed} MPH</p>
      <p>Humidity: ${humidity} %</p>
    `;

    forecastCardsContainer.appendChild(card);
  }
}

// Function to save search history
function saveSearchHistory(cityName) {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!searchHistory.includes(cityName)) {
    searchHistory.push(cityName);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    updateSearchHistory();
  }
}

// Function to update search history display
function updateSearchHistory() {
  historyList.innerHTML = "";
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistory.forEach((cityName) => {
    const listItem = document.createElement("li");
    listItem.textContent = cityName;
    listItem.addEventListener("click", () => {
      getWeatherData(cityName);
    });
    historyList.appendChild(listItem);
  });
}

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Update search history on page load
updateSearchHistory();
