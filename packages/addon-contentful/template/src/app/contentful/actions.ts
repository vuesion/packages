import { ActionContext } from 'vuex';
import { IContentfulState } from './state';
import { IState } from '../state';
import { HttpService } from '@/app/shared/services/HttpService/HttpService';

export interface IContentfulResponse {
  count: number;
}

export interface IContentfulActions {
  getContent(context: ActionContext<IContentfulState, IState>, params: { slug: string; locale: string }): Promise<any>;
}

export const ContentfulActions: IContentfulActions = {
  async getContent({ commit }: ActionContext<IContentfulState, IState>, params: { slug: string; locale: string }) {
    try {
      const res = await HttpService.get<IContentfulResponse>('/cms', { params });

      commit('SET_PAGE', res.data);
    } catch (e) {
      commit('SET_PAGE', null);
      throw e;
    }
  },
};
