import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import { Request, Response } from "express";

dotenv.config();
const API_SECRET_KEY = process.env.SECRET_KEY;

const verify = (transactionData,signature) => {
  try {
    const hmac = crypto.createHmac("sha512", process.env.MYSECRETKEY);
    const expectedSignature = hmac
      .update(JSON.stringify(transactionData))
      .digest("hex");
    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

export const initiateTransaction = async (req: Request, res: Response) => {
  const transactionDetails = {
    email: "francis@email.com",
    amount: 100000,
  };

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      transactionDetails,
      {
        headers: {
          Authorization: `Bearer ${API_SECRET_KEY}`,
        },
      }
    );
    return res.status(201).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

export const webhook = (req: Request, res: Response) => {
  const transactionData = req.body;
  const signature = req.headers["x-paystack-signature"];
  if (!verify(transactionData, signature)) {
    return res.status(400).json({ message: "Signature not verified" });
  }
  try {
    if (transactionData.event === "charge.success") {
      const transactionId = transactionData.data.reference;
      console.log(`Transaction ${transactionId} was successful`);
      return res.status(200).json({message: "Payment received succesffully"});
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};
