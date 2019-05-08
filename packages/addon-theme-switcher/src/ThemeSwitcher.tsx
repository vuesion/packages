import React from 'react';
import { SET_STORIES } from '@storybook/core-events';
// @ts-ignore
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
import { styled } from '@storybook/theming';

const createItem = (id: string, title: string, change: any) => ({
  id,
  title,
  onClick: () => {
    change({ selected: { id, title }, expanded: false });
    (document as any).querySelector('#storybook-preview-iframe').contentDocument.documentElement.className = id;
  },
});
const IconButtonWithLabel: any = styled(IconButton)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
}));
const IconButtonLabel: any = styled.div(({ theme }) => ({
  fontSize: theme.typography.size.s2 - 1,
  marginLeft: '10px',
}));

export class ThemeSwitcher extends React.Component<any, any> {
  public listener: any;
  public document: any = null;

  constructor(props: any) {
    super(props);

    this.state = {
      themes: [],
      selected: null,
      expanded: false,
    };

    this.listener = () => {
      const themes = props.api
        .getCurrentStoryData()
        .parameters.themeSwitcher.themes.map(({ label, value }: any) => createItem(value, label, this.change));

      this.setState({
        themes,
        selected: themes[0],
      });

      (document as any).querySelector('#storybook-preview-iframe').contentDocument.documentElement.className =
        themes[0].id;
    };
  }

  // @ts-ignore
  public change = (...args: any) => this.setState(...args);

  public componentDidMount() {
    const { api } = this.props;
    api.on(SET_STORIES, this.listener);
  }

  public render() {
    const { selected, themes, expanded } = this.state;
    return themes.length > 0 ? (
      <WithTooltip
        placement="top"
        trigger="click"
        tooltipShown={expanded}
        onVisibilityChange={(s: any) => this.setState({ expanded: s })}
        tooltip={<TooltipLinkList links={themes} />}
        closeOnClick
      >
        <IconButtonWithLabel key="theme" title="Change the application theme">
          <Icons icon="eye" />
          <IconButtonLabel>{selected.title}</IconButtonLabel>
        </IconButtonWithLabel>
      </WithTooltip>
    ) : null;
  }
}
