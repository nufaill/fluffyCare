import morgan from "morgan";
import fs from "fs";
import path from "path";

const logsDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const RETENTION_DAYS = 7;

const cleanupOldLogs = () => {
  const files = fs.readdirSync(logsDir);

  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > retentionMs) {
      fs.unlinkSync(filePath);
    }
  });
};

const getLogFilePath = () => {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return path.join(logsDir, `${date}-access.log`);
};

const accessLogStream = fs.createWriteStream(getLogFilePath(), {
  flags: "a",
});

cleanupOldLogs();

export const morganLogger = morgan("combined", {
  stream: accessLogStream,
});
