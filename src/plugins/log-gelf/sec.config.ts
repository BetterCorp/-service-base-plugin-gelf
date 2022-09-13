import { IPluginConfig, SecConfig } from "@bettercorp/service-base";

export enum AdapterName {
  UDP = "udp",
  TCP = "tcp",
  TLS = "tcp-tls",
}

export interface AdapterOptions {
  host: string;
  port: number;
  family: number;
  timeout: number;
}

export interface PluginConfig extends IPluginConfig {
  adapterName: AdapterName;
  adapterOptions: AdapterOptions;
}

export class Config extends SecConfig<PluginConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: PluginConfig
  ): PluginConfig {
    return {
      adapterName: existingConfig.adapterName || AdapterName.UDP,
      adapterOptions: {
        host: (existingConfig.adapterOptions || {}).host || "127.0.0.1",
        port: (existingConfig.adapterOptions || {}).port || 12201,
        family: (existingConfig.adapterOptions || {}).family || 4,
        timeout: (existingConfig.adapterOptions || {}).timeout || 10000,
      },
    };
  }
}
