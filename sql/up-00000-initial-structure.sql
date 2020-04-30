CREATE TABLE `node` (
    `nodeId` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ,
    `depth` BIGINT UNSIGNED NOT NULL ,
    PRIMARY KEY (`nodeId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tag` (
    `tagId` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ,
    `title` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL ,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ,
    PRIMARY KEY (`tagId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `tag` ADD UNIQUE(`title`);

CREATE TABLE `nodeTag` (
    `nodeId` BIGINT UNSIGNED NOT NULL ,
    `tagId` BIGINT UNSIGNED NOT NULL ,
    PRIMARY KEY (`nodeId`, `tagId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `nodeTag`
    ADD CONSTRAINT `nodeTag_node`
    FOREIGN KEY (`nodeId`)
    REFERENCES `node`(`nodeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;

ALTER TABLE `nodeTag`
    ADD CONSTRAINT `nodeTag_tag`
    FOREIGN KEY (`tagId`)
    REFERENCES `tag`(`tagId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;

CREATE TABLE `edit` (
    `editId` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT ,
    `nodeId` BIGINT UNSIGNED NOT NULL ,

    `title` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL ,
    `description` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL ,
    `content` MEDIUMTEXT COLLATE utf8mb4_unicode_ci NOT NULL ,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ,
    PRIMARY KEY (`editId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `edit`
    ADD CONSTRAINT `edit_node`
    FOREIGN KEY (`nodeId`)
    REFERENCES `node`(`nodeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;

ALTER TABLE `edit`
    ADD UNIQUE `editRateConstraint` (`nodeId`, `createdAt`)
    USING BTREE;

CREATE TABLE `dependency` (
    `nodeId` BIGINT UNSIGNED NOT NULL ,
    `parentId` BIGINT UNSIGNED NOT NULL ,
    `direct` BOOLEAN NOT NULL ,
    PRIMARY KEY (`nodeId`, `parentId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `dependency`
    ADD CONSTRAINT `dependency_node`
    FOREIGN KEY (`nodeId`)
    REFERENCES `node`(`nodeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;

ALTER TABLE `dependency`
    ADD CONSTRAINT `dependency_parent`
    FOREIGN KEY (`parentId`)
    REFERENCES `node`(`nodeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;

CREATE TABLE `dirtyNode` (
    `nodeId` BIGINT UNSIGNED NOT NULL ,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ,
    PRIMARY KEY (`nodeId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `dirtyNode`
    ADD CONSTRAINT `dirtyNode_node`
    FOREIGN KEY (`nodeId`)
    REFERENCES `node`(`nodeId`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT;
