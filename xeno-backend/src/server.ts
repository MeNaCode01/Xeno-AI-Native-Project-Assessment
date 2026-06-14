console.log("Starting server...");
console.log("Initializing Prisma...");
import "dotenv/config";
import app from "./app";

console.log("Registering routes...");

const PORT = Number(process.env.PORT) || 3000;

console.log("Listening...");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});

