import makeHttpRequest from './src/makeHttpRequest.js'

/**
 * Plugin de Vue 3: deja la funcion en $httpRequest.
 *
 * El plugin de Vuex que habia aqui se retira: el ecosistema migro a Pinia, y
 * en Pinia se importa la funcion directamente.
 */
export const VueHttpRequestPlugin = {
    install(app) {
        app.config.globalProperties.$httpRequest = makeHttpRequest
    },
}

export default VueHttpRequestPlugin
