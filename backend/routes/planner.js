import express from "express";
import { plannerAgent } from "../agents/plannerAgent.js";

const router = express.Router();

// POST /api/planner/query
router.post("/query", async (req, res) => {
    const { role, subjects, availableTime } = req.body;

    try {
        const schedule = await plannerAgent(role, subjects, availableTime);
        res.json({ schedule });
    } catch (err) {
        res.status(500).json({ error: "Planner failed", details: err.message });
    }
});

export default router;
