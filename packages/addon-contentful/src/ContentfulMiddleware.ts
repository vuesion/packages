import { ContentfulClientApi, createClient, CreateClientParams, Entry, EntryCollection } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Request, Response } from 'express';

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
  const getProperties = (fields: any, locale: string = options.defaultLocale, result: any = {}) => {
    Object.keys(fields).map((key) => {
      if (fields[key].hasOwnProperty(locale)) {
        const item = fields[key][locale];
        let property: any;

        if (typeof item !== 'object') {
          property = result[key] = item;
        } else if (item.hasOwnProperty('fields')) {
          property = result[key] = getProperties(item.fields, locale);
        } else if (item.hasOwnProperty('nodeType') && item.nodeType === 'document') {
          property = result[key] = documentToHtmlString(item);
        } else if (Array.isArray(item)) {
          property = result[key] = item.map((e) => getProperties(e, locale));
        } else {
          property = result[key] = item;
        }

        return property;
      }
    });

    return result;
  };
  const transformContentfulPageToVue = (page: Entry<any>, locale: string): IContentfulPage => {
    if (!page) {
      return null;
    }

    return {
      slug: getLocaleValue(page.fields.slug, locale),
      title: getLocaleValue(page.fields.title, locale),
      metaDescription: getLocaleValue(page.fields.metaDescription, locale),
      contentItems: getLocaleValue(page.fields.contentItems, locale).map((item: Entry<any>) => {
        return {
          component: item.sys.contentType.sys.id,
          properties: getProperties(item.fields, locale),
        };
      }),
    };
  };

  return (req: Request, res: Response) => {
    const slug: string = req.query.slug || '/';
    const locale: string = req.query.locale;
    const entry: Entry<any> = entries.find((p: Entry<any>) => getLocaleValue(p.fields.slug, locale) === slug);
    let page: IContentfulPage;

    try {
      page = transformContentfulPageToVue(entry, locale);
    } catch (e) {
      page = null;
    }

    if (page) {
      res.status(200).json(page);
    } else {
      res.status(404).json({ message: 'not found' });
    }
  };
};
