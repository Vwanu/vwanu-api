import { Response, NextFunction } from 'express';

export default (req: any, res: Response, next: NextFunction) => {
  const { method } = req;
  if (method === 'GET' || method === 'DELETE') return next();
  console.log(req.file);
  if (req.files) {
    req.feathers.file = req.files;
    req.feathers.files = req.files;
    req.body.UploadedMedia = req.files;
    // const body = [];

    // eslint-disable-next-line no-restricted-syntax
    // for (const file of req.files)
    //   body.push({
    //     description: req.body.description,
    //     orignalName: file.originalname,
    //     newNameWithPath: file.path,
    //     userId: req.user.id,
    //   });
    // req.body = method === 'POST' ? body : body[0];
  }

  return next();
};
