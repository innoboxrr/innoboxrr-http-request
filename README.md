```
# HTTP Request Handler 🌐

[![NPM version](https://img.shields.io/npm/v/http-request-handler.svg)](https://www.npmjs.com/package/http-request-handler)
[![Build Status](https://img.shields.io/travis/com/tu-username/http-request-handler/master.svg)](https://travis-ci.com/tu-username/http-request-handler)
[![Coverage Status](https://coveralls.io/repos/github/tu-username/http-request-handler/badge.svg?branch=master)](https://coveralls.io/github/tu-username/http-request-handler?branch=master)

Un manejador de solicitudes HTTP flexible para Node.js y Vue, que facilita la realización de solicitudes HTTP con diversas opciones de configuración.

## 🚀 Instalación

```bash
npm install http-request-handler
```

o si usas yarn:

```bash
yarn add http-request-handler
```

## 📘 Uso

### En un módulo ES6

Importa y utiliza `makeHttpRequest` directamente en tu módulo ES6.

```javascript
import makeHttpRequest from 'http-request-handler';

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

Registra `HttpRequestPlugin` en tu aplicación Vue para acceder a él globalmente.

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { HttpRequestPlugin } from 'http-request-handler';

const app = createApp(App);
app.use(HttpRequestPlugin);

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

## 🔍 Documentación

Para más información sobre cómo utilizar `http-request-handler`, consulta la [documentación completa](#).

## 🤝 Contribuciones

Las contribuciones son siempre bienvenidas! Por favor, lee el [documento de contribución](CONTRIBUTING.md) para saber cómo puedes contribuir.

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](LICENSE) para más información.
