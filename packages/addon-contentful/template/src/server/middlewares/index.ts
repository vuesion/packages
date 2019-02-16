import * as Express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { ContentfulMiddleware } from '@vuesion/addon-contentful';

export const applyMiddlewares = (app: Express.Application) => {
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(compression({ threshold: 0 }));
  app.use(
    '/cms',
    ContentfulMiddleware({
      space: process.env.CONTENTFUL_SPACE_ID,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      preview: true,
      syncIntervalInSeconds: 30,
    }),
  );
};
