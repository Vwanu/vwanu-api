import {Id} from '@feathersjs/feathers'
declare namespace Express {
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
      email: string;
      profilePicture: string;
    };
  }
}
