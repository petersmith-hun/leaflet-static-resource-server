import os from "os";

export const uploadPath = `${os.tmpdir()}/lsrs-storage`;
export const databasePath = `acceptance/out/lsrs-sqlite.db`;

process.env.NODE_ENV = "test";
process.env.NODE_CONFIG = JSON.stringify({
    lsrs: {
        datasource: {
            uri: `sqlite:${databasePath}`
        },
        storage: {
            "upload-path": uploadPath
        }
    }
});
