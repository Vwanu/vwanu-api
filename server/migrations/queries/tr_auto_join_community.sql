CREATE TRIGGER tr_auto_join_community
AFTER INSERT ON communities
FOR EACH ROW EXECUTE FUNCTION fn_auto_join_community();