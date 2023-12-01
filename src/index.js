import makeHttpRequest from './makeHttpRequest';

const VueHttpRequestPlugin = {
    install(app) {
        app.config.globalProperties.$httpRequest = makeHttpRequest;
    }
};

const VuexHttpRequestPlugin = store => {
    store.$httpRequest = makeHttpRequest;
};

// Exporta la función para uso general, el plugin para Vue y el plugin para Vuex
export { makeHttpRequest, VueHttpRequestPlugin, VuexHttpRequestPlugin };

export default makeHttpRequest;
