import { ContentfulMutations } from './mutations';
import { ContentfulDefaultState, IContentfulState } from './state';

describe('ContentfulMutations', () => {
  let testState: IContentfulState;

  beforeEach(() => {
    testState = ContentfulDefaultState();
  });

  test('it should set page', () => {
    ContentfulMutations.SET_PAGE(testState, 1337);
    expect(testState.page).toBe(1337);
  });
});
