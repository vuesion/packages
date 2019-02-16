export interface IContentfulState {
  page: any;
}

export const ContentfulDefaultState = (): IContentfulState => {
  return {
    page: null,
  };
};
