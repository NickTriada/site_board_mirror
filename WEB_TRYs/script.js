const API_KEY = '174d63fe7a0512b412c85ec8875f1dba'; // Replace with your actual OpenWeatherMap API key
const ZIP_CODE = '95112';
const COUNTRY = 'US'; // Change if needed

// Helper function to format date without year
function formatDateWithoutYear(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

async function getWeather() {
  try {
    // Get lat/lon from ZIP
    const geoResp = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${ZIP_CODE},${COUNTRY}&appid=${API_KEY}`);
    const geoData = await geoResp.json();
    
    if (!geoResp.ok) {
      throw new Error(`Geocoding API error: ${JSON.stringify(geoData)}`);
    }
    
    console.log('Geocoding response:', geoData);
    const { lat, lon } = geoData;

    // Get current weather
    const currentResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const currentData = await currentResp.json();
    
    if (!currentResp.ok) {
      throw new Error(`Current weather API error: ${JSON.stringify(currentData)}`);
    }

    // Get 5-day forecast
    const forecastResp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastResp.json();
    
    if (!forecastResp.ok) {
      throw new Error(`Forecast API error: ${JSON.stringify(forecastData)}`);
    }
    
    console.log('Current weather:', currentData);
    console.log('Forecast data:', forecastData);

    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    
    // Add current day's weather first
    const currentDate = new Date(currentData.dt * 1000);
    const currentDayCard = `
      <div class="day">
        <h3>${formatDateWithoutYear(currentDate)}</h3>
        <p><strong>Temp:</strong> ${currentData.main.temp.toFixed(1)}°C</p>
        <p><strong>Min:</strong> ${currentData.main.temp_min.toFixed(1)}°C</p>
        <p><strong>Max:</strong> ${currentData.main.temp_max.toFixed(1)}°C</p>
        <p><strong>Wind:</strong> ${currentData.wind.speed} m/s</p>
        <p><strong>Weather:</strong> ${currentData.weather[0].description}</p>
      </div>
    `;
    forecastDiv.innerHTML = currentDayCard;

    // Group all forecasts by day
    const dailyForecasts = {};
    forecastData.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dateStr = date.toDateString();
      
      // Skip today's date since we already showed it from current weather
      if (dateStr === currentDate.toDateString()) {
        return;
      }
      
      if (!dailyForecasts[dateStr]) {
        dailyForecasts[dateStr] = {
          date: date,
          forecasts: [],
          middayForecast: null
        };
      }
      
      dailyForecasts[dateStr].forecasts.push(forecast);
      
      // Store the forecast closest to noon for the main display
      if (date.getHours() >= 11 && date.getHours() <= 13) {
        dailyForecasts[dateStr].middayForecast = forecast;
      }
    });

    // Display each day's forecast
    Object.values(dailyForecasts).forEach(day => {
      // Skip if we don't have a midday forecast
      if (!day.middayForecast) return;
      
      // Calculate min/max from all forecasts for this day
      const temps = day.forecasts.map(f => f.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      const forecast = day.middayForecast;
      forecastDiv.innerHTML += `
        <div class="day">
          <h3>${formatDateWithoutYear(day.date)}</h3>
          <p><strong>Temp:</strong> ${forecast.main.temp.toFixed(1)}°C</p>
          <p><strong>Min:</strong> ${minTemp.toFixed(1)}°C</p>
          <p><strong>Max:</strong> ${maxTemp.toFixed(1)}°C</p>
          <p><strong>Wind:</strong> ${forecast.wind.speed} m/s</p>
          <p><strong>Weather:</strong> ${forecast.weather[0].description}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    document.getElementById('forecast').innerHTML = `<p>Unable to load weather data: ${error.message}</p>`;
  }
}

getWeather();
