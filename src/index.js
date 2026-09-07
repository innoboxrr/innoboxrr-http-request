/**
 * innoboxrr-http-request
 *
 * El nucleo no depende de ningun framework. El plugin de Vue vive en su propio
 * punto de entrada para que un proyecto React no lo arrastre:
 *
 *     import makeHttpRequest from 'innoboxrr-http-request'
 *     import { VueHttpRequestPlugin } from 'innoboxrr-http-request/vue'
 */

export { default, default as makeHttpRequest, RequestCancelledError, isRetryable } from './makeHttpRequest.js'
