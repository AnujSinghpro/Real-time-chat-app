import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadDir: string;
      
  constructor(private readonly configService: ConfigService) {
    // Set upload directory path
    this.uploadDir = path.join(process.cwd(), 'uploads', 'profile-images');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, fileName);

      // Save file
      await fs.promises.writeFile(filePath, file.buffer);

      return `/uploads/profile-images/${fileName}`;
    } catch (error) {
      throw error;
    }
  }

  async deleteProfileImage(imagePath: string): Promise<void> {
    try {
      if (!imagePath) return;

      // Extract filename from path
      const fileName = path.basename(imagePath);
      const filePath = path.join(this.uploadDir, fileName);

      // Check if file exists before deleting
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      throw error;
    }
  }
  
}