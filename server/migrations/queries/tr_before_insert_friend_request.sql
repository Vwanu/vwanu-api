CREATE TRIGGER 
before_insert_friend_request
BEFORE INSERT ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION fn_check_friend_request();