import { Request, Response, NextFunction } from "express";
import * as http from "http";
import * as sharp from "sharp";
import { Duplex } from "stream";
import {
  getContentType,
  getContentTypeFromId,
  getExtension,
  getSize,
  ImageSizeName,
} from "./image";

const CACHE_CONTROL_VALUE = "public, max-age=5184000";

const sendImage = (stream: Duplex, res: Response, ext: string) => {
  res.setHeader("content-type", getContentType(ext));
  res.setHeader("cache-control", CACHE_CONTROL_VALUE); // 60 days
  let length = 0;
  stream.on("data", (chunk) => {
    length += chunk.length;
    res.setHeader("content-length", length);
  });

  stream.pipe(res);
};

const headersToDelete = [
  "x-amz-id-2",
  "accept-ranges",
  "etag",
  "server",
  "x-amz-request-id",
  "connection",
  "last-modified",
];

const handleResponse = (
  id: string,
  ext: string,
  size: ImageSizeName,
  res: Response
) => (response: http.IncomingMessage) => {
  headersToDelete.forEach((header) => {
    delete response.headers[header];
  });

  const originalContentType = getContentTypeFromId(id);
  const originalExt = getExtension(originalContentType);

  if (size === ImageSizeName.ORIGINAL && ext === originalExt) {
    response.headers["cache-control"] = CACHE_CONTROL_VALUE;
    res.writeHead(response.statusCode || 200, response.headers);
    response.pipe(res);
    return;
  }

  let instance = sharp();
  if (ext !== originalExt) {
    instance = instance.toFormat(ext);
  }
  if (size !== ImageSizeName.ORIGINAL) {
    const newSize = getSize(size);
    instance = instance.resize(newSize);
  }

  sendImage(response.pipe(instance), res, ext);
};

export default (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const ext = req.params.ext;
  const size = req.params.size as ImageSizeName;
  const originalExt = getExtension(getContentTypeFromId(id));

  const host = "s3.eu-central-1.amazonaws.com";

  const path = `/media.ournetcdn.net/images/${id.substring(0,4)}/${id}.${originalExt}`;

  const options = { timeout: 3000, method: "GET", host, path };

  http
    .get(options, handleResponse(id, ext, size, res))
    .on("error", (error: any) => next(error));
};
