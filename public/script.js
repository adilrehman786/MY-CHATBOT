const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");
const typing = document.getElementById("typing");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

/* -------------------------
   Restore Previous Chat
-------------------------- */

window.onload = () => {

    input.focus();

    const darkMode = localStorage.getItem("theme");

    if (darkMode === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
    }

    if (chatHistory.length > 0) {

        chat.innerHTML = "";

        chatHistory.forEach(msg => {

            createMessage(
                msg.text,
                msg.type,
                msg.time,
                false
            );

        });

    }

};

/* -------------------------
   Current Time
-------------------------- */

function getTime() {

    return new Date().toLocaleTimeString([], {

        hour: "2-digit",
        minute: "2-digit"

    });

}

/* -------------------------
   Save Chat
-------------------------- */

function saveChat() {

    localStorage.setItem(

        "chatHistory",

        JSON.stringify(chatHistory)

    );

}

/* -------------------------
   Scroll
-------------------------- */

function scrollBottom() {

    chat.scrollTop = chat.scrollHeight;

}

/* -------------------------
   Create Bubble
-------------------------- */

function createMessage(
    text,
    type,
    time = getTime(),
    save = true
) {

    const row = document.createElement("div");

    row.className = `message-row ${type}`;

    if (type === "bot") {

        row.innerHTML = `

        <div class="avatar">🤖</div>

        <div class="message">

            ${text}

            <br>

            <button class="copy-btn">

                📋 Copy

            </button>

            <div class="time">

                ${time}

            </div>

        </div>

        `;

    }

    else {

        row.innerHTML = `

        <div class="message">

            ${text}

            <div class="time">

                ${time}

            </div>

        </div>

        `;

    }

    chat.appendChild(row);

    scrollBottom();

    if (save) {

        chatHistory.push({

            text,
            type,
            time

        });

        saveChat();

    }

}

/* -------------------------
   Send Message
-------------------------- */

async function sendMessage() {

    const message = input.value.trim();

    if (message === "") return;

    if (document.querySelector(".welcome")) {

        document.querySelector(".welcome").remove();

    }

    createMessage(

        message,

        "user"

    );

    input.value = "";

    sendBtn.disabled = true;

    typing.classList.remove("hidden");

    scrollBottom();

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                message

            })

        });

        const data = await response.json();

        typing.classList.add("hidden");

        createMessage(

            data.reply,

            "bot"

        );

    }

    catch (error) {

        typing.classList.add("hidden");

        createMessage(

            "❌ Something went wrong.",

            "bot"

        );

    }

    sendBtn.disabled = false;

    input.focus();

}
/* ==========================
   Send Button
========================== */

sendBtn.addEventListener("click", sendMessage);

/* ==========================
   Press Enter
========================== */

input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

/* ==========================
   Suggestion Buttons
========================== */

document.querySelectorAll(".suggestion").forEach(button => {

    button.addEventListener("click", () => {

        input.value = button.innerText;

        sendMessage();

    });

});

/* ==========================
   Dark Mode
========================== */

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.innerHTML = "☀️";

        localStorage.setItem("theme", "dark");

    }

    else {

        themeBtn.innerHTML = "🌙";

        localStorage.setItem("theme", "light");

    }

});

/* ==========================
   Clear Chat
========================== */

clearBtn.addEventListener("click", () => {

    const ok = confirm("Clear all chats?");

    if (!ok) return;

    chat.innerHTML = `

    <div class="welcome">

        <div class="welcome-icon">

            🤖

        </div>

        <h1>Hello 👋</h1>

        <p>

            I'm your Gemini AI assistant.

        </p>

        <div class="suggestions">

            <button class="suggestion">

                Explain JavaScript

            </button>

            <button class="suggestion">

                Write a Python Program

            </button>

            <button class="suggestion">

                Tell me a joke

            </button>

            <button class="suggestion">

                Help me prepare for exams

            </button>

        </div>

    </div>

    `;

    chatHistory = [];

    saveChat();

    attachSuggestionEvents();

});

/* ==========================
   Copy Button
========================== */

chat.addEventListener("click", (e) => {

    if (!e.target.classList.contains("copy-btn")) return;

    const text = e.target.parentElement.childNodes[0].textContent.trim();

    navigator.clipboard.writeText(text);

    const original = e.target.innerHTML;

    e.target.innerHTML = "✅ Copied";

    setTimeout(() => {

        e.target.innerHTML = original;

    }, 1500);

});

/* ==========================
   Attach Suggestion Events
========================== */

function attachSuggestionEvents() {

    document.querySelectorAll(".suggestion").forEach(button => {

        button.onclick = () => {

            input.value = button.innerText;

            sendMessage();

        };

    });

}

attachSuggestionEvents();

/* ==========================
   Welcome Animation
========================== */

setTimeout(() => {

    const welcome = document.querySelector(".welcome");

    if (welcome) {

        welcome.style.animation = "fadeIn .8s ease";

    }

}, 200);

/* ==========================
   Input Animation
========================== */

input.addEventListener("focus", () => {

    input.style.boxShadow = "0 0 15px rgba(37,99,235,.5)";

});

input.addEventListener("blur", () => {

    input.style.boxShadow = "none";

});

/* ==========================
   Button Hover
========================== */

sendBtn.addEventListener("mouseenter", () => {

    sendBtn.style.transform = "scale(1.08) rotate(8deg)";

});

sendBtn.addEventListener("mouseleave", () => {

    sendBtn.style.transform = "scale(1)";

});

/* ==========================
   Prevent Empty Spaces
========================== */

input.addEventListener("input", () => {

    if (input.value.length > 500) {

        input.value = input.value.substring(0, 500);

    }

});