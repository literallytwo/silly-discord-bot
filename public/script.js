// Function to update the current status display
function updateCurrentStatus(status) {
    const statusDisplay = document.getElementById('currentStatus');
    const statusEmojis = {
        'green': '🟢',
        'orange': '🟠',
        'red': '🔴',
        'hacked': '❗'
    };
    statusDisplay.textContent = `${statusEmojis[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
}

// Function to set the bot's status
async function setStatus(status) {
    const customMessage = document.getElementById('customStatus').value;
    
    try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status,
                message: customMessage
            })
        });

        if (response.ok) {
            updateCurrentStatus(status);
            document.getElementById('customStatus').value = ''; // Clear the input
        } else {
            console.error('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Function to get the current status
async function getCurrentStatus() {
    try {
        const response = await fetch('/api/status');
        if (response.ok) {
            const data = await response.json();
            updateCurrentStatus(data.status);
        }
    } catch (error) {
        console.error('Error getting status:', error);
    }
}

// Get initial status when page loads
getCurrentStatus(); 