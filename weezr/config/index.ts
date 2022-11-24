import { ENV } from "../constants/env";
import configLocal from "./local";
import configDev from "./dev";
import configProd from "./prod";

// eslint-disable-next-line import/no-mutable-exports
let config: any = configLocal;

switch (ENV) {
    case 'local':
        config = configLocal;
        break;
    case 'dev':
        config = configDev;
        break;
    case 'prod':
        config = configProd;
        break;
    default:
        break;
}

export default config;
