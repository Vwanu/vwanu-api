CREATE OR REPLACE FUNCTION proc_get_friends (p_user_id UUID, p_req_id UUID, p_limit INT, p_offSet INT) RETURNS TABLE ("total" INT, "data" JSON)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT
 (SELECT amount_of_friend 
  FROM "Users" 
  WHERE "Users"."id"= p_user_id
  ) as "total",
(
SELECT 
json_agg(
  json_build_object(
    'id', "U"."id",
    'firstName', "U".first_name,
    'lastName', "U".last_name,
    'profilePicture', "U".profile_picture,
    'email', "U"."email",
    'amountOfFollower',"U".amount_of_follower,
    'amountOfFollowing',"U".amount_of_following,
    'amountOfFriend',"U".amount_of_friend,
    'isFriend', "U"."isFriend",
    'iFollow',"U"."iFollow"
--     'IsAFollower',"IsAFollower"
    )) AS data
  FROM ( 
  SELECT DISTINCT "Us"."id", "Us".first_name, "Us".last_name, "Us"..profile_picture, "Us"."email","Us".amount_of_follower,"Us".amount_of_following ,"Us".amount_of_friend ,
   
   (
    EXISTS
    (
     SELECT 1 FROM "friends" 
     WHERE ("User_friends"."UserId" = p_req_id AND "User_friends"."friendId" = "Us"."id") 
     OR ("User_friends"."UserId" = "Us"."id" AND "User_friends"."friendId" = p_req_id)
     )
    ) AS "isFriend", 
    (
      EXISTS
      (
        SELECT 1 
        FROM "User_Follower"  
        WHERE "User_Follower"."UserId" = "Us"."id" AND "User_Follower"."FollowerId" = p_req_id 
       )
    ) AS "iFollow"

   
  FROM "Users" AS "Us"
  
  WHERE "Us"."id" IN 
	( 
		SELECT "UserId" AS "id"
		FROM "User_friends"
		WHERE "User_friends"."friendId" = p_user_id  -- Parameterized user ID
		
		UNION DISTINCT
		SELECT "friendId" AS "id"
		FROM "User_friends"
		WHERE "User_friends"."UserId" = p_user_id
		OFFSET p_offSet
		LIMIT p_limit
/* OFFSET p_offSet */
	)) as "U");

END;
$$;