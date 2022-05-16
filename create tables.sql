-- create schema pseudit; 
USE pseudit;

DROP TABLE vote;

DROP TABLE Post;
CREATE TABLE Post (
	Id BIGINT UNIQUE NOT NULL auto_increment,
    postedOn TIMESTAMP NOT NULL,
    title VARCHAR(255) DEFAULT "",
    postOwner BIGINT,
    PRIMARY KEY(Id));
    
DROP TABLE pseuditor;
--     
CREATE TABLE Pseuditor (
	Id BIGINT UNIQUE NOT NULL auto_increment,
    username VARCHAR(255) NOT NULL,
    PRIMARY KEY(Id));
--     
CREATE TABLE Vote (
	PostId BIGINT NOT NULL,
    UserID BIGINT NOT NULL,
    Vote TINYINT NOT NULL,
    PRIMARY KEY (PostId, UserID),
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (UserID) REFERENCES Pseuditor(Id));

-- ALTER TABLE Post DROP COLUMN score;

    