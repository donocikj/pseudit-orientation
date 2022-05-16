use pseudit;
-- insert into post (postedOn, title, url, postOwner) 
--  		  values ("2019-12-31 22:55", "testtitle", "https://9gag.com", "3"); 

-- insert into post (postedOn, title, url, postOwner) 
--  		  values ("2019-12-31 20:55", "testtitle", "https://9gag.com", "3"); 

-- insert into pseuditor (username) values ('karl'), ('testuser'), ('someone');

-- INSERT INTO vote values(21, 3, 1);
-- INSERT INTO vote values(22, 3, 1);
-- INSERT INTO vote values(20, 2, 1);
                    
-- insert into post (postedOn, title, url) 
-- 		  values ("2019-1-1 23:55", "testtitle2", "https://9gag.com");
--           
-- update post set postedOn= "2000-12-31 23:55" where id=1;

-- UPDATE Post SET score = score + '1' WHERE Id = '1'; 
-- update Post set postOwner = 1 where Id = 1;
-- select * from Post 

-- insert into vote values(22,2,1), (22,1,1);


-- select Vote 
-- 			from Post 
--             inner join pseuditor on post.postOwner=pseuditor.Id 
--             inner join vote on post.Id = vote.PostId AND pseuditor.Id= vote.UserId 
--             WHERE pseuditor.username='testuser';

-- SELECT Post.Id as POST_ID, 
-- 		title, 
-- 		url, 
--         postedOn,  
-- 		username, 
--         SUM(Vote) as score,
--         (select Vote 
-- 			from Post 
--             inner join pseuditor on post.postOwner=pseuditor.Id 
--             inner join vote on post.Id = vote.PostId AND pseuditor.Id= vote.UserId 
--             WHERE pseuditor.username='testuser' AND POST_ID=vote.PostId) as myvote
--         
-- 	FROM Post 
-- 		LEFT JOIN pseuditor ON post.postOwner=pseuditor.Id 
-- 		LEFT JOIN vote ON post.Id = vote.PostID
-- 	GROUP BY Post.Id;
--         
-- SELECT * FROM Post;

-- select * from vote;

-- truncate table vote;
-- truncate table pseuditor;
-- truncate table post;

-- insert into pseuditor (username) values ('karl'), ('testuser'), ('nn'), ('sheev'); 

-- select * from Post JOIN vote ON vote.postId = Post.Id JOIN pseuditor ON vote.userID = pseuditor.Id;
		
    