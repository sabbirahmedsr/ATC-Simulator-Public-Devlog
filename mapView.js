const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Zoom/pan variables FIRST!
let scale = 1;
let offsetX = window.innerWidth / 2; // Start with half the window width
let offsetY = window.innerHeight / 2; // Start with half the window height
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let lastOffset = { x: 0, y: 0 };
const meterToPixel = 0.05; // Adjust this value for zoom level

// Node data variable (move this up!)
let nodeData = [];

// Add this variable near the top of your script
const runwayImage = new Image();
runwayImage.src = 'runway.png';
let isImageLoaded = false;
// New variable to control image visibility
let showBackgroundImage = true;

// Event listener to know when the image is ready to draw
runwayImage.onload = () => {
    isImageLoaded = true;
    drawScene(); // Redraw the scene once the image is ready
};
runwayImage.onerror = () => {
    console.error("Failed to load the runway image.");
};

// Node type variables
const nodeTypeNames = [
    "PreArrival",         // 0
    "Arrival",            // 1
    "Arr_Taxiway",        // 2
    "Gate_Inbound",       // 3
    "Gate_Outbound",      // 4
    "Dep_Taxiway",        // 5
    "Departure",          // 6
    "PostDeparture",      // 7
    "More_OnSky",         // 8
    "More_OnGround"       // 9
];

let visibleNodeTypes = Object.fromEntries(nodeTypeNames.map(type => [type, true]));

// Color mapping for node types
const nodeTypeColors = {
    PreArrival:       "#00ffb3", // green-cyan
    Arrival:          "#00ffc8", // bright green-cyan
    Arr_Taxiway:      "#00e673", // vivid green
    Gate_Inbound:     "#00b386", // teal-green
    Gate_Outbound:    "#ffb347", // orange-yellow
    Dep_Taxiway:      "#ff9933", // orange
    Departure:        "#ff8000", // strong orange
    PostDeparture:    "#ff6600", // deep orange
    More_OnSky:       "#00e6e6", // aqua
    More_OnGround:    "#b3b3b3"  // neutral gray
};

// Resize canvas to fill window
function resizeCanvas() {
    // Store the current center relative to the canvas
    const oldCenterX = offsetX;
    const oldCenterY = offsetY;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate the new center of the canvas
    const newCenterX = window.innerWidth / 2;
    const newCenterY = window.innerHeight / 2;

    // Adjust the offset to keep the same relative world position centered
    offsetX += (newCenterX - oldCenterX);
    offsetY += (newCenterY - oldCenterY);

    drawScene();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawGrid() {
    const gridSize = 40 * scale; // grid spacing scales with zoom

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for fixed pixel thickness
    ctx.strokeStyle = 'rgba(120, 120, 140, 0.15)';
    ctx.lineWidth = 1; // Always 1px

    // Calculate offset for grid lines
    const startX = offsetX % gridSize;
    const startY = offsetY % gridSize;

    // Draw vertical lines
    for (let x = startX; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawRangeCircles() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const centerX = offsetX;
    const centerY = offsetY;

    const ranges = [
        { nm: 50, meters: 9260, color: 'rgba(0,255,255,0.35)' },
        { nm: 25, meters: 4630, color: 'rgba(0,255,255,0.25)' },
        { nm: 14, meters: 1298, color: 'rgba(0,255,255,0.18)' }
    ];

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = 'rgba(0,255,255,0.85)';
    ctx.textAlign = 'center';

    ranges.forEach(range => {
        const radius = range.meters * meterToPixel * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = range.color;
        ctx.lineWidth = 4; // Thicker line
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(`${range.nm} NM`, centerX, centerY - radius - 18);
    });

    ctx.restore();
}

function drawNodes(nodes) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const centerX = offsetX;
    const centerY = offsetY;

    nodes.forEach((node, idx) => {
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.z !== 'number') return;

        const typeName = nodeTypeNames[node.nodeType];
        if (!visibleNodeTypes[typeName]) return;

        const nodeColor = nodeTypeColors[typeName] || "#00ffb3";

        const worldX = node.position.x * meterToPixel * scale;
        const worldY = -node.position.z * meterToPixel * scale;

        const screenX = centerX + worldX;
        const screenY = centerY + worldY;

        ctx.beginPath();
        ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = '14px monospace';
        ctx.fillStyle = nodeColor;
        ctx.textAlign = 'left';
        ctx.fillText(node.nodeName || node.id || `Node ${idx}`, screenX + 10, screenY - 10);
    });

    ctx.restore();
}

function drawNodeConnections(nodes) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const centerX = offsetX;
    const centerY = offsetY;

    nodes.forEach(node => {
        if (
            !node.position ||
            typeof node.position.x !== 'number' ||
            typeof node.position.z !== 'number' ||
            !Array.isArray(node.allNeighbourId)
        ) return;

        const typeName = nodeTypeNames[node.nodeType];
        if (!visibleNodeTypes[typeName]) return;

        const nodeColor = nodeTypeColors[typeName] || "#00ffb3";

        const startX = centerX + node.position.x * meterToPixel * scale;
        const startY = centerY - node.position.z * meterToPixel * scale;

        node.allNeighbourId.forEach(neighId => {
            const neighbor = nodes.find(n => n.id === neighId);
            if (
                !neighbor ||
                !neighbor.position ||
                typeof neighbor.position.x !== 'number' ||
                typeof neighbor.position.z !== 'number'
            ) return;

            const endX = centerX + neighbor.position.x * meterToPixel * scale;
            const endY = centerY - neighbor.position.z * meterToPixel * scale;
            
            // 🎯 New: Calculate the handle vectors based on fwdAngle
            const fwdRad = (node.fwdAngle - 90) * Math.PI / 180; // Unity's Y-rotation to JS canvas angle
            const outHandleVectorX = Math.cos(fwdRad);
            const outHandleVectorY = Math.sin(fwdRad);
            
            const neighborFwdRad = (neighbor.fwdAngle - 90) * Math.PI / 180;
            const inHandleVectorX = -Math.cos(neighborFwdRad); // Negative for inbound
            const inHandleVectorY = -Math.sin(neighborFwdRad);
            
            const outDist = (node.outHandleDistance || 0) * meterToPixel * scale;
            const inDist = (neighbor.inHandleDistance || 0) * meterToPixel * scale;
            
            // Calculate control points using handle vectors
            const cp1X = startX + outHandleVectorX * outDist;
            const cp1Y = startY + outHandleVectorY * outDist;
            const cp2X = endX + inHandleVectorX * inDist;
            const cp2Y = endY + inHandleVectorY * inDist;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
            ctx.strokeStyle = nodeColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.7;
            ctx.shadowColor = nodeColor;
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        });
    });

    ctx.restore();
}

canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    const zoomIntensity = 0.2;
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const prevScale = scale;

    if (e.deltaY < 0) {
        scale *= (1 + zoomIntensity);
    } else {
        scale *= (1 - zoomIntensity);
        scale = Math.max(scale, 0.2); // Prevent too much zoom out
    }

    // Adjust offset so zoom centers on mouse
    offsetX = mouseX - ((mouseX - offsetX) * (scale / prevScale));
    offsetY = mouseY - ((mouseY - offsetY) * (scale / prevScale));

    drawScene();
});

canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    lastOffset.x = offsetX;
    lastOffset.y = offsetY;
});

window.addEventListener('mousemove', function(e) {
    if (isDragging) {
        offsetX = lastOffset.x + (e.clientX - dragStart.x);
        offsetY = lastOffset.y + (e.clientY - dragStart.y);
        drawScene();
    }
});

window.addEventListener('mouseup', function() {
    isDragging = false;
});

// New function to draw the background image
function drawBackgroundImage() {
    if (!isImageLoaded) return; // Don't draw if the image hasn't loaded yet

    ctx.save();
    // Apply the same global transforms as your other elements
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

    // Translate to the world origin (0,0) and rotate
    // Canvas rotation is in radians. fwdAngle from Unity needs conversion.
    const angleInRadians = (324) * Math.PI / 180;
    ctx.translate(0, 0); // Origin for rotation
    ctx.rotate(angleInRadians);

    // Draw the image. It needs to be positioned so its bottom center is at the new origin (0,0).
    // The image's width and height need to be scaled by meterToPixel.
    const imgWidth = 285 * meterToPixel;
    const imgHeight = 500 * meterToPixel;

    // Draw the image, adjusting the x- and y-positions so the bottom center is at (0,0).
    ctx.drawImage(runwayImage, -imgWidth / 2, -imgHeight, imgWidth, imgHeight);

    ctx.restore();
}

// Draw everything with transforms
function drawScene() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw the background image first
    if (showBackgroundImage) {
        drawBackgroundImage();
    }

    // 2. Draw the grid
    drawGrid();

    // 3. Draw the range circles
    drawRangeCircles();

    // 4. Draw node connections
    drawNodeConnections(nodeData);

    // 5. Draw the nodes on top
    drawNodes(nodeData);
}

fetch('node_data.json')
    .then(response => response.json())
    .then(data => {
        nodeData = data.nodes;
        drawScene();
    })
    .catch(error => {
        console.error('Error loading node data:', error);
    });

// Create checkboxes
function createNodeTypeFilters() {
    const container = document.getElementById('nodeTypeFilters');
    container.innerHTML = `
        <b>Node Types:</b><br>
        <label style="margin-right:12px; color:#00ffc8; font-weight:bold;">
            <input type="checkbox" id="filter_arrivalGroup" checked>
            Show All Arrival Types
        </label>
        <label style="margin-right:12px; color:#ff8000; font-weight:bold;">
            <input type="checkbox" id="filter_departureGroup" checked>
            Show All Departure Types
        </label>
        <br>
    `;

    nodeTypeNames.forEach(type => {
        const id = `filter_${type}`;
        container.innerHTML += `
            <label style="margin-right:8px; color:${nodeTypeColors[type]}; font-weight:bold;">
                <input type="checkbox" id="${id}" checked>
                ${type}
            </label>
        `;
    });

    // Individual type toggles
    nodeTypeNames.forEach(type => {
        document.getElementById(`filter_${type}`).addEventListener('change', (e) => {
            visibleNodeTypes[type] = e.target.checked;
            drawScene();
        });
    });

    // Arrival group toggle
    document.getElementById('filter_arrivalGroup').addEventListener('change', (e) => {
        const checked = e.target.checked;
        // Arrival-related types
        ["PreArrival", "Arrival", "Arr_Taxiway", "Gate_Inbound"].forEach(type => {
            visibleNodeTypes[type] = checked;
            document.getElementById(`filter_${type}`).checked = checked;
        });
        drawScene();
    });

    // Departure group toggle
    document.getElementById('filter_departureGroup').addEventListener('change', (e) => {
        const checked = e.target.checked;
        // Departure-related types
        ["Gate_Outbound", "Dep_Taxiway", "Departure", "PostDeparture"].forEach(type => {
            visibleNodeTypes[type] = checked;
            document.getElementById(`filter_${type}`).checked = checked;
        });
        drawScene();
    });
}
createNodeTypeFilters();

// Add the event listener for the new toggle button
const imageToggle = document.getElementById('showImageToggle');
imageToggle.addEventListener('change', (e) => {
    showBackgroundImage = e.target.checked;
    drawScene(); // Redraw the scene to apply the change
});