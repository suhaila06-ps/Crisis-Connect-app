import { Router, type IRouter } from "express";
import {
  CreateAlertBody,
  ListAlertsQueryParams,
  UpdateAlertStatusParams,
  UpdateAlertStatusBody,
} from "@workspace/api-zod";
import {
  createAlert,
  getStats,
  listAlerts,
  updateAlertStatus,
} from "../lib/alerts-store";

const router: IRouter = Router();

router.get("/alerts", (req, res) => {
  const params = ListAlertsQueryParams.parse(req.query);
  res.json(listAlerts(params));
});

router.post("/alerts", (req, res) => {
  const body = CreateAlertBody.parse(req.body);
  const alert = createAlert(body);
  res.status(201).json(alert);
});

router.get("/alerts/stats", (_req, res) => {
  res.json(getStats());
});

router.put("/alerts/:id", (req, res) => {
  const { id } = UpdateAlertStatusParams.parse(req.params);
  const body = UpdateAlertStatusBody.parse(req.body);
  const updated = updateAlertStatus(id, body.status);
  if (!updated) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(updated);
});

export default router;
