import { Router, type IRouter } from "express";
import {
  CreateRequestBody,
  ResolveRequestParams,
} from "@workspace/api-zod";
import {
  createRequest,
  listRequests,
  resolveRequest,
} from "../lib/requests-store";

const router: IRouter = Router();

router.get("/requests", (_req, res) => {
  res.json(listRequests());
});

router.post("/requests", (req, res) => {
  const body = CreateRequestBody.parse(req.body);
  const r = createRequest(body);
  res.status(201).json(r);
});

router.post("/requests/:id/resolve", (req, res) => {
  const { id } = ResolveRequestParams.parse(req.params);
  const r = resolveRequest(id);
  if (!r) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(r);
});

export default router;
