import {Router} from "express";
import {InjectMany, Service} from "typedi";
import {GenericError} from "../core/error/error-types";
import {ControllerToken} from "../helper/typedi-tokens";
import ActuatorController from "./controller/actuator-controller";
import {Controller, ControllerType} from "./controller/controller";
import FilesController from "./controller/files-controller";
import {
    DirectoryCreationRequestModel,
    FileIdentifier,
    FileUploadRequestModel,
    UpdateFileMetadataRequestModel
} from "./model/files";
import {ParameterizedMappingHelper, ParameterlessMappingHelper} from "./utility/mapping-helper";
import {formidableUploadMiddleware} from "./utility/middleware";

/**
 * Component to handle controller registrations.
 */
@Service()
export default class ControllerRegistration {

    private readonly controllerMap: Map<ControllerType, Controller>;

    constructor(@InjectMany(ControllerToken) controllers: Controller[]) {
        this.controllerMap = new Map(controllers.map(controller => [controller.controllerType(), controller]));
    }

    /**
     * Triggers registering routes.
     *
     * @returns configured Express Router object
     */
    public registerRoutes(): Router {

        const actuatorController: ActuatorController = this.assertAndReturnController(ControllerType.ACTUATOR);
        const filesController: FilesController = this.assertAndReturnController(ControllerType.FILES);

        const simple = new ParameterlessMappingHelper();
        const fileID = new ParameterizedMappingHelper(FileIdentifier);
        const upload = new ParameterizedMappingHelper(FileUploadRequestModel);
        const directory = new ParameterizedMappingHelper(DirectoryCreationRequestModel);
        const update = new ParameterizedMappingHelper(UpdateFileMetadataRequestModel);

        const actuatorRouter = Router();
        const filesRouter = Router();

        actuatorRouter
            .get("/info", simple.register(() => actuatorController.info()))
            .get("/health", simple.register(() => actuatorController.health()));

        filesRouter.route("/")
            .get(simple.register(() => filesController.getUploadedFiles()))
            .post(formidableUploadMiddleware, upload.register((uploadRequest) => filesController.uploadFile(uploadRequest)));

        filesRouter.route("/directories")
            .get(simple.register(() => filesController.getDirectories()))
            .post(directory.register((creationRequest) => filesController.createDirectory(creationRequest)));

        filesRouter.route("/:pathUUID")
            .get(fileID.register(fileIdentifier => filesController.getFileDetails(fileIdentifier)))
            .put(update.register((updateRequest) => filesController.updateFileMetaInfo(updateRequest)))
            .delete(fileID.register(fileIdentifier => filesController.deleteFile(fileIdentifier)));

        filesRouter.route("/:pathUUID/:storedFilename")
            .get(fileID.register(fileIdentifier => filesController.download(fileIdentifier)));

        return Router()
            .use("/actuator", actuatorRouter)
            .use("/files", filesRouter);
    }

    private assertAndReturnController<Type extends Controller>(controllerType: ControllerType): Type {

        const controller = this.controllerMap.get(controllerType) as Type;
        if (!controller) {
            throw new GenericError(`Failed to register controller=${controllerType} - stopping.`);
        }

        return controller;
    }
}
