import { Router, type IRouter } from "express";
import healthRouter from "./health";
import alertsRouter from "./alerts";
import requestsRouter from "./requests";
import chatRouter from "./chat";
import evacuationRouter from "./evacuation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(alertsRouter);
router.use(requestsRouter);
router.use(chatRouter);
router.use(evacuationRouter);

export default router;
