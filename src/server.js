const app = require("./app");
const prisma = require("./prisma/client");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
