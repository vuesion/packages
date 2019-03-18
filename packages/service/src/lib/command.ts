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

export interface IRunOptions {
  debug?: boolean;
}

export interface ICommandHandler {
  run(args: string[], options?: IRunOptions);
}

const getCommand = (args: any) => {
  const max = args.length;
  let command = null;

  for (let i = 0; i < max; i++) {
    if (args[i].parent) {
      command = args[i];
      break;
    }
  }

  return command;
};

const getOptions = (obj: any): string[] => {
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
  meta = Object.assign({ alias: null, options: [], arguments: [] }, meta);

  return (Target) => {
    const target: ICommandHandler = new Target();
    const command = commander.command(meta.name);

    command.allowUnknownOption();
    command.alias(meta.alias);
    command.description(meta.description);

    meta.options.forEach((option: IOption) => {
      if (option.formatter) {
        command.option(option.flags, option.description, option.formatter, option.defaultValue);
      } else {
        command.option(option.flags, option.description, option.defaultValue);
      }
    });

    meta.arguments.forEach((arg: IArgument) => {
      if (arg.required) {
        command.arguments(`<${arg.name}>`);
      } else {
        command.arguments(`[${arg.name}]`);
      }
    });

    command.action(function() {
      const hasArgs = meta.arguments.length > 0;
      const localCommand = getCommand(arguments);
      const options = getOptions(localCommand);
      const args = localCommand.parent.rawArgs.splice(3);

      options.forEach((option: string) => (target[option] = localCommand[option]));

      if (hasArgs) {
        meta.arguments.forEach((arg: IArgument, idx: number) => {
          target[arg.name] = arguments[idx] ? arguments[idx] : arg.defaultValue;
        });
      }

      target.run(args.filter((arg: string) => ['--debug'].indexOf(arg) === -1), { debug: !!localCommand.parent.debug });
    });

    return target;
  };
}
