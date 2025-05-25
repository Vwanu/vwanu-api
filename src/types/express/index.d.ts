import {Id} from '@feathersjs/feathers'
import 'express';

declare global {
  namespace Express {
    interface Request {
      token: string;
      files: File[];
      file: File;
      user: { 
        id: Id;
        username: string;
        emailVerified: boolean;
        firstName: string;
        lastName: string;
        email?: string;
        profilePicture?: string;
      };
    }
  }
}

export {};