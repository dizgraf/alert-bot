const express = require("express");
const fetch = require("node-fetch");

const TOKEN = "8635751892:AAFmbCJ41yLmXVX9CXut6F_L3SVyEAthUpc";
const CHAT_ID = "951053167";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log(`Сервер слушает порт ${PORT}`);
});

// =====================

let lastAlertKey = "";
let alertActive = false;

async function checkAlerts() {
  try {
    const res = await fetch("https://api.tzevaadom.co.il/notifications", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const data = await res.json();

    // 🚫 нет тревоги
    if (!Array.isArray(data) || data.length === 0) {
      if (alertActive) {
        alertActive = false;

        await sendMessage(`🟢 ИНЦИДЕНТ ЗАВЕРШЁН\nМожно выходить из укрытия`);
      }
      return;
    }

    // берем первое событие
    const alert = data[0];

    const citiesArr = Array.isArray(alert.cities) ? alert.cities : [];
    const cities = citiesArr.join(", ");

    const key = cities + alert.time;

    // 🚫 защита от дублей
    if (key === lastAlertKey) return;

    lastAlertKey = key;
    alertActive = true;

    const time = new Date(alert.time * 1000).toLocaleTimeString("ru-RU");

    const message =
`🚨 РАКЕТНАЯ ТРЕВОГА

📍 ${cities || "Неизвестно"}
⏱ ${time}

⚠️ Немедленно в укрытие`;

    await sendMessage(message);

  } catch (e) {
    console.log("Ошибка:", e.message);
  }
}

// =====================

async function sendMessage(text) {
  const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text
    })
  });

  const result = await tg.text();
  console.log("Telegram:", result);
}

// =====================

console.log("бот запущен");
setInterval(checkAlerts, 10000);
