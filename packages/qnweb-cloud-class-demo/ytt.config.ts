import { ChangeCase, defineConfig, ExtendedInterface, ServerConfig } from 'yapi-to-typescript';

const getRequestFunctionName = (interfaceInfo: ExtendedInterface, changeCase: ChangeCase): string => {
  const pathName = interfaceInfo.path
    .replace(/^\/v\d+/g, ''); // 去掉版本号
  // .replace(/\/{\w+}/g, '') // 去掉参数
  return changeCase.pascalCase(`${interfaceInfo.method}${pathName}`);
};

const getRequestDataTypeName = (interfaceInfo: ExtendedInterface, changeCase: ChangeCase): string => {
  return changeCase.pascalCase(`${getRequestFunctionName(interfaceInfo, changeCase)}Params`);
};

const getResponseDataTypeName = (interfaceInfo: ExtendedInterface, changeCase: ChangeCase): string => {
  return changeCase.pascalCase(`${getRequestFunctionName(interfaceInfo, changeCase)}Result`);
};

const createConfig = (config: Pick<ServerConfig, 'projects'>): ServerConfig => {
  return {
    serverUrl: 'http://pili-yapi.aslan.qa.qiniu.io',
    typesOnly: true,
    target: 'typescript',
    reactHooks: {
      enabled: false,
    },
    prodEnvName: 'production',
    // requestFunctionFilePath: 'src/api/request.ts',
    // dataKey: 'data',
    projects: config.projects.map(project => {
      return {
        getRequestFunctionName,
        getRequestDataTypeName,
        getResponseDataTypeName,
        ...project,
      };
    })
  };
};

export default defineConfig([
  createConfig({
    projects: [
      {
        outputFilePath: 'src/api/_types/cube.ts',
        token: 'cdf5d301849b701a2fcb079e2479a1de7727cb89ada2a722b6f2591f3b61488f',
        categories: [
          { id: 277, },
          { id: 380, },
          { id: 383, },
          { id: 386, },
          { id: 388, },
          { id: 420, },
          { id: 377, },
          { id: 284, },
          { id: 371, },
          { id: 302, },
          { id: 374, },
          { id: 291, },
          { id: 295, },
          { id: 368 },
        ]
      },
    ],
  })
]);
