import express, { type Application } from "express";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;
const ENVIRONMENT: string = process.env.ENVIRONMENT || "development";

console.log(`Environment: ${ENVIRONMENT}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
