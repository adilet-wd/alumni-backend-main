import { type Request } from 'express';
import { UserModel } from '../models/user-model';
import { UserDto } from '../dtos/user-dto';
import { ApiError } from '../exeptions/api-error-exeption';
import { ImageService } from './image-service';
import { Errors, ImageFolders, type PaginationResponse, type User } from '../types/global';
import { paginate } from '../helpers/pagination';

class Service {
  async getProfile (email: string): Promise<UserDto> {
    const user = await UserModel.findOne({ email });

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    return new UserDto(user);
  }

  async updateProfile (id: string, fields: Request['body'], file: string | undefined): Promise<UserDto> {
    const user = await UserModel.findByIdAndUpdate(id, fields, {
      returnDocument: 'after'
    });

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    if (file !== undefined && user.avatar === null) {
      user.avatar = file;
    }

    if (file !== undefined && user.avatar !== null) {
      ImageService.removeImage(ImageFolders.AVATARS, user.avatar);
      user.avatar = file;
    }

    await user.save();
    return new UserDto(user);
  }

  async getUsers (limit: number, page: number, body: Request['body']): Promise<PaginationResponse<UserDto>> {
    const query: {
      name?: RegExp
      yearOfRelease?: number
      specialty?: string
      education?: string
      isAdmin: boolean
    } = {
      isAdmin: false
    };

    if (body.name !== undefined) {
      query.name = new RegExp(body.name, 'i');
    }

    if (body.yearOfRelease !== undefined) {
      query.yearOfRelease = body.yearOfRelease;
    }

    if (body.education !== undefined) {
      query.education = body.education;
    }

    if (body.specialty !== undefined) {
      query.specialty = body.specialty;
    }

    const users = await paginate(UserModel, page, limit, query);
    const dtoUsers: UserDto[] = users.results.map((user: User) => new UserDto(user));

    return {
      ...users,
      results: dtoUsers
    };
  }

  async getUserById (id: string): Promise<UserDto> {
    const user = await UserModel.findById(id);

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    return new UserDto(user);
  }
}

export const UserService = new Service();