-- create schema pseudit; 
USE pseudit;

CREATE TABLE Post (
	Id BIGINT UNIQUE NOT NULL auto_increment,
    postedOn TIMESTAMP NOT NULL,
    title VARCHAR(255) DEFAULT "",
    url TEXT(1024),
    score BIGINT DEFAULT 0,
    postOwner VARCHAR(255) DEFAULT "nn",
    PRIMARY KEY(Id));
    