import { ApiError } from '../exeptions/api-error-exeption';
import { UserModel } from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { MailService } from './mail-service';
import { UserDto } from '../dtos/user-dto';
import { TokenService } from './token-service';
import { Errors, Success } from '../types/global';

interface userReturn {
  user: UserDto
  accessToken: string
  refreshToken: string
}

interface ChangePasswordProps {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
  id: string
}

interface ResetPasswordProps {
  email: string
  code: number
  newPassword: string
  confirmNewPassword: string
}

class Service {
  generateOtp (): number {
    let otp: number = 0;
    for (let i: number = 0; i < 6; i++) {
      otp = otp * 10 + Math.floor(Math.random() * 10);
    }
    return otp;
  }

  async registration (email: string, password: string, name: string, surname: string, phoneNumber: string): Promise<{ message: string }> {
    const candidate = await UserModel.findOne({ email });

    if (candidate != null) {
      throw ApiError.BadRequest(Errors.AUTH_USER_EXIST);
    }

    const hashPassword: string = await bcrypt.hash(password, 3);
    const activationLink: string = v4();

    const user = await UserModel.create(
      { email, password: hashPassword, activationLink, name, surname, phoneNumber }
    );
    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/activate/${activationLink}`);

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { message: Success.REGISTERED };
  }

  async activate (activationLink: string): Promise<void> {
    const user = await UserModel.findOne({ activationLink });
    if (user == null) {
      throw ApiError.BadRequest(Errors.INVALID_ACTIVATION_LINK);
    }
    user.isActivated = true;
    await user.save();
  }

  async logout (refreshToken: string): Promise<void> {
    if (refreshToken === null || refreshToken === undefined) {
      throw ApiError.UnauthorizedError();
    }
    const tokenFromDB = await TokenService.findToken(refreshToken);
    console.log(tokenFromDB);
    if (tokenFromDB === null || tokenFromDB === undefined) {
      throw ApiError.UnauthorizedError();
    }
    await TokenService.removeToken(refreshToken);
  }

  async login (email: string, password: string): Promise<userReturn> {
    const user = await UserModel.findOne({ email });

    if (user == null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    if (!user.isActivated) {
      throw ApiError.BadRequest(Errors.EMAIL_IS_ACTIVATED);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest(Errors.INCORRECT_PASSWORD);
    }

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });

    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async refresh (refreshToken: string | null | undefined): Promise<userReturn> {
    if (refreshToken === null || refreshToken === undefined) {
      throw ApiError.UnauthorizedError();
    }

    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await TokenService.findToken(refreshToken);

    if (userData == null || typeof userData === 'string' || tokenFromDB === null) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);

    if (user == null) {
      throw ApiError.UnauthorizedError();
    }

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });

    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async changePassword (props: ChangePasswordProps): Promise<void> {
    const { oldPassword, newPassword, confirmNewPassword, id } = props;

    const user = await UserModel.findById(id);

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    const isPassEquals = await bcrypt.compare(oldPassword, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest(Errors.INCORRECT_PASSWORD);
    }

    if (newPassword !== confirmNewPassword) {
      throw ApiError.BadRequest(Errors.PASSWORD_ARE_NOT_EQUAL);
    }

    user.password = await bcrypt.hash(newPassword, 3);
    await user.save();
  }

  async sendOtpCode (email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }
    const code = this.generateOtp();
    await MailService.sendOtpCode(user.email, code);
    user.resetCode = code;
    await user.save();
  }

  async reSendOtpCode (email: string): Promise<void> {
    const user = await UserModel.findOne({ email });

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    if (user.resetCode === null) {
      throw ApiError.BadRequest(Errors.OTP_DID_NOT_SEND);
    }

    const code = this.generateOtp();
    await MailService.sendOtpCode(user.email, code);
    user.resetCode = code;
    await user.save();
  }

  async resetPassword (props: ResetPasswordProps): Promise<void> {
    const { email, code, newPassword, confirmNewPassword } = props;
    const user = await UserModel.findOne({ email });

    if (user === null) {
      throw ApiError.BadRequest(Errors.USER_NOT_FOUND);
    }

    if (user.resetCode === null) {
      throw ApiError.BadRequest(Errors.OTP_DID_NOT_SEND);
    }

    if (user.resetCode !== code) {
      throw ApiError.BadRequest(Errors.OTP_INCORRECT);
    }

    if (newPassword !== confirmNewPassword) {
      throw ApiError.BadRequest(Errors.PASSWORD_ARE_NOT_EQUAL);
    }

    user.password = await bcrypt.hash(newPassword, 3);
    user.resetCode = null;
    await user.save();
  }
}

export const AuthService = new Service();
