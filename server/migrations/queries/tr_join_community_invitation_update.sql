CREATE TRIGGER tr_join_community_invitation_update
AFTER UPDATE ON "community_invitation_requests"
FOR EACH ROW EXECUTE FUNCTION fn_join_community_invitation_update();