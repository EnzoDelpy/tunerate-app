import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  albumsApi,
  reviewsApi,
  getCurrentUser,
  type Album,
  type Review,
  type User,
  type ReviewsResponse,
} from "../api/api";

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]); // Assurez-vous que c'est toujours un tableau vide par défaut
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

  // Récupération de l'utilisateur courant
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
        // L'utilisateur n'est peut-être pas connecté, ce n'est pas grave
      }
    };

    fetchCurrentUser();
  }, []);

  // Fonction pour charger les critiques avec pagination
  const fetchReviews = async (
    albumInternalId: number,
    pageNum: number,
    replace: boolean = false
  ) => {
    setLoadingMore(true);
    try {
      // Utilisation de l'API avec pagination
      const reviewsData = await reviewsApi.getReviewsByAlbum(
        albumInternalId,
        pageNum
      );

      // Adapter la réponse selon la structure
      const reviewsList = Array.isArray(reviewsData)
        ? reviewsData
        : reviewsData.reviews;
      const hasMoreReviews = !Array.isArray(reviewsData) && reviewsData.hasMore;
      const totalCount = !Array.isArray(reviewsData)
        ? reviewsData.total
        : reviewsList.length;

      if (Array.isArray(reviewsList)) {
        if (replace) {
          setReviews(reviewsList);
        } else {
          setReviews((prev) => [...prev, ...reviewsList]);
        }
        setHasMore(!!hasMoreReviews);
        setTotalReviews(totalCount);
      } else {
        console.error(
          "Les données de critique ne sont pas un tableau:",
          reviewsData
        );
        if (replace) {
          setReviews([]);
        }
        setHasMore(false);
      }
    } catch (reviewError) {
      console.error(
        "Erreur lors de la récupération des critiques:",
        reviewError
      );
      if (replace) {
        setReviews([]);
      }
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Chargement de l'album et des critiques initiales
  useEffect(() => {
    const fetchAlbumAndReviews = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setPage(1); // Réinitialiser la pagination

        // On peut utiliser directement l'id (string ou number)
        const albumData = await albumsApi.getAlbumById(id);
        setAlbum(albumData);

        // Pour les reviews, on utilise uniquement l'ID interne de l'album récupéré
        // Ne pas utiliser l'ID de l'URL qui peut être un externalId
        if (albumData && albumData.id && typeof albumData.id === "number") {
          // On utilise TOUJOURS l'ID interne de l'album récupéré depuis l'API
          console.log(
            `Fetching reviews for album with internal ID: ${albumData.id}`
          );
          await fetchReviews(albumData.id, 1, true);
        } else {
          // Si l'album n'a pas d'ID interne, c'est qu'il n'est pas encore en base
          console.log("No internal album ID found, no reviews to fetch");
          setReviews([]);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching album details:", err);
        if (err?.response?.status === 401) {
          setError(
            "Vous devez être connecté pour voir les détails de l'album. Veuillez vous connecter."
          );
        } else if (err?.response?.status === 404) {
          setError(`Album non trouvé. ID: ${id}`);
        } else {
          setError(
            `Impossible de récupérer les détails de l'album. Erreur: ${
              err?.message || "Inconnue"
            }`
          );
        }
        setLoading(false);
      }
    };

    fetchAlbumAndReviews();
  }, [id]);

  // Fonction pour charger plus de critiques
  const handleLoadMoreReviews = async () => {
    if (!album || loadingMore || !hasMore) return;

    // Utiliser uniquement l'ID interne de l'album récupéré depuis l'API
    if (album && album.id && typeof album.id === "number") {
      const nextPage = page + 1;
      setPage(nextPage);
      console.log(
        `Loading more reviews for album with internal ID: ${album.id}, page: ${nextPage}`
      );
      await fetchReviews(album.id, nextPage, false);
    }
  };

  // Gestion de la soumission d'une critique
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!currentUser) {
      setReviewError("Vous devez être connecté pour publier une critique.");
      return;
    }

    if (!id) {
      setReviewError("Impossible d'identifier l'album.");
      return;
    }

    if (!reviewContent.trim()) {
      setReviewError("Veuillez écrire votre critique avant de la soumettre.");
      return;
    }

    if (rating === 0) {
      setReviewError("Veuillez attribuer une note à l'album.");
      return;
    }

    // Vérifier si l'ID est un nombre valide
    if (isNaN(parseInt(id, 10))) {
      setReviewError(
        "Impossible d'ajouter une critique pour cet album externe. Veuillez d'abord l'ajouter à la base de données."
      );
      return;
    }

    try {
      setSubmitting(true);

      // Utiliser l'ID interne de l'album, pas l'ID de l'URL
      if (!album?.id || typeof album.id !== "number") {
        throw new Error("ID d'album invalide ou non disponible");
      }

      const newReview = await reviewsApi.createReview(
        album.id, // Utiliser l'ID de l'album récupéré, pas l'ID de l'URL
        reviewContent,
        rating
      );

      // Ajouter la critique au début de la liste
      setReviews((prevReviews) => [newReview, ...prevReviews]);

      // Réinitialiser le formulaire et afficher un message de succès
      setReviewContent("");
      setRating(0);
      setReviewSuccess("Votre critique a été publiée avec succès!");

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setReviewSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setReviewError(
        err?.response?.data?.message ||
          "Une erreur est survenue lors de la publication de votre critique."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // La fonction de gestion des réponses a été supprimée

  // Suppression d'une critique
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette critique ?")) {
      return;
    }

    try {
      await reviewsApi.deleteReview(reviewId);
      // Supprimer la critique de la liste
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
      setReviewSuccess("Votre critique a été supprimée avec succès.");

      setTimeout(() => {
        setReviewSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression de la critique:", err);
      setReviewError("Impossible de supprimer cette critique.");
    }
  };

  // La fonction de like a été supprimée

  if (loading) {
    return (
      <div className="flex justify-center pt-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || "Album not found"}
      </div>
    );
  }

  const averageRating =
    Array.isArray(reviews) && reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "No ratings yet";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-32">
      <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 lg:w-1/4">
            <div className="aspect-square overflow-hidden relative">
              <img
                className="w-full h-full object-cover"
                src={
                  album.coverImageUrl ||
                  album.coverUrl ||
                  "https://via.placeholder.com/300x300?text=Album+Cover"
                }
                alt={`${album.name || album.title || "Album"} cover`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
            </div>
          </div>
          <div className="p-6 md:p-8 md:w-2/3 lg:w-3/4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {album.albumType && (
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
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
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-yellow-500">
                  {averageRating}
                </span>
                <span className="text-gray-400">({reviews.length} avis)</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              {album.name || album.title || "Album sans titre"}
            </h1>

            <div className="text-xl text-orange-500 mb-4">
              {album.artist?.name || album.artistName || "Artiste inconnu"}
            </div>

            <p className="text-gray-400 mb-6">
              Sortie le{" "}
              {album.releaseDate
                ? new Date(album.releaseDate).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date inconnue"}
            </p>

            {album.genres && album.genres.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-400 mb-2">
                  Genres
                </div>
                <div className="flex flex-wrap gap-2">
                  {album.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-gray-200 border border-gray-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Écrire une critique
          </h3>

          {!currentUser ? (
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 text-center">
              <p className="text-gray-300 mb-4">
                Connectez-vous pour partager votre avis sur cet album
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm7 2a1 1 0 011 1v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 9.586V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              {reviewError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {reviewError}
                </div>
              )}

              {reviewSuccess && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-300 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Note
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`h-10 w-10 ${
                          star <= rating ? "text-yellow-500" : "text-gray-600"
                        } hover:scale-110 transition-transform`}
                        onClick={() => setRating(star)}
                      >
                        <span className="sr-only">{star} stars</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {rating === 1 && "Mauvais"}
                    {rating === 2 && "Moyen"}
                    {rating === 3 && "Bon"}
                    {rating === 4 && "Très bon"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="review"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Votre critique
                  </label>
                  <textarea
                    id="review"
                    name="review"
                    rows={4}
                    className="bg-neutral-800 border border-gray-700 focus:border-orange-500 focus:ring focus:ring-orange-500/20 rounded-lg w-full px-4 py-3 text-gray-200 placeholder-gray-500 resize-none"
                    placeholder="Partagez votre opinion sur cet album..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-800/30 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Envoi en cours...
                    </>
                  ) : (
                    "Publier ma critique"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              <span>Critiques</span>
            </div>
            {reviews.length > 0 && (
              <span className="bg-neutral-800 px-3 py-1 rounded-full text-sm text-gray-300">
                {reviews.length} {reviews.length > 1 ? "avis" : "avis"}
              </span>
            )}
          </h3>

          {!reviews || !Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-10 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <p className="text-gray-400">
                Aucune critique pour le moment. Soyez le premier à donner votre
                avis !
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold">
                          {review.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {review.user.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-neutral-900 px-2 py-1 rounded">
                        <span className="text-yellow-500 font-bold mr-1">
                          {review.rating}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm mb-4">
                      <p>{review.comment || review.content}</p>
                    </div>

                    {currentUser && currentUser.id === review.userId && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-neutral-900 text-gray-400 hover:text-red-400 border border-neutral-700 transition-colors ml-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleLoadMoreReviews}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg transition-colors flex items-center"
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Voir plus de critiques
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-2"
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
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
