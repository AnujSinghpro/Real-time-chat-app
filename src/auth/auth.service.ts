import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private fileUploadService: FileUploadService,
  ) {}

  async register(data: any,
    file: Express.Multer.File) {

    let uploadedMedia;
    if (file) {
      uploadedMedia = await this.fileUploadService.uploadProfileImage(file);
    }

    const existingUser = await this.usersService.findByEmail(
      data.email,
    );

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
      image: uploadedMedia || null,
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(data: any) {
    const user = await this.usersService.findByEmail(
      data.email,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isMatch = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
    });

    return {
      access_token: token,
      user,
    };
  }



  async updateProfileImage(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image is required',
      );
    }

    const uploadedMedia =
      await this.fileUploadService.uploadProfileImage(file);

    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (user.image) {
      await this.fileUploadService.deleteProfileImage(
        user.image,
      );
    }

    const updatedUser =
      await this.usersService.update(userId, {
        image: uploadedMedia,
      });

    return {
      message: 'Profile image updated successfully',
      user: updatedUser,
    };
  }

  
}