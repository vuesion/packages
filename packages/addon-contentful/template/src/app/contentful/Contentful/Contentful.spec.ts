import { createLocalVue, mount } from '@vue/test-utils';
import Vuex, { ActionTree, GetterTree, Store } from 'vuex';
import Contentful from './Contentful.vue';
import { ContentfulGetters, IContentfulGetters } from '../getters';
import { ContentfulDefaultState, IContentfulState } from '../state';
import { ContentfulActions, IContentfulActions } from '../actions';
import { i18n } from '../../shared/plugins/i18n/i18n';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('Contentful.vue', () => {
  let store: Store<IContentfulState>;
  let getters: GetterTree<IContentfulState, IContentfulGetters>;
  let actions: ActionTree<IContentfulState, IContentfulActions>;
  let state: IContentfulState;

  beforeEach(() => {
    getters = {
      ...ContentfulGetters,
      page() {
        return {
          slug: '/test',
          title: 'This is my first Page',
          metaDescription: 'First page bla bla bla',
          contentItems: [
            {
              component: 'text',
              properties: {
                text:
                  '# This is a test\n\n## wh000t?\n\nThis is a text that should be rendered with a markdown component\n\n`test`\n\n- test\n- test\n- test',
              },
            },
            {
              component: 'text',
              properties: { text: '## This is another component!\n\ntest test test' },
            },
            {
              component: 'gallery',
              properties: {
                images: [
                  {
                    title: 'logo',
                    file: {
                      url:
                        '//images.ctfassets.net/p6newip3ed3b/3DYahkHkbKCCmWCC4wkCCQ/7166f8289adf34ffa8853dc473d4175c/logo.png',
                      fileName: 'logo.png',
                      contentType: 'image/png',
                    },
                  },
                  {
                    title: 'icon-144x144',
                    file: {
                      url:
                        '//images.ctfassets.net/p6newip3ed3b/2V6YjNuju0Am4seYQsa0W0/9d7d4bcb5f8766d3b8c17aea81354236/icon-144x144.png',
                      fileName: 'icon-144x144.png',
                      contentType: 'image/png',
                    },
                  },
                ],
              },
            },
          ],
        };
      },
    };
    actions = {
      ...ContentfulActions,
    };
    state = {
      ...ContentfulDefaultState(),
    };

    store = new Vuex.Store({
      modules: {
        contentful: {
          namespaced: true,
          getters,
          actions,
          state,
        },
        app: {
          namespaced: true,
          getters: {
            getLocale(): string {
              return 'en';
            },
          },
        },
      },
    } as any);
  });

  test('renders component with content', () => {
    const wrapper = mount(Contentful, {
      store,
      localVue,
      i18n,
    });

    expect(wrapper.find('h1').text()).toBe('This is a test');

    expect((wrapper as any).vm.$options.metaInfo.apply(wrapper.vm)).toEqual({
      meta: [
        {
          content: 'First page bla bla bla',
          name: 'description',
        },
      ],
      title: 'This is my first Page',
    });
  });

  test('dispatches action on the server', () => {
    store.dispatch = jest.fn();

    Contentful.prefetch({ store, route: { path: '/test' } });

    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(`contentful/getContent`, { locale: 'en', slug: '/test' });
  });
});
