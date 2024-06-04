// Event listener for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Accessing the API key from a config file
    const apiKey = config.apiKey; // Use the apiKey from config.js
    // Retrieving DOM elements
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const cityNameElement = document.querySelector(".cityName");
    const tempElement = document.querySelector(".temp");
    const windElement = document.querySelector(".wind");
    const humidityElement = document.querySelector(".humidity");


    // Load search history from local storage
    loadSearchHistory();

    // Adding event listener to search button
    searchBtn.addEventListener("click", function () {
        const city = searchInput.value;
        // If input city is not empty
        if (city) {
            // Get weather for the city
            getWeather(city);
            // Add city to search history
            addToSearchHistory(city);
            // Save search history to local storage
            saveSearchHistory(city);
        }
    });

    // Function to fetch weather data for a city
    function getWeather(city) {
        // Log the city for which weather is being fetched
        console.log(`Getting weather for: ${city}`); // Debug log
        // Fetch weather data from OpenWeatherMap API
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    // If city is found, display its current weather
                    displayCurrentWeather(data);
                    // Get forecast for the city
                    getForecast(data.coord.lat, data.coord.lon);
                } else {
                    // If city is not found, show alert
                    alert("City not found!");
                }
            })
            .catch(error => console.error("Error fetching weather data:", error));
    }

    // Function to display current weather
    function displayCurrentWeather(data) {
        // Construct URL for weather icon
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

        // Get current date
        const currentDate = new Date().toLocaleDateString();

        // Display current weather information
        cityNameElement.innerHTML = `${data.name}, ${data.sys.country} (${currentDate}) <img src="${iconUrl}" alt="${data.weather[0].description}">`;
        const celsiusTemp = data.main.temp;
        const fahrenheitTemp = (celsiusTemp * 9/5) + 32;
        tempElement.innerHTML = `Temp: ${celsiusTemp} °C / ${fahrenheitTemp.toFixed(2)} °F`;
        windElement.innerHTML = `Wind: ${data.wind.speed} m/s`;
        humidityElement.innerHTML = `Humidity: ${data.main.humidity}%`;

        // Add border to .city element
        const cityElement = document.querySelector('.city');
        cityElement.classList.add('city-border');
    }

    // Function to fetch forecast data for a city
    function getForecast(lat, lon) {
        // Log the coordinates for which forecast is being fetched
        console.log(`Getting forecast for coordinates: ${lat}, ${lon}`); // Debug log
        // Fetch forecast data from OpenWeatherMap API
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                // Display forecast data
                displayForecast(data);
            })
            .catch(error => console.error("Error fetching forecast data:", error));
    }

    // Function to display forecast
    function displayForecast(data) {
        const forecastElement = document.querySelector(".forecast");
        forecastElement.innerHTML = '<h3 class="resultForecast">5-Day Forecast:</h3>';

        // Initialize today and tomorrow dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const forecastContainer = document.createElement("div");
        forecastContainer.className = "forecast-container";

        const dailyForecasts = {};

        // Filter out and store daily forecasts for the next 5 days
        data.list.forEach(forecast => {
            const forecastDate = new Date(forecast.dt * 1000);
            const forecastDay = forecastDate.getDate();

            // Only consider forecasts for dates after tomorrow
            if (forecastDate > tomorrow && !dailyForecasts[forecastDay]) {
                dailyForecasts[forecastDay] = forecast;
            }
        });

        // Iterate over the next 5 days and display the forecast
        Object.keys(dailyForecasts).slice(0, 5).forEach(day => {
            const forecast = dailyForecasts[day];
            const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
            const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

            const celsiusTemp = forecast.main.temp;
            const fahrenheitTemp = (celsiusTemp * 9/5) + 32;

            const forecastDiv = document.createElement("div");
            forecastDiv.className = "forecast-day";
            forecastDiv.innerHTML = `
                <div class="forecast-date">${forecastDate}</div>
                <img src="${iconUrl}" alt="${forecast.weather[0].description}">
                <div>Temp: ${celsiusTemp} °C / ${fahrenheitTemp.toFixed(2)} °F</div>
                <div>Wind: ${forecast.wind.speed} m/s</div>
                <div>Humidity: ${forecast.main.humidity}%</div>
            `;

            forecastContainer.appendChild(forecastDiv);
        });

        forecastElement.appendChild(forecastContainer);
    }

    // Function to add a city to search history
    function addToSearchHistory(city) {
        // Log the city being added to search history
        console.log(`Adding to search history: ${city}`); // Debug log
        // Create and append search history element
        const searchHistory = document.createElement("div");
        searchHistory.className = "search-history";
        searchHistory.innerHTML = city;
        searchHistory.addEventListener("click", function () {
            // Log when a search history item is clicked
            console.log(`Search history clicked: ${city}`); // Debug log
            // Get weather for the clicked city
            getWeather(city);
        });
        document.querySelector(".search").appendChild(searchHistory);
    }

    // Function to save search history to local storage
    function saveSearchHistory(city) {
        // Retrieve search history from local storage or initialize an empty array
        let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        // If city is not already in search history, add it
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem("searchHistory", JSON.stringify(history));
        }
    }

    // Function to load search history from local storage
function loadSearchHistory() {
    // Retrieve search history from local storage or initialize an empty array
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    // Add each city in search history to the UI
    history.forEach(city => addToSearchHistory(city));
}
// Add missing ')' and '}'
});
