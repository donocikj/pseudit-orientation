-- create schema pseudit; 
USE pseudit;
DROP TABLE Post;
CREATE TABLE Post (
	Id BIGINT UNIQUE NOT NULL auto_increment,
    postedOn TIMESTAMP NOT NULL,
    title VARCHAR(255) DEFAULT "",
    url TEXT(1024),
    score BIGINT DEFAULT 0,
    postOwner VARCHAR(255),
    PRIMARY KEY(Id));
    