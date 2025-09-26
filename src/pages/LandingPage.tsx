import { useState, useEffect } from "react";

// Type simplifié pour les albums de la landing page
interface SimpleAlbum {
  id: number;
  name: string;
  coverImageUrl: string;
  artist: {
    name: string;
    id: number;
  };
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Nous n'utilisons plus useState pour les albums car nous utiliserons uniquement mockAlbums
  // const [albums, setAlbums] = useState<Album[]>([]);

  // Nous n'avons plus besoin de récupérer les albums depuis l'API
  // useEffect(() => {
  //   const fetchAlbums = async () => {
  //     try {
  //       // Utilisez l'API réelle une fois connectée
  //       const data = await albumsApi.getAllAlbums(1, 8);
  //       setAlbums(data);
  //     } catch (err) {
  //       console.error("Erreur lors du chargement des albums", err);
  //       // Utilisez des données fictives en cas d'erreur
  //       setAlbums([]);
  //     }
  //   };
  //
  //   fetchAlbums();
  // }, []);

  // Effet pour l'animation au chargement
  useEffect(() => {
    // Petit délai pour assurer que le DOM est prêt
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Données fictives pour le développement - version simplifiée
  const mockAlbums: SimpleAlbum[] = [
    {
      id: 1,
      name: "The Dark Side of the Moon",
      coverImageUrl:
        "https://i.scdn.co/image/ab67616d0000b273483d23d7490a266a042aa0b2",
      artist: {
        name: "Pink Floyd",
        id: 1,
      },
    },
    {
      id: 2,
      name: "Abbey Road",
      coverImageUrl:
        "https://cdn-images.dzcdn.net/images/cover/475e231e312e0b511c19e23020ed483f/0x1900-000000-80-0-0.jpg",
      artist: { name: "The Beatles", id: 2 },
    },
    {
      id: 3,
      name: "Thriller",
      coverImageUrl:
        "https://cdn-images.dzcdn.net/images/cover/217b3453b2cdc5172f6689269b6361d9/1900x1900-000000-81-0-0.jpg",
      artist: { name: "Michael Jackson", id: 3 },
    },
    {
      id: 4,
      name: "Back in Black",
      coverImageUrl:
        "https://i.scdn.co/image/ab67616d0000b27354a6cdfbdc7a0e77b99abf75",
      artist: { name: "AC/DC", id: 4 },
    },
    {
      id: 5,
      name: "Nevermind",
      coverImageUrl:
        "https://i.scdn.co/image/ab67616d0000b2739297f238f237431d56c67460",
      artist: {
        name: "Nirvana",
        id: 5,
      },
    },
    {
      id: 6,
      name: "OK Computer",
      coverImageUrl:
        "https://i.scdn.co/image/ab67616d0000b273110978fabea619d30156216b",
      artist: {
        name: "Radiohead",
        id: 6,
      },
    },
    {
      id: 7,
      name: "Random Access Memories",
      coverImageUrl:
        "https://i.scdn.co/image/ab67616d0000b2738a4869eaf9f003ab73df0ec2",
      artist: { name: "Daft Punk", id: 7 },
    },
  ];

  // Utiliser directement mockAlbums au lieu de displayAlbums
  const displayAlbums = mockAlbums;

  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Hero Section avec Albums en arc de cercle */}
      <div className="relative h-screen w-full flex flex-col items-center justify-start pt-24 p-4">
        <div className="absolute inset-0 w-full overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
          {/* Albums en arc */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`relative w-[900px] h-[500px] flex items-center justify-center transform translate-y-[400px] transition-all duration-1000 ${
                isLoaded ? "opacity-100" : "opacity-0 translate-y-[500px]"
              }`}
            >
              {displayAlbums.map((album, i) => {
                const radius = 560; // rayon de l’arc
                const arcAngle = 110; // ouverture de l’arc
                const angle =
                  -arcAngle / 2 + (i * arcAngle) / (displayAlbums.length - 1);
                const rad = (angle * Math.PI) / 180;

                // Arc horizontal vers le haut
                const x = radius * Math.sin(rad);
                const y = -radius * Math.cos(rad); // <-- inversion ici pour aller vers le haut

                // Petite rotation pour l’effet
                const rotation = angle / 4;

                return (
                  <div
                    key={album.id}
                    className="absolute transition-all duration-300 cursor-pointer album-animate"
                    style={{
                      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                      transitionDelay: `${200 + i * 100}ms`,
                      opacity: isLoaded ? 1 : 0,
                    }}
                  >
                    <div className="relative rounded-2xl overflow-hidden">
                      <div className="p-2">
                        <img
                          src={
                            album.coverImageUrl ||
                            "https://via.placeholder.com/300x300?text=Album+Cover"
                          }
                          alt={album.name}
                          className="w-44 h-44 object-cover rounded-xl album-shadow"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu central */}
        <div
          className={`z-20 text-center px-4 w-full max-w-5xl mx-auto p-8 transform translate-y-[400px] transition-all duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0 translate-y-[500px]"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <p className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 uppercase tracking-wider">
            TuneRate
          </p>
          <p className="text-xl md:text-xl mb-8 text-gray-300">
            Découvrez, évaluez et partagez vos opinions sur vos albums préférés
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {/* <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-full font-bold text-lg transition-colors"
            >
              S'inscrire
            </Link>
            <Link
              to="/login"
              className="bg-transparent hover:bg-white/10 text-white border border-white px-8 py-3 rounded-full font-bold text-lg transition-colors"
            >
              Se connecter
            </Link> */}
          </div>
        </div>
      </div>

      {/* Style pour l'animation et les ombres */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shadow-neon {
          box-shadow: 0 0 10px rgba(138, 43, 226, 0.7), 0 0 20px rgba(138, 43, 226, 0.5);
        }
        .album-shadow:hover {
          transform: translateY(-5px) scale(1.05);
        }
        .album-animate {
          transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
