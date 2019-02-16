/* tslint:disable:only-arrow-functions */
import * as commander from 'commander';
import * as _ from 'lodash';

export interface ICommandMetadata {
  name: string;
  description: string;
  alias?: string;
  options?: IOption[];
  arguments?: IArgument[];
}

export interface IOption {
  flags: string;
  description?: string;
  formatter?: any;
  defaultValue?: any;
}

export interface IArgument {
  name: string;
  required?: boolean;
  defaultValue?: string;
}

export interface ICommandHandler {
  run(args: string[], silent: boolean);
}

const getProperties = (obj: any): string[] => {
  const result = [];
  for (const property in obj) {
    if (
      obj.hasOwnProperty(property) &&
      !property.startsWith('_') &&
      ['commands', 'options', 'parent'].indexOf(property) === -1
    ) {
      result.push(property);
    }
  }
  return result;
};

export function Command(meta: ICommandMetadata): any {
  return (Target) => {
    const target = new Target();
    const command = commander.command(meta.name);

    command.allowUnknownOption();

    if (meta.alias) {
      command.alias(meta.alias);
    }

    if (meta.description) {
      command.description(meta.description);
    }

    if (meta.options) {
      meta.options.forEach((option: IOption) => {
        if (option.formatter) {
          command.option(option.flags, option.description, option.formatter, option.defaultValue);
        } else {
          command.option(option.flags, option.description, option.defaultValue);
        }
      });
    }

    if (meta.arguments) {
      meta.arguments.forEach((arg: IArgument) => {
        if (arg.required) {
          command.arguments(`<${arg.name}>`);
        } else {
          command.arguments(`[${arg.name}]`);
        }
      });
    }

    command.action(function() {
      const hasArgs = meta.arguments ? meta.arguments.length > 0 : false;
      const data = hasArgs ? arguments[meta.arguments.length] : arguments[0];
      const options = getProperties(data);
      let args = (data && data.parent && data.parent.rawArgs.splice(3)) || [];
      const silent = !!(data && data.parent && data.parent.silent);

      if (_.isArray(data)) {
        args = data;
      } else {
        options.forEach((option: any) => (target[option] = data[option]));
      }

      if (hasArgs) {
        meta.arguments.forEach((arg: IArgument, idx: number) => {
          target[arg.name] = arguments[idx] ? arguments[idx] : arg.defaultValue;
        });
      }

      target.run(args, silent);
    });

    return target;
  };
}
