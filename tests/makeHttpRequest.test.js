import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

import makeHttpRequest, { RequestCancelledError, isRetryable } from '../src/makeHttpRequest.js'

vi.mock('axios')
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

const httpError = (status, headers = {}) => Object.assign(new Error(`HTTP ${status}`), {
    response: { status, headers },
})

const networkError = () => Object.assign(new Error('Network Error'), { response: undefined })

describe('makeHttpRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete globalThis.Swal
        axios.mockResolvedValue({ data: { ok: true } })
    })

    it('devuelve el cuerpo de la respuesta, no la respuesta entera', async () => {
        await expect(makeHttpRequest('get', '/api')).resolves.toEqual({ ok: true })
    })

    it('en GET los datos viajan como query', async () => {
        await makeHttpRequest('get', '/api', { page: 2 })

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            method: 'get',
            url: '/api',
            params: { page: 2 },
        }))

        expect(axios.mock.calls[0][0]).not.toHaveProperty('data')
    })

    it('en POST los datos viajan en el cuerpo', async () => {
        await makeHttpRequest('post', '/api', { title: 'x' })

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({ data: { title: 'x' } }))
        expect(axios.mock.calls[0][0]).not.toHaveProperty('params')
    })

    /**
     * Las rutas generadas leen el id del cuerpo, asi que DELETE lo manda.
     */
    it('en DELETE los datos siguen viajando en el cuerpo', async () => {
        await makeHttpRequest('delete', '/api', { post_id: 1 })

        expect(axios).toHaveBeenCalledWith(expect.objectContaining({ data: { post_id: 1 } }))
    })

    it('lleva un timeout por defecto', async () => {
        await makeHttpRequest('get', '/api')

        expect(axios.mock.calls[0][0].timeout).toBe(30000)
    })

    it('el timeout se puede cambiar', async () => {
        await makeHttpRequest('get', '/api', {}, {}, 0, 1500, null, { timeout: 500 })

        expect(axios.mock.calls[0][0].timeout).toBe(500)
    })
})

describe('reintentos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete globalThis.Swal
    })

    it('reintenta un fallo de red', async () => {
        axios.mockRejectedValueOnce(networkError()).mockResolvedValue({ data: { ok: true } })

        await expect(makeHttpRequest('get', '/api', {}, {}, 3, 0)).resolves.toEqual({ ok: true })
        expect(axios).toHaveBeenCalledTimes(2)
    })

    it('reintenta un 500', async () => {
        axios.mockRejectedValueOnce(httpError(503)).mockResolvedValue({ data: { ok: true } })

        await expect(makeHttpRequest('get', '/api', {}, {}, 3, 0)).resolves.toEqual({ ok: true })
        expect(axios).toHaveBeenCalledTimes(2)
    })

    /**
     * Reintentar un 422 tres veces es tres veces el mismo error de validacion,
     * y un 403 no se va a arreglar solo. La version anterior reintentaba todo.
     */
    it('no reintenta un error del cliente', async () => {
        axios.mockRejectedValue(httpError(422))

        await expect(makeHttpRequest('post', '/api', {}, {}, 3, 0)).rejects.toThrow()
        expect(axios).toHaveBeenCalledTimes(1)
    })

    it('no reintenta un 403 ni un 404', async () => {
        for (const status of [403, 404]) {
            vi.clearAllMocks()
            axios.mockRejectedValue(httpError(status))

            await expect(makeHttpRequest('get', '/api', {}, {}, 3, 0)).rejects.toThrow()
            expect(axios).toHaveBeenCalledTimes(1)
        }
    })

    it('un 429 si se reintenta', async () => {
        axios.mockRejectedValueOnce(httpError(429)).mockResolvedValue({ data: { ok: true } })

        await expect(makeHttpRequest('get', '/api', {}, {}, 3, 0)).resolves.toEqual({ ok: true })
        expect(axios).toHaveBeenCalledTimes(2)
    })

    it('respeta el Retry-After de un 429', async () => {
        vi.useFakeTimers()

        axios.mockRejectedValueOnce(httpError(429, { 'retry-after': '2' })).mockResolvedValue({ data: { ok: true } })

        const promise = makeHttpRequest('get', '/api', {}, {}, 1, 50)

        await vi.advanceTimersByTimeAsync(1999)
        expect(axios).toHaveBeenCalledTimes(1)

        await vi.advanceTimersByTimeAsync(2)
        await promise

        expect(axios).toHaveBeenCalledTimes(2)

        vi.useRealTimers()
    })

    it('se rinde tras maxRetries', async () => {
        axios.mockRejectedValue(networkError())

        await expect(makeHttpRequest('get', '/api', {}, {}, 2, 0)).rejects.toThrow('Network Error')
        expect(axios).toHaveBeenCalledTimes(3)
    })

    it('sin reintentos, un solo intento', async () => {
        axios.mockRejectedValue(networkError())

        await expect(makeHttpRequest('get', '/api')).rejects.toThrow()
        expect(axios).toHaveBeenCalledTimes(1)
    })
})

describe('confirmacion', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        axios.mockResolvedValue({ data: { ok: true } })
    })

    it('no lanza la peticion si el usuario cancela', async () => {
        globalThis.Swal = { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) }

        await expect(makeHttpRequest('post', '/api', {}, {}, 0, 0, { title: '¿Seguro?' }))
            .rejects.toBeInstanceOf(RequestCancelledError)

        expect(axios).not.toHaveBeenCalled()
    })

    it('la lanza si confirma', async () => {
        globalThis.Swal = { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) }

        await expect(makeHttpRequest('post', '/api', {}, {}, 0, 0, { title: '¿Seguro?' }))
            .resolves.toEqual({ ok: true })

        expect(axios).toHaveBeenCalledTimes(1)
    })

    /**
     * La cancelacion era un Error generico, indistinguible de un fallo de red:
     * quien llamaba no podia saber si mostrar un error o callarse.
     */
    it('la cancelacion se distingue de un fallo', async () => {
        globalThis.Swal = { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) }

        const error = await makeHttpRequest('post', '/api', {}, {}, 0, 0, {}).catch((e) => e)

        expect(error.cancelled).toBe(true)
        expect(error.name).toBe('RequestCancelledError')
    })

    /**
     * Antes se preguntaba solo en el primer intento, dentro del bucle de
     * reintentos. Ahora se pregunta una vez, fuera.
     */
    it('solo pregunta una vez aunque haya reintentos', async () => {
        const fire = vi.fn().mockResolvedValue({ isConfirmed: true })

        globalThis.Swal = { fire }
        axios.mockRejectedValueOnce(networkError()).mockResolvedValue({ data: { ok: true } })

        await makeHttpRequest('post', '/api', {}, {}, 3, 0, { title: '¿Seguro?' })

        expect(fire).toHaveBeenCalledTimes(1)
    })

    /**
     * `window` no existe en Node ni en un render de servidor: leerlo
     * directamente lanzaba antes de llegar a la peticion.
     */
    it('sin Swal global usa el importado, sin tocar window', async () => {
        delete globalThis.Swal

        const { default: Swal } = await import('sweetalert2')

        Swal.fire.mockResolvedValue({ isConfirmed: true })

        await expect(makeHttpRequest('post', '/api', {}, {}, 0, 0, {})).resolves.toEqual({ ok: true })
    })
})

describe('isRetryable', () => {
    it('decide por el codigo', () => {
        expect(isRetryable(networkError())).toBe(true)
        expect(isRetryable(httpError(500))).toBe(true)
        expect(isRetryable(httpError(429))).toBe(true)
        expect(isRetryable(httpError(422))).toBe(false)
        expect(isRetryable(httpError(401))).toBe(false)
        expect(isRetryable(new RequestCancelledError())).toBe(false)
    })
})
