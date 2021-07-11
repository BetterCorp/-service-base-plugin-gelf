export default () => {
  return {
    adapterName: "udp",
    adapterOptions: {
      host: "127.0.0.1",
      port: 12201,
      family: 4,
      timeout: 10000
    }
  };
}