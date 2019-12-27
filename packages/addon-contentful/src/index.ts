import { AppRouter, AppState, ModuleRoutes, ExpressMiddlewares } from '@vuesion/models';
import { Isomorphic } from './Isomorphic';

export default async () => {
  AppRouter.addModule('contentful');
  AppState.addModule('contentful');

  const appRoutes = new ModuleRoutes('app');

  appRoutes.removeRoute('/not-found');
  appRoutes.removeRoute('*');

  ExpressMiddlewares.addImport("import { ContentfulMiddleware } from '@vuesion/addon-contentful';");
  ExpressMiddlewares.addMiddleware(`app.use(
  '/cms',
  ContentfulMiddleware({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    preview: true,
    syncIntervalInSeconds: 30,
  }),
);`);

  const isomorphic = new Isomorphic();
  isomorphic.transform();
};
