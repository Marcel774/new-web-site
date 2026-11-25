import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { requireAdmin } from '../middleware/auth.ts';
import { Category } from '../models/Category.ts';
import { Movie } from '../models/Movie.ts';
import {
  escapeRegExp,
  isNonEmptyString,
  isSafeMediaUrl,
  slugifyCategory,
} from '../utils/validation.ts';

const router = Router();

interface ValidatedMoviePayload {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  rating: number;
  poster: string;
  backdrop: string;
  videoUrl: string;
  featured: boolean;
  trending: boolean;
}

function validateMovieBody(
  body: Record<string, unknown>
): { data?: ValidatedMoviePayload; error?: string } {
  const {
    title,
    description,
    genre,
    releaseYear,
    rating,
    poster,
    backdrop,
    videoUrl,
    featured,
    trending,
  } = body ?? {};

  if (!isNonEmptyString(title, 1, 160)) {
    return { error: 'Title is required and must be under 160 characters.' };
  }
  if (!isNonEmptyString(description, 10, 2000)) {
    return { error: 'Description must be between 10 and 2000 characters.' };
  }
  if (!isNonEmptyString(genre, 2, 50)) {
    return { error: 'Genre is required and must be under 50 characters.' };
  }

  const parsedYear = Number(releaseYear);
  if (!Number.isInteger(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
    return { error: 'Release year must be a valid whole year between 1888 and 2100.' };
  }

  const parsedRating = Number(rating);
  if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
    return { error: 'Rating must be a number between 0.0 and 10.0.' };
  }

  if (!isSafeMediaUrl(poster, true)) {
    return { error: 'Poster must be a valid HTTP(S) image URL or uploaded image file.' };
  }

  const normalizedBackdrop =
    typeof backdrop === 'string' && backdrop.trim().length > 0 ? backdrop.trim() : '';
  if (normalizedBackdrop && !isSafeMediaUrl(normalizedBackdrop, true)) {
    return { error: 'Backdrop URL must be a valid HTTP(S) image URL.' };
  }

  if (!isSafeMediaUrl(videoUrl, false)) {
    return { error: 'Video URL must be a valid HTTP(S) media or trailer URL.' };
  }

  return {
    data: {
      title: title.trim(),
      description: description.trim(),
      genre: genre.trim(),
      releaseYear: parsedYear,
      rating: Math.round(parsedRating * 10) / 10,
      poster: poster.trim(),
      backdrop: normalizedBackdrop,
      videoUrl: videoUrl.trim(),
      featured: Boolean(featured),
      trending: Boolean(trending),
    },
  };
}

async function ensureCategoryExists(genreName: string): Promise<void> {
  const slug = slugifyCategory(genreName);
  if (!slug) return;
  const exists = await Category.findOne({ slug }).lean();
  if (!exists) {
    await Category.create({ name: genreName.trim(), slug });
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const genreParam =
      typeof req.query.genre === 'string'
        ? req.query.genre.trim()
        : typeof req.query.category === 'string'
          ? req.query.category.trim()
          : '';
    const featuredParam = req.query.featured;
    const trendingParam = req.query.trending;
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'newest';

    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(String(req.query.limit ?? '12'), 10) || 12)
    );

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.title = { $regex: escapeRegExp(search), $options: 'i' };
    }

    if (genreParam && genreParam.toLowerCase() !== 'all') {
      filter.genre = { $regex: `^${escapeRegExp(genreParam)}$`, $options: 'i' };
    }

    if (featuredParam === 'true') {
      filter.featured = true;
    }
    if (trendingParam === 'true') {
      filter.trending = true;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === 'rating') sortOption = { rating: -1, createdAt: -1 };
    else if (sortParam === 'year') sortOption = { releaseYear: -1, createdAt: -1 };
    else if (sortParam === 'title') sortOption = { title: 1 };

    const [movies, total, totalCatalog, aggregateStats] = await Promise.all([
      Movie.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Movie.countDocuments(filter),
      Movie.countDocuments(),
      Movie.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            featuredCount: { $sum: { $cond: ['$featured', 1, 0] } },
            trendingCount: { $sum: { $cond: ['$trending', 1, 0] } },
          },
        },
      ]),
    ]);

    const summary = aggregateStats[0] ?? {
      averageRating: 0,
      featuredCount: 0,
      trendingCount: 0,
    };

    res.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      stats: {
        totalMovies: totalCatalog,
        averageRating: Number((summary.averageRating ?? 0).toFixed(1)),
        featuredCount: summary.featuredCount ?? 0,
        trendingCount: summary.trendingCount ?? 0,
      },
    });
  } catch (error) {
    console.error('GET /api/movies error:', error);
    res.status(500).json({ error: 'Failed to retrieve movies.' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid movie ID format.' });
      return;
    }

    const movie = await Movie.findById(id).lean();
    if (!movie) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }

    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      genre: movie.genre,
    })
      .sort({ rating: -1 })
      .limit(4)
      .lean();

    res.json({ movie, relatedMovies });
  } catch (error) {
    console.error('GET /api/movies/:id error:', error);
    res.status(500).json({ error: 'Failed to retrieve movie details.' });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = validateMovieBody((req.body ?? {}) as Record<string, unknown>);
    if (error || !data) {
      res.status(400).json({ error: error ?? 'Invalid movie payload.' });
      return;
    }

    await ensureCategoryExists(data.genre);
    const createdMovie = await Movie.create(data);
    res.status(201).json({
      message: 'Movie added to catalog.',
      movie: createdMovie,
    });
  } catch (error) {
    console.error('POST /api/movies error:', error);
    res.status(500).json({ error: 'Failed to create movie.' });
  }
});

router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid movie ID format.' });
      return;
    }

    const { data, error } = validateMovieBody((req.body ?? {}) as Record<string, unknown>);
    if (error || !data) {
      res.status(400).json({ error: error ?? 'Invalid movie payload.' });
      return;
    }

    await ensureCategoryExists(data.genre);
    const updatedMovie = await Movie.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();

    if (!updatedMovie) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }

    res.json({
      message: 'Movie updated successfully.',
      movie: updatedMovie,
    });
  } catch (error) {
    console.error('PUT /api/movies/:id error:', error);
    res.status(500).json({ error: 'Failed to update movie.' });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid movie ID format.' });
      return;
    }

    const deletedMovie = await Movie.findByIdAndDelete(id).lean();
    if (!deletedMovie) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }

    res.json({
      message: `"${deletedMovie.title}" removed from catalog.`,
      id: String(deletedMovie._id),
    });
  } catch (error) {
    console.error('DELETE /api/movies/:id error:', error);
    res.status(500).json({ error: 'Failed to delete movie.' });
  }
});

export default router;
