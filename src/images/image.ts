export enum ImageSizeName {
  ORIGINAL = "ORIGINAL",
  LARGE = "LARGE",
  MEDIUM = "MEDIUM",
  SMALL = "SMALL",
  THUMBNAIL = "THUMBNAIL",
}

export const getContentTypeFromId = (id: string) => {
  const e = id[id.length - 1];
  switch (e) {
    case "j":
      return "image/jpeg";
    case "w":
      return "mage/webp";
    case "p":
      return "image/png";
    default:
      throw new Error(`Invalid image id: ${id}`);
  }
};

export const getExtension = (contentType: string) => {
  const ext = contentType
    .toLowerCase()
    .trim()
    .replace(/^image\//, "");
  if (!["jpeg", "png", "webp"].includes(ext))
    throw new Error(`Invalid image content type: ${contentType}`);

  return ext;
};

export const getContentType = (ext: string) => {
  return `image/${ext}`;
};

export const getSize = (name: ImageSizeName) => {
  switch (name) {
    case ImageSizeName.THUMBNAIL:
      return 180;
    case ImageSizeName.SMALL:
      return 320;
    case ImageSizeName.MEDIUM:
      return 640;
    case ImageSizeName.LARGE:
      return 1024;
    default:
      throw new Error(`Invalid image size: ${name}`);
  }
};
