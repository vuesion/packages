import { AppDefaultState, IAppState } from './app/state';
import { ICounterState } from './counter/state';
import { IContentfulState } from './contentful/state';

export interface IState {
  [key: string]: any;

  app?: IAppState;
  counter?: ICounterState;
  contentful?: IContentfulState;
}

export const DefaultState: IState = {
  app: {
    ...AppDefaultState(),
  },
};
