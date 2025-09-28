import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import 'dotenv/config'

import chalk from 'chalk';

export const log = console.log;

import plannerRoutes from "./routes/planner.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
    log(chalk.green(`API Check Status, ${new Date().toISOString()}`));
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    log(chalk.blue(`API Root Endpoint, ${new Date().toISOString()}`));
    res.send("Welcome to BTS: Back to School OnBoard Challenge");
});

app.use("/api/planner", plannerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
