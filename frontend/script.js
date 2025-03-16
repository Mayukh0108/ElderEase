const CLIENT_ID = "432869003314-dddj39mnhukdjlut0o1dheg8mh86ok91.apps.googleusercontent.com";  // Replace with your OAuth Client ID
const API_SCOPE = "https://www.googleapis.com/auth/assistant-sdk-prototype";

let screenReaderActive = false;

function toggleScreenReader() {
    screenReaderActive = !screenReaderActive;
    const screenReaderText = document.getElementById('screen-reader-text');

    if (screenReaderActive) {
        document.body.addEventListener('mouseover', handleScreenReader);
        alert('Screen reader activated. Hover over elements to hear them.');
    } else {
        document.body.removeEventListener('mouseover', handleScreenReader);
        screenReaderText.style.display = 'none';
    }
}

function handleScreenReader(e) {
    const screenReaderText = document.getElementById('screen-reader-text');
    if (e.target.textContent.trim()) {
        screenReaderText.textContent = e.target.textContent;
        screenReaderText.style.display = 'block';
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(e.target.textContent);
            window.speechSynthesis.speak(utterance);
        }
    }
}

function startVoiceAssistant() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            alert('Voice assistant is listening...');
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            handleVoiceCommand(command);
        };

        recognition.start();
    } else {
        alert('Voice recognition is not supported in your browser.');
    }
}

function handleVoiceCommand(command) {
    if (command.includes('emergency')) {
        alert('Contacting emergency services and caregivers...');
        sendSOS();
    } else if (command.includes('medication')) {
        alert('Your next medication is scheduled for 2:00 PM');
    } else {
        alert('Command not recognized. Please try again.');
    }
}

let currentFontSize = 16;
function adjustFontSize(change) {
    currentFontSize = Math.max(12, Math.min(24, currentFontSize + change));
    document.body.style.fontSize = currentFontSize + 'px';
}

// Language toggle (simplified example)
let currentLanguage = 'en';
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    const translations = {
        en: {
            title: 'Making Elderly Care Simple & Safe',
            subtitle: 'A comprehensive care solution that brings peace of mind to seniors and their loved ones.'
        },
        hi: {
            title: 'बुजुर्गों की देखभाल को सरल और सुरक्षित बनाना',
            subtitle: 'एक व्यापक देखभाल समाधान जो बुजुर्गों और उनके प्रियजनों को मन की शांति प्रदान करता है।'
        }
    };

    document.querySelector('.hero h1').textContent = translations[currentLanguage].title;
    document.querySelector('.hero p').textContent = translations[currentLanguage].subtitle;
}

document.addEventListener("DOMContentLoaded", function() {
    const sosButton = document.querySelector(".sos-button");

    if (sosButton) {
        sosButton.addEventListener("click", function() {
            console.log("SOS Button Clicked!");
            alert("SOS alert sent!");
            sendSOS();
        });
    } else {
        console.error("SOS button not found!");
    }

    // ✅ Ensure Google API is loaded before authentication
    if (typeof google !== "undefined" && google.accounts) {
        authenticateWithGoogle();
    } else {
        console.error("Google API not loaded.");
    }
});

// ✅ Fixed sendSOS function (ensuring backend response is JSON)
function sendSOS() {
    fetch("http://localhost:5000/send-sos", {  // Ensure backend is running at this URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            to: "+918017466069", 
            message: "🚨 SOS ALERT!!! Immediate assistance needed." 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log("Response from server:", data))
    .catch(error => console.error("Error sending SOS:", error));
}

// ✅ Google OAuth authentication
function authenticateWithGoogle() {
    if (typeof google === "undefined") {
        console.error("Google API not available.");
        return;
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: API_SCOPE,
        callback: (response) => {
            if (response.access_token) {
                console.log("Authenticated successfully!", response);
                startVoiceAssistant();
            } else {
                console.error("Authentication failed", response);
            }
        }
    });

    tokenClient.requestAccessToken(); // Trigger OAuth request
}
// ✅ Display status message on page load
window.onload = function() {
  let statusText = document.getElementById("status").innerText;
  alert(statusText);
};
// ✅ Voice listening for automatic SOS trigger
window.onload = function () {
    startListening();
};

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
        alert("Voice recognition activated. Listening for SOS command...");
    };

    recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Heard:", command);
        if (command.includes("activate") || command.includes("SOS")) {
            alert("SOS command detected!");
            sendSOS();
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        document.getElementById("status").innerText = "Error. Restarting...";
        setTimeout(startListening, 2000);  // Restart after 2 seconds
    };

    recognition.start();
}