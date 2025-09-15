// Initialize the map
let map = L.map('map').setView([37.3362, -121.8906], 5); // Center on San Jose with zoom level 5

// Add the dark theme tile layer (CartoDB Positron)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 15
}).addTo(map);

// Add traffic layer
const trafficLayer = L.tileLayer('https://mt1.google.com/vt?lyrs=traffic&x={x}&y={y}&z={z}', {
    opacity: 0.7,
    attribution: '© Google'
});

// Define the locations
const startLocation = {
    address: '201 S 4th St, San Jose, CA 95112',
    lat: 37.3362,
    lng: -121.8906
};

const endLocation = {
    address: '47400 Kato Rd, Fremont, CA 94538',
    lat: 37.4784,
    lng: -121.933285
};

// Create custom marker icons
const startIcon = L.divIcon({
    className: 'custom-marker start-marker',
    html: '<div style="background-color: #00E676; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a1a1a; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const endIcon = L.divIcon({
    className: 'custom-marker end-marker',
    html: '<div style="background-color: #FF5252; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1a1a1a; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Create markers for start and end points with custom icons
const startMarker = L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
    .bindPopup('Start: ' + startLocation.address);
const endMarker = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon })
    .bindPopup('End: ' + endLocation.address);

// Function to format distance
function formatDistance(meters) {
    const miles = meters * 0.000621371; // Convert meters to miles
    return miles.toFixed(1) + ' mi';
}

// Function to format duration
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
}

// Create custom routing machine
const routingMachine = L.Routing.control({
    waypoints: [
        L.latLng(startLocation.lat, startLocation.lng),
        L.latLng(endLocation.lat, endLocation.lng)
    ],
    routeWhileDragging: false,
    show: false,
    createMarker: function() { return null; },
    lineOptions: {
        styles: [
            { color: '#00B0FF', weight: 6, opacity: 0.8 }
        ]
    },
    router: L.Routing.osrmv1({
        serviceUrl: 'https://valhalla1.openstreetmap.de/route/v1',
        profile: 'auto',
        useHints: false,
        timeout: 30000,
        alternatives: false
    })
});

// Add the routing control to the map
routingMachine.addTo(map);

// Add custom markers
startMarker.addTo(map);
endMarker.addTo(map);

// Add rotation controls
const rotationControl = L.control({ position: 'topright' });
rotationControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control rotation-controls');
    div.innerHTML = `
        <div class="rotation-buttons">
            <a href="#" title="Rotate Left" class="rotation-button rotate-left">
                <span class="rotation-icon">↺</span>
            </a>
            <a href="#" title="Rotate Right" class="rotation-button rotate-right">
                <span class="rotation-icon">↻</span>
            </a>
        </div>
    `;
    
    let currentRotation = 0;
    
    // Left rotation
    div.querySelector('.rotate-left').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentRotation = (currentRotation - 90) % 360;
        rotateMap(currentRotation);
    };
    
    // Right rotation
    div.querySelector('.rotate-right').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentRotation = (currentRotation + 90) % 360;
        rotateMap(currentRotation);
    };
    
    function rotateMap(degrees) {
        // Get all map layers that need to be rotated
        const layers = [
            document.querySelector('.leaflet-tile-pane'),
            document.querySelector('.leaflet-overlay-pane'),
            document.querySelector('.leaflet-marker-pane'),
            document.querySelector('.leaflet-shadow-pane'),
            document.querySelector('.leaflet-popup-pane')
        ];
        
        // Apply rotation to each layer
        layers.forEach(layer => {
            if (layer) {
                layer.style.transform = `rotate(${degrees}deg)`;
                layer.style.transformOrigin = 'center center';
            }
        });

        // Calculate the bounds of the route
        const bounds = L.latLngBounds([
            [startLocation.lat, startLocation.lng],
            [endLocation.lat, endLocation.lng]
        ]);

        // Get the map container size
        const mapSize = map.getSize();
        const mapWidth = mapSize.x;
        const mapHeight = mapSize.y;

        // Calculate the center point of the route
        const routeCenter = bounds.getCenter();

        // Calculate the diagonal distance of the bounds
        const boundsWidth = bounds.getEast() - bounds.getWest();
        const boundsHeight = bounds.getNorth() - bounds.getSouth();
        const diagonalDistance = Math.sqrt(boundsWidth * boundsWidth + boundsHeight * boundsHeight);

        // Calculate the appropriate zoom level
        let zoomLevel;
        if (degrees % 180 === 0) {
            // For 0 and 180 degrees
            zoomLevel = map.getBoundsZoom(bounds, false, [0, 0]);
        } else {
            // For 90 and 270 degrees, we need to account for the rotated view
            const rotatedBounds = L.latLngBounds([
                [routeCenter.lat - diagonalDistance/2, routeCenter.lng - diagonalDistance/2],
                [routeCenter.lat + diagonalDistance/2, routeCenter.lng + diagonalDistance/2]
            ]);
            zoomLevel = map.getBoundsZoom(rotatedBounds, false, [0, 0]);
        }

        // Ensure we don't exceed max zoom
        zoomLevel = Math.min(zoomLevel, map.getMaxZoom());

        // Set the new view with the route centered
        map.setView(routeCenter, zoomLevel, {
            animate: true,
            duration: 0.5,
            padding: [50, 50] // Add some padding around the route
        });
    }
    
    return div;
};

// Add the rotation control to the map
rotationControl.addTo(map);

// Show route information
const routeInfo = document.querySelector('.route-info');
routeInfo.style.display = 'block';

// Update route information when route is found
routingMachine.on('routesfound', function(e) {
    const route = e.routes[0];
    const distance = formatDistance(route.summary.totalDistance);
    const duration = formatDuration(route.summary.totalTime);
    
    document.getElementById('distance').textContent = distance;
    document.getElementById('duration').textContent = duration;
});

// Add traffic toggle control
const trafficControl = L.control({ position: 'topright' });
trafficControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control traffic-control');
    div.innerHTML = `
        <a href="#" title="Toggle Traffic" class="traffic-button">
            <span class="traffic-icon">🚦</span>
        </a>
    `;
    
    let trafficVisible = false;
    const button = div.querySelector('.traffic-button');
    
    button.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        trafficVisible = !trafficVisible;
        
        if (trafficVisible) {
            map.addLayer(trafficLayer);
            button.classList.add('active');
        } else {
            map.removeLayer(trafficLayer);
            button.classList.remove('active');
        }
    };
    
    return div;
};
trafficControl.addTo(map);

// Initial route calculation
routingMachine.route();
