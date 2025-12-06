
        const API_KEY = '8df6312430911c503cd848f72117ec67';
        const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
        const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

        // Global variables
        let currentUnit = 'metric';
        let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];

        // Initialize on page load
        updateBackground();
        displayHistory();

        // Update background every 30 minutes
        setInterval(updateBackground, 1800000);

        // Update background based on time of day
        function updateBackground() {
            const hour = new Date().getHours();
            let colors;

            if (hour >= 5 && hour < 12) {
                // Morning - Light blue
                colors = ['#87CEEB', '#B0E0E6'];
            } else if (hour >= 12 && hour < 17) {
                // Afternoon - Bright blue
                colors = ['#4682B4', '#87CEEB'];
            } else if (hour >= 17 && hour < 20) {
                // Evening - Orange/Purple sunset
                colors = ['#FF8C00', '#BA55D3'];
            } else {
                // Night - Dark blue
                colors = ['#191970', '#483D8B'];
            }

            document.body.style.background = `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
        }

        // Search weather
        function searchWeather() {
            const location = document.getElementById('locationInput').value.trim();

            if (!location) {
                alert('Please enter a location!');
                return;
            }

            fetchCurrentWeather(location);
            fetchForecast(location);
        }

        // Fetch current weather data
        async function fetchCurrentWeather(location) {
            try {
                const url = `${CURRENT_URL}?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=${currentUnit}`;
                const response = await fetch(url);

                if (!response.ok) {
                    if (response.status === 404) {
                        alert('Location not found! Please check the spelling.');
                    } else {
                        alert('API Error: ' + response.status);
                    }
                    return;
                }

                const data = await response.json();
                displayWeather(data, location);
            } catch (error) {
                alert('Network error: ' + error.message);
            }
        }

        // Fetch forecast data
        async function fetchForecast(location) {
            try {
                const url = `${FORECAST_URL}?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=${currentUnit}`;
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    displayForecast(data);
                }
            } catch (error) {
                console.error('Forecast error:', error);
            }
        }

        // Display current weather
        function displayWeather(data, location) {
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const icon = data.weather[0].icon;
            const humidity = data.main.humidity;
            const windSpeed = Math.round(data.wind.speed);
            const city = data.name;

            const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
            const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

            document.getElementById('temperature').textContent = `${temp} ${unitSymbol}`;
            document.getElementById('weatherDesc').textContent = `${capitalize(desc)} in ${city}`;
            document.getElementById('humidity').textContent = `💧 Humidity: ${humidity}%`;
            document.getElementById('windSpeed').textContent = `💨 Wind: ${windSpeed} ${windUnit}`;
            document.getElementById('weatherIcon').textContent = getWeatherEmoji(icon);

            addToHistory(location);
        }

        // Display 5-day forecast
        function displayForecast(data) {
            const forecastGrid = document.getElementById('forecastGrid');
            forecastGrid.innerHTML = '';

            // Get one forecast per day (around noon)
            const dailyData = [];
            const processedDays = new Set();

            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en', { weekday: 'short' });
                const hour = date.getHours();

                // Get forecast around noon (12:00) for each day
                if (hour >= 11 && hour <= 14 && !processedDays.has(day) && dailyData.length < 5) {
                    dailyData.push({
                        day: day,
                        temp: Math.round(item.main.temp),
                        icon: item.weather[0].icon
                    });
                    processedDays.add(day);
                }
            });

            // If we don't have 5 days, fill with available data
            if (dailyData.length < 5) {
                const remaining = 5 - dailyData.length;
                for (let i = 0; i < remaining && i < data.list.length; i++) {
                    const item = data.list[i * 8]; // Every 8th entry (24 hours)
                    if (item) {
                        const date = new Date(item.dt * 1000);
                        const day = date.toLocaleDateString('en', { weekday: 'short' });

                        if (!processedDays.has(day)) {
                            dailyData.push({
                                day: day,
                                temp: Math.round(item.main.temp),
                                icon: item.weather[0].icon
                            });
                            processedDays.add(day);
                        }
                    }
                }
            }

            // Create forecast cards
            dailyData.forEach(info => {
                const dayCard = document.createElement('div');
                dayCard.className = 'forecast-day';

                const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';

                dayCard.innerHTML = `
            <div class="forecast-day-name">${info.day}</div>
            <div class="forecast-icon">${getWeatherEmoji(info.icon)}</div>
            <div class="forecast-temp">${info.temp}${unitSymbol}</div>
        `;

                forecastGrid.appendChild(dayCard);
            });
        }

        // Get weather emoji based on icon code
        function getWeatherEmoji(code) {
            const icons = {
                '01': '☀️',  // Clear sky
                '02': '⛅',  // Few clouds
                '03': '☁️',  // Scattered clouds
                '04': '☁️',  // Broken clouds
                '09': '🌧️',  // Shower rain
                '10': '🌦️',  // Rain
                '11': '⛈️',  // Thunderstorm
                '13': '❄️',  // Snow
                '50': '🌫️'   // Mist
            };
            return icons[code.substring(0, 2)] || '❓';
        }

        // Capitalize words
        function capitalize(str) {
            return str.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        // Convert units
        function convertUnits() {
            const selector = document.getElementById('unitSelector');
            currentUnit = selector.value;

            const location = document.getElementById('locationInput').value.trim();
            if (location) {
                searchWeather();
            }
        }

        // Add to search history
        function addToHistory(location) {
            const timestamp = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const entry = `${timestamp} - ${location}`;

            // Add to beginning of array
            searchHistory.unshift(entry);

            // Keep only last 20 searches
            if (searchHistory.length > 20) {
                searchHistory = searchHistory.slice(0, 20);
            }

            // Save to localStorage
            localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));

            displayHistory();
        }

        // Display search history
        function displayHistory() {
            const historyList = document.getElementById('historyList');

            if (searchHistory.length === 0) {
                historyList.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">No searches yet</div>';
                return;
            }

            historyList.innerHTML = searchHistory.map(entry =>
                `<div class="history-item">${entry}</div>`
            ).join('');
        }

        // Clear search history
        function clearHistory() {
            if (confirm('Are you sure you want to clear the history?')) {
                searchHistory = [];
                localStorage.removeItem('weatherHistory');
                displayHistory();
            }
        }

        // Allow Enter key to search
        document.addEventListener('DOMContentLoaded', function () {
            const input = document.getElementById('locationInput');
            if (input) {
                input.addEventListener('keypress', function (event) {
                    if (event.key === 'Enter') {
                        searchWeather();
                    }
                });
            }
        });
