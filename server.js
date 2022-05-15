import fastify from "fastify";
import { InteractionResponseType, InteractionType } from "discord-interactions";

const server = fastify({
  logger: true,
});

server.get("/", (request, response) => {
  server.log.info("Handling GET request");
});

server.post("/", async (request, response) => {
  const message = request.body;

  if (message.type === InteractionType.PING) {
    server.log.info("Handling Ping request");
    response.send({
      type: InteractionResponseType.PONG,
    });
  } else {
    server.log.error("Unknown Type");
    response.status(400).send({ error: "Unknown Type" });
  }
});

server.listen(3000, async (error, address) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }
  server.log.info(`server listening on ${address}`);
});