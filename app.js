// Function to filter ongoing disasters
function filterOngoingDisasters(disasters) {
    const ongoingDisasters = disasters.filter(disaster => {
        const disasterDate = new Date(disaster.fields.date);
        const today = new Date();
        return disasterDate <= today;  // Only show disasters that have occurred till today (ongoing or past)
    });
    return ongoingDisasters;
}

// Show the main sections based on the nav link click
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach((section) => {
        section.style.display = 'none';
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Reset active class on nav links
    document.querySelectorAll('nav a').forEach((a) => a.classList.remove('active'));

    // Add active class to current nav item
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const activeLink = navLinks.find(a => a.getAttribute('onclick') === `showSection('${sectionId}')`);
    if (activeLink) activeLink.classList.add('active');

    // Show a default disaster if 'disasters' section is opened
    if (sectionId === 'disasters') {
        showDisasterInfo('sikkim');
    }
}

// Show disaster-specific info when clicked
function showDisasterInfo(disasterId) {
    document.querySelectorAll('.disaster-info').forEach((info) => {
        info.style.display = 'none';
    });
    const target = document.getElementById(disasterId);
    if (target) {
        target.style.display = 'block';
    }
}

// Fetch the latest disaster reports from ReliefWeb API
async function fetchDisasterReports() {
    const url = 'https://api.reliefweb.int/v1/reports?filter[category][0]=Disasters&limit=5';

    try {
        const response = await fetch(url);
        const data = await response.json();
        const ongoingDisasters = filterOngoingDisasters(data.data); // Filter ongoing disasters
        displayReports(ongoingDisasters);  // Display only ongoing disasters
    } catch (error) {
        console.error("Error fetching disaster reports:", error);
        document.getElementById('reports').innerHTML = `
            <p style="color: red;">Failed to load disaster reports.</p>
        `;
    }
}

// Display the disaster reports
function displayReports(disasters) {
    const reportsSection = document.getElementById('reports');

    if (!disasters || disasters.length === 0) {
        reportsSection.innerHTML = '<p>No ongoing disaster reports available at the moment.</p>';
        return;
    }

    reportsSection.innerHTML = disasters.map(disaster => {
        const title = disaster.fields?.title || 'No Title';
        const url = disaster.fields?.url || '#';
        const date = disaster.fields?.date || 'No Date Available';

        return `
            <div>
                <h4><a href="${url}" target="_blank">${title}</a></h4>
                <p><strong>Published:</strong> ${date}</p>
            </div>
        `;
    }).join('');
}

// Fetch weather data from Open-Meteo API
async function fetchWeatherData() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=17.385044&longitude=78.486671&current_weather=true'; // Hyderabad

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById('weather-info-content').innerHTML = `
            <p style="color: red;">Unable to load weather data at the moment.</p>
        `;
    }
}

// Display the weather data
function displayWeather(data) {
    const weather = data.current_weather;
    const weatherContent = document.getElementById('weather-info-content');

    if (weatherContent && weather) {
        weatherContent.innerHTML = `
            <p>Temperature: ${weather.temperature}°C</p>
            <p>Wind Speed: ${weather.windspeed} km/h</p>
        `;
    }
}

// Initialize on page load
window.onload = function() {
    fetchWeatherData();
    fetchDisasterReports();
    showSection('home');  // Show Home section by default
};
