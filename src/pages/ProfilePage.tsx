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
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Sidebar avec photo de profil */}
          <div className="md:w-1/3 bg-gradient-to-b from-indigo-800 to-indigo-900 p-8 text-center">
            <div className="mb-8">
              <div className="h-32 w-32 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
                {/* Image de profil placeholder - à remplacer par l'avatar de l'utilisateur */}
                <div className="h-full w-full flex items-center justify-center text-4xl text-gray-500">
                  {profile?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {profile?.username}
              </h2>
              <p className="text-indigo-300 mt-1">Mélomane</p>
            </div>

            <div className="border-t border-indigo-700 pt-4">
              <div className="flex flex-col space-y-4 mt-4">
                <div>
                  <p className="text-indigo-300 text-sm">Membre depuis</p>
                  <p className="text-white">Janvier 2023</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-sm">Reviews</p>
                  <p className="text-white">42</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-sm">Albums favoris</p>
                  <p className="text-white">18</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-8 md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Modifier
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Annuler
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded-md">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                      disabled={loading}
                    >
                      {loading
                        ? "Enregistrement..."
                        : "Enregistrer les modifications"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Informations personnelles
                  </h3>
                  <div className="mt-2 space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Nom d'utilisateur</p>
                      <p className="text-white">{profile?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{profile?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">
                    Activité récente
                  </h3>
                  <div className="mt-2 space-y-4">
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <p className="text-gray-300">
                        A noté l'album "OK Computer" 5/5
                      </p>
                      <p className="text-sm text-gray-500">Il y a 2 jours</p>
                    </div>
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <p className="text-gray-300">
                        A noté l'album "Random Access Memories" 4/5
                      </p>
                      <p className="text-sm text-gray-500">Il y a 1 semaine</p>
                    </div>
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <p className="text-gray-300">
                        A ajouté l'album "Abbey Road" à ses favoris
                      </p>
                      <p className="text-sm text-gray-500">Il y a 2 semaines</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
