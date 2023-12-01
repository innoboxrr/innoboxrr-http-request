// test/makeHttpRequest.test.js
import makeHttpRequest from '../src/makeHttpRequest';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('makeHttpRequest', () => {
    it('should handle a GET request correctly', async () => {
        // Configura una respuesta simulada
        const mockResponse = { data: { success: true, data: [1, 2, 3] } };
        axios.get.mockResolvedValue(mockResponse);

        // Realiza la solicitud GET
        const response = await makeHttpRequest('GET', 'https://api.example.com/data');

        // Verifica que la respuesta sea como se espera
        expect(response).toEqual(mockResponse.data);

        // Verifica que se haya llamado a axios con los parámetros correctos
        expect(axios.get).toHaveBeenCalledWith('https://api.example.com/data', {
            headers: {}, // o los headers que esperas por defecto
        });
    });

    // Aquí puedes añadir más tests para otros métodos HTTP y casos de uso
});
