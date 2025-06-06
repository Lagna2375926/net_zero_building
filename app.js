// Application Data
const buildingTypes = [
    {
        name: "Baseline Building",
        energyConsumption: 180,
        wallCost: 11760,
        description: "Standard construction with basic efficiency"
    },
    {
        name: "Improved Building", 
        energyConsumption: 150,
        wallCost: 15680,
        description: "Enhanced insulation and efficient windows"
    },
    {
        name: "High-Performance Building",
        energyConsumption: 120,
        wallCost: 19600,
        description: "Advanced envelope and HVAC systems"
    },
    {
        name: "Low-Energy Building",
        energyConsumption: 90,
        wallCost: 23520,
        description: "Optimized design with smart controls"
    },
    {
        name: "Net Zero Building",
        energyConsumption: 60,
        wallCost: 27440,
        description: "Integrated renewables achieving net zero"
    },
    {
        name: "Smart Net Zero Building",
        energyConsumption: 40,
        wallCost: 31360,
        description: "AI-optimized systems with energy surplus"
    }
];

const smartTechnologies = [
    {
        name: "Temperature Sensors",
        cost: 4900,
        energySavings: 8,
        paybackYears: 4,
        description: "IoT sensors for climate optimization"
    },
    {
        name: "Occupancy Sensors", 
        cost: 7840,
        energySavings: 15,
        paybackYears: 3,
        description: "Automated lighting and HVAC control"
    },
    {
        name: "Smart Lighting Control",
        cost: 11760,
        energySavings: 25,
        paybackYears: 3,
        description: "Adaptive lighting with daylight harvesting"
    },
    {
        name: "AI HVAC Control",
        cost: 490000,
        energySavings: 30,
        paybackYears: 8,
        description: "Machine learning HVAC optimization"
    },
    {
        name: "Energy Management System",
        cost: 294000,
        energySavings: 20,
        paybackYears: 6,
        description: "Centralized energy monitoring and control"
    },
    {
        name: "Building Automation System", 
        cost: 1470000,
        energySavings: 35,
        paybackYears: 10,
        description: "Comprehensive building intelligence platform"
    }
];

const renewableEnergy = [
    {
        name: "Solar PV",
        generation: 120,
        cost: 245000,
        description: "Photovoltaic panels for electricity generation"
    },
    {
        name: "Solar Thermal",
        generation: 60,  
        cost: 147000,
        description: "Solar collectors for hot water heating"
    },
    {
        name: "Geothermal",
        generation: 90,
        cost: 490000,
        description: "Ground source heat pump system"
    },
    {
        name: "Wind Power",
        generation: 40,
        cost: 196000,
        description: "Small-scale wind turbines"
    }
];

// Application State
let appState = {
    orientation: 0,
    buildingType: 0,
    buildingSize: 1000,
    activeTechnologies: new Set(),
    activeRenewables: new Set(),
    scene: null,
    camera: null,
    renderer: null,
    building: null,
    charts: {}
};

// Utility Functions
function formatINR(amount) {
    if (amount >= 10000000) { // 1 crore
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) { // 1 lakh
        return `₹${(amount / 100000).toFixed(1)} L`;
    } else if (amount >= 1000) {
        return `₹${amount.toLocaleString('en-IN')}`;
    } else {
        return `₹${amount}`;
    }
}

function getOrientationLabel(angle) {
    if (angle >= 0 && angle < 45) return "North";
    if (angle >= 45 && angle < 135) return "East";
    if (angle >= 135 && angle < 225) return "South";
    if (angle >= 225 && angle < 315) return "West";
    return "North";
}

function calculateSolarGain(orientation) {
    // Interpolate between cardinal directions
    const radians = (orientation * Math.PI) / 180;
    const north = 110;
    const east = 320;
    const south = 450;
    const west = 380;
    
    // Use trigonometric interpolation for smooth transitions
    const northComponent = north * Math.max(0, Math.cos(radians));
    const eastComponent = east * Math.max(0, Math.sin(radians));
    const southComponent = south * Math.max(0, -Math.cos(radians));
    const westComponent = west * Math.max(0, -Math.sin(radians));
    
    return Math.round(northComponent + eastComponent + southComponent + westComponent);
}

// 3D Visualization
function init3D() {
    const container = document.getElementById('three-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    appState.scene = new THREE.Scene();
    appState.scene.background = new THREE.Color(0x87CEEB);

    // Camera
    appState.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    appState.camera.position.set(5, 5, 5);
    appState.camera.lookAt(0, 0, 0);

    // Renderer
    appState.renderer = new THREE.WebGLRenderer({ antialias: true });
    appState.renderer.setSize(width, height);
    appState.renderer.shadowMap.enabled = true;
    appState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(appState.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    appState.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    appState.scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x98FB98 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    appState.scene.add(ground);

    // Building
    createBuilding();

    // Animation loop
    animate();
}

function createBuilding() {
    if (appState.building) {
        appState.scene.remove(appState.building);
    }

    const buildingGroup = new THREE.Group();
    
    // Main building structure
    const buildingGeometry = new THREE.BoxGeometry(2, 3, 1.5);
    const buildingType = buildingTypes[appState.buildingType];
    
    // Material based on building type
    let color = 0xcccccc;
    switch (appState.buildingType) {
        case 0: color = 0xcccccc; break; // Baseline - Gray
        case 1: color = 0xaaaaff; break; // Improved - Light Blue
        case 2: color = 0x66aa66; break; // High-Performance - Green
        case 3: color = 0x6666aa; break; // Low-Energy - Blue
        case 4: color = 0x336633; break; // Net Zero - Dark Green
        case 5: color = 0x003366; break; // Smart Net Zero - Dark Blue
    }
    
    const buildingMaterial = new THREE.MeshLambertMaterial({ color });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.5;
    building.castShadow = true;
    buildingGroup.add(building);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.02);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
    
    // Front windows
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-0.6 + i * 0.6, 1.2 + j * 0.6, 0.76);
            buildingGroup.add(window);
        }
    }

    // Side windows
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(1.01, 1.2 + j * 0.6, -0.3 + i * 0.6);
            window.rotation.y = Math.PI / 2;
            buildingGroup.add(window);
        }
    }

    // Roof (for advanced buildings)
    if (appState.buildingType >= 2) {
        const roofGeometry = new THREE.BoxGeometry(2.2, 0.1, 1.7);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 3.05;
        buildingGroup.add(roof);

        // Solar panels for Net Zero buildings
        if (appState.buildingType >= 4) {
            const panelGeometry = new THREE.BoxGeometry(0.4, 0.02, 0.3);
            const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x000044 });
            
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 4; j++) {
                    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
                    panel.position.set(-0.8 + i * 0.4, 3.15, -0.6 + j * 0.4);
                    buildingGroup.add(panel);
                }
            }
        }
    }

    appState.building = buildingGroup;
    appState.scene.add(buildingGroup);
    updateBuildingRotation();
}

function updateBuildingRotation() {
    if (appState.building) {
        const radians = (appState.orientation * Math.PI) / 180;
        appState.building.rotation.y = radians;
    }
}

function animate() {
    requestAnimationFrame(animate);
    appState.renderer.render(appState.scene, appState.camera);
}

// Calculations
function calculateMetrics() {
    const buildingType = buildingTypes[appState.buildingType];
    const size = appState.buildingSize;
    
    // Base energy consumption
    let energyConsumption = buildingType.energyConsumption;
    
    // Apply smart technology savings
    let totalEnergyReduction = 0;
    appState.activeTechnologies.forEach(index => {
        totalEnergyReduction += smartTechnologies[index].energySavings;
    });
    
    // Cap energy reduction at 80%
    totalEnergyReduction = Math.min(totalEnergyReduction, 80);
    energyConsumption = energyConsumption * (1 - totalEnergyReduction / 100);
    
    // Solar gain
    const solarGain = calculateSolarGain(appState.orientation);
    
    // Renewable energy generation
    let renewableGeneration = 0;
    appState.activeRenewables.forEach(index => {
        renewableGeneration += renewableEnergy[index].generation;
    });
    
    // Net energy balance
    const netEnergy = energyConsumption - solarGain - renewableGeneration;
    
    // Carbon emissions (0.5 kg CO2 per kWh)
    const carbonEmissions = Math.max(0, netEnergy * 0.5);
    
    // Financial calculations
    const constructionCost = buildingType.wallCost;
    const operatingCost = energyConsumption * 5; // ₹5 per kWh
    
    // Smart technology costs and savings
    let techCost = 0;
    let techSavings = 0;
    appState.activeTechnologies.forEach(index => {
        techCost += smartTechnologies[index].cost;
        techSavings += (buildingType.energyConsumption * smartTechnologies[index].energySavings / 100) * 5 * size;
    });
    
    // Renewable energy costs
    let renewableCost = 0;
    appState.activeRenewables.forEach(index => {
        renewableCost += renewableEnergy[index].cost;
    });
    
    // Payback period
    const totalAdditionalCost = techCost + renewableCost;
    const paybackPeriod = totalAdditionalCost > 0 ? totalAdditionalCost / (techSavings + Math.max(0, -netEnergy * 5 * size)) : 0;
    
    return {
        energyConsumption: Math.round(energyConsumption),
        solarGain,
        renewableGeneration: Math.round(renewableGeneration),
        netEnergy: Math.round(netEnergy),
        carbonEmissions: Math.round(carbonEmissions),
        constructionCost,
        operatingCost: Math.round(operatingCost),
        techSavings: Math.round(techSavings),
        paybackPeriod: paybackPeriod > 0 ? Math.round(paybackPeriod * 10) / 10 : 0
    };
}

// UI Updates
function updateMetrics() {
    const metrics = calculateMetrics();
    
    // Energy Performance
    document.getElementById('energy-consumption').textContent = `${metrics.energyConsumption} kWh/m²/year`;
    document.getElementById('solar-gain').textContent = `${metrics.solarGain} kWh/m²/year`;
    document.getElementById('net-energy').textContent = `${metrics.netEnergy} kWh/m²/year`;
    document.getElementById('carbon-emissions').textContent = `${metrics.carbonEmissions} kg CO₂/m²/year`;
    
    // Financial Analysis
    document.getElementById('construction-cost').textContent = `${formatINR(metrics.constructionCost)}/m²`;
    document.getElementById('operating-cost').textContent = `${formatINR(metrics.operatingCost)}/m²/year`;
    document.getElementById('tech-savings').textContent = `${formatINR(metrics.techSavings)}/year`;
    document.getElementById('payback-period').textContent = metrics.paybackPeriod > 0 ? `${metrics.paybackPeriod} years` : 'N/A';
    
    // Apply status colors
    const netEnergyElement = document.getElementById('net-energy');
    netEnergyElement.className = `metric-value ${metrics.netEnergy <= 0 ? 'positive' : 'negative'}`;
    
    // Update solar indicators
    updateSolarIndicators();
    
    // Update charts
    updateCharts(metrics);
}

function updateSolarIndicators() {
    const orientations = [
        { element: document.getElementById('solar-north'), angle: 0, name: 'north' },
        { element: document.getElementById('solar-east'), angle: 90, name: 'east' },
        { element: document.getElementById('solar-south'), angle: 180, name: 'south' },
        { element: document.getElementById('solar-west'), angle: 270, name: 'west' }
    ];
    
    orientations.forEach(({ element, angle, name }) => {
        const gain = calculateSolarGain(angle);
        element.textContent = `${gain} kWh/m²`;
        
        const indicator = element.closest('.solar-indicator');
        indicator.classList.toggle('active', Math.abs(appState.orientation - angle) < 45 || Math.abs(appState.orientation - angle) > 315);
    });
}

function updateCharts(metrics) {
    // Energy Consumption Chart
    if (appState.charts.energy) {
        appState.charts.energy.destroy();
    }
    
    const energyCtx = document.getElementById('energy-chart').getContext('2d');
    appState.charts.energy = new Chart(energyCtx, {
        type: 'pie',
        data: {
            labels: ['Building Consumption', 'Solar Gain', 'Renewable Generation'],
            datasets: [{
                data: [metrics.energyConsumption, metrics.solarGain, metrics.renewableGeneration],
                backgroundColor: ['#B4413C', '#FFC185', '#1FB8CD'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Balance (kWh/m²/year)'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Solar Gain Chart
    if (appState.charts.solar) {
        appState.charts.solar.destroy();
    }
    
    const solarCtx = document.getElementById('solar-chart').getContext('2d');
    appState.charts.solar = new Chart(solarCtx, {
        type: 'bar',
        data: {
            labels: ['North', 'East', 'South', 'West'],
            datasets: [{
                label: 'Solar Gain (kWh/m²/year)',
                data: [110, 320, 450, 380],
                backgroundColor: ['#5D878F', '#D2BA4C', '#FFC185', '#964325'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Solar Gain by Orientation'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh/m²/year'
                    }
                }
            }
        }
    });
}

// Event Handlers
function setupEventListeners() {
    // Orientation slider
    const orientationSlider = document.getElementById('orientation');
    orientationSlider.addEventListener('input', (e) => {
        appState.orientation = parseInt(e.target.value);
        document.getElementById('orientation-value').textContent = `${appState.orientation}°`;
        const label = getOrientationLabel(appState.orientation);
        document.getElementById('orientation-value').textContent = `${appState.orientation}° (${label})`;
        updateBuildingRotation();
        updateMetrics();
    });
    
    // Building type selector
    const buildingTypeSelect = document.getElementById('building-type');
    buildingTypeSelect.addEventListener('change', (e) => {
        appState.buildingType = parseInt(e.target.value);
        const buildingType = buildingTypes[appState.buildingType];
        document.getElementById('building-description').textContent = buildingType.description;
        createBuilding();
        updateMetrics();
    });
    
    // Building size input
    const buildingSizeInput = document.getElementById('building-size');
    buildingSizeInput.addEventListener('input', (e) => {
        appState.buildingSize = parseInt(e.target.value);
        updateMetrics();
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        const container = document.getElementById('three-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        appState.camera.aspect = width / height;
        appState.camera.updateProjectionMatrix();
        appState.renderer.setSize(width, height);
    });
}

function createTechnologyToggles() {
    const smartTechContainer = document.getElementById('smart-tech-toggles');
    const renewableContainer = document.getElementById('renewable-toggles');
    
    // Smart Technologies
    smartTechnologies.forEach((tech, index) => {
        const toggleElement = document.createElement('div');
        toggleElement.className = 'tech-toggle';
        toggleElement.innerHTML = `
            <div class="tech-info">
                <div class="tech-name">${tech.name}</div>
                <div class="tech-description">${tech.description}</div>
                <div class="tech-specs">
                    <div class="tech-spec">
                        <div class="tech-spec-label">Cost</div>
                        <div class="tech-spec-value">${formatINR(tech.cost)}</div>
                    </div>
                    <div class="tech-spec">
                        <div class="tech-spec-label">Savings</div>
                        <div class="tech-spec-value">${tech.energySavings}%</div>
                    </div>
                    <div class="tech-spec">
                        <div class="tech-spec-label">Payback</div>
                        <div class="tech-spec-value">${tech.paybackYears}y</div>
                    </div>
                </div>
            </div>
            <div class="toggle-switch" tabindex="0" role="button" aria-label="Toggle ${tech.name}"></div>
        `;
        
        const toggle = toggleElement.querySelector('.toggle-switch');
        toggle.addEventListener('click', () => {
            if (appState.activeTechnologies.has(index)) {
                appState.activeTechnologies.delete(index);
                toggleElement.classList.remove('active');
                toggle.classList.remove('active');
            } else {
                appState.activeTechnologies.add(index);
                toggleElement.classList.add('active');
                toggle.classList.add('active');
            }
            updateMetrics();
        });
        
        smartTechContainer.appendChild(toggleElement);
    });
    
    // Renewable Energy Systems
    renewableEnergy.forEach((renewable, index) => {
        const toggleElement = document.createElement('div');
        toggleElement.className = 'tech-toggle';
        toggleElement.innerHTML = `
            <div class="tech-info">
                <div class="tech-name">${renewable.name}</div>
                <div class="tech-description">${renewable.description}</div>
                <div class="tech-specs">
                    <div class="tech-spec">
                        <div class="tech-spec-label">Cost</div>
                        <div class="tech-spec-value">${formatINR(renewable.cost)}</div>
                    </div>
                    <div class="tech-spec">
                        <div class="tech-spec-label">Generation</div>
                        <div class="tech-spec-value">${renewable.generation} kWh/m²</div>
                    </div>
                </div>
            </div>
            <div class="toggle-switch" tabindex="0" role="button" aria-label="Toggle ${renewable.name}"></div>
        `;
        
        const toggle = toggleElement.querySelector('.toggle-switch');
        toggle.addEventListener('click', () => {
            if (appState.activeRenewables.has(index)) {
                appState.activeRenewables.delete(index);
                toggleElement.classList.remove('active');
                toggle.classList.remove('active');
            } else {
                appState.activeRenewables.add(index);
                toggleElement.classList.add('active');
                toggle.classList.add('active');
            }
            updateMetrics();
        });
        
        renewableContainer.appendChild(toggleElement);
    });
}

// Initialize Application
function initApp() {
    init3D();
    setupEventListeners();
    createTechnologyToggles();
    updateMetrics();
    
    // Set initial building description
    document.getElementById('building-description').textContent = buildingTypes[0].description;
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);