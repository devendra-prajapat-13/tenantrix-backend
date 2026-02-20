import express from "express";
import morgan from "morgan";
import logger from "./logger.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("combined",{
    stream:{write:(message)=>logger.info(message.trim())}
}))
app.get("/", (req, res) => {
  res.send("Api is running...");
});

export default app;
