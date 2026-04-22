import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/evacuation", (_req, res) => {
  res.json({
    instructions: [
      "Stay calm and move quickly — do not run.",
      "Use the nearest staircase. Do NOT use elevators.",
      "Follow the illuminated EXIT signs along the corridor.",
      "Exit via the main lobby and gather at the assembly point across the street.",
      "If a corridor is blocked by smoke, close the door and stay low near a window.",
      "Once safely outside, do not re-enter the building until staff give the all-clear.",
    ],
  });
});

export default router;
