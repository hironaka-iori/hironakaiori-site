// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current language from URL path or default to 'en'
    const currentPagePath = window.location.pathname + window.location.href;
    let currentLanguage = 'en';
    
    if (currentPagePath.includes('-ja')) {
        currentLanguage = 'ja';
    } else if (currentPagePath.includes('-zh')) {
        currentLanguage = 'zh';
    }
    
    // Update active language switcher
    document.querySelectorAll('.language-switcher a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLangLink = document.querySelector(`[data-lang="${currentLanguage}"]`);
    if (activeLangLink) {
        activeLangLink.classList.add('active');
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = navbar.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close mobile menu when clicking on language switcher links
    document.querySelectorAll('.language-switcher a').forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close mobile menu when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        }
    });

    // Fetch iPhone location
    fetchiPhoneLocation();
});

// Fallback location coordinates (Minhang, Shanghai, China)
const FALLBACK_LOCATION = {
    district: 'Minhang',
    city: 'Shanghai',
    country: 'China',
    latitude: 31.1163,
    longitude: 121.4688
};

// Fetch iPhone location from backend
async function fetchiPhoneLocation() {
    const locationElement = document.getElementById('location-text');
    if (!locationElement) return;

    let location = null;
    let usedFallback = false;

    try {
        const response = await fetch('/api/iphone-location');
        if (!response.ok) throw new Error('Failed to fetch location');
        
        const data = await response.json();
        
        if (data.success && data.location) {
            location = data.location;
        } else {
            throw new Error('No location data in response');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        console.log('Using fallback location');
        location = FALLBACK_LOCATION;
        usedFallback = true;
    }

    // Display location
    if (location) {
        const { district, city, country } = location;
        let locationText = district;
        
        if (city && city !== district) {
            locationText += `, ${city}`;
        }
        if (country) {
            locationText += `, ${country}`;
        }
        
        locationElement.innerHTML = `📍 ${locationText}`;
    } else {
        locationElement.innerHTML = `<span class="error">Location unavailable</span>`;
    }

    // Initialize map
    if (location && (location.latitude || location.latitude === 0) && (location.longitude || location.longitude === 0)) {
        initializeMap(location, usedFallback);
    }
}

// Initialize Leaflet map
function initializeMap(location, isFromFallback) {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer || typeof L === 'undefined') return;

    const lat = location.latitude || FALLBACK_LOCATION.latitude;
    const lng = location.longitude || FALLBACK_LOCATION.longitude;

    // Create map
    const map = L.map('location-map').setView([lat, lng], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add marker
    const markerColor = isFromFallback ? 'gray' : 'blue';
    const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: isFromFallback ? '#888888' : '#58a6ff',
        color: isFromFallback ? '#666666' : '#0d1117',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7
    }).addTo(map);

    // Add popup
    let popupText = `📍 ${location.district}`;
    if (location.city && location.city !== location.district) {
        popupText += `, ${location.city}`;
    }
    if (location.country) {
        popupText += `, ${location.country}`;
    }
    if (isFromFallback) {
        popupText += ' <br><small>(Fallback location)</small>';
    }
    
    marker.bindPopup(popupText);
    marker.openPopup();

    // Fit bounds with padding
    map.setZoom(12);
}

// Navigate to different language versions
function switchLanguage(lang) {
    // Get the directory of the current file
    const currentPath = window.location.pathname;
    const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Determine current page type  
    let pageType = 'index.html';
    if (currentPath.includes('about-me')) {
        pageType = 'about-me.html';
    } else if (currentPath.includes('projects')) {
        pageType = 'projects.html';
    }
    
    let targetFile = pageType;
    if (lang === 'ja') {
        targetFile = pageType.replace('.html', '-ja.html');
    } else if (lang === 'zh') {
        targetFile = pageType.replace('.html', '-zh.html');
    }
    
    window.location.href = dirPath + targetFile;
}
