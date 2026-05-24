// Variables globales
let groqApiKey = null;
let appConfig = null;

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const apiStatus = document.getElementById('apiStatus');

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Inicialización
window.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    askForApiKey();
});

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error('No se pudo cargar config.json');
        appConfig = await response.json();
        apiStatus.textContent = "✨ Labubu listo para la travesura · Esperando clave ✨";
        console.log("Configuración cargada:", appConfig);
    } catch (error) {
        console.error("Error cargando config:", error);
        apiStatus.textContent = "⚠️ Usando personalidad por defecto";
        appConfig = {
            system_prompt: "Eres Labubu. Hablas con alegría y usas emojis de travieso (🦷✨).",
            model: "llama-3.1-8b-instant",
            temperature: 0.85,
            max_tokens: 150
        };
    }
}

function askForApiKey() {
    const key = prompt("🔑 Labubu necesita tu clave de Groq.\n\nObtén una gratis en https://console.groq.com\n\nIntroduce tu clave (empieza por gsk_):");
    
    if (key && key.trim().startsWith("gsk_")) {
        groqApiKey = key.trim();
        apiStatus.textContent = "✅ Magia traviesa activa · ¡Labubu listo para jugar!";
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        addBotMessage("✨ ¡Perfecto! Ahora sí, ¿en qué te ayudo, humano? 🧸✨🦷");
    } else {
        apiStatus.textContent = "❌ Clave no válida · Recarga la página";
        addBotMessage("🦷 Lo siento, la clave no funciona. Recarga e intenta con una clave válida de Groq, por favor.");
        userInput.disabled = true;
        sendBtn.disabled = true;
    }
}

function addBotMessage(text) {
    addMessage(text, false);
}

function addUserMessage(text) {
    addMessage(text, true);
}

function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    const avatar = document.createElement('div');
    avatar.textContent = isUser ? '🧑' : '🦷';
    const bubble = document.createElement('div');
    bubble.textContent = text;
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div>🦷</div>
        <div>✨✨ Labubu está tramando algo... ✨✨</div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

async function callGroqAPI(userMessage) {
    if (!appConfig) {
        return "🦷 Ups, mi magia traviesa no está lista aún. ¡Recarga la página!";
    }
    
    const messages = [
        { role: "system", content: appConfig.system_prompt },
        { role: "user", content: userMessage }
    ];
    
    const requestBody = {
        model: appConfig.model,
        messages: messages,
        temperature: appConfig.temperature,
        max_tokens: appConfig.max_tokens
    };
    
    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error("Error llamando a Groq API:", error);
        return "🦷 ¡Ay, no! Mi magia falló. ¿Puedes revisar tu conexión o clave de API? 🧸✨";
    }
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    addUserMessage(message);
    userInput.value = '';
    
    showTypingIndicator();
    const botResponse = await callGroqAPI(message);
    removeTypingIndicator();
    addBotMessage(botResponse);
    
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !userInput.disabled && !sendBtn.disabled) {
        handleSendMessage();
    }
});