CREATE TABLE `leaflet_uploaded_files`
(
    `id`                 integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    `date_created`       datetime(6)  DEFAULT NULL,
    `is_enabled`         bit(1)       DEFAULT NULL,
    `date_last_modified` datetime(6)  DEFAULT NULL,
    `description`        varchar(255) DEFAULT NULL,
    `mime`               varchar(255) DEFAULT NULL,
    `original_filename`  varchar(255) DEFAULT NULL,
    `path`               varchar(255) DEFAULT NULL UNIQUE,
    `path_uuid`          varchar(255) DEFAULT NULL UNIQUE,
    `stored_filename`    varchar(255) DEFAULT NULL
);
