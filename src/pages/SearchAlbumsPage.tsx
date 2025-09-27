import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { albumsApi, type Album } from "../api/api";

export default function SearchAlbumsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  // Nous n'avons plus besoin de filtrer les albums car cela se fait côté API
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Filtrage désormais géré directement par l'API
  const albumsPerPage = 10;

  // Animation d'entrée
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const searchAlbums = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage(null); // Réinitialiser le message d'erreur à chaque nouvelle recherche
    setCurrentPage(1); // Réinitialiser la pagination pour une nouvelle recherche

    try {
      // Appel à l'API pour rechercher des albums (première page)
      const data = await albumsApi.searchAlbums(searchQuery, 1, albumsPerPage);
      setAlbums(data);

      // Vérifie si on a atteint la fin des résultats
      setHasMoreAlbums(data.length === albumsPerPage);
    } catch (error) {
      console.error("Erreur lors de la recherche d'albums:", error);
      setAlbums([]);
      setHasMoreAlbums(false);

      // Afficher un message d'erreur convivial
      // Vérifier si l'erreur a une structure d'erreur axios
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 400) {
        setErrorMessage(
          "La recherche n'a pas pu être effectuée. Veuillez vérifier votre requête."
        );
      } else {
        setErrorMessage(
          "Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger plus d'albums
  // Nous n'avons plus besoin de filtrer par type car cela se fait côté API

  const loadMoreAlbums = async () => {
    if (isLoading || isLoadingMore || !hasMoreAlbums) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const moreAlbums = await albumsApi.searchAlbums(
        searchQuery,
        nextPage,
        albumsPerPage
      );

      // Ajouter les nouveaux albums à la liste existante tout en évitant les doublons
      setAlbums((prevAlbums) => {
        // Créer un Set des IDs existants pour éviter les doublons
        // Utiliser plusieurs critères pour la détection
        const existingExternalIds = new Set(
          prevAlbums.map((album) => album.externalId)
        );
        const existingUniqueIds = new Set(
          prevAlbums.map((album) => album._uniqueId)
        );

        // Filtrer les nouveaux albums pour n'ajouter que ceux qui ne sont pas déjà présents
        const uniqueNewAlbums = moreAlbums.filter((album) => {
          // Vérifier l'ID unique généré par le backend
          if (album._uniqueId && existingUniqueIds.has(album._uniqueId)) {
            return false;
          }

          // Vérifier également l'ID externe
          if (album.externalId && existingExternalIds.has(album.externalId)) {
            return false;
          }

          return true;
        });

        return [...prevAlbums, ...uniqueNewAlbums];
      });

      // Mettre à jour la page courante
      setCurrentPage(nextPage);

      // Vérifier s'il y a encore d'autres albums à charger
      setHasMoreAlbums(moreAlbums.length === albumsPerPage);
    } catch (error) {
      console.error("Erreur lors du chargement de plus d'albums:", error);
      setErrorMessage(
        "Impossible de charger plus d'albums. Veuillez réessayer."
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-neutral-950 text-white">
      <div
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Trouver un album
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Recherchez parmi des milliers d'albums et découvrez de nouvelles
            musiques qui correspondent à vos goûts musicaux
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <form
            onSubmit={searchAlbums}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher un album ou un artiste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 rounded-full bg-neutral-800/60 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Rechercher
                </>
              )}
            </button>
          </form>
        </div>

        {hasSearched && (
          <div
            className="transition-all duration-500"
            style={{
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            <h2 className="text-xl font-semibold mb-6">
              {albums.length > 0
                ? `${albums.length} album${albums.length > 1 ? "s" : ""} ou EP${
                    albums.length > 1 ? "s" : ""
                  } pour "${searchQuery}"`
                : `Aucun album ou EP pour "${searchQuery}"`}
            </h2>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Les filtres ne sont plus nécessaires puisque le backend filtre déjà */}

            {albums.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {albums.map((album: Album) => (
                    <Link
                      to={`/albums/${
                        typeof album.id === "number"
                          ? album.id
                          : album.externalId
                      }`}
                      key={album._uniqueId || album.id || album.externalId}
                      className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all hover:-translate-y-1 group cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={
                            album.coverImageUrl ||
                            album.coverUrl ||
                            "https://via.placeholder.com/300x300?text=Album+Cover"
                          }
                          alt={album.name || album.title || "Album"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                          <span className="text-sm font-medium text-white px-3 py-1.5 bg-orange-500/80 rounded-full">
                            Voir détails
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-white truncate flex-1">
                            {album.name || album.title || "Album sans titre"}
                          </h3>
                          {album.albumType && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                album.albumType === "single"
                                  ? "bg-indigo-900/50 text-indigo-300"
                                  : album.albumType === "compilation"
                                  ? "bg-purple-900/50 text-purple-300"
                                  : album.albumType === "ep"
                                  ? "bg-amber-900/50 text-amber-300"
                                  : "bg-green-900/50 text-green-300"
                              }`}
                            >
                              {album.albumType === "single"
                                ? "Single"
                                : album.albumType === "compilation"
                                ? "Compilation"
                                : album.albumType === "ep"
                                ? "EP"
                                : "Album"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400 truncate flex-1">
                            {album.artist?.name ||
                              album.artistName ||
                              "Artiste inconnu"}
                          </p>
                          {album.totalTracks && (
                            <span className="text-xs text-gray-500">
                              {album.totalTracks}{" "}
                              {album.totalTracks > 1 ? "pistes" : "piste"}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bouton "Charger plus" */}
                {hasMoreAlbums && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={loadMoreAlbums}
                      disabled={isLoadingMore}
                      className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-full transition-colors flex items-center justify-center mx-auto"
                    >
                      {isLoadingMore ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Chargement...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Charger plus
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-300">
                  Aucun album ou EP trouvé pour cette recherche.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Essayez avec des mots-clés différents
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ce bloc n'est plus nécessaire car il n'y a plus de filtres côté client */}

        {!hasSearched && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-20 w-20 text-orange-500/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="mt-6 text-gray-300">
              Commencez par rechercher un album, un EP ou un artiste
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Découvrez de nouvelles musiques et partagez vos avis
            </p>
          </div>
        )}
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
