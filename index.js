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

let sentIds = new Set();

async function checkAlerts() {
  try {
    const res = await fetch("https://api.tzevaadom.co.il/notifications", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*"
      }
    });

    const text = await res.text();
    console.log("Ответ TzevaAdom:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("Это не JSON");
      return;
    }

    if (!Array.isArray(data) || data.length === 0) return;

    for (const alert of data) {
      const id = alert.notificationId || `${alert.time}-${(alert.cities || []).join(",")}`;

      if (sentIds.has(id)) continue;
      sentIds.add(id);

      const cities = Array.isArray(alert.cities) ? alert.cities.join(", ") : "Без городов";
      const threat = alert.threat;
      const isDrill = alert.isDrill ? "Да" : "Нет";
      const ts = alert.time ? new Date(alert.time * 1000).toLocaleString("ru-RU") : "Нет времени";

      const message =
`🚨 ТРЕВОГА
Города: ${cities}
Время: ${ts}
Threat: ${threat}
Учебная: ${isDrill}`;

      const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      });

      const tgText = await tg.text();
      console.log("Ответ Telegram:", tgText);
    }

    if (sentIds.size > 500) {
      sentIds = new Set(Array.from(sentIds).slice(-200));
    }

  } catch (e) {
    console.log("Ошибка:", e.message);
  }
}

console.log("бот запущен");
setInterval(checkAlerts, 10000);
