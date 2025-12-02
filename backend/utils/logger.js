import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function logEvent(eventType, message, userId = "N/A", ip = "N/A") {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const filePath = path.join(logDir, `${date}.csv`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      "timestamp,event_type,message,user_id,ip_address\n",
      "utf-8"
    );
  }

  const timestamp = now.toISOString();
  const safeMessage = message.replace(/,/g, ";");

  const row = `${timestamp},${eventType},${safeMessage},${userId},${ip}\n`;

  fs.appendFile(filePath, row, (err) => {
    if (err) console.error("Error writing log:", err);
  });
}

export function getClientIp(req) {
  // Try various headers that might contain the client IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] || // Cloudflare
    req.headers["true-client-ip"] || // Akamai/Cloudflare
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip || // Express trust proxy
    "N/A";

  // Handle IPv6 localhost format (::1 or ::ffff:127.0.0.1)
  if (ip === "::1") return "127.0.0.1";
  if (ip?.startsWith("::ffff:")) return ip.replace("::ffff:", "");

  return ip;
}
