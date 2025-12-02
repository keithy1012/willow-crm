import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function logEvent(eventType, message, userId = "N/A") {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const filePath = path.join(logDir, `${date}.csv`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      "timestamp,event_type,message,user_id\n",
      "utf-8"
    );
  }

  const timestamp = now.toISOString();
  const safeMessage = message.replace(/,/g, ";"); // prevent CSV breaking

  const row = `${timestamp},${eventType},${safeMessage},${userId}\n`;

  // Append row
  fs.appendFile(filePath, row, (err) => {
    if (err) console.error("Error writing log:", err);
  });
}
