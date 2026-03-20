// Emby 服务器配置
export const config = {
  // 服务器地址
  serverUrl: import.meta.env.VITE_EMBY_SERVER_URL,

  // 设备信息
  deviceId: import.meta.env.VITE_EMBY_DEVICE_ID,
  clientName: import.meta.env.VITE_EMBY_CLIENT_NAME,
  version: import.meta.env.VITE_EMBY_VERSION,

  // 是否启用调试模式
  debug: false,
};

export default config;
