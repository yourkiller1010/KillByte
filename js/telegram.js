/* ============================================
   KILLBYTE PREMIUM - TELEGRAM INTEGRATION
   Bot Configuration & Messaging
   ============================================ */

// Telegram State
const telegramState = {
    botToken: '',
    chatId: '',
    notifyEnabled: true,
    isConnected: false
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadTelegramConfig();
});

// ============================================
// CONFIGURATION
// ============================================
function loadTelegramConfig() {
    telegramState.botToken = localStorage.getItem('kb_bot_token') || '';
    telegramState.chatId = localStorage.getItem('kb_chat_id') || '';
    telegramState.notifyEnabled = localStorage.getItem('kb_notify_enabled') !== 'false';

    // Update form fields if they exist
    const tokenInput = document.getElementById('botToken');
    const chatIdInput = document.getElementById('chatId');
    const notifyCheckbox = document.getElementById('notifyEnabled');

    if (tokenInput) tokenInput.value = telegramState.botToken;
    if (chatIdInput) chatIdInput.value = telegramState.chatId;
    if (notifyCheckbox) notifyCheckbox.checked = telegramState.notifyEnabled;

    // Update status
    updateTelegramStatus();
}

function saveTelegramConfig() {
    const tokenInput = document.getElementById('botToken');
    const chatIdInput = document.getElementById('chatId');
    const notifyCheckbox = document.getElementById('notifyEnabled');

    telegramState.botToken = tokenInput ? tokenInput.value.trim() : '';
    telegramState.chatId = chatIdInput ? chatIdInput.value.trim() : '';
    telegramState.notifyEnabled = notifyCheckbox ? notifyCheckbox.checked : true;

    // Save to localStorage
    localStorage.setItem('kb_bot_token', telegramState.botToken);
    localStorage.setItem('kb_chat_id', telegramState.chatId);
    localStorage.setItem('kb_notify_enabled', telegramState.notifyEnabled.toString());

    // Update status
    updateTelegramStatus();

    // Test connection
    testTelegramConnection();

    showNotification('Telegram configuration saved', 'success');
}

function updateTelegramStatus() {
    const statusEl = document.getElementById('telegramStatus');
    
    if (statusEl) {
        if (telegramState.botToken && telegramState.chatId) {
            statusEl.textContent = 'ON';
            statusEl.style.color = '#00ff88';
            telegramState.isConnected = true;
        } else {
            statusEl.textContent = 'OFF';
            statusEl.style.color = '#ff4444';
            telegramState.isConnected = false;
        }
    }
}

// ============================================
// CONNECTION TEST
// ============================================
async function testTelegramConnection() {
    if (!telegramState.botToken || !telegramState.chatId) return;

    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramState.botToken}/getMe`);
        const data = await response.json();

        if (data.ok) {
            console.log('Telegram bot connected:', data.result.username);
            telegramState.isConnected = true;
            
            // Send test message
            await sendTelegramMessage('🔔 <b>KillByte Bot Connected</b>\n\nVisitor notifications are now active!', false);
        } else {
            console.error('Telegram bot connection failed:', data.description);
            telegramState.isConnected = false;
            showNotification('Bot connection failed. Check your token.', 'error');
        }
    } catch (error) {
        console.error('Telegram connection error:', error);
        telegramState.isConnected = false;
    }
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendTelegramMessage(message, silent = false) {
    if (!telegramState.botToken || !telegramState.chatId) {
        console.log('Telegram not configured');
        return false;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramState.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramState.chatId,
                text: message,
                parse_mode: 'HTML',
                disable_notification: silent
            })
        });

        const data = await response.json();

        if (data.ok) {
            console.log('Message sent to Telegram');
            return true;
        } else {
            console.error('Telegram API error:', data.description);
            return false;
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return false;
    }
}

// ============================================
// SEND VISITOR NOTIFICATION
// ============================================
async function sendVisitorTelegramNotification(visitor, stats) {
    if (!telegramState.notifyEnabled) return;
    if (!telegramState.botToken || !telegramState.chatId) return;

    const location = visitor.city !== 'Unknown' 
        ? `${visitor.city}, ${visitor.region}, ${visitor.country}` 
        : visitor.country !== 'Unknown' 
            ? visitor.country 
            : 'Unknown Location';

    const date = new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const message = `
🚨 <b>New Visitor on KillByte</b>

📊 <b>Visitor Information</b>
├ IP: <code>${visitor.ip}</code>
├ Location: ${location}
├ Country: ${visitor.country} (${visitor.countryCode})
├ ISP: ${visitor.isp}
├ Timezone: ${visitor.timezone}
└ Time: ${date}

📱 <b>Device Information</b>
├ Type: ${getDeviceType()}
├ Platform: ${navigator.platform}
├ Language: ${navigator.language}
└ Screen: ${screen.width}x${screen.height}

📈 <b>Statistics</b>
├ Total Visitors: ${stats.total}
└ Today's Visitors: ${stats.today}

🔗 <b>Navigation</b>
├ Page: ${visitor.page}
└ Referrer: ${visitor.referrer}
    `.trim();

    return await sendTelegramMessage(message);
}

// ============================================
// SEND ORDER NOTIFICATION
// ============================================
async function sendOrderNotification(orderDetails) {
    if (!telegramState.botToken || !telegramState.chatId) return;

    const date = new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const message = `
💰 <b>New Order on KillByte</b>

📦 <b>Order Details</b>
├ Plan: ${orderDetails.plan}
├ Price: $${orderDetails.price}
├ Type: ${orderDetails.type}
└ Time: ${date}

👤 <b>Customer</b>
├ IP: ${orderDetails.ip || 'Unknown'}
└ Contact: @${orderDetails.username || 'Unknown'}

⚡ Action required! Contact customer ASAP.
    `.trim();

    return await sendTelegramMessage(message);
}

// ============================================
// SEND SYSTEM ALERT
// ============================================
async function sendSystemAlert(alertType, details) {
    if (!telegramState.botToken || !telegramState.chatId) return;

    const icons = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
    };

    const message = `
${icons[alertType] || 'ℹ️'} <b>System Alert</b>

<b>Type:</b> ${alertType.toUpperCase()}
<b>Details:</b> ${details}
<b>Time:</b> ${new Date().toLocaleString()}
    `.trim();

    return await sendTelegramMessage(message, alertType === 'info');
}

// ============================================
// GET BOT INFO
// ============================================
async function getBotInfo() {
    if (!telegramState.botToken) return null;

    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramState.botToken}/getMe`);
        const data = await response.json();

        if (data.ok) {
            return data.result;
        }
        return null;
    } catch (error) {
        console.error('Error getting bot info:', error);
        return null;
    }
}

// ============================================
// GET UPDATES (for webhook simulation)
// ============================================
async function getTelegramUpdates() {
    if (!telegramState.botToken) return [];

    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramState.botToken}/getUpdates?limit=10`);
        const data = await response.json();

        if (data.ok) {
            return data.result;
        }
        return [];
    } catch (error) {
        console.error('Error getting updates:', error);
        return [];
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    if (/ipad/i.test(ua)) return 'iPad';
    return 'Desktop';
}

function formatTelegramMessage(text) {
    // Escape special characters for Telegram HTML
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================
// SETUP WIZARD
// ============================================
function showTelegramSetup() {
    const steps = `
How to setup Telegram Bot:

1. Open Telegram and search for @BotFather
2. Send /newbot command
3. Follow instructions to create bot
4. Copy the bot token (looks like: 123456789:ABCdef...)
5. Start a chat with your bot
6. Search for @userinfobot
7. Copy your Chat ID
8. Paste both in the admin panel
9. Click "Save Configuration"

Your bot will now receive visitor notifications!
    `.trim();

    alert(steps);
}

// Export functions
window.saveTelegramConfig = saveTelegramConfig;
window.testTelegramConnection = testTelegramConnection;
window.sendTelegramMessage = sendTelegramMessage;
window.sendVisitorTelegramNotification = sendVisitorTelegramNotification;
window.sendOrderNotification = sendOrderNotification;
window.sendSystemAlert = sendSystemAlert;
window.getBotInfo = getBotInfo;
window.getTelegramUpdates = getTelegramUpdates;
window.showTelegramSetup = showTelegramSetup;
