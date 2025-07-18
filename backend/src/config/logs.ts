import morgan from "morgan";
import fs from "fs";
import path from "path";

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../../logs/access.log"),
  { flags: "a" } 
);

export const morganLogger = morgan("combined", {
  stream: accessLogStream,
});
