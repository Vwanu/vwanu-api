/** Local dependencies */
// @ts-nocheck
import {
  CLOUDINARY_CONFIG_SCHEMA,
  CLOUDINARY_CONFIG_TYPE,
} from '../schema/mediaConf.schema';
import * as cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from 'config';

const ALL_ALLOW_FORMAT = ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'm4v'];
const RESTRICTED_FORMAT = ['jpg', 'png', 'jpeg'];

const configuration: CLOUDINARY_CONFIG_TYPE = config.get(
  'CLOUDINARY_CONFIGURATION'
);

if (CLOUDINARY_CONFIG_SCHEMA.parse(configuration))
  // @ts-ignore
  cloudinary?.v2?.config(configuration);

const profilePictures = new CloudinaryStorage({
  cloudinary,
  params: {
    allowedFormats: RESTRICTED_FORMAT,
    folder: 'vwanu/profile',
    resource_type: 'auto',
  },
});

const freeMedia = new CloudinaryStorage({
  cloudinary,
  params: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    allowedFormats: RESTRICTED_FORMAT,
    folder: 'vwanu/medias',
    resource_type: 'auto',
  },
});
const postImages = new CloudinaryStorage({
  cloudinary,
  params: {
    allowedFormats: ALL_ALLOW_FORMAT,
    folder: 'vwanu/post',
    resource_type: 'auto',
  },
});

const discussionImages = new CloudinaryStorage({
  cloudinary,
  params: {
    allowedFormats: ALL_ALLOW_FORMAT,
    folder: 'vwanu/post',
    resource_type: 'auto',
  },
});

const messageMedia = new CloudinaryStorage({
  cloudinary,
  params: {
    // @ts-ignore
    allowedFormats: ALL_ALLOW_FORMAT,
    folder: 'vwanu/messages',
    resource_type: 'auto',
  },
});
const blogImages = new CloudinaryStorage({
  cloudinary,
  params: {
    allowedFormats: ALL_ALLOW_FORMAT,
    folder: 'vwanu/blog',
    resource_type: 'auto',
  },
});

const albumImages = new CloudinaryStorage({
  cloudinary,
  params: {
    allowedFormats: ALL_ALLOW_FORMAT,
    folder: 'vwanu/album',
    resource_type: 'auto',
  },
});

export const messageStorage = multer({ storage: messageMedia });
export const postStorage = multer({ storage: postImages });
export const discussionStorage = multer({ storage: discussionImages });
export const blogStorage = multer({ storage: blogImages });
export const profilesStorage = multer({ storage: profilePictures });
export const mediaStorage = multer({ storage: freeMedia });
export const albumStorage = multer({ storage: albumImages });
