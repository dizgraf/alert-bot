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

let lastAlertKey = "";
let alertActive = false;
let lastSeenAlertTime = 0;

async function checkAlerts() {
  try {
    const res = await fetch("https://api.tzevaadom.co.il/notifications", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("Ответ TzevaAdom не JSON");
      return;
    }

    // Если тревог нет
    if (!Array.isArray(data) || data.length === 0) {
      const now = Date.now();

      // Завершение только если 10 минут не было новых тревог
      if (alertActive && now - lastSeenAlertTime > 600000) {
        alertActive = false;
        lastAlertKey = "";

        await sendMessage(
          "🟢 ИНЦИДЕНТ ЗАВЕРШЁН\nПрошло 10 минут без новых тревог.\nМожно выходить из укрытия."
        );
      }

      return;
    }

    // Берём первое событие
    const alert = data[0];

    const citiesArr = Array.isArray(alert.cities) ? alert.cities : [];
    const cities = citiesArr.join(", ");

    const key = `${cities}_${alert.time}`;

    // Защита от дублей
    if (key === lastAlertKey) {
      lastSeenAlertTime = Date.now();
      return;
    }

    lastAlertKey = key;
    alertActive = true;
    lastSeenAlertTime = Date.now();

    const time = alert.time
      ? new Date(alert.time * 1000).toLocaleTimeString("ru-RU")
      : "Неизвестно";

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

async function sendMessage(text) {
  try {
    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text
      })
    });

    const result = await tg.json();

    if (result.ok) {
      console.log("Сообщение отправлено:", text.replace(/\n/g, " | "));
    } else {
      console.log("Ошибка Telegram:", JSON.stringify(result));
    }
  } catch (e) {
    console.log("Ошибка Telegram:", e.message);
  }
}

console.log("бот запущен");
setInterval(checkAlerts, 10000);
