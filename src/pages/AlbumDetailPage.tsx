import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { albumsApi, reviewsApi, type Album, type Review } from "../api/api";

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAlbumAndReviews = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // On peut utiliser directement l'id (string ou number)
        const albumData = await albumsApi.getAlbumById(id);
        setAlbum(albumData);

        // Pour les reviews, on vérifie si l'id est numérique
        if (!isNaN(parseInt(id, 10))) {
          const albumId = parseInt(id, 10);
          const reviewsData = await reviewsApi.getReviewsByAlbum(albumId);
          setReviews(reviewsData);
        } else {
          // Si l'id n'est pas numérique (par exemple, un externalId),
          // on n'a peut-être pas encore de reviews dans notre base
          setReviews([]);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch album details. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAlbumAndReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !reviewContent.trim() || rating === 0) return;

    // Vérifier si l'ID est un nombre valide
    if (isNaN(parseInt(id, 10))) {
      setError("Impossible d'ajouter une critique pour cet album.");
      return;
    }

    try {
      setSubmitting(true);
      const albumId = parseInt(id, 10);

      const newReview = await reviewsApi.createReview(
        albumId,
        reviewContent,
        rating
      );
      setReviews((prevReviews) => [newReview, ...prevReviews]);

      setReviewContent("");
      setRating(0);
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      // Handle error (show error message)
    }
  };

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

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
    : "No ratings yet";

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:h-full md:w-48"
              src={
                album.coverImageUrl ||
                album.coverUrl ||
                "https://via.placeholder.com/300x300?text=Album+Cover"
              }
              alt={`${album.name || album.title || "Album"} cover`}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {album.artist?.name || album.artistName || "Artiste inconnu"}
            </div>
            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {album.name || album.title || "Album sans titre"}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Released:{" "}
              {album.releaseDate
                ? new Date(album.releaseDate).toLocaleDateString()
                : "Date inconnue"}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-gray-700 dark:text-gray-300">
                Average Rating:{" "}
              </span>
              <span className="ml-2 text-xl font-bold text-yellow-500">
                {averageRating}
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                ({reviews.length} reviews)
              </span>
            </div>
            {album.genres && album.genres.length > 0 && (
              <div className="mt-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Genres:{" "}
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {album.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
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

      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Write a Review
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Rating
            </label>
            <div className="mt-1 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                  onClick={() => setRating(star)}
                >
                  <span className="sr-only">{star} stars</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="review"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Review
            </label>
            <div className="mt-1">
              <textarea
                id="review"
                name="review"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Write your review here..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Reviews
        </h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6"
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {review.user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.user.username}
                    </p>
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-gray-700 dark:text-gray-300">
                <p>{review.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
