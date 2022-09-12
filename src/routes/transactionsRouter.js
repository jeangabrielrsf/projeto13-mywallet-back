import express from "express";
import {
	getUserTransactions,
	registerTransaction,
} from "../controllers/transactionsController.js";

const transactionsRouter = express.Router();
transactionsRouter.post("/transactions", registerTransaction);
transactionsRouter.get("/transactions", getUserTransactions);

export default transactionsRouter;
