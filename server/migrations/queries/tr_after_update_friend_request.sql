CREATE TRIGGER after_update_friend_request
AFTER UPDATE ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION fn_handle_friend_request_update();
