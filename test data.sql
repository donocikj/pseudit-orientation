use pseudit;
insert into post (postedOn, title, url, postOwner) 
		  values ("2000-12-31 23:55", "testtitle", "https://9gag.com", "testowner");
          
insert into post (postedOn, title, url) 
		  values ("2019-1-1 23:55", "testtitle", "https://9gag.com");
--           
-- update post set postedOn= "2000-12-31 23:55" where id=1;