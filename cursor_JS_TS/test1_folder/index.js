// console.log("Script is running");
// alert("Script is running");

// document.addEventListener('DOMContentLoaded', function() {
//   console.log("DOMContentLoaded event fired");
//   document.getElementById("header_1").innerHTML = `<h1> My Widgets Board </h1>`;
// });

// Clock in JS
function updClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");
  const timeStr = `${h}:${m}:${s}`;
  document.getElementById("clock1").textContent = timeStr;
}
setInterval(updClock, 1000);
updClock();

//calendar in JS
const calElement = document.getElementById("today_is");
const h1Element = document.createElement("h1");
calElement.appendChild(h1Element);

function calendar1() {
  const today = new Date();
  // Update the existing h1 element's content
  h1Element.textContent = `${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysinMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["S", "M", "T", "W", "Th", "F", "S"];
  
  let calendarHTML = "<table>";
  calendarHTML += "<tr>";
  for (let i = 0; i < 7; i++) {
    calendarHTML += `<th>${dayNames[i]}</th>`;
  }
  calendarHTML += "</tr>";
  let day = 1;

  for (let i = 0; i < 5; i++) {
    // drawing table of rows (each row is one week)
    calendarHTML += "<tr>";
    for (let j = 0; j < 7; j++) {
      // drawing table of columns
      if (i === 0 && j < new Date(year, month, 1).getDay()) {
        calendarHTML += "<td></td>";
      } else if (day <= daysinMonth) {
        if (day === today.getDate()) {
          calendarHTML += `<td class="today">${day}</td>`;
        } else if (j === 0 || j === 6) {
          calendarHTML += `<td class="weekend">${day}</td>`;
        } else {
          calendarHTML += `<td>${day}</td>`;
        }
        day++;
      } else {
        calendarHTML += "<td></td>";
      }
    }
    calendarHTML += "</tr>";
  }
  calendarHTML += "</table>";
  document.getElementById("calendar1").innerHTML = calendarHTML;
}
setInterval(calendar1, 1000);
calendar1();


//////////////////
// Weather Widgets
function getAndDisplayWeather(zipCode) {
  // Hide the form elements
  const label = document.querySelector('label[for="zipCode"]');
  const input = document.getElementById('zipCode');
  const button = document.querySelector('button[type="submit"]');

  if (label) label.style.display = 'none';
  if (input) input.style.display = 'none';
  if (button) button.style.display = 'none';

  const apiKey = "2299aff04290332fa767a30e44f0d6a2";
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode}&appid=${apiKey}&units=metric`;
  
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const weatherTable = document.createElement("table");
      weatherTable.innerHTML = "<tr><th>Date</th><th>Temperature (°C)</th></tr>";
      
      const dailyData = {};
      const today = new Date().toDateString();
      const todayForecast = [];

      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();
        if (!dailyData[dateString]) {
          dailyData[dateString] = { 
            temp: item.main.temp, 
            count: 1,
            date: date  // Store the date object
          };
        } else {
          dailyData[dateString].temp += item.main.temp;
          dailyData[dateString].count++;
        }

        // Collect today's forecast (unchanged)
        if (dateString === today) {
          todayForecast.push({
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            temp: item.main.temp.toFixed(1)
          });
        }
      });

      // Display 7-day forecast with formatted date
      Object.entries(dailyData).slice(0, 7).forEach(([dateString, data]) => {
        const avgTemp = (data.temp / data.count).toFixed(1);
        const formattedDate = data.date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: '2-digit'
        }).toUpperCase();
        weatherTable.innerHTML += `<tr><td>${formattedDate}</td><td>${avgTemp}°C</td></tr>`;
      });

      const weatherOutput = document.getElementById("weatherOutput");
      weatherOutput.innerHTML = ''; // Clear previous content
      weatherOutput.appendChild(weatherTable);

      // Display today's forecast every 5 hours
      const todayForecastDiv = document.createElement("div");
      todayForecastDiv.innerHTML = "<h3>Today's Forecast (every 2 hours):</h3>";
      const todayTable = document.createElement("table");
      todayTable.innerHTML = "<tr><th>Time</th><th>Temperature (°C)</th></tr>";
      
      for (let i = 0; i < todayForecast.length; i += 2) {
        const forecast = todayForecast[i];
        todayTable.innerHTML += `<tr><td>${forecast.time}</td><td>${forecast.temp}°C</td></tr>`;
      }

      todayForecastDiv.appendChild(todayTable);
      weatherOutput.appendChild(todayForecastDiv);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
}

function handleFormSubmit(event) {
  event.preventDefault();
  const enteredZipCode = document.getElementById("zipCode").value;
  sessionStorage.setItem("zipCode", enteredZipCode);
  getAndDisplayWeather(enteredZipCode);
}

// Main execution
document.addEventListener('DOMContentLoaded', function() {
  const weatherForm = document.getElementById("weatherForm");
  const zipCodeInput = document.getElementById("zipCode");

  // Check if zip code is stored in session
  const storedZipCode = sessionStorage.getItem("zipCode");
  
  if (storedZipCode) {
    zipCodeInput.value = storedZipCode;
    getAndDisplayWeather(storedZipCode);
  }

  // Add event listener for form submission
  weatherForm.addEventListener("submit", handleFormSubmit);
});

// Function to initialize the map
async function initMap() {
    // Load the Maps library first
    const { Map } = await google.maps.importLibrary("maps");
    
    // Default coordinates (will be replaced with actual location)
    let lat = 0;
    let lng = 0;

    // Create map instance
    const map = new Map(document.getElementById('map'), {
        center: { lat: lat, lng: lng },
        zoom: 12
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                lat = position.coords.latitude;
                lng = position.coords.longitude;

                // Center map on user's location
                map.setCenter({ lat: lat, lng: lng });

                // Load the Advanced Markers library
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
                
                // Add advanced marker at user's location
                const marker = new AdvancedMarkerElement({
                    position: { lat: lat, lng: lng },
                    map: map,
                    title: 'Your Location'
                });
            },
            () => {
                console.error('Error: The Geolocation service failed.');
                // You could add error handling here, like displaying a message to the user
            }
        );
    } else {
        console.error('Error: Your browser doesn\'t support geolocation.');
        // You could add error handling here, like displaying a message to the user
    }
}