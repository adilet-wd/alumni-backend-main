import { type Model, type Document } from 'mongoose';
import { ApiError } from '../exeptions/api-error-exeption';
import type { PaginationResponse } from '../types/global';

export const paginate = async <T extends Document>(
  model: Model<T>,
  page: number,
  perPage: number,
  query: Record<string, any> = {}
): Promise<PaginationResponse<T>> => {
  const pageNumber: number = page || 1;
  const skip: number = (pageNumber - 1) * perPage;

  try {
    const total: number = await model.countDocuments();
    const totalPages: number = Math.ceil(total / perPage);

    const results: T[] = await model.find(query)
      .skip(skip)
      .limit(perPage)
      .sort({ date: -1 });

    const hasNextPage: boolean = pageNumber < totalPages;
    const hasPrevPage: boolean = pageNumber > 1;

    return {
      total,
      totalPages,
      currentPage: pageNumber,
      hasNextPage,
      hasPrevPage,
      perPage,
      results
    };
  } catch (error) {
    throw ApiError.BadRequest('Error paginating');
  }
};