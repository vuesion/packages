import { ContentfulClientApi, createClient, CreateClientParams, Entry, EntryCollection } from 'contentful';
import { Request, Response } from 'express';
import * as _ from 'lodash';

export interface IContentfulMiddlewareOptions extends CreateClientParams {
  space: string;
  accessToken: string;
  preview?: boolean;
  syncIntervalInSeconds?: number;
  defaultLocale?: string;
}

export interface IContentfulPage {
  slug: string;
  title: string;
  metaDescription: string;
  contentItems: Array<{ component: string; properties: any }>;
}

export const ContentfulMiddleware = (options: IContentfulMiddlewareOptions) => {
  options.defaultLocale = options.defaultLocale || 'en';

  if (!options.accessToken || !options.space) {
    console.warn('You have to provide "accessToken" and "space". Contentful middleware not applied.'); // tslint:disable-line

    return (req: Request, res: Response, next: any) => {
      next();
    };
  }

  let entries: Array<Entry<any>>;

  const host: string = options.preview ? 'preview.contentful.com' : 'cdn.contentful.com';
  const client: ContentfulClientApi = createClient({ ...options, host });
  const sync = () => {
    client
      .getEntries({ content_type: 'page', include: 6, locale: '*' })
      .then((contentTypes: EntryCollection<any>) => (entries = contentTypes.items))
      .catch((e: Error) => console.error(e)); // tslint:disable-line
  };

  sync();

  setInterval(() => sync(), options.syncIntervalInSeconds * 1000 || 300000);

  const getLocaleValue = (item: any, locale: string): any => {
    if (item[locale]) {
      return item[locale];
    }

    return item[options.defaultLocale];
  };
  const getProperties = (item: Entry<any>, locale: string) => {
    const properties: any = {};

    Object.keys(item.fields).forEach((key: string) => {
      const value: any | any[] = getLocaleValue(item.fields[key], locale);

      if (_.isArray(value)) {
        properties[key] = value.map((entry: Entry<any>) => {
          const prop: any = {};

          Object.keys(entry.fields).forEach((k: string) => {
            prop[k] = getLocaleValue(entry.fields[k], locale);
          });

          return prop;
        });
      } else {
        properties[key] = value;
      }
    });

    return properties;
  };
  const transformContentfulPageToVue = (page: Entry<any>, locale: string): IContentfulPage => {
    return {
      slug: getLocaleValue(page.fields.slug, locale),
      title: getLocaleValue(page.fields.title, locale),
      metaDescription: getLocaleValue(page.fields.metaDescription, locale),
      contentItems: getLocaleValue(page.fields.contentItems, locale).map((item: Entry<any>) => {
        return {
          component: item.sys.contentType.sys.id,
          properties: getProperties(item, locale),
        };
      }),
    };
  };

  return (req: Request, res: Response) => {
    const slug: string = req.query.slug || '/';
    const locale: string = req.query.locale;
    const entry: Entry<any> = entries.find((p: Entry<any>) => getLocaleValue(p.fields.slug, locale) === slug);

    if (entry) {
      res.status(200).json(transformContentfulPageToVue(entry, locale));
    } else {
      res.status(404).json({ message: 'not found' });
    }
  };
};
