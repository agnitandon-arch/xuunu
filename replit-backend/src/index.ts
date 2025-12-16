import express from "express";
import cors from "cors";
import homeostasisRouter from "./routes/homeostasis.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/homeostasis", homeostasisRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Replit backend running on port ${PORT}`);
});
