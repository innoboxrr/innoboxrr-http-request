// src/index.js
import makeHttpRequest from './makeHttpRequest';

const HttpRequestPlugin = {
    install(app) {
        app.config.globalProperties.$httpRequest = makeHttpRequest;
    }
};

// Exporta la función para uso general y el plugin para Vue
export { makeHttpRequest, HttpRequestPlugin };
export default makeHttpRequest;
