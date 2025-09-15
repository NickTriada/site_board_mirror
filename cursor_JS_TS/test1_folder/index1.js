
// Configuration
const CONFIG = {
    ZIP_CODE: '95112', // New York City
    API_KEY: 'AIzaSyCqLu1rJ2URpt2eE7SigrcFkAnVyzurcG8', // Replace with your OpenWeatherMap API key
    UNITS: 'metric', // imperial for Fahrenheit, metric for Celsius
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes in milliseconds
    ANIMATION_ELEMENTS: 50, // Number of animation elements (raindrops, snowflakes, etc.)
};

// DOM Elements
let widgetElement;
let backgroundElement;
let contentElement;
let loadingElement;

// Weather Data Storage
let weatherData = {
    current: null,
    forecast: null,
    location: null,
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    widgetElement = document.getElementById('weatherWidget');
    backgroundElement = document.getElementById('widgetBackground');
    contentElement = document.getElementById('widgetContent');
    loadingElement = document.getElementById('loading');
    
    // Start the widget
    initWidget();
});

// Initialize the widget
async function initWidget() {
    try {
        // Fetch current weather data
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?zip=${CONFIG.ZIP_CODE},us&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error('Failed to fetch current weather data');
        }
        
        weatherData.current = await currentWeatherResponse.json();
        weatherData.location = {
            city: weatherData.current.name,
            country: weatherData.current.sys.country
        };

        // Fetch 7-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.current.coord.lat}&lon=${weatherData.current.coord.lon}&exclude=minutely,hourly&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        weatherData.forecast = await forecastResponse.json();

        // Update the widget UI
        updateWidget();
        
        // Set up background and animations
        setWeatherBackground();
        createWeatherAnimation();

        // Hide loading indicator
        loadingElement.style.display = 'none';
        
        // Set up refresh interval
        setInterval(refreshWeatherData, CONFIG.REFRESH_INTERVAL);
    } catch (error) {
        console.error('Error initializing weather widget:', error);
        showError(error.message);
    }
}

// Show error message
function showError(message) {
    loadingElement.style.display = 'none';
    contentElement.innerHTML = `
        <div class="error-message">
            <h2>Oops! Something went wrong</h2>
            <p>${message}</p>
            <p>Please check your API key or try again later.</p>
        </div>
    `;
}

// Update the widget with the latest weather data
function updateWidget() {
    if (!weatherData.current || !weatherData.forecast) return;

    const current = weatherData.current;
    const forecast = weatherData.forecast;
    const location = weatherData.location;

    // Format current date
    const currentDate = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);

    // Get current weather info
    const temp = Math.round(current.main.temp);
    const feelsLike = Math.round(current.main.feels_like);
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed;
    const windDirection = current.wind.deg;
    const weatherDescription = current.weather[0].description;
    const weatherIcon = getWeatherIcon(current.weather[0].id, isDay());
    
    // Create current weather HTML
    const currentWeatherHTML = `
        <div class="location-info">
            <h1>${location.city}, ${location.country}</h1>
            <p>${formattedDate}</p>
        </div>
        <div class="current-weather">
            <div class="temp-info">
                <i class="${weatherIcon} weather-icon"></i>
                <div class="temperature">${temp}<span>°${CONFIG.UNITS === 'imperial' ? 'F' : 'C'}</span></div>
                <div class="weather-description">${capitalizeFirstLetter(weatherDescription)}</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-icon"><i class="fas fa-thermometer-half"></i></div>
                    <div class="detail-text">Feels like: ${feelsLike}°${CONFIG.UNITS === 'imperial' ? 'F' : 'C'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon"><i class="fas fa-wind"></i></div>
                    <div class="detail-text">
                        <div class="wind-indicator">
                            Wind: ${windSpeed} ${CONFIG.UNITS === 'imperial' ? 'mph' : 'm/s'}
                            <i class="fas fa-arrow-up wind-arrow" style="transform: rotate(${windDirection}deg)"></i>
                        </div>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon"><i class="fas fa-tint"></i></div>
                    <div class="detail-text">Humidity: ${humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon"><i class="fas fa-compress-arrows-alt"></i></div>
                    <div class="detail-text">Pressure: ${current.main.pressure} hPa</div>
                </div>
            </div>
        </div>
    `;

    // Create forecast HTML
    let forecastHTML = `<h2 class="forecast-title">7-Day Forecast</h2><div class="forecast-container">`;
    
    // Start with index 1 to skip today's forecast
    for (let i = 1; i < 8; i++) {
        const day = forecast.daily[i];
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayMaxTemp = Math.round(day.temp.max);
        const dayMinTemp = Math.round(day.temp.min);
        const dayWindSpeed = day.wind_speed;
        const dayWindDirection = day.wind_deg;
        const dayHumidity = day.humidity;
        const dayPrecipitation = Math.round((day.pop * 100));
        const dayWeatherIcon = getWeatherIcon(day.weather[0].id, true);
        
        forecastHTML += `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-date">${dayMonth}</div>
                <i class="${dayWeatherIcon} forecast-icon"></i>
                <div class="forecast-temp">
                    <div class="forecast-max">
                        <p>Max</p>
                        <span>${dayMaxTemp}°</span>
                    </div>
                    <div class="forecast-min">
                        <p>Min</p>
                        <span>${dayMinTemp}°</span>
                    </div>
                </div>
                <div class="forecast-details">
                    <div class="forecast-detail-item">
                        <div class="forecast-detail-icon"><i class="fas fa-umbrella"></i></div>
                        <div class="detail-text">Precip: ${dayPrecipitation}%</div>
                    </div>
                    <div class="forecast-detail-item">
                        <div class="forecast-detail-icon"><i class="fas fa-wind"></i></div>
                        <div class="detail-text">
                            <div class="wind-indicator">
                                Wind: ${dayWindSpeed} ${CONFIG.UNITS === 'imperial' ? 'mph' : 'm/s'}
                                <i class="fas fa-arrow-up wind-arrow" style="transform: rotate(${dayWindDirection}deg);"></i>
                            </div>
                        </div>
                    </div>
                    <div class="forecast-detail-item">
                        <div class="forecast-detail-icon"><i class="fas fa-tint"></i></div>
                        <div class="detail-text">Humidity: ${dayHumidity}%</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    forecastHTML += `</div>`;

    // Combine and insert into the widget
    contentElement.innerHTML = currentWeatherHTML + forecastHTML;
}

// Refresh weather data
async function refreshWeatherData() {
    try {
        // Fetch current weather data
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?zip=${CONFIG.ZIP_CODE},us&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`
        );
        
        if (!currentWeatherResponse.ok) throw new Error('Failed to fetch current weather data');
        
        weatherData.current = await currentWeatherResponse.json();

        // Fetch 7-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.current.coord.lat}&lon=${weatherData.current.coord.lon}&exclude=minutely,hourly&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`
        );
        
        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');
        
        weatherData.forecast = await forecastResponse.json();

        // Update the widget UI
        updateWidget();
        
        // Update background and animations
        setWeatherBackground();
        createWeatherAnimation();
    } catch (error) {
        console.error('Error refreshing weather data:', error);
    }
}

// Set the background based on current weather
function setWeatherBackground() {
    if (!weatherData.current) return;
    
    const weatherId = weatherData.current.weather[0].id;
    const weatherMain = weatherData.current.weather[0].main;
    const isDayTime = isDay();
    
    // Remove all existing background classes
    backgroundElement.classList.remove('background-day', 'background-night', 'background-cloudy', 'background-rainy');
    
    // Determine appropriate background
    if (weatherMain === 'Clear') {
        backgroundElement.classList.add(isDayTime ? 'background-day' : 'background-night');
    } else if (weatherMain === 'Clouds') {
        backgroundElement.classList.add('background-cloudy');
    } else if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain)) {
        backgroundElement.classList.add('background-rainy');
    } else if (weatherMain === 'Snow') {
        backgroundElement.classList.add('background-cloudy');
    } else {
        backgroundElement.classList.add(isDayTime ? 'background-day' : 'background-night');
    }
}

// Create weather animations based on current weather
function createWeatherAnimation() {
    if (!weatherData.current) return;
    
    // Remove any existing animation elements
    removeAnimationElements();
    
    const weatherMain = weatherData.current.weather[0].main;
    const isDayTime = isDay();
    
    // Create appropriate animation
    if (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain)) {
        createRainAnimation();
    } else if (weatherMain === 'Snow') {
        createSnowAnimation();
    } else if (weatherMain === 'Clouds') {
        createCloudAnimation();
    } else if (weatherMain === 'Clear' && isDayTime) {
        createSunAnimation();
    }
}

// Create rain animation
function createRainAnimation() {
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    for (let i = 0; i < CONFIG.ANIMATION_ELEMENTS; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // Random positioning
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * 100}%`;
        drop.style.opacity = Math.random() * 0.8 + 0.2;
        drop.style.height = `${Math.random() * 15 + 10}px`;
        
        // Animation
        drop.style.animation = `rainFall ${Math.random() * 1 + 0.5}s linear infinite`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        
        rainContainer.appendChild(drop);
    }
    
    widgetElement.appendChild(rainContainer);
}

// Create snow animation
function createSnowAnimation() {
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow';
    
    for (let i = 0; i < CONFIG.ANIMATION_ELEMENTS; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        
        // Random positioning
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.top = `${Math.random() * 100}%`;
        snowflake.style.opacity = Math.random() * 0.8 + 0.2;
        snowflake.style.fontSize = `${Math.random() * 15 + 5}px`;
        
        // Animation
        snowflake.style.animation = `snowFall ${Math.random() * 5 + 5}s linear infinite`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        
        snowContainer.appendChild(snowflake);
    }
    
    widgetElement.appendChild(snowContainer);
}

// Create cloud animation
function createCloudAnimation() {
    const cloudContainer = document.createElement('div');
    cloudContainer.className = 'clouds';
    
    const cloudIcons = ['☁️', '🌥️', '⛅'];
    
    for (let i = 0; i < Math.floor(CONFIG.ANIMATION_ELEMENTS / 2); i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.innerHTML = cloudIcons[Math.floor(Math.random() * cloudIcons.length)];
        
        // Random positioning
        cloud.style.left = `${Math.random() * 100}%`;
        cloud.style.top = `${Math.random() * 60}%`;
        cloud.style.opacity = Math.random() * 0.6 + 0.2;
        cloud.style.fontSize = `${Math.random() * 30 + 20}px`;
        
        // Animation
        cloud.style.animation = `cloudFloat ${Math.random() * 60 + 40}s linear infinite`;
        cloud.style.animationDelay = `${Math.random() * 10}s`;
        
        cloudContainer.appendChild(cloud);
    }
    
    widgetElement.appendChild(cloudContainer);
    }

    // Create sun animation
    function createSunAnimation() {
        const sunContainer = document.createElement('div');
        sunContainer.className = 'sun';
        
        const sun = document.createElement('div');
        sun.className = 'sun-element';
        sun.style.top = '20px';
        sun.style.right = '20px';
        sun.style.animation = 'sunPulse 3s ease-in-out infinite';
        
        sunContainer.appendChild(sun);
        widgetElement.appendChild(sunContainer);
    }

    // Remove any existing animation elements
    function removeAnimationElements() {
        const animationElements = widgetElement.querySelectorAll('.rain, .snow, .clouds, .sun');
        animationElements.forEach(element => element.remove());
    }

    // Check if it's daytime based on current time and sunrise/sunset data
    function isDay() {
        if (!weatherData.current) return true;
        
        const currentTime = new Date().getTime() / 1000;
        const sunrise = weatherData.current.sys.sunrise;
        const sunset = weatherData.current.sys.sunset;
        
        return currentTime >= sunrise && currentTime < sunset;
    }

    // Get the appropriate weather icon class based on weather ID and time of day
    function getWeatherIcon(weatherId, isDay) {
        // Weather condition codes: https://openweathermap.org/weather-conditions
        
        // Thunderstorm
        if (weatherId >= 200 && weatherId < 300) {
            return 'fas fa-bolt';
        }
        // Drizzle or Rain
        else if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
            return 'fas fa-cloud-rain';
        }
        // Snow
        else if (weatherId >= 600 && weatherId < 700) {
            return 'fas fa-snowflake';
        }
        // Atmosphere (fog, mist, etc.)
        else if (weatherId >= 700 && weatherId < 800) {
            return 'fas fa-smog';
        }
        // Clear
        else if (weatherId === 800) {
            return isDay ? 'fas fa-sun' : 'fas fa-moon';
        }
        // Clouds
        else if (weatherId > 800 && weatherId < 900) {
            return isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
        }
        // Default
        else {
            return 'fas fa-cloud';
        }
    }

    // Helper function to capitalize first letter of each word
    function capitalizeFirstLetter(string) {
        return string.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    }