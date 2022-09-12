import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import db from "../db/db.js";

async function signUp(req, res) {
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
}

async function login(req, res) {
	try {
		const { email, password } = req.body;

		const userExists = await db.collection("users").findOne({ email });
		if (!userExists) {
			return res.status(404).send({ message: "Usuário não cadastrado!" });
		}
		const passwordCheck = bcrypt.compareSync(password, userExists.password);
		if (!passwordCheck) {
			return res.status(404).send({ message: "Email e/ou senha incorretos!" });
		}

		const token = uuid();
		await db.collection("sessions").insertOne({
			token,
			time: Date.now(),
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
}

async function signOut(req, res) {
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
}

setInterval(async function () {
	try {
		const sessions = await db.collection("sessions").find().toArray();

		sessions.map((session) => {
			let delta = Date.now() - session.time;
			if (delta > 600000) {
				db.collection("sessions").deleteOne({ _id: session._id });
			}
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}, 300000);

export { signUp, login, signOut };
