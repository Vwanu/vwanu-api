import  { Response, Request, NextFunction } from 'express';

import { Application } from '../../declarations';
import signup, { SignupInput } from './signup';
import signIn, { SignInInput } from './signIn';
import { BadRequest } from '@feathersjs/errors';


// signup service
export default  (app: Application) => (req: Request<any, any, SignInInput | SignupInput>, res: Response<SignInInput | SignupInput>, next: NextFunction) => {
    switch(req.path.split('/')[1]) {
    case 'signup':
      return signup(app)(req as Request<any, any, SignupInput>, res as Response<SignupInput>, next);
    case 'signin':
      return signIn(app)(req as Request<any, any, SignInInput>, res as Response<SignInInput>, next);
    default:
      throw new BadRequest('Invalid request');
    }
}