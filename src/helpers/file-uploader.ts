import multer, { type Multer, type StorageEngine } from 'multer';
import { ImageFolders } from '../types/global';
import path from 'path';
import { v4 } from 'uuid';

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = (): ImageFolders | '' => {
      if (file.fieldname === ImageFolders.AVATARS) {
        return ImageFolders.AVATARS;
      } else if (file.fieldname === ImageFolders.POSTERS) {
        return ImageFolders.POSTERS;
      } else if (file.fieldname === ImageFolders.NEWS_IMAGES) {
        return ImageFolders.NEWS_IMAGES;
      } else if (file.fieldname === ImageFolders.COMPANY_LOGOS) {
        return ImageFolders.COMPANY_LOGOS;
      }

      return '';
    };

    cb(null, path.join(__dirname, '..', 'images', directory()));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + v4() + '-' + file.originalname.split(' ').join('')
    );
  }
});

export const fileUploader: Multer = multer({ storage });