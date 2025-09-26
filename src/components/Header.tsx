import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AUTH_EVENTS } from "../utils/auth-events";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Note: L'effet pour scrolled a été supprimé car la variable n'était pas utilisée

  // Animation d'entrée pour le header
  useEffect(() => {
    // Petit délai pour assurer que le reste de la page commence à se charger
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    // Vérifier au chargement
    checkLoginStatus();

    // Écouteurs pour les événements d'authentification personnalisés
    window.addEventListener(AUTH_EVENTS.LOGIN, checkLoginStatus);
    window.addEventListener(AUTH_EVENTS.LOGOUT, checkLoginStatus);

    // Ajouter un écouteur pour détecter les changements de localStorage (pour la compatibilité)
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGIN, checkLoginStatus);
      window.removeEventListener(AUTH_EVENTS.LOGOUT, checkLoginStatus);
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  return (
    //${scrolled ? 'bg-black/50 py-2 shadow-lg' : 'bg-black/20 py-3'}
    <header
      className={`fixed w-full z-50 ${
        isVisible ? "top-6" : "-top-20"
      } flex justify-center px-4 transition-all duration-1000 ease-out`}
    >
      <div
        className={`container mx-auto flex items-center justify-between w-[95%] max-w-3xl rounded-3xl border bg-[#13131366] border-[#ffffff0d] p-3 px-4 sm:px-5 backdrop-blur-3xl transition-all duration-1000 ${
          isVisible ? "opacity-100 transform-none" : "opacity-0 -translate-y-8"
        }`}
      >
        <div className="text-lg sm:text-xl font-semibold text-white">
          <Link to="/" className="transition-colors">
            TuneRate
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/search"
            className="text-white/80 hover:text-white transition"
          >
            Trouver un album
          </Link>
        </nav>

        <div className="hidden md:block">
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full font-medium text-sm transition-colors"
            >
              Mon profil
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full font-medium text-sm transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>

        {/* Menu mobile */}
        <div className="md:hidden">
          <button
            type="button"
            className={`text-white p-2 rounded-full ${
              isMenuOpen ? "bg-white/10" : ""
            } hover:bg-white/10 transition-colors`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant - positionné en dehors du header pour un meilleur placement */}
      {isMenuOpen && (
        <div
          className={`fixed left-0 right-0 z-40 top-24 flex justify-center transition-all duration-500 ${
            isMenuOpen
              ? "opacity-100 transform-none"
              : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="w-[90%] max-w-md mx-auto rounded-3xl border bg-[#13131366] border-[#ffffff0d] p-5 backdrop-blur-3xl shadow-lg animate-fadeIn">
            <nav className="space-y-4">
              <Link
                to="/"
                className="block text-white/90 hover:text-orange-400 py-2 px-4 rounded-lg hover:bg-white/5 transition-all font-medium"
              >
                Accueil
              </Link>
              <Link
                to="/search"
                className="block text-white/80 hover:text-white py-2 px-4 rounded-lg hover:bg-white/5 transition-all"
              >
                Trouver un album
              </Link>
              <div className="pt-3 pb-1">
                {isLoggedIn ? (
                  <Link
                    to="/profile"
                    className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full font-medium text-sm transition-colors"
                  >
                    Mon profil
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center bg-white hover:bg-gray-100 text-black px-4 py-3 rounded-full font-medium text-sm transition-colors"
                  >
                    Se connecter
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
      {/* Styles pour l'animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Effet de flou amélioré pour les appareils qui le supportent */
        @supports (backdrop-filter: blur(15px)) {
          .backdrop-blur-3xl {
            backdrop-filter: blur(25px);
          }
        }
      `}</style>
    </header>
  );
}
