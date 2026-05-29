
interface ApiErrorLike {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: any;
  };
}


const extractBackendValidation = (data: any): string => {
  if (!data) return '';

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e: any) => e?.defaultMessage || e?.message || e?.msg)
      .filter(Boolean)
      .join(' ');
  }

  if (typeof data === 'string') return data;

  return data.message || data.error || '';
};

const looksHuman = (text: string): boolean => {
  if (!text) return false;
  if (text.length > 160) return false;
  const technical = /(exception|stacktrace|null|undefined|com\.|java\.|org\.|\{|\}|\[object)/i;
  return !technical.test(text);
};

export const getFriendlyError = (
  error: unknown,
  fallback = 'Algo salió mal. Por favor, inténtalo de nuevo.'
): string => {
  const err = error as ApiErrorLike;


  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
  }

  const status = err.response.status ?? 0;
  const backendMessage = extractBackendValidation(err.response.data);

  switch (status) {
    case 400:
    case 422:
      
      return looksHuman(backendMessage)
        ? backendMessage
        : 'Revisa la información ingresada; parece que hay algo incorrecto.';

    case 401:
      return 'Tus datos no son correctos o tu sesión expiró. Inténtalo de nuevo.';

    case 403:
      return 'No tienes permiso para realizar esta acción.';

    case 404:
      return 'No encontramos lo que buscabas. Es posible que ya no exista.';

    case 409:
      return 'Esta acción no se puede completar en este momento. Actualiza la página e inténtalo de nuevo.';

    case 413:
      return 'La imagen es demasiado grande. Intenta con una más liviana.';

    case 415:
      return 'El formato del archivo no es válido. Usa una imagen JPG o PNG.';

    case 429:
      return 'Has hecho demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.';

    default:
      if (status >= 500) {
        return 'El servidor tuvo un problema inesperado. Inténtalo de nuevo en unos momentos.';
      }
      return looksHuman(backendMessage) ? backendMessage : fallback;
  }
};
