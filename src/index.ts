import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  console.log("Webhook Body:", req.body);
  res.status(200).json({
    status: "OK",
    body: req.body,
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
