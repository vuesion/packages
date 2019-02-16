import { IContentfulState } from './state';

export interface IContentfulMutations {
  SET_PAGE(state: IContentfulState, page: any): void;
}

export const ContentfulMutations: IContentfulMutations = {
  SET_PAGE: (state: IContentfulState, page: any) => {
    state.page = page;
  },
};
