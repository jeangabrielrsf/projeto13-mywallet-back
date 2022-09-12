import express from "express";
import cors from "cors";
import { signUp, login, signOut } from "./controllers/authController.js";
import {
	getUserTransactions,
	registerTransaction,
} from "./controllers/transactionsController.js";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", signUp);

app.post("/login", login);

app.delete("/sign-out", signOut);

app.get("/transactions", getUserTransactions);

app.post("/transactions", registerTransaction);

app.listen(5000, () => console.log("Listening on port 5000..."));
