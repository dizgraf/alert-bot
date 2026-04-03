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

let lastAlert = "";

async function checkAlerts() {
  try {
    const res = await fetch("https://www.oref.org.il/WarningMessages/Alert/alerts.json");
    const text = await res.text();

    if (!text || text === lastAlert) return;

    lastAlert = text;

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }

    if (data.data && data.data.length > 0) {
      const message = `🚨 ТРЕВОГА\n${data.data.join(", ")}`;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      });
    }
  } catch (e) {
    console.log("Ошибка:", e.message);
  }
}

console.log("бот запущен");
setInterval(checkAlerts, 3000);
