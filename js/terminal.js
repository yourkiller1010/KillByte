/* ============================================
   KILLBYTE PREMIUM - TERMINAL JAVASCRIPT
   Auto-typing Animation & Terminal Effects
   ============================================ */

// Terminal State
const terminalState = {
    isTyping: false,
    currentCommand: '',
    commandIndex: 0,
    commands: [
        'killbyte --status --power',
        './check-nodes.sh',
        'monitor --l7 --l4',
        'stats --realtime'
    ],
    outputLines: [
        { icon: 'check', text: 'System Status: <strong>OPERATIONAL</strong>', type: 'success' },
        { icon: 'bolt', text: 'L7 Power: <span class="highlight">72,000,000</span> requests/sec', type: 'info' },
        { icon: 'bolt', text: 'L4 Power: <span class="highlight">630</span> Gbps output', type: 'info' },
        { icon: 'lock', text: 'Nodes: <span class="highlight">240+</span> active worldwide', type: 'success' },
        { icon: 'crown', text: 'KillByte: <strong>The strongest L7 & L4 on the market</strong>', type: 'success' },
        { icon: 'user', text: 'Admin: <strong>@rankflood</strong> — Best L7 & L4 Admin', type: 'info' }
    ]
};

// DOM Elements
let terminalElements = {};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTerminalElements();
    initTerminalObserver();
});

function initTerminalElements() {
    terminalElements = {
        body: document.getElementById('terminalBody'),
        command: document.getElementById('typingCommand'),
        cursor: document.getElementById('cursor'),
        output: document.getElementById('terminalOutput')
    };
}

function initTerminalObserver() {
    const terminalSection = document.getElementById('terminal');
    if (!terminalSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !terminalState.hasAnimated) {
                terminalState.hasAnimated = true;
                startTerminalAnimation();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(terminalSection);
}

// ============================================
// TERMINAL ANIMATION
// ============================================
async function startTerminalAnimation() {
    const { command, cursor, output } = terminalElements;
    if (!command || !cursor || !output) return;

    // Wait a moment before starting
    await sleep(800);

    // Type the command
    const commandText = terminalState.commands[0];
    await typeCommand(commandText);

    // Hide cursor briefly
    cursor.style.opacity = '0';
    await sleep(300);

    // Show output
    await showOutput();

    // Show cursor again
    cursor.style.opacity = '1';
    await sleep(500);

    // Clear and prepare for next command
    await clearCommand();

    // Start command cycle
    startCommandCycle();
}

async function typeCommand(text) {
    const { command, cursor } = terminalElements;
    if (!command || !cursor) return;

    terminalState.isTyping = true;
    cursor.classList.add('typing');

    for (let i = 0; i < text.length; i++) {
        command.textContent += text[i];
        
        // Random typing speed for realism
        const delay = getRandomDelay(30, 120);
        await sleep(delay);
    }

    terminalState.isTyping = false;
    cursor.classList.remove('typing');
}

async function showOutput() {
    const { output } = terminalElements;
    if (!output) return;

    output.innerHTML = '';
    output.style.display = 'block';

    for (let i = 0; i < terminalState.outputLines.length; i++) {
        const line = terminalState.outputLines[i];
        const lineEl = createOutputLine(line, i);
        output.appendChild(lineEl);

        // Stagger the appearance
        await sleep(150);
    }
}

function createOutputLine(line, index) {
    const div = document.createElement('div');
    div.className = 'output-line';
    div.style.animationDelay = `${index * 0.1}s`;

    const iconMap = {
        'check': 'check',
        'bolt': 'bolt',
        'lock': 'lock',
        'crown': 'crown',
        'user': 'user-shield'
    };

    const iconClass = iconMap[line.icon] || 'circle';

    div.innerHTML = `
        <span class="output-icon"><i class="fas fa-${iconClass}"></i></span>
        <span class="output-text ${line.type}">${line.text}</span>
    `;

    return div;
}

async function clearCommand() {
    const { command, cursor } = terminalElements;
    if (!command || !cursor) return;

    cursor.classList.add('typing');
    
    // Simulate backspace
    const text = command.textContent;
    for (let i = text.length; i > 0; i--) {
        command.textContent = text.substring(0, i - 1);
        await sleep(20);
    }

    cursor.classList.remove('typing');
}

// ============================================
// COMMAND CYCLE
// ============================================
async function startCommandCycle() {
    const { command, output } = terminalElements;
    if (!command || !output) return;

    let commandIndex = 1;

    while (true) {
        await sleep(3000);

        // Clear previous output
        output.innerHTML = '';
        output.style.display = 'none';

        // Type new command
        const cmdText = terminalState.commands[commandIndex];
        await typeCommand(cmdText);

        // Show different output based on command
        await showCommandOutput(commandIndex);

        // Move to next command
        commandIndex = (commandIndex + 1) % terminalState.commands.length;

        // Clear command
        await sleep(2000);
        await clearCommand();
    }
}

async function showCommandOutput(commandIndex) {
    const { output } = terminalElements;
    if (!output) return;

    output.innerHTML = '';
    output.style.display = 'block';

    let lines = [];

    switch (commandIndex) {
        case 1: // check-nodes
            lines = [
                { icon: 'server', text: 'Node-US-01: <span class="success">ONLINE</span> (12ms)', type: 'success' },
                { icon: 'server', text: 'Node-EU-03: <span class="success">ONLINE</span> (8ms)', type: 'success' },
                { icon: 'server', text: 'Node-AS-07: <span class="success">ONLINE</span> (18ms)', type: 'success' },
                { icon: 'server', text: 'Node-SA-02: <span class="success">ONLINE</span> (22ms)', type: 'success' },
                { icon: 'check', text: '<strong>240 nodes</strong> responding correctly', type: 'success' }
            ];
            break;
        case 2: // monitor
            lines = [
                { icon: 'chart-line', text: 'L7 Load: <span class="highlight">45%</span> (32M req/s)', type: 'info' },
                { icon: 'chart-line', text: 'L4 Load: <span class="highlight">38%</span> (240 Gbps)', type: 'info' },
                { icon: 'shield-alt', text: 'DDoS Protection: <span class="success">ACTIVE</span>', type: 'success' },
                { icon: 'clock', text: 'Uptime: <span class="highlight">99.98%</span>', type: 'info' }
            ];
            break;
        case 3: // stats
            lines = [
                { icon: 'tachometer-alt', text: 'Peak L7: <span class="highlight">72M</span> req/s', type: 'info' },
                { icon: 'tachometer-alt', text: 'Peak L4: <span class="highlight">630</span> Gbps', type: 'info' },
                { icon: 'users', text: 'Active Users: <span class="highlight">1,247</span>', type: 'info' },
                { icon: 'star', text: 'Rating: <span class="success">4.9/5.0</span>', type: 'success' }
            ];
            break;
        default:
            lines = terminalState.outputLines;
    }

    for (let i = 0; i < lines.length; i++) {
        const lineEl = createOutputLine(lines[i], i);
        output.appendChild(lineEl);
        await sleep(100);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
}

// ============================================
// TERMINAL COMMANDS (For user interaction)
// ============================================
const terminalCommands = {
    help: () => {
        return `
Available commands:
  <span class="highlight">status</span>     - Show system status
  <span class="highlight">nodes</span>      - List active nodes
  <span class="highlight">stats</span>      - Show statistics
  <span class="highlight">power</span>      - Show power metrics
  <span class="highlight">contact</span>    - Show contact info
  <span class="highlight">clear</span>      - Clear terminal
  <span class="highlight">help</span>       - Show this help
        `;
    },
    status: () => {
        return `
System Status: <span class="success">OPERATIONAL</span>
L7 Status: <span class="success">ONLINE</span>
L4 Status: <span class="success">ONLINE</span>
API Status: <span class="success">ONLINE</span>
        `;
    },
    nodes: () => {
        return `
Active Nodes: <span class="highlight">240+</span>
Regions:
  - North America: <span class="highlight">85</span> nodes
  - Europe: <span class="highlight">72</span> nodes
  - Asia: <span class="highlight">48</span> nodes
  - South America: <span class="highlight">21</span> nodes
  - Oceania: <span class="highlight">14</span> nodes
        `;
    },
    stats: () => {
        return `
Statistics:
  Total Visitors: <span class="highlight">${document.getElementById('countValue')?.textContent || '0'}</span>
  Active Plans: <span class="highlight">1,247</span>
  Uptime: <span class="highlight">99.98%</span>
        `;
    },
    power: () => {
        return `
Power Metrics:
  L7 Capacity: <span class="highlight">72M+</span> requests/sec
  L4 Capacity: <span class="highlight">630</span> Gbps
  Concurrent: <span class="highlight">Unlimited</span>
        `;
    },
    contact: () => {
        return `
Contact Information:
  Admin: <span class="highlight">@rankflood</span>
  Support: <span class="highlight">@KillByte_Support_Bot</span>
  Channel: <span class="highlight">t.me/KillByteSolutions</span>
        `;
    },
    clear: () => {
        return 'CLEAR';
    }
};

// ============================================
// INTERACTIVE TERMINAL (Optional feature)
// ============================================
function initInteractiveTerminal() {
    const terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;

    // Make terminal clickable for focus
    terminalBody.addEventListener('click', () => {
        terminalBody.focus();
    });

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (!terminalBody.matches(':hover')) return;

        if (e.key === 'Enter') {
            executeCommand(terminalState.currentInput);
            terminalState.currentInput = '';
        } else if (e.key === 'Backspace') {
            terminalState.currentInput = terminalState.currentInput.slice(0, -1);
        } else if (e.key.length === 1) {
            terminalState.currentInput += e.key;
        }

        updateInputDisplay();
    });
}

function executeCommand(input) {
    const cmd = input.trim().toLowerCase();
    
    if (terminalCommands[cmd]) {
        const result = terminalCommands[cmd]();
        if (result === 'CLEAR') {
            terminalElements.output.innerHTML = '';
        } else {
            addToOutput(result, 'info');
        }
    } else if (cmd) {
        addToOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
    }
}

function addToOutput(text, type = 'info') {
    const { output } = terminalElements;
    if (!output) return;

    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = `<span class="output-text ${type}">${text}</span>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function updateInputDisplay() {
    // Update the input display if needed
}

// Export for global access
window.terminalCommands = terminalCommands;
window.executeTerminalCommand = executeCommand;
