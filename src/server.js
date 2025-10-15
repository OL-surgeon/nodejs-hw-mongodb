// import express from 'express';
// import pino from 'pino-http';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
// import { contactsRouter } from './routers/contacts.js';
// import { contactsRout } from './routes/contacts.js';
// import { errorHandler } from './middlewares/errorHandler.js';
// import { notFoundHandler } from './middlewares/notFoundHandler.js';
// import { authRouter } from './routers/auth.js';
// dotenv.config();

// export const setupServer = () => {
//   const PORT = Number(contactsRout('PORT', '3000'));
//   const app = express();

//   app.use(express.json());
//   app.use(cors());
//   app.use(cookieParser());
//   app.use(
//     pino({
//       transport: {
//         target: 'pino-pretty',
//       },
//     }),
//   );

//   app.get('/', (req, res) => {
//     res.json({
//       message: 'Hello MongoDB!',
//     });
//   });

//   app.use('/contacts', contactsRouter);
//   app.use('/auth', authRouter);
//   app.use(notFoundHandler);

//   app.use(errorHandler);

//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// };
// src/server.js
import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import router from './routers/index.js';
import { getEnvVar } from './utils/getEnvVar.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

export const setupServer = () => {
  const PORT = Number(getEnvVar('PORT', '3000'));
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello MongoDB!',
    });
  });

  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
