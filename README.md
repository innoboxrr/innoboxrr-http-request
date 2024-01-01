# HTTP Request Handler 🌐

[![NPM version](https://img.shields.io/npm/v/innoboxrr-http-request.svg)](https://www.npmjs.com/package/innoboxrr-http-request)
[![Build Status](https://img.shields.io/travis/com/tu-username/innoboxrr-http-request/master.svg)](https://travis-ci.com/tu-username/innoboxrr-http-request)
[![Coverage Status](https://coveralls.io/repos/github/tu-username/innoboxrr-http-request/badge.svg?branch=master)](https://coveralls.io/github/tu-username/http-request-handler?branch=master)

Un manejador de solicitudes HTTP flexible para Node.js y Vue, que facilita la realización de solicitudes HTTP con diversas opciones de configuración.

## 🚀 Instalación

```bash
npm install innoboxrr-http-request
```

o si usas yarn:

```bash
yarn add innoboxrr-http-request
```

## 📘 Uso

### En un módulo ES6

Importa y utiliza `makeHttpRequest` directamente en tu módulo ES6.

```javascript
import makeHttpRequest from 'innoboxrr-http-request';

// Utiliza makeHttpRequest...
makeHttpRequest('GET', 'https://api.example.com/data')
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error);
  });
```

### En Vue 3

Registra `VueHttpRequestPlugin` en tu aplicación Vue para acceder a él globalmente.

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { VueHttpRequestPlugin } from 'innoboxrr-http-request';

const app = createApp(App);
app.use(VueHttpRequestPlugin);

app.mount('#app');
```

En tus componentes Vue, puedes acceder a la función a través de `this.$httpRequest`.

```javascript
export default {
  mounted() {
    this.$httpRequest('GET', 'https://api.example.com/data')
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  }
};
```

### En Vuex

Utiliza VuexHttpRequestPlugin para inyectar la función en tu store de Vuex.

```javascript
import Vuex from 'vuex';
import { VuexHttpRequestPlugin } from 'innoboxrr-http-request';

const store = new Vuex.Store({
    // Tu configuración de Vuex...
    plugins: [VuexHttpRequestPlugin]
});
```
Luego, en tus acciones Vuex:

```javascript
// En un módulo Vuex
actions: {
    fetchData({ commit }) {
        this.$httpRequest('GET', 'https://api.example.com')
            .then(response => {
                commit('setData', response);
            })
            .catch(error => {
                console.error(error);
            });
    }
}
```
Ejemplo completo: 

``` javascript 
import makeHttpRequest from './makeHttpRequest'; // Asegúrate de que la ruta sea correcta

// Datos a enviar en la solicitud POST
const postData = {
  key1: 'value1',
  key2: 'value2'
};

// Encabezados personalizados para la solicitud
const customHeaders = {
  'Authorization': 'Bearer token',
  'Content-Type': 'application/json'
};

// Opciones de confirmación para Sweet Alert
const confirmOptions = {
  title: '¿Estás seguro?',
  text: "¡No podrás revertir esto!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Sí, ¡hazlo!'
};

// Uso de la función makeHttpRequest
makeHttpRequest(
  'POST',                            // Método HTTP
  'https://api.example.com/data',    // URL de la solicitud
  postData,                          // Datos a enviar
  customHeaders,                     // Encabezados personalizados
  3,                                 // Número máximo de reintentos
  2000,                              // Intervalo entre reintentos en milisegundos
  confirmOptions                     // Opciones para la confirmación con Sweet Alert
)
.then(data => {
  console.log('Respuesta recibida:', data);
})
.catch(error => {
  console.error('Ocurrió un error en la solicitud:', error);
});
```

## 🔍 Documentación

Para más información sobre cómo utilizar `innoboxrr-http-request`, consulta la [documentación completa](#).

## 🤝 Contribuciones

Las contribuciones son siempre bienvenidas! Por favor, lee el [documento de contribución](CONTRIBUTING.md) para saber cómo puedes contribuir.

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](LICENSE) para más información.
