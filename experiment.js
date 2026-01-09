// Fitts's Law Experiment JavaScript
// This file handles the core experiment logic, data collection, and analysis

// Experiment configuration
const conditions = [
    // Easy conditions (low ID)
    { distance: 100, width: 80 },   // ID ≈ 0.64
    { distance: 150, width: 80 },   // ID ≈ 1.17
    { distance: 200, width: 80 },   // ID ≈ 1.64

    // Medium conditions
    { distance: 200, width: 40 },   // ID ≈ 2.58
    { distance: 300, width: 40 },   // ID ≈ 3.00
    { distance: 400, width: 40 },   // ID ≈ 3.36

    // Hard conditions (high ID)
    { distance: 300, width: 20 },   // ID ≈ 4.00
    { distance: 400, width: 20 },   // ID ≈ 4.36
    { distance: 500, width: 20 },   // ID ≈ 4.64
];

// Calculate ID for each condition using Fitts's Law formula
conditions.forEach(c => {
    c.id = Math.log2(c.distance / c.width + 1);
});

// Experiment state variables
let currentTrial = 0;
let currentConditionIndex = 0;
let trialData = [];
let startTime = null;
let experimentRunning = false;
let trialSequence = [];

// DOM elements - initialized after DOM loads
let startBtn, resetBtn, experimentArea, message, statsPanel, resultsSection;
let trialsPerConditionInput, participantIdInput;

// Initialize DOM references when document is ready
document.addEventListener('DOMContentLoaded', function() {
    startBtn = document.getElementById('startBtn');
    resetBtn = document.getElementById('resetBtn');
    experimentArea = document.getElementById('experimentArea');
    message = document.getElementById('message');
    statsPanel = document.getElementById('statsPanel');
    resultsSection = document.getElementById('resultsSection');
    trialsPerConditionInput = document.getElementById('trialsPerCondition');
    participantIdInput = document.getElementById('participantId');

    // Attach event listeners
    startBtn.addEventListener('click', initializeExperiment);
    resetBtn.addEventListener('click', () => location.reload());
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
});

/**
 * Initialize the experiment with randomized trial sequence
 */
function initializeExperiment() {
    const trialsPerCondition = parseInt(trialsPerConditionInput.value);

    // Create trial sequence (randomize condition order)
    trialSequence = [];
    for (let i = 0; i < trialsPerCondition; i++) {
        conditions.forEach((condition, index) => {
            trialSequence.push({ ...condition, conditionIndex: index });
        });
    }

    // Shuffle trial sequence to avoid order effects
    trialSequence = shuffleArray(trialSequence);

    currentTrial = 0;
    trialData = [];
    experimentRunning = true;

    statsPanel.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    startNextTrial();
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Start the next trial in the sequence
 */
function startNextTrial() {
    if (currentTrial >= trialSequence.length) {
        endExperiment();
        return;
    }

    const condition = trialSequence[currentTrial];

    // Update stats display
    document.getElementById('trialCount').textContent = `${currentTrial + 1}/${trialSequence.length}`;
    document.getElementById('currentID').textContent = condition.id.toFixed(2);

    message.classList.add('hidden');
    experimentArea.innerHTML = '';

    // Create start button in center
    const startTarget = createTarget(
        experimentArea.clientWidth / 2,
        experimentArea.clientHeight / 2,
        60,
        true
    );

    experimentArea.appendChild(startTarget);
}

/**
 * Create a target element (either start button or test target)
 * @param {number} x - X position (center)
 * @param {number} y - Y position (center)
 * @param {number} width - Target width/height
 * @param {boolean} isStart - Whether this is the start button
 * @returns {HTMLElement} - Target element
 */
function createTarget(x, y, width, isStart = false) {
    const target = document.createElement('div');
    target.className = isStart ? 'target start' : 'target';
    target.style.width = width + 'px';
    target.style.height = width + 'px';
    target.style.left = (x - width / 2) + 'px';
    target.style.top = (y - width / 2) + 'px';

    if (isStart) {
        target.textContent = 'START';
        target.onclick = () => showTestTarget();
    } else {
        target.onclick = (e) => recordClick(e, x, y, width);
    }

    return target;
}

/**
 * Display the test target at a random angle from center
 */
function showTestTarget() {
    const condition = trialSequence[currentTrial];
    experimentArea.innerHTML = '';

    // Random angle for target placement (radians)
    const angle = Math.random() * 2 * Math.PI;
    const centerX = experimentArea.clientWidth / 2;
    const centerY = experimentArea.clientHeight / 2;

    // Calculate target position using polar coordinates
    const targetX = centerX + condition.distance * Math.cos(angle);
    const targetY = centerY + condition.distance * Math.sin(angle);

    // Ensure target stays within bounds
    const boundedX = Math.max(condition.width / 2, Math.min(experimentArea.clientWidth - condition.width / 2, targetX));
    const boundedY = Math.max(condition.width / 2, Math.min(experimentArea.clientHeight - condition.width / 2, targetY));

    const target = createTarget(boundedX, boundedY, condition.width, false);
    experimentArea.appendChild(target);

    // Start timing
    startTime = performance.now();
}

/**
 * Record click on target and calculate metrics
 * @param {Event} event - Click event
 * @param {number} targetX - Target center X
 * @param {number} targetY - Target center Y
 * @param {number} targetWidth - Target width
 */
function recordClick(event, targetX, targetY, targetWidth) {
    if (!startTime) return;

    const endTime = performance.now();
    const movementTime = endTime - startTime;
    const condition = trialSequence[currentTrial];

    // Calculate click position relative to target center
    const rect = event.target.getBoundingClientRect();
    const areaRect = experimentArea.getBoundingClientRect();
    const clickX = event.clientX - areaRect.left;
    const clickY = event.clientY - areaRect.top;

    // Calculate Euclidean distance from target center
    const dx = clickX - targetX;
    const dy = clickY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isAccurate = distance <= targetWidth / 2;

    // Record trial data
    trialData.push({
        trial: currentTrial + 1,
        participantId: participantIdInput.value || 'anonymous',
        timestamp: new Date().toISOString(),
        condition: condition.conditionIndex,
        distance: condition.distance,
        width: condition.width,
        id: condition.id,
        movementTime: movementTime,
        errorDistance: distance,
        accurate: isAccurate,
        clickX: clickX,
        clickY: clickY,
        targetX: targetX,
        targetY: targetY
    });

    // Update real-time stats
    document.getElementById('lastMT').textContent = Math.round(movementTime);
    const accuracy = (trialData.filter(t => t.accurate).length / trialData.length * 100).toFixed(1);
    document.getElementById('accuracy').textContent = accuracy;

    currentTrial++;
    startTime = null;

    // Brief pause before next trial
    setTimeout(() => startNextTrial(), 500);
}

/**
 * End experiment and show results
 */
function endExperiment() {
    experimentRunning = false;
    experimentArea.innerHTML = '<div class="message">Experiment Complete! View results below.</div>';
    statsPanel.classList.add('hidden');

    analyzeResults();
    displayResults();
}

/**
 * Analyze trial data and calculate statistics for each condition
 */
function analyzeResults() {
    // Group trials by condition (using ID as key)
    const byCondition = {};

    trialData.forEach(trial => {
        const key = trial.id.toFixed(2);
        if (!byCondition[key]) {
            byCondition[key] = {
                id: trial.id,
                distance: trial.distance,
                width: trial.width,
                movementTimes: [],
                errors: 0,
                total: 0
            };
        }

        byCondition[key].movementTimes.push(trial.movementTime);
        byCondition[key].total++;
        if (!trial.accurate) byCondition[key].errors++;
    });

    // Calculate statistics for each condition
    window.summaryResults = Object.values(byCondition).map(condition => {
        const meanMT = condition.movementTimes.reduce((a, b) => a + b, 0) / condition.movementTimes.length;
        const variance = condition.movementTimes.reduce((sum, mt) => sum + Math.pow(mt - meanMT, 2), 0) / condition.movementTimes.length;
        const sdMT = Math.sqrt(variance);
        const errorRate = (condition.errors / condition.total) * 100;
        const throughput = condition.id / (meanMT / 1000); // bits per second

        return {
            id: condition.id,
            distance: condition.distance,
            width: condition.width,
            meanMT: meanMT,
            sdMT: sdMT,
            errorRate: errorRate,
            throughput: throughput,
            trials: condition.total
        };
    }).sort((a, b) => a.id - b.id);
}

/**
 * Display results table and chart
 */
function displayResults() {
    resultsSection.classList.remove('hidden');

    // Populate results table
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    window.summaryResults.forEach(result => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = result.id.toFixed(2);
        row.insertCell(1).textContent = result.distance;
        row.insertCell(2).textContent = result.width;
        row.insertCell(3).textContent = result.meanMT.toFixed(1);
        row.insertCell(4).textContent = result.sdMT.toFixed(1);
        row.insertCell(5).textContent = result.errorRate.toFixed(1);
        row.insertCell(6).textContent = result.throughput.toFixed(2);
        row.insertCell(7).textContent = result.trials;
    });

    // Draw visualization
    drawChart();

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Draw scatter plot with linear regression
 */
function drawChart() {
    const canvas = document.getElementById('resultsChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up chart dimensions
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Get data ranges
    const ids = window.summaryResults.map(r => r.id);
    const mts = window.summaryResults.map(r => r.meanMT);

    const minID = 0;
    const maxID = Math.ceil(Math.max(...ids));
    const minMT = 0;
    const maxMT = Math.ceil(Math.max(...mts) / 100) * 100;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid and labels
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (ID)
    for (let i = 0; i <= maxID; i++) {
        const x = padding + (i / maxID) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, height - padding + 5);
        ctx.stroke();
        ctx.fillText(i.toString(), x, height - padding + 20);

        if (i > 0) {
            ctx.strokeStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            ctx.strokeStyle = '#e0e0e0';
        }
    }

    // Y-axis labels (MT)
    ctx.textAlign = 'right';
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const mt = (maxMT / steps) * i;
        const y = height - padding - (i / steps) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(padding, y);
        ctx.stroke();
        ctx.fillText(Math.round(mt).toString(), padding - 10, y + 4);

        if (i > 0) {
            ctx.strokeStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            ctx.strokeStyle = '#e0e0e0';
        }
    }

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Index of Difficulty (bits)', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Movement Time (ms)', 0, 0);
    ctx.restore();

    // Plot data points
    ctx.fillStyle = '#667eea';
    ctx.strokeStyle = '#667eea';

    window.summaryResults.forEach((result, index) => {
        const x = padding + (result.id / maxID) * chartWidth;
        const y = height - padding - (result.meanMT / maxMT) * chartHeight;

        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw error bars (SD)
        const sdTop = height - padding - ((result.meanMT + result.sdMT) / maxMT) * chartHeight;
        const sdBottom = height - padding - ((result.meanMT - result.sdMT) / maxMT) * chartHeight;

        ctx.beginPath();
        ctx.moveTo(x, sdTop);
        ctx.lineTo(x, sdBottom);
        ctx.stroke();

        // Draw line to next point
        if (index < window.summaryResults.length - 1) {
            const nextResult = window.summaryResults[index + 1];
            const nextX = padding + (nextResult.id / maxID) * chartWidth;
            const nextY = height - padding - (nextResult.meanMT / maxMT) * chartHeight;

            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
        }
    });

    // Calculate and draw linear regression line
    const n = window.summaryResults.length;
    const sumID = window.summaryResults.reduce((sum, r) => sum + r.id, 0);
    const sumMT = window.summaryResults.reduce((sum, r) => sum + r.meanMT, 0);
    const sumIDMT = window.summaryResults.reduce((sum, r) => sum + r.id * r.meanMT, 0);
    const sumIDSq = window.summaryResults.reduce((sum, r) => sum + r.id * r.id, 0);

    const slope = (n * sumIDMT - sumID * sumMT) / (n * sumIDSq - sumID * sumID);
    const intercept = (sumMT - slope * sumID) / n;

    // Draw regression line
    ctx.strokeStyle = '#f5576c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const x1 = padding;
    const y1 = height - padding - (intercept / maxMT) * chartHeight;
    const x2 = width - padding;
    const y2 = height - padding - ((slope * maxID + intercept) / maxMT) * chartHeight;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Display regression equation and R²
    ctx.fillStyle = '#f5576c';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`MT = ${intercept.toFixed(1)} + ${slope.toFixed(1)} × ID`, padding + 10, padding + 20);
    ctx.fillText(`R² = ${calculateRSquared(window.summaryResults, slope, intercept).toFixed(3)}`, padding + 10, padding + 40);
}

/**
 * Calculate R-squared (coefficient of determination)
 * @param {Array} data - Summary results data
 * @param {number} slope - Regression slope
 * @param {number} intercept - Regression intercept
 * @returns {number} - R² value
 */
function calculateRSquared(data, slope, intercept) {
    const meanMT = data.reduce((sum, r) => sum + r.meanMT, 0) / data.length;
    const ssTotal = data.reduce((sum, r) => sum + Math.pow(r.meanMT - meanMT, 2), 0);
    const ssResidual = data.reduce((sum, r) => {
        const predicted = slope * r.id + intercept;
        return sum + Math.pow(r.meanMT - predicted, 2);
    }, 0);
    return 1 - (ssResidual / ssTotal);
}

/**
 * Download trial data as CSV file
 */
function downloadCSV() {
    const headers = ['Trial', 'ParticipantID', 'Timestamp', 'Condition', 'Distance', 'Width', 'ID', 'MovementTime', 'ErrorDistance', 'Accurate', 'ClickX', 'ClickY', 'TargetX', 'TargetY'];
    const rows = trialData.map(t => [
        t.trial,
        t.participantId,
        t.timestamp,
        t.condition,
        t.distance,
        t.width,
        t.id.toFixed(4),
        t.movementTime.toFixed(2),
        t.errorDistance.toFixed(2),
        t.accurate ? 1 : 0,
        t.clickX.toFixed(2),
        t.clickY.toFixed(2),
        t.targetX.toFixed(2),
        t.targetY.toFixed(2)
    ]);

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitts_law_${participantIdInput.value || 'anonymous'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
