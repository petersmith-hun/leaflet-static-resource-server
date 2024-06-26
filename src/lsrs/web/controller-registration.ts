import ConfigurationProvider, { AuthConfig, configurationProvider } from "@app/core/config/configuration-provider";
import { GenericError } from "@app/core/error/error-types";
import ActuatorController, { actuatorController } from "@app/web/controller/actuator-controller";
import { Controller, ControllerType } from "@app/web/controller/controller";
import FilesController, { filesController } from "@app/web/controller/files-controller";
import { Scope } from "@app/web/model/common";
import {
    BrowseRequest,
    DirectoryCreationRequestModel,
    FileIdentifier,
    FileUploadRequestModel,
    UpdateFileMetadataRequestModel
} from "@app/web/model/files";
import { formidableUploadMiddleware } from "@app/web/utility/formidable-support";
import { ParameterizedMappingHelper, ParameterlessMappingHelper } from "@app/web/utility/mapping-helper";
import { RequestHandler, Router } from "express";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";

/**
 * Component to handle controller registrations.
 */
export default class ControllerRegistration {

    private readonly controllerMap: Map<ControllerType, Controller>;
    private readonly authConfig: AuthConfig;

    constructor(configurationProvider: ConfigurationProvider, controllers: Controller[]) {
        this.controllerMap = new Map(controllers.map(controller => [controller.controllerType(), controller]));
        this.authConfig = configurationProvider.getAuthConfig();
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
        const browser = new ParameterizedMappingHelper(BrowseRequest);
        const auth = this.prepareAuth();

        const actuatorRouter = Router();
        const filesRouter = Router();

        actuatorRouter
            .get("/info", simple.register(() => actuatorController.info()))
            .get("/health", simple.register(() => actuatorController.health()));

        filesRouter.route("/")
            .get(auth(Scope.READ_FILES), simple.register(() => filesController.getUploadedFiles()))
            .post(auth(Scope.WRITE_FILES), formidableUploadMiddleware, upload.register((uploadRequest) => filesController.uploadFile(uploadRequest)));

        filesRouter.route(["/browse", "/browse/:path([A-Za-z0-9_-]*)"])
            .get(auth(Scope.READ_FILES), browser.register(browse => filesController.browse(browse)))

        filesRouter.route("/directories")
            .get(auth(Scope.READ_FILES), simple.register(() => filesController.getDirectories()))
            .post(auth(Scope.WRITE_FILES), directory.register((creationRequest) => filesController.createDirectory(creationRequest)));

        filesRouter.route("/:pathUUID")
            .get(auth(Scope.READ_FILES), fileID.register(fileIdentifier => filesController.getFileDetails(fileIdentifier)))
            .put(auth(Scope.WRITE_FILES), update.register((updateRequest) => filesController.updateFileMetaInfo(updateRequest)))
            .delete(auth(Scope.WRITE_FILES), fileID.register(fileIdentifier => filesController.deleteFile(fileIdentifier)));

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

    private prepareAuth(): (scope: Scope) => RequestHandler[] {

        return (scope) => [
            auth({
                issuerBaseURL: this.authConfig.oauthIssuer,
                audience: this.authConfig.oauthAudience
            }),
            requiredScopes(scope)
        ];
    }
}

export const controllerRegistration = new ControllerRegistration(configurationProvider, [
    actuatorController,
    filesController
]);
