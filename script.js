const startBtn = document.getElementById('startBtn');
const terminal = document.getElementById('terminal');
const playerBalance = document.getElementById('playerBalance');

startBtn.addEventListener('click', async () => {
    // Disable button
    startBtn.disabled = true;
    startBtn.querySelector('.btn-text').innerText = 'SIMULATING...';
    
    // Clear terminal except first line
    terminal.innerHTML = '<div class="line sys">Initializing network connection to Sphere Testnet...</div>';
    
    try {
        // Call the Vercel serverless function
        const response = await fetch('/api/play');
        const data = await response.json();
        
        if (data.success && data.logs) {
            await typeLogs(data.logs);
        } else {
            appendLog('Error: Failed to retrieve simulation data.', 'sys');
        }
    } catch (error) {
        appendLog('Error: Connection to API failed.', 'sys');
        console.error(error);
    } finally {
        startBtn.disabled = false;
        startBtn.querySelector('.btn-text').innerText = 'RESTART SIMULATION';
    }
});

async function typeLogs(logs) {
    let currentBalance = 100;
    
    for (let i = 0; i < logs.length; i++) {
        const rawLog = logs[i];
        let className = 'sys';
        let formattedLog = rawLog;

        // Parse log type to assign colors
        if (rawLog.includes('[GM]')) {
            className = 'gm';
        } else if (rawLog.includes('[Player]')) {
            className = 'player';
        } else if (rawLog.includes('[Nostr]')) {
            className = 'nostr';
        } else if (rawLog.includes('[Wallet]')) {
            className = 'wallet';
            
            // Update UI balance
            if (rawLog.includes('Remaining balance:')) {
                const match = rawLog.match(/Remaining balance: (\d+)/);
                if (match) {
                    currentBalance = parseInt(match[1]);
                    playerBalance.innerText = currentBalance;
                }
            }
        }
        
        // Special highlighting
        if (rawLog.includes('VICTORY')) className = 'victory';
        if (rawLog.includes('Successfully decrypted')) className = 'success';
        if (rawLog.includes('Riddle:')) className = 'riddle';

        // Animate the line
        await typeLine(formattedLog, className);
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
        
        // Random small delay between lines (50ms - 300ms) for realistic feel
        await sleep(Math.random() * 250 + 50);
    }
}

function typeLine(text, className) {
    return new Promise(resolve => {
        const line = document.createElement('div');
        line.className = `line ${className} typing`;
        terminal.appendChild(line);
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                // If it's a bracket, type it.
                line.innerText = text.substring(0, index + 1);
                index++;
            } else {
                clearInterval(typeInterval);
                line.classList.remove('typing');
                resolve();
            }
        }, 10); // Typing speed: 10ms per character
    });
}

function appendLog(text, className) {
    const line = document.createElement('div');
    line.className = `line ${className}`;
    line.innerText = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
