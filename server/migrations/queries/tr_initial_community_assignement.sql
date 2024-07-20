CREATE TRIGGER 
tr_initial_community_assignement
    AFTER UPDATE OR INSERT ON "entity_addresses"
    FOR EACH ROW
    EXECUTE FUNCTION fn_initial_community_assignement();