CREATE TABLE `Agent`(
    `id` BIGINT UNSIGNED NOT NULL,
    `rbxname` VARCHAR(255) UNIQUE NULL,
    `joindate` DATETIME NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `Role`(
    `id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `division` BOOLEAN NOT NULL,
    `obtainable` BOOLEAN NOT NULL,
    `weight` TINYINT UNSIGNED NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `AgentRole`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `roleid` BIGINT UNSIGNED NOT NULL,
    `issuedby` VARCHAR(255) NULL,
    `issuedon` DATE NOT NULL,
    CONSTRAINT fk_agentid_1
        FOREIGN KEY(agentid) REFERENCES Agent(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT fk_roleid
        FOREIGN KEY(roleid) REFERENCES Role(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
CREATE TABLE `LOALog`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(255) NULL,
    `start` DATE NOT NULL,
    `end` DATE NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `AgentLOALog`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `loaid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    CONSTRAINT fk_agentid_2
        FOREIGN KEY(agentid) REFERENCES Agent(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT fk_loaid
        FOREIGN KEY(loaid) REFERENCES LOALog(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
CREATE TABLE `ModLog`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `issuedby` BIGINT UNSIGNED NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `date` DATETIME NOT NULL,
    `expired` DATE NULL,
    PRIMARY KEY(`id`),
    CONSTRAINT fk_issuedby FOREIGN KEY(issuedby) REFERENCES Agent(id)
);
CREATE TABLE `AgentModLog`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `modlogid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    CONSTRAINT fk_agentid_3
        FOREIGN KEY(agentid) REFERENCES Agent(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT fk_modlogid
        FOREIGN KEY(modlogid) REFERENCES ModLog(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
CREATE TABLE `PatrolLog`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `duration` TIME NOT NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `AgentPatrolLog`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `patrolid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    CONSTRAINT fk_agentid_4
        FOREIGN KEY(agentid) REFERENCES Agent(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT fk_patrolid
        FOREIGN KEY(patrolid) REFERENCES PatrolLog(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
CREATE TABLE `TrainingLog`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `duration` TIME NOT NULL,
    `division` VARCHAR(255) NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `TrainingHost`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `trainingid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    CONSTRAINT fk_agentid_5 FOREIGN KEY(agentid) REFERENCES Agent(id),
    CONSTRAINT fk_trainingid_1 FOREIGN KEY(trainingid) REFERENCES TrainingLog(id)
);
CREATE TABLE `TrainingParticipant`(
    `agentid` BIGINT UNSIGNED NOT NULL,
    `trainingid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `passed` BOOLEAN NOT NULL,
    `failreason` VARCHAR(255) NULL,
    CONSTRAINT fk_agentid_6
        FOREIGN KEY(agentid) REFERENCES Agent(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT fk_trainingid_2
        FOREIGN KEY(trainingid) REFERENCES TrainingLog(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);