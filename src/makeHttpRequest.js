import axios from 'axios'
import SwalImported from 'sweetalert2'

/**
 * Se lanza cuando el usuario cancela en el diálogo de confirmación.
 *
 * Antes esto era un `Error` genérico, indistinguible de un fallo de red: quien
 * llamaba no podía saber si mostrar un mensaje de error o callarse.
 */
export class RequestCancelledError extends Error {
    constructor(message = 'Operación cancelada por el usuario') {
        super(message)

        this.name = 'RequestCancelledError'
        this.cancelled = true
    }
}

/**
 * Los códigos que merecen un reintento.
 *
 * Reintentar un 422 tres veces es tres veces el mismo error de validación, y
 * un 403 no se va a arreglar solo. Solo se reintenta lo que puede ser
 * transitorio: un fallo de red (sin respuesta), un 5xx, o un 429 —donde además
 * se respeta el `Retry-After` que mande el servidor—.
 *
 * @param {any} error
 * @returns {boolean}
 */
export function isRetryable(error) {
    if (error?.cancelled) {
        return false
    }

    const status = error?.response?.status

    // Sin respuesta es un fallo de red o un timeout.
    if (status === undefined) {
        return true
    }

    return status === 429 || status >= 500
}

/**
 * @param {any} error
 * @param {number} fallback
 * @returns {number}  milisegundos
 */
const waitFor = (error, fallback) => {
    const header = error?.response?.headers?.['retry-after']

    if (! header) {
        return fallback
    }

    const seconds = Number(header)

    return Number.isFinite(seconds) ? seconds * 1000 : fallback
}

/**
 * Realiza una solicitud HTTP con reintentos y confirmación opcional.
 *
 * @param {string} method El método HTTP.
 * @param {string} url La URL.
 * @param {object} [data={}] Datos; en GET viajan como query.
 * @param {object} [headers={}] Cabeceras.
 * @param {number} [maxRetries=0] Reintentos como máximo.
 * @param {number} [retryInterval=1500] Espera entre reintentos, en ms.
 * @param {object|null} [confirmOptions=null] Diálogo de SweetAlert antes de enviar.
 * @param {{timeout?: number, signal?: AbortSignal, withCredentials?: boolean}} [options={}]
 * @returns {Promise<any>} El cuerpo de la respuesta.
 */
const makeHttpRequest = async (
    method,
    url,
    data = {},
    headers = {},
    maxRetries = 0,
    retryInterval = 1500,
    confirmOptions = null,
    options = {}
) => {
    // `window` no existe en Node ni en un render de servidor: leerlo
    // directamente lanzaba un ReferenceError antes de llegar a la petición.
    const Swal = globalThis.Swal ?? SwalImported

    if (confirmOptions) {
        const result = await Swal.fire(confirmOptions)

        if (! result?.isConfirmed) {
            throw new RequestCancelledError()
        }
    }

    const verb = String(method).toLowerCase()

    const config = {
        method: verb,
        url,
        headers,
        timeout: options.timeout ?? 30000,
        signal: options.signal,
        withCredentials: options.withCredentials,
        // GET y HEAD no llevan cuerpo: sus datos van en la query. DELETE sí lo
        // manda, como hasta ahora: las rutas generadas leen el id del cuerpo.
        ...(['get', 'head'].includes(verb) ? { params: data } : { data }),
    }

    const attempt = async (retry) => {
        try {
            return (await axios(config)).data
        } catch (error) {
            if (retry >= maxRetries || ! isRetryable(error)) {
                throw error
            }

            await new Promise((resolve) => setTimeout(resolve, waitFor(error, retryInterval)))

            return attempt(retry + 1)
        }
    }

    return attempt(0)
}

export default makeHttpRequest
