// // app/api/upload/route.ts
// import { NextResponse } from 'next/server';
// import multer from 'multer';
// import path from 'path';
// import nextConnect from 'next-connect';
// import { NextRequest } from 'next/server';

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: './public/images/',
//     filename: (req, file, cb) => cb(null, file.originalname),
//   }),
// });

// const uploadMiddleware = nextConnect<NextRequest, NextResponse>({
//   onError(error, req, res) {
//     res.status(500).json({ error: `Error: ${error.message}` });
//   },
// }).use(upload.single('image'));

// export const POST = async (req: NextRequest, res: NextResponse) => {
//   await uploadMiddleware(req as any, res as any);

//   // @ts-ignore
//   const file = req.file;

//   return NextResponse.json({ filePath: `/images/${file.filename}` });
// };

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
