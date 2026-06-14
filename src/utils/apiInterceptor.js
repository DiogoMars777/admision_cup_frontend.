
import { toast } from 'react-hot-toast';

// Almacenamiento en memoria para la caché global (simple y efectivo)
const cacheStorage = new Map();

export const applyGlobalInterceptor = (apiInstance) => {
  // 1. Interceptor de PETICIÓN (Request) - Para servir desde caché
  apiInstance.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    
    // Solo cacheamos GET
    if (method === 'get') {
      const key = config.url + (config.params ? JSON.stringify(config.params) : '');
      const cachedResponse = cacheStorage.get(key);
      
      // Si existe y no han pasado 2 minutos (120,000 ms)
      if (cachedResponse && (Date.now() - cachedResponse.timestamp < 120000)) {
        // En Axios, para cancelar y devolver inmediatamente, necesitamos hacer un pequeño truco
        // Lanzamos un error especial que luego capturamos
        return Promise.reject({ isCached: true, data: cachedResponse.data, config });
      }
    }
    return config;
  });

  // 2. Interceptor de RESPUESTA (Response) - Para guardar en caché y manejar errores
  apiInstance.interceptors.response.use(
    (response) => {
      const method = response.config.method?.toLowerCase();
      
      // Si es un GET exitoso, lo guardamos en caché
      if (method === 'get') {
        const key = response.config.url + (response.config.params ? JSON.stringify(response.config.params) : '');
        cacheStorage.set(key, {
          timestamp: Date.now(),
          data: response.data
        });
      }

      // Si es una mutación (POST, PUT, DELETE), vaciamos TODO el caché
      if (['post', 'put', 'patch', 'delete'].includes(method)) {
        cacheStorage.clear();

        // Mostrar mensaje de éxito (ignorando login)
        if (!response.config.url.includes('/login') && !response.config.url.includes('/logout')) {
            const msg = response.data?.message || 'Operación completada exitosamente.';
            toast.success(msg);
        }
      }
      return response;
    },
    (error) => {
      // Si el error es nuestra "respuesta en caché" simulada, la resolvemos como éxito!
      if (error.isCached) {
        return Promise.resolve({ data: error.data, config: error.config, status: 200, statusText: 'OK (Cached)' });
      }

      let msg = error.response?.data?.message || error.response?.data?.error || 'Ocurrió un error inesperado en el servidor.';
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        msg = errors[firstErrorKey][0];
      }

      if (error.config && !error.config.url.includes('/login')) {
          toast.error(msg);
      }
      return Promise.reject(error);
    }
  );
  
  return apiInstance;
};
