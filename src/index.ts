import express, { type Application } from "express";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import User from "./models/user.model";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app: Application = express();

console.log(`Environment: ${env.ENVIRONMENT}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await connectDB();

    await User.init();

    app.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

export default app;
