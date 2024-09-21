import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import Payment from "./routes/payment";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;
app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Payment service running on ${PORT}`);
});

app.use("/payment", Payment);
