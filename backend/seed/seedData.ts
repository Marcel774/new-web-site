import { Category } from '../models/Category.ts';
import { Movie } from '../models/Movie.ts';
import { slugifyCategory } from '../utils/validation.ts';

const INITIAL_CATEGORIES = ['Action', 'Comedy', 'Drama', 'Horror', 'Adventure', 'Thriller'];

const INITIAL_MOVIES = [
  {
    title: 'Obsidian Protocol',
    description:
      'After an encrypted black-site archive vanishes across three European capitals, a disavowed intelligence operative has forty-eight hours to intercept a rogue syndicate before the network goes dark permanently.',
    genre: 'Action',
    releaseYear: 2025,
    rating: 8.9,
    poster: '/src/assets/images/poster_obsidian_protocol_1795590429090.jpg',
    backdrop: '/src/assets/images/hero_obsidian_protocol_1795590428538.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    featured: true,
    trending: true,
  },
  {
    title: 'The Velvet Alibi',
    description:
      'Two perpetually broke antique appraisers accidentally inherit a misdelivered diplomatic briefcase in Paris, forcing them into a high-society weekend of improbable disguises, terrible espresso, and escalating misunderstandings.',
    genre: 'Comedy',
    releaseYear: 2024,
    rating: 8.2,
    poster: '/src/assets/images/poster_velvet_alibi_1795590429678.jpg',
    backdrop: '/src/assets/images/poster_velvet_alibi_1795590429678.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    featured: false,
    trending: true,
  },
  {
    title: 'Glass Harbor',
    description:
      'Returning to her estranged coastal village after fifteen winters away, a marine cartographer uncovers a decades-old ledger washed ashore that reshapes the town’s memory of its greatest maritime loss.',
    genre: 'Drama',
    releaseYear: 2025,
    rating: 8.7,
    poster: '/src/assets/images/poster_glass_harbor_1795590430035.jpg',
    backdrop: '/src/assets/images/poster_glass_harbor_1795590430035.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    featured: true,
    trending: false,
  },
  {
    title: 'Crimson Corridor',
    description:
      'Hired to catalog an abandoned Victorian conservatory before winter demolition, an architectural archivist realizes the estate’s acoustic blueprints were engineered to trap more than echoes.',
    genre: 'Horror',
    releaseYear: 2024,
    rating: 7.9,
    poster: '/src/assets/images/poster_crimson_corridor_1795590430589.jpg',
    backdrop: '/src/assets/images/poster_crimson_corridor_1795590430589.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    featured: false,
    trending: true,
  },
  {
    title: 'Atlas Beyond',
    description:
      'Armed only with hand-drawn expedition journals from 1924, a mountaineer and a geologist traverse an unmapped canyon range in search of an ancient astronomical observatory.',
    genre: 'Adventure',
    releaseYear: 2025,
    rating: 8.5,
    poster: '/src/assets/images/poster_atlas_beyond_1795590430656.jpg',
    backdrop: '/src/assets/images/poster_atlas_beyond_1795590430656.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
    featured: true,
    trending: true,
  },
  {
    title: 'Midnight Relay',
    description:
      'A nocturnal precision driver hired for a single borderless courier run through the Alps discovers his cargo is a live decryption key pursued by every syndicate frequency on the continent.',
    genre: 'Thriller',
    releaseYear: 2024,
    rating: 8.4,
    poster: '/src/assets/images/poster_midnight_relay_1795590431659.jpg',
    backdrop: '/src/assets/images/poster_midnight_relay_1795590431659.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    featured: false,
    trending: true,
  },
];

export async function seedInitialCatalogIfEmpty(): Promise<void> {
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    await Category.insertMany(
      INITIAL_CATEGORIES.map((name) => ({
        name,
        slug: slugifyCategory(name),
      }))
    );
    console.log(`[MOVIEFLIX] Seeded ${INITIAL_CATEGORIES.length} initial categories into MongoDB.`);
  }

  const movieCount = await Movie.countDocuments();
  if (movieCount === 0) {
    await Movie.insertMany(INITIAL_MOVIES);
    console.log(`[MOVIEFLIX] Seeded ${INITIAL_MOVIES.length} initial movies into MongoDB.`);
  }
}
