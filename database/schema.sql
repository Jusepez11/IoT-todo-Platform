CREATE DATABASE IF NOT EXISTS IoT_AWS_Display;
USE IoT_AWS_Display;

CREATE TABLE IF NOT EXISTS task (
    task_id             VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    device_id           VARCHAR(36)     NOT NULL,
    task_description    VARCHAR(255)    NOT NULL,
    due_date            DATETIME,
    is_complete         BOOLEAN         DEFAULT FALSE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS user (
    user_id             VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    email               VARCHAR(255)    NOT NULL UNIQUE,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device (
    device_id           VARCHAR(36)     PRIMARY KEY,
    user_id             VARCHAR(36)     NOT NULL,
    linked_at           DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS list (
    list_id             VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id             VARCHAR(36)     NOT NULL,
    list_name           VARCHAR(255)    NOT NULL,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);
