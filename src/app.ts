require("dotenv").config();

import * as express from "express";
import { logger } from "./logger";
import imageHandler from "./images/image-handler";
import { NextFunction, Response, Request } from "express";
import { ImageSizeName } from "./images/image";
const cors = require("cors");
const PORT = process.env.PORT;

async function start() {
  const server = express();

  server.disable("x-powered-by");

  server.use(cors());

  const path = `/images/:size(${Object.values(ImageSizeName)
    .map((it) => it.toLowerCase())
    .join("|")})/:id.:ext(jpeg|png|webp)`;
  server.get(path, imageHandler);

  server.use((_req, res) => res.sendStatus(404).end());

  server.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error(err.message, err);
      res.status(500).send(err.message);
    }
  );

  await server.listen(PORT);
}

// process.on("unhandledRejection", function(error: Error) {
//   logger.error("unhandledRejection: " + error.message, error);
// });

process.on("uncaughtException", function (error: Error) {
  logger.error("uncaughtException: " + error.message, error);
});

start()
  .then(() => logger.warn(`Listening at ${PORT}`))
  .catch((e) => {
    logger.error(e);
  });
