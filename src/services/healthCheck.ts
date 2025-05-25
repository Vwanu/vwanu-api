import { Response } from 'express';

export default (_, res:Response) => {
    res.status(200).json({ status: 'healthy', dummy: true, version: process.env.VERSION || '0.0' });
  }