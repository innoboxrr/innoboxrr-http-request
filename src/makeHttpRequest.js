import axios from 'axios';
import SwalImported from 'sweetalert2';

/**
 * Realiza una solicitud HTTP con Axios de manera flexible y con opciones de reintentos y confirmación.
 *
 * @param {string} method El método HTTP (GET, POST, PUT, DELETE, PATCH, etc.).
 * @param {string} url La URL de la solicitud.
 * @param {Object} [data={}] Los datos a enviar en la solicitud.
 * @param {Object} [headers={}] Los encabezados personalizados de la solicitud.
 * @param {number} [maxRetries=0] Número máximo de reintentos.
 * @param {number} [retryInterval=1500] Intervalo entre reintentos en milisegundos.
 * @param {Object} [confirmOptions=null] Opciones para la confirmación con Sweet Alert.
 * @returns {Promise} Promesa con la respuesta de la solicitud.
 */
const makeHttpRequest = async (method, url, data = {}, headers = {}, maxRetries = 0, retryInterval = 1500, confirmOptions = null) => {
    // Usar Swal global si está disponible, de lo contrario usar la versión importada
    const Swal = window.Swal || SwalImported;

    const makeRequest = async (retryCount) => {
        try {
            if (confirmOptions && retryCount === 0) {
                const result = await Swal.fire(confirmOptions);
                if (!result.isConfirmed) {
                    throw new Error('Operación cancelada por el usuario');
                }
            }

            const response = await axios({ method, url, headers, data });
            return response.data;
        } catch (error) {
            if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryInterval));
                return makeRequest(retryCount + 1);
            } else {
                throw error;
            }
        }
    };

    return makeRequest(0);
};

export default makeHttpRequest;
