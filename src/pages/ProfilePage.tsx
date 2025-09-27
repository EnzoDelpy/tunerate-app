import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi, type User } from "../api/api";
import { authEvents } from "../utils/auth-events";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login", {
        state: {
          message: "Veuillez vous connecter pour accéder à votre profil.",
        },
      });
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      setProfile(data);
      setFormData({
        username: data.username,
        email: data.email,
      });
      setLoading(false);
    } catch (err) {
      setError(
        "Impossible de charger votre profil. Veuillez vous reconnecter."
      );
      setLoading(false);
      // En cas d'erreur d'authentification, rediriger vers la page de connexion
      localStorage.removeItem("authToken");
      // Émettre l'événement de déconnexion pour mettre à jour l'interface
      authEvents.emitLogout();
      navigate("/login", {
        state: {
          message: "Votre session a expiré. Veuillez vous reconnecter.",
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateProfile({
        username: formData.username,
        email: formData.email,
      });
      setProfile(updatedUser);
      setIsEditing(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    // Émettre l'événement de déconnexion pour mettre à jour l'interface
    authEvents.emitLogout();
    navigate("/login");
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 bg-neutral-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar avec photo de profil */}
          <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-xl p-6">
            <div className="text-center mb-8">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 mx-auto mb-6 overflow-hidden flex items-center justify-center">
                <span className="text-4xl text-white font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {profile?.username}
              </h2>
              <p className="text-gray-400 mt-1">Mélomane passionné</p>
            </div>

            <div className="border-t border-neutral-800 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center mt-4">
                <div className="bg-neutral-800/60 rounded-lg p-3">
                  <p className="text-orange-500 text-xl font-bold">42</p>
                  <p className="text-gray-400 text-sm">Critiques</p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-3">
                  <p className="text-orange-500 text-xl font-bold">18</p>
                  <p className="text-gray-400 text-sm">Favoris</p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-3">
                  <p className="text-orange-500 text-xl font-bold">127</p>
                  <p className="text-gray-400 text-sm">Albums</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Informations personnelles
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm transition-colors shadow-lg shadow-orange-800/30"
                  >
                    Modifier
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-neutral-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-neutral-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-800/30 flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? (
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
                            Enregistrement...
                          </>
                        ) : (
                          "Enregistrer les modifications"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
                    <p className="text-sm text-gray-400 mb-1">
                      Nom d'utilisateur
                    </p>
                    <p className="text-lg text-white font-medium">
                      {profile?.username}
                    </p>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-lg text-white font-medium">
                      {profile?.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Activité récente
              </h2>

              <div className="space-y-4">
                <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-orange-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-200">
                        A noté l'album "OK Computer"
                        <span className="ml-2 text-yellow-500 font-bold">
                          5/5
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Il y a 2 jours
                      </p>
                    </div>
                    <div className="bg-neutral-900 p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-orange-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-200">
                        A noté l'album "Random Access Memories"
                        <span className="ml-2 text-yellow-500 font-bold">
                          4/5
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Il y a 1 semaine
                      </p>
                    </div>
                    <div className="bg-neutral-900 p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-orange-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-200">
                        A ajouté l'album "Abbey Road" à ses favoris
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Il y a 2 semaines
                      </p>
                    </div>
                    <div className="bg-neutral-900 p-1 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-700 flex justify-end">
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-white hover:bg-red-600 font-medium px-4 py-2 rounded-lg transition-colors flex items-center"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
