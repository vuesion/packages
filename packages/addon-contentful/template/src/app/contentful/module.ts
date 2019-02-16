import { Module } from 'vuex';
import { IState } from '../state';
import { ContentfulDefaultState, IContentfulState } from './state';
import { ContentfulActions } from './actions';
import { ContentfulGetters } from './getters';
import { ContentfulMutations } from './mutations';

export const ContentfulModule: Module<IContentfulState, IState> = {
  namespaced: true,
  actions: {
    ...ContentfulActions,
  },
  getters: {
    ...ContentfulGetters,
  },
  state: {
    ...ContentfulDefaultState(),
  },
  mutations: {
    ...ContentfulMutations,
  },
};
