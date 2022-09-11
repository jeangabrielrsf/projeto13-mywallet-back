import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt, { compareSync } from "bcrypt";
import dayjs from "dayjs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
	db = mongoClient.db("wallet");
});

app.post("/sign-up", async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const cryptedPassword = bcrypt.hashSync(password, 13);

		const userExists = await db.collection("users").findOne({ email });
		if (userExists) {
			return res.status(409).send({ message: "Email já cadastrado!" });
		}

		await db.collection("users").insertOne({
			name,
			email,
			password: cryptedPassword,
		});

		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const userExists = await db.collection("users").findOne({ email });
		if (!userExists) {
			return res.status(404).send({ message: "Usuário não cadastrado!" });
		}
		const passwordCheck = compareSync(password, userExists.password);
		if (!passwordCheck) {
			return res.status(404).send({ message: "Email e/ou senha incorretos!" });
		}

		const token = uuid();
		await db.collection("sessions").insertOne({
			token,
			userID: userExists._id,
		});
		return res.status(200).send({
			token,
			name: userExists.name,
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.get("/transactions", async (req, res) => {
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
});

app.post("/transactions", async (req, res) => {
	try {
		const { authorization } = req.headers;
		const { value, description, type } = req.body;
		const token = authorization?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).send("sem token aqui");
		}

		const session = await db.collection("sessions").findOne({ token });
		if (!session) {
			return res.status(401).send("nao tem session amigo");
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
});

app.delete("/sign-out", async (req, res) => {
	try {
		const { authorization } = req.headers;
		const token = authorization?.replace("Bearer ", "");
		if (!token) {
			return res.sendStatus(401);
		}

		await db.collection("sessions").deleteOne({ token });
		return res.status(200).send({ message: "Usuário deslogado com sucesso!" });
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.listen(5000, () => console.log("Listening on port 5000..."));
