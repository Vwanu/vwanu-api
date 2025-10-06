export default `(
    SELECT
        json_agg(
            json_build_object(
                'id', "I"."id",
                'name', "I"."name"
            )
        ) FROM interests AS "I"
        INNER JOIN community_interests AS "CI" ON "CI".interest_id = "I"."id"
        WHERE "CI".community_id="Community"."id"
)
`;
