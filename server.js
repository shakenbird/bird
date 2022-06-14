import fastify from "fastify";
import rawBody from 'fastify-raw-body';
import fetch from "node-fetch";
import { InteractionResponseType, InteractionType, verifyKey, } from "discord-interactions";

const server = fastify({
  logger: true,
});

import { INVITE_COMMAND } from './commands.js'

const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&scope=applications.commands`;

server.register(rawBody, {
    runFirst: true,
  });

const guildId = "848630165319581717";

const response = await fetch(
`https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/guilds/${guildId}/commands`,
);

server.get("/", (request, response) => {
  server.log.info("Handling GET request");
});

server.addHook('preHandler', async (request, response) => {
    // We don't want to check GET requests to our root url
    if (request.method === 'POST') {
      const signature = request.headers['x-signature-ed25519'];
      const timestamp = request.headers['x-signature-timestamp'];
      const isValidRequest = verifyKey(
        request.rawBody,
        signature,
        timestamp,
        process.env.PUBLIC_KEY
      );
      if (!isValidRequest) {
        server.log.info('Invalid Request');
        return response.status(401).send({ error: 'Bad request signature ' });
      }
    }
  });

server.post("/", async (request, response) => {
  const message = request.body;

  if (message.type === InteractionType.PING) {
    server.log.info("Handling Ping request");
    response.send({
      type: InteractionResponseType.PONG,
    });
} else if (message.type === InteractionType.APPLICATION_COMMAND) {
    switch (message.data.name.toLowerCase()) {
      case INVITE_COMMAND.name.toLowerCase():
        response.status(200).send({
          type: 4,
          data: {
            content: INVITE_URL,
            flags: 64,
          },
        });
        server.log.info('Invite request');
        break;
      default:
        server.log.error('Unknown Command');
        response.status(400).send({ error: 'Unknown Type' });
        break;
    }
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