import {
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  Res,
  Param,
  Query,
  Body,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { createReadStream } from 'fs';
import { extname, join } from 'path';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const storagePath = './storage';
          let path = req.body.path;

          if (path.charAt(0) !== '/') {
            path = '/' + path;
          }
          const filePath = storagePath + path;

          if (fs.existsSync(filePath)) {
            cb(null, filePath);
          } else {
            cb(new HttpException('wrong path', HttpStatus.BAD_REQUEST), null);
          }
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid.v4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileData = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileName: file.filename,
    };
    return fileData;
  }
}
