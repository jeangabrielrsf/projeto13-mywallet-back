import dayjs from "dayjs";
import db from "../db/db.js";

async function getUserTransactions(req, res) {
	try {
		const { authorization } = req.headers;
		const token = authorization?.replace("Bearer ", "");

		if (!token) {
			return res.sendStatus(401);
		}

		const session = await db.collection("sessions").findOne({ token });
		if (!session) {
			return res.sendStatus(401);
		}

		const userTransactions = await db
			.collection("transactions")
			.find({ userID: session.userID })
			.toArray();

		return res.status(200).send(userTransactions);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function registerTransaction(req, res) {
	try {
		const { authorization } = req.headers;
		const { value, description, type } = req.body;
		const token = authorization?.replace("Bearer ", "");

		if (!token) {
			return res.sendStatus(401);
		}

		const session = await db.collection("sessions").findOne({ token });
		if (!session) {
			return res.sendStatus(401);
		}

		await db.collection("transactions").insertOne({
			value,
			description,
			type,
			userID: session.userID,
			date: dayjs().format("DD/MM"),
		});
		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export { getUserTransactions, registerTransaction };
