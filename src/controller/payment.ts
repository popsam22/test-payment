import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import { Request, Response } from "express";

dotenv.config();
const API_SECRET_KEY = process.env.SECRET_KEY;

const verify = (
  eventData: any,
  signature: string | string[] | undefined
): boolean => {
  const hmac = crypto.createHmac("sha512", API_SECRET_KEY!);
  const expectedSignature = hmac
    .update(JSON.stringify(eventData))
    .digest("hex");
  return expectedSignature === signature;
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
  const eventData = req.body;
  const signature = req.headers["x-paystack-signature"];
  if (!verify(eventData, signature)) {
    return res.status(400).json({ message: "Signature not verified" });
  }

  try {
    if (eventData.event === "charge.success") {
      const transactionId = eventData.data.id;
      return res
        .status(200)
        .json({ message: `Transaction ${transactionId} was successful` });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};
