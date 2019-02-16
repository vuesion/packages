import { ActionContext } from 'vuex';
import { IContentfulState } from './state';
import { IState } from '../state';
import { HttpService } from '@/app/shared/services/HttpService/HttpService';
import { AxiosResponse, AxiosError } from 'axios';

export interface IContentfulResponse {
  count: number;
}

export interface IContentfulActions {
  getContent(context: ActionContext<IContentfulState, IState>, params: { slug: string; locale: string }): Promise<any>;
}

export const ContentfulActions: IContentfulActions = {
  getContent(
    { commit, state }: ActionContext<IContentfulState, IState>,
    params: { slug: string; locale: string },
  ): Promise<any> {
    return HttpService.get('/cms', { params })
      .then((res: AxiosResponse<IContentfulResponse>) => {
        commit('SET_PAGE', res.data);
      })
      .catch((e: AxiosError) => {
        commit('SET_PAGE', null);
        throw e;
      });
  },
};
