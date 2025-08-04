import { Hono } from "hono";
import { productsController } from "../controllers/productsController";

export const products = new Hono();

products.get("/", productsController.getAll);
products.get("/:id", productsController.getOne);
products.post("/", productsController.create);
products.put("/:id", productsController.update);
products.post("/upload-image", productsController.uploadImage); // This endpoint should not be used
products.delete("/:id", productsController.delete);
