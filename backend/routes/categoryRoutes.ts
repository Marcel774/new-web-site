import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { requireAdmin } from '../middleware/auth.ts';
import { Category } from '../models/Category.ts';
import { Movie } from '../models/Movie.ts';
import { escapeRegExp, isNonEmptyString, slugifyCategory } from '../utils/validation.ts';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [categories, movieCounts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Movie.aggregate([
        {
          $group: {
            _id: { $toLower: '$genre' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countMap = new Map<string, number>();
    for (const item of movieCounts) {
      if (typeof item._id === 'string') {
        countMap.set(item._id, item.count);
      }
    }

    const enriched = categories.map((cat) => ({
      ...cat,
      movieCount: countMap.get(cat.name.toLowerCase()) ?? 0,
    }));

    res.json({ categories: enriched });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};
    if (!isNonEmptyString(name, 2, 50)) {
      res.status(400).json({ error: 'Category name must be between 2 and 50 characters.' });
      return;
    }

    const trimmed = name.trim();
    const slug = slugifyCategory(trimmed);
    if (!slug) {
      res.status(400).json({ error: 'Category name must contain alphanumeric characters.' });
      return;
    }

    const existing = await Category.findOne({
      $or: [{ slug }, { name: { $regex: `^${escapeRegExp(trimmed)}$`, $options: 'i' } }],
    }).lean();

    if (existing) {
      res.status(409).json({ error: 'This category already exists.' });
      return;
    }

    const category = await Category.create({ name: trimmed, slug });
    res.status(201).json({
      message: `Category "${category.name}" created.`,
      category: { ...category.toObject(), movieCount: 0 },
    });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid category ID.' });
      return;
    }

    const category = await Category.findById(id).lean();
    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    const inUseCount = await Movie.countDocuments({
      genre: { $regex: `^${escapeRegExp(category.name)}$`, $options: 'i' },
    });

    if (inUseCount > 0) {
      res.status(409).json({
        error: `Cannot delete "${category.name}" while ${inUseCount} movie${inUseCount === 1 ? ' is' : 's are'} assigned to it.`,
      });
      return;
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: `Category "${category.name}" deleted.`, id });
  } catch (error) {
    console.error('DELETE /api/categories/:id error:', error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

export default router;
