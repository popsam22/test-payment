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

export const initiateTransaction = () => {
  const transactionDetails = {
    email: "customer@email.com",
    amount: 100000,
    metadata: {
      custom_fields: [
        {
          display_name: "Customer's name",
          variable_name: "customer_name",
          value: "John Doe",
        },
      ],
    },
  };

  axios
    .post(
      "https://api.paystack.co/transaction/initialize",
      transactionDetails,
      {
        headers: {
          Authorization: `Bearer ${API_SECRET_KEY}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

export const webhook = (req: Request, res: Response) => {
  const eventData = req.body;
  const signature = req.headers["x-paystack-signature"];
  if (!verify(eventData, signature)) {
    return res.status(400).json({ message: "Signature not verified" });
  }

  if (eventData.event === "charge.success") {
    const transactionId = eventData.data.id;
    console.log(`Transaction ${transactionId} was successful`);
  }
  return res.status(200).json({ message: "good webhook" });
};
