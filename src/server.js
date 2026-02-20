import app from "./app.js";
import { dbconnect } from "./config/db.config.js";
import logger from "./logger.js";

await dbconnect();

app.listen(process.env.PORT, () => {
  logger.info(`server running on port no. ${process.env.PORT}`);
});
