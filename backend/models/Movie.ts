import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  rating: number;
  poster: string;
  backdrop?: string;
  videoUrl: string;
  featured: boolean;
  trending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genre: {
      type: String,
      required: [true, 'Movie genre is required'],
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1888, 'Release year must be 1888 or later'],
      max: [2100, 'Release year cannot exceed 2100'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating must be between 0 and 10'],
      max: [10, 'Rating must be between 0 and 10'],
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    backdrop: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ createdAt: -1 });

export const Movie = mongoose.models.Movie || mongoose.model<IMovie>('Movie', movieSchema);
