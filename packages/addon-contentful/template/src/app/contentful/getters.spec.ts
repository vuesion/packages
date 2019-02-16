import { ContentfulGetters } from './getters';
import { ContentfulDefaultState, IContentfulState } from './state';

describe('ContentfulGetters', () => {
  let testState: IContentfulState;

  beforeEach(() => {
    testState = ContentfulDefaultState();
  });

  test('it should get the page', () => {
    expect(ContentfulGetters.page(testState)).toBe(null);
  });
});
