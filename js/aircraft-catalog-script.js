/*
 * Module: Aircraft List Manager
 * Description: This script handles all the dynamic functionality of the aircraft catalog page.
 * It fetches data, renders the aircraft cards and navigation panel, manages user interactions
 * like filtering and highlighting, and links to external resources.
 */

// Global DOM element references
// These variables provide quick access to key HTML elements, improving performance.
const cardContainer = document.getElementById('card-container');
const navPanel = document.getElementById('navigation-panel');

// Stores the original, unfiltered data fetched from the JSON file.
let allAircraftData = [];

/**
 * Sub-Module: Data Fetching
 * Description: Contains the main function for asynchronously fetching JSON data from a file.
 */

/**
 * Fetches the JSON data from the specified path using an asynchronous function.
 * @param {string} url - The URL or path to the JSON file.
 * @returns {Promise<Array<Object>|null>} A promise that resolves to the JSON data or null on error.
 */
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        // Check if the HTTP response was successful.
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the JSON data from the response body.
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Display a user-friendly error message if the data fails to load.
        if (cardContainer) {
            cardContainer.innerHTML = '<p class="error-message">Failed to load aircraft data.</p>';
        }
        return null;
    }
};

/**
 * Sub-Module: Utility Functions
 * Description: Helper functions used for data processing and string manipulation.
 */

/**
 * Extracts the domain name from a URL for image attribution.
 * @param {string} url - The URL of the image.
 * @returns {string} The domain name (e.g., 'flightaware.com') or 'Unknown Source' if invalid.
 */
const getSourceDomainFromUrl = (url) => {
    try {
        const hostname = new URL(url).hostname;
        // Removes 'www.' for a cleaner display name.
        return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    } catch (e) {
        console.error("Invalid URL:", url);
        return "Unknown Source";
    }
};

/**
 * Sub-Module: Card Rendering
 * Description: Functions for generating the HTML structure for each aircraft card.
 */

/**
 * Creates and returns an HTML string for a single aircraft card.
 * @param {Object} aircraft - The aircraft data object containing details.
 * @returns {string} The complete HTML string for the aircraft card.
 */
const createAircraftCardHtml = (aircraft) => {
    const sourceDomain = getSourceDomainFromUrl(aircraft.imageUrl);

    // Provide default values if 'origin' or 'destination' are missing to prevent the error.
    const origin = aircraft.origin || 'N/A, N/A';
    const destination = aircraft.destination || 'N/A, N/A';

    // Generate the 3D view button HTML only if a model URL is provided in the data.
    let view3dButtonHtml = '';
    if (aircraft.model3dUrl) {
        view3dButtonHtml = `
            <a href="#" class="view-3d-btn" data-model-url="${aircraft.model3dUrl}" data-model-name="${aircraft.model}" title="View 3D Model">
                <i class="fa-solid fa-cube"></i>
            </a>
        `;
    }

    return `
        <div class="aircraft-card" id="aircraft-${aircraft.callSign}">
            <div class="card-image-container">
                <a href="${aircraft.imageUrl}" target="_blank">
                    <img src="${aircraft.imageUrl}" alt="${aircraft.model}" class="aircraft-image">
                </a>
                ${view3dButtonHtml}
                <div class="image-attribution">
                    Source: <a href="${aircraft.imageUrl}" target="_blank">${sourceDomain}</a>
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h2>${aircraft.callSign}</h2>
                    <p>${aircraft.fullName}</p>
                    <a href="#" class="external-link-btn" data-callsign="${aircraft.callSign}">
                        <i class="fa-solid fa-square-arrow-up-right"></i>
                    </a>
                    <a href="#" class="google-search-btn" data-callsign="${aircraft.callSign}">
                        <i class="fa-brands fa-google"></i>
                    </a>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-plane-departure icon"></i>Origin</span>
                        <p>${origin}</p>
                        <a href="#" class="detail-item-btn" data-type="origin" data-icao-code="${origin.split(',')[0].trim()}">
                            <i class="fa-solid fa-square-arrow-up-right"></i>
                        </a>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-plane-arrival icon"></i>Destination</span>
                        <p>${destination}</p>
                        <a href="#" class="detail-item-btn" data-type="destination" data-icao-code="${destination.split(',')[0].trim()}">
                            <i class="fa-solid fa-square-arrow-up-right"></i>
                        </a>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-road icon"></i>SID</span>
                        <p>${aircraft.SID}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-tag icon"></i>Model</span>
                        <p>${aircraft.model}</p>
                        <a href="#" class="detail-item-btn" data-type="model" data-model="${aircraft.model}">
                            <i class="fa-brands fa-google"></i>
                        </a>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-plane icon"></i>Type</span>
                        <p>${aircraft.type}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-weight-scale icon"></i>Weight</span>
                        <p>${aircraft.weightCategory}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-ruler-horizontal icon"></i>Length</span>
                        <p>${aircraft.length}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-ruler-combined icon"></i>Wingspan</span>
                        <p>${aircraft.wingspan}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-ruler-vertical icon"></i>Height</span>
                        <p>${aircraft.height}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Sub-Module: Navigation Panel
 * Description: Contains functions for building and managing the side navigation panel.
 */

/**
 * Renders the navigation panel based on the aircraft data.
 * @param {Array<Object>} aircrafts - An array of aircraft objects.
 */
const renderNavigationPanel = (aircrafts) => {
    if (!navPanel) return;

    let navHtml = '<h3>Aircrafts</h3><ul>';
    aircrafts.forEach(aircraft => {
        // Creates a list item with a link to the corresponding card's unique ID.
        navHtml += `
            <li class="nav-item">
                <a href="#aircraft-${aircraft.callSign}" class="nav-link-button">
                    <img src="${aircraft.imageUrl}" alt="${aircraft.callSign}" class="nav-icon">
                    <span>${aircraft.callSign}</span>
                </a>
            </li>
        `;
    });
    navHtml += '</ul>';
    navPanel.innerHTML = navHtml;
};

/**
 * Manages smooth scrolling to a target element and applies a visual highlight.
 * @param {Event} e - The click event object.
 */
const smoothScroll = (e) => {
    e.preventDefault(); // Prevents the default jump behavior of the anchor tag.

    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const targetId = targetLink.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        // Removes highlights from any previously selected card/button.
        clearHighlights();

        // Adds highlight class to the newly selected card.
        targetElement.classList.add('highlighted-card');
        // Adds highlight to the corresponding navigation button.
        targetLink.classList.add('selected-nav-button');

        // Scrolls the element into the center of the viewport for a smooth user experience.
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};

/**
 * Removes the highlight classes from the currently selected card and navigation button.
 */
const clearHighlights = () => {
    const previousHighlightedCard = document.querySelector('.highlighted-card');
    const previousSelectedButton = document.querySelector('.selected-nav-button');

    if (previousHighlightedCard) {
        previousHighlightedCard.classList.remove('highlighted-card');
    }
    if (previousSelectedButton) {
        previousSelectedButton.classList.remove('selected-nav-button');
    }
};

/**
 * Opens an external link to FlightAware.
 * @param {string} type - The type of link ('callsign' or 'airport').
 * @param {string} value - The value to use for the search (call sign or ICAO code).
 */
const openFlightAwareLink = (type, value) => {
    let url;
    if (type === 'callsign') {
        url = `https://www.flightaware.com/live/flight/${value}`;
    } else if (type === 'airport') {
        url = `https://www.flightaware.com/live/airport/${value}`;
    } else {
        return; // Do nothing if type is invalid
    }
    window.open(url, '_blank');
};

/**
 * Opens a Google search link for a given query.
 * @param {string} query - The search query.
 */
const openGoogleSearch = (query) => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, '_blank');
};

/**
 * Opens a FlightRadar24 search link for a given call sign.
 * @param {string} callsign - The call sign for the search.
 */
const openFlightRadar24Link = (callsign) => {
    const flightRadarUrl = `https://www.flightradar24.com/${callsign}`;
    window.open(flightRadarUrl, '_blank');
};

/**
 * Injects custom CSS to style the 3D view button with a caption.
 * Overrides the default icon-only styles.
 */
const inject3DButtonStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .card-image-container {
            position: relative;
        }
        .view-3d-btn {
            position: absolute;
            bottom: 5px;
            left: 5px;
            width: 30px;
            height: 30px;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(2px);
            color: #e0e0e0 !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 4px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.2s ease;
            z-index: 5;
            font-size: 0.9rem;
        }
        .view-3d-btn:hover {
            background-color: rgba(255, 255, 255, 0.9);
            color: #121212 !important;
            border-color: #ffffff !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
};

/**
 * Sub-Module: Main Application Flow
 * Description: The core function that orchestrates data loading, rendering, and event handling.
 */

/**
 * Populates the filter dropdown menus with unique values from the aircraft data.
 */
const populateFilters = () => {
    // Use a Set to collect unique values for origin, destination, type, and weight.
    const icaoSet = new Set();
    const iataSet = new Set();
    const typeSet = new Set();
    const weightSet = new Set();

    allAircraftData.forEach(aircraft => {
        // Split origin and destination to get ICAO and IATA codes.
        const originData = aircraft.origin.split(',').map(s => s.trim());
        const destinationData = aircraft.destination.split(',').map(s => s.trim());

        // Add ICAO and IATA to their respective sets.
        icaoSet.add(originData[0]);
        icaoSet.add(destinationData[0]);
        iataSet.add(originData[1]);
        iataSet.add(destinationData[1]);

        typeSet.add(aircraft.type);
        weightSet.add(aircraft.weightCategory);
    });

    const icaoFilter = document.getElementById('icao-filter');
    const iataFilter = document.getElementById('iata-filter');
    const typeFilter = document.getElementById('type-filter');
    const weightFilter = document.getElementById('weight-filter');

    // Populate the ICAO filter.
    icaoFilter.innerHTML = `<option value="all">All</option>`; // Keep the "All" option
    icaoSet.forEach(icao => {
        icaoFilter.innerHTML += `<option value="${icao}">${icao}</option>`;
    });

    // Populate the IATA filter.
    iataFilter.innerHTML = `<option value="all">All</option>`;
    iataSet.forEach(iata => {
        iataFilter.innerHTML += `<option value="${iata}">${iata}</option>`;
    });

    // Populate Type filter dropdown.
    typeFilter.innerHTML = `<option value="all">All</option>`;
    typeSet.forEach(type => {
        typeFilter.innerHTML += `<option value="${type}">${type}</option>`;
    });

    // Populate Weight filter dropdown.
    weightFilter.innerHTML = `<option value="all">All</option>`;
    weightSet.forEach(weight => {
        weightFilter.innerHTML += `<option value="${weight}">${weight}</option>`;
    });
};

/**
 * Filters the aircraft cards based on the selected filters.
 */
const filterAircrafts = () => {
    // Get the selected values from the dropdowns.
    const selectedIcao = document.getElementById('icao-filter').value;
    const selectedIata = document.getElementById('iata-filter').value;
    const selectedType = document.getElementById('type-filter').value;
    const selectedWeight = document.getElementById('weight-filter').value;

    // Iterate through each aircraft card to determine visibility.
    const aircraftCards = document.querySelectorAll('.aircraft-card');
    aircraftCards.forEach(card => {
        // Get the values from the card's details using the correct indices.
        const cardOrigin = card.querySelector('.detail-item:nth-of-type(1) p').textContent;
        const cardDestination = card.querySelector('.detail-item:nth-of-type(2) p').textContent;
        const cardType = card.querySelector('.detail-item:nth-of-type(5) p').textContent;
        const cardWeight = card.querySelector('.detail-item:nth-of-type(6) p').textContent;
        
        // Extract the ICAO and IATA from the card's text content.
        const cardIcaoOrigin = cardOrigin.split(',')[0].trim();
        const cardIcaoDestination = cardDestination.split(',')[0].trim();
        const cardIataOrigin = cardOrigin.split(',')[1].trim();
        const cardIataDestination = cardDestination.split(',')[1].trim();

        // Check for a match with each filter.
        const isIcaoMatch = selectedIcao === 'all' || cardIcaoOrigin === selectedIcao || cardIcaoDestination === selectedIcao;
        const isIataMatch = selectedIata === 'all' || cardIataOrigin === selectedIata || cardIataDestination === selectedIata;
        const isTypeMatch = selectedType === 'all' || cardType === selectedType;
        const isWeightMatch = selectedWeight === 'all' || cardWeight === selectedWeight;

        // Show or hide the card based on all filter conditions.
        if (isIcaoMatch && isIataMatch && isTypeMatch && isWeightMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
};

/**
 * Main function to load data and render the page.
 */
const renderAircrafts = async () => {
    const aircraftData = await fetchData('../data/all-aircraft-data.json');

    if (aircraftData) {
        // Inject styles for the 3D button
        inject3DButtonStyles();

        // Store the original data for all subsequent filtering operations.
        allAircraftData = aircraftData;

        // Generate the HTML for all aircraft cards and insert it into the page.
        let cardsHtml = '';
        aircraftData.forEach(aircraft => {
            cardsHtml += createAircraftCardHtml(aircraft);
        });
        if (cardContainer) {
            cardContainer.innerHTML = cardsHtml;
        }

        // Add a click event listener to each aircraft card.
        const aircraftCards = document.querySelectorAll('.aircraft-card');
        aircraftCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Handle click on external link button.
                const headerFlightRadarBtn = e.target.closest('.external-link-btn');
                if (headerFlightRadarBtn) {
                    e.preventDefault();
                    const callSign = headerFlightRadarBtn.dataset.callsign;
                    openFlightRadar24Link(callSign);
                    return;
                }
                
                // Handle click on the Google search button in the header.
                const headerGoogleBtn = e.target.closest('.google-search-btn');
                if (headerGoogleBtn) {
                    e.preventDefault();
                    const callSign = headerGoogleBtn.dataset.callsign;
                    openGoogleSearch(callSign);
                    return;
                }

                // Handle click on a detail-item button.
                const detailItemBtn = e.target.closest('.detail-item-btn');
                if (detailItemBtn) {
                    e.preventDefault();
                    const type = detailItemBtn.dataset.type;
                    if (type === 'origin' || type === 'destination') {
                        const icaoCode = detailItemBtn.dataset.icaoCode;
                        openFlightAwareLink('airport', icaoCode);
                    } else if (type === 'model') {
                        const model = detailItemBtn.dataset.model;
                        openGoogleSearch(model);
                    }
                    return;
                }

                // Handle click on the View 3D Model button.
                const view3dBtn = e.target.closest('.view-3d-btn');
                if (view3dBtn) {
                    e.preventDefault();
                    const modelUrl = view3dBtn.dataset.modelUrl;
                    const modelName = view3dBtn.dataset.modelName;
                    // Call the open function from the new modular script
                    // Use window.Aircraft3DViewer to ensure we access the global object
                    if (window.Aircraft3DViewer) {
                        window.Aircraft3DViewer.open(modelUrl, modelName);
                    } else {
                        console.error("Aircraft3DViewer is not defined. Please ensure 'js/aircraft-3d-viewer.js' is included and loaded correctly.");
                        alert("The 3D Viewer feature is currently unavailable.");
                    }
                    return;
                }

                // If the click is on the card but not a button, toggle highlight.
                // Clear any existing highlights from other cards and nav links.
                clearHighlights();

                // Add the highlight class to the clicked card.
                card.classList.add('highlighted-card');

                // Find the corresponding navigation button and highlight it as well.
                const callSign = card.id.split('-')[1];
                const navButton = document.querySelector(`.nav-link-button[href="#aircraft-${callSign}"]`);
                if (navButton) {
                    navButton.classList.add('selected-nav-button');
                }
            });
        });

        // Render the navigation panel and populate the filter dropdowns.
        renderNavigationPanel(aircraftData);
        populateFilters();

        // Attach event listeners for the navigation panel, global clicks, and filters.
        if (navPanel) {
            navPanel.addEventListener('click', smoothScroll);
        }

        document.addEventListener('click', (e) => {
            const isNavButton = e.target.closest('.nav-link-button');
            const isCard = e.target.closest('.aircraft-card');
            const isFilter = e.target.closest('.filter-container');

            // If the click is on neither a nav button, a card, nor a filter, clear all highlights.
            if (!isNavButton && !isCard && !isFilter) {
                clearHighlights();
            }
        });

        const filterContainer = document.querySelector('.filter-container');
        filterContainer.addEventListener('change', () => {
            filterAircrafts();
            clearHighlights();
        });

        // Add a click event listener to the "Clear Filters" button.
        const clearButton = document.getElementById('clear-filters-btn');
        clearButton.addEventListener('click', () => {
            // Reset each dropdown to its default "all" value.
            document.getElementById('icao-filter').value = 'all';
            document.getElementById('iata-filter').value = 'all'; // Reset the new IATA filter
            document.getElementById('type-filter').value = 'all';
            document.getElementById('weight-filter').value = 'all';

            // Re-run the filter to show all cards and clear any highlights.
            filterAircrafts();
            clearHighlights();
        });
    }
};

// Call the main function when the page loads to start the application.
document.addEventListener('DOMContentLoaded', renderAircrafts);