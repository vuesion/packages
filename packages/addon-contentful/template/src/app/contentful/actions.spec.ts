import MockAdapter from 'axios-mock-adapter';
import { HttpService } from '@/app/shared/services/HttpService/HttpService';
import { ActionContext, Commit, Dispatch } from 'vuex';
import { ContentfulActions } from './actions';
import { ContentfulDefaultState, IContentfulState } from './state';
import { IState } from '../state';

describe('ContentfulActions', () => {
  let testContext: ActionContext<IContentfulState, IState>;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    testContext = {
      dispatch: jest.fn() as Dispatch,
      commit: jest.fn() as Commit,
      state: ContentfulDefaultState(),
    } as ActionContext<IContentfulState, IState>;

    mockAxios = new MockAdapter(HttpService);
  });

  test('it should call SET_PAGE action on success', async () => {
    const commitMock: jest.Mock = testContext.commit as jest.Mock;

    mockAxios.onGet('/cms').reply(200, 'foo');

    await ContentfulActions.getContent(testContext, { slug: '/test', locale: 'en' });

    expect(commitMock.mock.calls[0]).toEqual(['SET_PAGE', 'foo']);
  });

  test('it should call SET_PAGE action on failure', async () => {
    const commitMock: jest.Mock = testContext.commit as jest.Mock;
    let message = '';

    mockAxios.onGet('/cms').reply(500, 'foo');

    try {
      await ContentfulActions.getContent(testContext, { slug: '/test', locale: 'en' });
    } catch (e) {
      message = e.message;
    }

    expect(commitMock.mock.calls[0]).toEqual(['SET_PAGE', null]);

    expect(message).toBe('Request failed with status code 500');
  });
});
