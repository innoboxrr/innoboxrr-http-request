# innoboxrr-http-request

Peticiones HTTP con reintentos y confirmación opcional. Sobre axios.

```
npm i innoboxrr-http-request
```

## Uso

```js
import makeHttpRequest from 'innoboxrr-http-request'

// GET: los datos viajan como query
const posts = await makeHttpRequest('get', route('api.blog.post.index'), { page: 2 }, {}, 3, 1500)

// POST con confirmación
await makeHttpRequest('delete', url, { post_id: 1 }, {}, 0, 1500, {
    title: 'Confirmar operación',
    text: '¿Seguro que quieres borrarlo?',
    icon: 'warning',
    showCancelButton: true,
})
```

Devuelve el **cuerpo** de la respuesta, no la respuesta de axios.

```
makeHttpRequest(method, url, data, headers, maxRetries, retryInterval, confirmOptions, options)
```

| | |
|---|---|
| `data` | En `GET` y `HEAD` viaja como query; en el resto, en el cuerpo. |
| `maxRetries` | Reintentos como máximo. Por defecto 0. |
| `retryInterval` | Espera entre reintentos, en ms. |
| `confirmOptions` | Diálogo de SweetAlert antes de enviar. |
| `options` | `{ timeout, signal, withCredentials }`. El timeout por defecto es 30 s. |

## Reintentos

Solo se reintenta lo que puede ser transitorio:

| | |
|---|---|
| Sin respuesta (red, timeout) | sí |
| `5xx` | sí |
| `429` | sí, respetando el `Retry-After` del servidor |
| `4xx` | **no** |

Reintentar un `422` tres veces es tres veces el mismo error de validación, y un
`403` no se va a arreglar solo.

## Cancelación

```js
import makeHttpRequest, { RequestCancelledError } from 'innoboxrr-http-request'

try {
    await makeHttpRequest('delete', url, data, {}, 0, 1500, confirmOptions)
} catch (error) {
    if (error instanceof RequestCancelledError) {
        return   // el usuario dijo que no; no es un fallo
    }

    mostrarError(error)
}
```

## Vue

```js
import { VueHttpRequestPlugin } from 'innoboxrr-http-request/vue'

app.use(VueHttpRequestPlugin)   // this.$httpRequest
```

## Qué cambió en la 2.0

- **Se reintentaba cualquier error**, incluidos los `4xx`.
- **La confirmación se preguntaba dentro del bucle de reintentos**, así que con
  `maxRetries` podía volver a preguntar.
- **Cancelar lanzaba un `Error` genérico**, indistinguible de un fallo de red.
- **`window.Swal`** lanzaba un `ReferenceError` en Node y en un render de
  servidor, pese a que el paquete se anunciaba "para Node.js y Vue".
- **El paquete no declaraba `type: "module"`** aunque el código es ESM, así que
  Node lo leía como CommonJS y fallaba al importarlo.
- **Sin timeout**: una petición podía quedarse colgada indefinidamente.
- Se retira la dependencia `sweetalert` (v1), que no se usaba en ninguna parte,
  y el plugin de Vuex, porque el ecosistema migró a Pinia.
- El plugin de Vue sale a `innoboxrr-http-request/vue` para que un proyecto
  React no lo arrastre.

El test que había afirmaba que se llamaba a `axios.get(...)`; el código llama a
`axios(config)`. Nunca pasó, y `jest` ni estaba instalado.

## Pruebas

```
npm test
```

## Documentación / Documentation

Documentación completa del ecosistema, en español y en inglés / Full ecosystem documentation, in Spanish and English: <https://innoboxrr.github.io/docs/interfaz/http-rutas-i18n>
