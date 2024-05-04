import { datasourceConfiguration } from "@app/core/config/datasource-configuration";
import { fileStorageConfiguration } from "@app/core/config/file-storage-configuration";
import LoggerFactory from "@app/helper/logger-factory";
import { leafletStaticResourceServerApplication } from "@app/leaflet-static-resource-server-application";

[datasourceConfiguration, fileStorageConfiguration]
    .forEach(async configuration => {
        try {
            await configuration.init();
        } catch (error) {
            // @ts-ignore
            LoggerFactory.getLogger("main").error(error?.message);
            process.exit(1);
        }
    });

leafletStaticResourceServerApplication.run();
