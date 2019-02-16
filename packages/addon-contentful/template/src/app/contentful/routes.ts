import { RouteConfig } from 'vue-router/types/router';

export const ContentfulRoutes: RouteConfig[] = [
  {
    path: '*',
    component: () =>
      import(/* webpackChunkName: "contentful" */ './Contentful/Contentful.vue').then((m: any) => m.default),
  },
];
