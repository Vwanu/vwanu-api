export default `(
    SELECT 
    json_agg(
        json_build_object(
            'id', "INV"."id",
            'role',"R"."name",
            'roleId',"R"."id",
            'createdAt',"INV"."created_at",
            'updatedAt',"INV"."updated_at",
            'hostId',"INV"."host",
            'guestId',"INV"."guest"
        )
    ) FROM community_invitation_requests AS "INV" 
    INNER JOIN  community_roles AS "R" ON "R"."id" = "INV"."community_role_id"
    WHERE "INV".community_id="Community"."id" AND "INV"."guest"=':userId' AND "INV"."response" IS NULL
)`