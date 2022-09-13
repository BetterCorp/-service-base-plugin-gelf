import { IPluginLogger, LoggerBase, LogMeta } from "@bettercorp/service-base";
import { PluginConfig } from "./sec.config";
import * as Gelf from "gelf-pro";
import * as OS from "os";

export class Logger extends LoggerBase<PluginConfig> {
  private _gelf!: Gelf.Logger;
  private async gelf(): Promise<Gelf.Logger> {
    if (this._gelf !== undefined) return this._gelf;
    this._gelf = Gelf.setConfig(await this.getPluginConfig());
    return this._gelf;
  }
  constructor(pluginName: string, cwd: string, defaultLogger: IPluginLogger) {
    super(pluginName, cwd, defaultLogger);
  }

  public async reportStat(
    plugin: string,
    key: string,
    value: number
  ): Promise<void> {
    if (!this.runningDebug) return;
  }
  public async debug<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {}
  public async info<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    if (this.runningLive && hasPIData === true) return;
    let formattedMessage = this.formatLog<T>(message, meta);
    formattedMessage = `[${plugin.toUpperCase()}] ${formattedMessage}`;
    const self = this;
    return new Promise(async (res, rej) =>
      (await this.gelf()).message(
        formattedMessage,
        6,
        {
          ...meta,
          _hostname: OS.hostname(),
          _plugin: plugin.toUpperCase(),
          _workingDir: self.cwd,
        },
        (err: any) => {
          if (!err) return res();
          self.log.fatal(err);
          rej(err);
        }
      )
    );
  }
  public async warn<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    if (this.runningLive && hasPIData === true) return;
    let formattedMessage = this.formatLog<T>(message, meta);
    formattedMessage = `[WARN] [${plugin.toUpperCase()}] ${formattedMessage}`;
    const self = this;
    return new Promise(async (res, rej) =>
      (await this.gelf()).message(
        formattedMessage,
        4,
        {
          ...meta,
          _hostname: OS.hostname(),
          _plugin: plugin.toUpperCase(),
          _workingDir: self.cwd,
        },
        (err: any) => {
          if (!err) return res();
          self.log.fatal(err);
          rej(err);
        }
      )
    );
  }
  public async error<T extends string>(
    plugin: string,
    message: T,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void>;
  public async error(plugin: string, error: Error): Promise<void>;
  public async error<T extends string>(
    plugin: string,
    messageOrError: T | Error,
    meta?: LogMeta<T>,
    hasPIData?: boolean
  ): Promise<void> {
    let message: string =
      typeof messageOrError === "string"
        ? messageOrError
        : messageOrError.message;
    if (this.runningLive && hasPIData === true) return;
    let additionalmeta: any = {};
    if (
      typeof messageOrError !== "string" &&
      messageOrError.stack !== undefined
    ) {
      additionalmeta.stack = messageOrError.stack;
    }

    let formattedMessage = this.formatLog<T>(message as any, meta);
    formattedMessage = `[${plugin.toUpperCase()}] ${formattedMessage}`;
    const self = this;
    return new Promise(async (res, rej) =>
      (await this.gelf()).message(
        formattedMessage,
        6,
        {
          ...meta,
          ...additionalmeta,
          _hostname: OS.hostname(),
          _plugin: plugin.toUpperCase(),
          _workingDir: self.cwd,
        },
        (err: any) => {
          if (!err) return res();
          self.log.fatal(err);
          rej(err);
        }
      )
    );
  }
}
