import FileParsingInterafce from "../interface/fileParsing.js";
import multer from "multer";
import path from "path";

class MulterService implements FileParsingInterafce {
  constructor(
    private distination = "/uploads",
    private fileName?: string,
    private fileSizeLimit = 5 * 1024 * 1024,
    private acceptedFileType = [".mp3", ".wav",".webm"],
  ) {}

  public singleFileParsing = () => {
    const storage = this.fileDestinationDefination();
    const upload = this.fileValidation({ storage });
    return upload;
  };

  private fileDestinationDefination = () => {
    const storage = multer.diskStorage({
      destination: this.distination,

      filename: (req, file, cb) => {
        cb(null, this.fileName ?? Date.now() + "-" + file.originalname);
      },
    });

    return storage;
  };

  private fileValidation = ({ storage }: { storage: multer.StorageEngine }) => {
    const upload = multer({
      storage,

      limits: {
        fileSize: this.fileSizeLimit,
      },

      // Check extension/type
      fileFilter: (req, file, cb) => {
        const allowedExtensions = this.acceptedFileType;

        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
          return cb(new Error("Only audio files are allowed"));
        }

        cb(null, true);
      },
    });

    return upload;
  };
}

export default MulterService;
