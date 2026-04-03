const express = require("express");
const fetch = require("node-fetch");

const TOKEN = "8635751892:AAFmbCJ41yLmXVX9CXut6F_L3SVyEAthUpc";
const CHAT_ID = "951053167";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, async () => {
  console.log(`Сервер слушает порт ${PORT}`);

  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "ТЕСТ: бот запустился"
      })
    });

    const result = await response.text();
    console.log("Ответ Telegram:", result);
  } catch (e) {
    console.log("Ошибка Telegram:", e.message);
  }
});
