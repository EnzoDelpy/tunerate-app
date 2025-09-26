// Événement personnalisé pour la gestion de l'authentification
export const AUTH_EVENTS = {
  LOGIN: "auth:login",
  LOGOUT: "auth:logout",
};

// Fonctions pour émettre les événements d'authentification
export const authEvents = {
  emitLogin: () => {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN));
  },

  emitLogout: () => {
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
  },
};
