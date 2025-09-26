import { useState, useEffect } from "react";
import { albumsApi, type Album } from "../api/api";

export default function HomePage() {
  const [latestAlbums, setLatestAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await albumsApi.getAllAlbums(1, 6);
        setLatestAlbums(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch albums. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Latest Albums
        </h2>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="relative h-48">
                  <img
                    src={
                      album.coverImageUrl ||
                      album.coverUrl ||
                      "https://via.placeholder.com/300x300?text=Album+Cover"
                    }
                    alt={`${album.name || album.title || "Album"} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {album.name || album.title || "Album sans titre"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {album.artist?.name ||
                      album.artistName ||
                      "Artiste inconnu"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Released:{" "}
                    {album.releaseDate
                      ? new Date(album.releaseDate).toLocaleDateString()
                      : "Date inconnue"}
                  </p>
                  <div className="mt-3">
                    <a
                      href={`/albums/${album.id || album.externalId}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
