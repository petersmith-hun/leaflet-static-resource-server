import ConfigurationProvider, {
    Acceptor,
    configurationProvider,
    StorageConfig
} from "@app/core/config/configuration-provider";
import { FileInput } from "@app/core/model/file-input";
import path from "path";
import removeAccents from "remove-accents";

/**
 * File path operations.
 */
export default class PathUtility {

    private readonly pathNormalizationPattern = new RegExp("\\\\", "g");
    private readonly filenameCleaningPattern = new RegExp(' ', 'g');
    private readonly storageConfig: StorageConfig;

    constructor(configurationProvider: ConfigurationProvider) {
        this.storageConfig = configurationProvider.getStorageConfig();
    }

    /**
     * Formats the filename of the file being uploaded. The following steps are done:
     *  - Removes accents;
     *  - Changes the entire filename to lower case;
     *  - Trims extra whitespaces;
     *  - Replaces spaces with underscores.
     *
     * @param fileInput FileInput object containing the original filename
     */
    public createTargetFilename(fileInput: FileInput): string {

        return removeAccents(fileInput.originalFilename)
            .toLowerCase()
            .trim()
            .replace(this.filenameCleaningPattern, '_');
    }

    /**
     * Creates a path relative to the storage root.
     *
     * @param acceptor Acceptor object to extract acceptor root folder name
     * @param fileInput FileInput object to extract the files relative path to the acceptor root (if any, applies only if the file is placed in a subfolder)
     * @param targetFilename formatted target filename
     */
    public createFileRelativePath(acceptor: Acceptor, fileInput: FileInput, targetFilename: string): string {

        return fileInput.relativePath
            ? path.join(acceptor.groupRootDirectory, fileInput.relativePath, targetFilename)
            : path.join(acceptor.groupRootDirectory, targetFilename);
    }

    /**
     * Creates an absolute path for the given file (storage root + acceptor root + sub-folders + filename).
     *
     * @param fileRelativePath file path relative to the storage root (acceptor root + sub-folders + filename)
     */
    public createFileAbsolutePath(fileRelativePath: string): string {
        return path.join(this.storageConfig.uploadPath, fileRelativePath);
    }

    /**
     * Normalizes the given path string by replacing the backslashes with forward slashes.
     *
     * @param path path string to be normalized
     * @returns normalized path string
     */
    public normalizePath(path: string): string {
        return path.replace(this.pathNormalizationPattern, "/");
    }
}

export const pathUtility = new PathUtility(configurationProvider);
