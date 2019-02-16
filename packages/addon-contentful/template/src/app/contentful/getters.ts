import { IContentfulState } from './state';

export interface IContentfulGetters {
  page(state: IContentfulState): any;
}

export const ContentfulGetters: IContentfulGetters = {
  page(state: IContentfulState): any {
    return state.page;
  },
};
