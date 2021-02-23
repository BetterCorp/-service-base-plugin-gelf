import { ILogger, PluginFeature } from "@bettercorp/service-base/lib/ILib";
import * as Gelf from 'gelf-pro';
import * as OS from 'os';
import { Logger as DefaultLogger } from '@bettercorp/service-base/lib/DefaultLogger';
import { Tools } from '@bettercorp/tools/lib/Tools';

export class Logger implements ILogger {
  private _gelf!: any;
  private features!: PluginFeature;
  private defaultLogger: ILogger = new DefaultLogger();
  init (features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      await self.defaultLogger.init(features);
      self.features = features;
      self._gelf = Gelf.setConfig(features.getPluginConfig() || {});
      resolve();
    });
  }
  debug (plugin: string, ...data: any[]): void {
    this.defaultLogger.debug(plugin, data);
  }
  info (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`INFO [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'info',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.features.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.defaultLogger.info(plugin, logData);
      self.defaultLogger.error(self.features.pluginName, err);
    });
  }
  warn (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`WARNING [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'warning',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.features.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.defaultLogger.info(plugin, logData);
      self.defaultLogger.error(self.features.pluginName, err);
    });
  }
  error (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`ERROR [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'error',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.features.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.defaultLogger.info(plugin, logData);
      self.defaultLogger.error(self.features.pluginName, err);
    });
  }
}