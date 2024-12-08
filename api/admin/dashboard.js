import express from "express";

import * as controller from "../../controllers/admin/dashboard.js";

const dashboardRoutes = express.Router()

dashboardRoutes.get("/", controller.index);

export default dashboardRoutes;