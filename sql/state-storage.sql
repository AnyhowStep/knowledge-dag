CREATE TABLE IF NOT EXISTS `successfulMigration` (
    `identifier` VARCHAR(255) NOT NULL ,
    `migratedUp` BOOLEAN NOT NULL ,
    `timestamp` DOUBLE NOT NULL ,
    `batchNumber` DOUBLE NOT NULL ,
    PRIMARY KEY (`identifier`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `migrationLock` (
    `lockKey` VARCHAR(255) NOT NULL ,
    PRIMARY KEY (`lockKey`)
) ENGINE = InnoDB;
