const fetch = require("node-fetch");

const TOKEN = "8635751892:AAE590fqPpviopRxjTtSt_q23V56gc92lVg";
const CHAT_ID = "951053167";

let lastAlert = "";

async function checkAlerts() {
  try {
    const res = await fetch("https://www.oref.org.il/WarningMessages/Alert/alerts.json");
    const text = await res.text();

    if (!text || text === lastAlert) return;

    lastAlert = text;

    const data = JSON.parse(text);

    if (data.data && data.data.length > 0) {
      const message = `🚨 ТРЕВОГА\n${data.data.join(", ")}`;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      });
    }

  } catch (e) {}
}

setInterval(checkAlerts, 3000);
