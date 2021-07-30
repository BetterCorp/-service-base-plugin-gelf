import { CLogger } from "@bettercorp/service-base/lib/ILib";
import * as Gelf from 'gelf-pro';
import * as OS from 'os';
import { Tools } from '@bettercorp/tools/lib/Tools';

export class Logger extends CLogger {
  private _gelf!: any;
  init (): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      self._gelf = Gelf.setConfig(self.appConfig.getPluginConfig<any>(self.pluginName));
      resolve();
    });
  }
  debug (plugin: string, ...data: any[]): void {
    this.log.debug(plugin, data);
  }
  info (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`INFO [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'info',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.log.info(plugin, logData);
      self.log.error(self.pluginName, err);
    });
  }
  warn (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`WARNING [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'warning',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.log.info(plugin, logData);
      self.log.error(self.pluginName, err);
    });
  }
  error (plugin: string, ...data: any[]): void {
    const logData = data[0];
    const self = this;
    self._gelf.info(`ERROR [${plugin.toUpperCase()}] ${Tools.isString(logData) || (Tools.isArray(logData) && Tools.isString(logData[0])) ? logData[0] : ''}`, {
      log: 'error',
      hostname: OS.hostname(),
      plugin: plugin.toUpperCase(),
      workingDir: self.cwd,
      data: JSON.stringify(logData)
    }, (err: any) => {
      if (!err) return;
      self.log.info(plugin, logData);
      self.log.error(self.pluginName, err);
    });
  }
}