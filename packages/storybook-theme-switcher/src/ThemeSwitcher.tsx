import React from 'react';
import { STORY_RENDERED } from '@storybook/core-events';
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
import { styled } from '@storybook/theming';

const createItem = (id: string, title: string, change: any) => ({
  id,
  title,
  onClick: () => {
    change({ id, title });
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

  constructor(props: any) {
    super(props);

    this.state = {
      themes: [],
      selected: null,
    };

    this.listener = () => {
      const data = props.api.getCurrentStoryData();
      const parameters = data ? data.parameters : null;
      let themes = (parameters && parameters.themeSwitcher && parameters.themeSwitcher.themes) || [];

      themes = themes.map(({ label, value }: any) => createItem(value, label, this.change));

      if (themes.length === 0 || this.state.selected) {
        return;
      }

      this.setState({
        themes,
        selected: themes[0],
      });

      (document as any).querySelector('#storybook-preview-iframe').contentDocument.documentElement.className =
        themes[0].id;
    };
  }

  public change = (selected: any) => this.setState({ selected: selected });

  public componentDidMount() {
    const { api } = this.props;
    api.on(STORY_RENDERED, this.listener);
  }

  public render() {
    const { selected, themes } = this.state;
    return themes.length > 0 ? (
      <WithTooltip
        placement="top"
        trigger="click"
        onVisibleChange={(s: any) => this.setState({ expanded: s })}
        tooltip={<TooltipLinkList links={themes} />}
        closeOnOutsideClick
      >
        <IconButtonWithLabel key="theme" title="Change the application theme">
          <Icons icon="eye" />
          <IconButtonLabel>{selected.title}</IconButtonLabel>
        </IconButtonWithLabel>
      </WithTooltip>
    ) : null;
  }
}
