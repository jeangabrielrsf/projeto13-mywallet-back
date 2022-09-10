import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt, { compareSync } from "bcrypt";

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
		console.log(compareSync("1234567", cryptedPassword));

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
		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.listen(5000, () => console.log("Listening on port 5000..."));
