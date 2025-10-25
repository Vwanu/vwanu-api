--DROP FUNCTION fn_get_community_by_id(uuid,uuid) 
CREATE OR REPLACE FUNCTION public.fn_get_community_by_id(p_user_id uuid, p_community_id uuid)
 RETURNS TABLE(comm_id uuid, community_name text, description text,  "profilePicture" text, "coverPicture" text, "numMembers" integer, "numAdmins" integer,  "Interests" JSONB[], members JSONB[], "canUserInvite" boolean, "canUserUploadDoc" boolean, "canUserUploadPhotos" boolean, "isMember" jsonb, "pendingInvitation" jsonb[], creator jsonb, "commPrivacyType" text, "commUserId" uuid)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_is_banned BOOLEAN;
    v_is_creator BOOLEAN;
    v_is_public BOOLEAN;
	v_is_member BOOLEAN;
    v_role_id UUID;
    v_role_name TEXT;
    v_community_record RECORD;
BEGIN
    -- Check if the user is banned
    SELECT EXISTS(
        SELECT 1 FROM community_bans
        WHERE user_id = p_user_id 
        AND community_id = p_community_id 
        AND (until IS NULL OR until > NOW())
    ) INTO v_is_banned;

    IF v_is_banned THEN
        RAISE EXCEPTION 'User is banned from the community';
        RETURN;
    END IF;

    -- Check if user is the creator
    SELECT EXISTS(
        SELECT 1 FROM communities
        WHERE id = p_community_id 
        AND user_id = p_user_id
    ) INTO v_is_creator;

    -- Check if the community is public
    SELECT EXISTS(
        SELECT 1 FROM communities
        WHERE id = p_community_id 
        AND privacy_type = 'public'
    ) INTO v_is_public;

    -- Fetch the user's role if they are a member of the community
    SELECT community_role_id, name 
    INTO v_role_id, v_role_name
    FROM community_users 
    JOIN community_roles  ON community_roles.id = community_users.community_role_id
    WHERE user_id = p_user_id AND community_id = p_community_id;


	  -- Check if user is a member of the community
     SELECT EXISTS(
        SELECT 1 FROM community_users
        WHERE user_id = p_user_id 
        AND community_id = p_community_id
    ) INTO v_is_member;
    
    -- Fetch community if any of the conditions is met
    IF v_is_creator OR v_is_public OR v_is_member THEN
        SELECT * INTO v_community_record
        FROM communities
        WHERE id = p_community_id;

        comm_id:= v_community_record.id;
        community_name := v_community_record.name;
		description:= v_community_record.description;
		"commUserId":=v_community_record.user_id;
        "profilePicture" := v_community_record.profile_picture;
        "coverPicture" := v_community_record.cover_picture;
        "numMembers" := v_community_record.num_members;
        "numAdmins" := v_community_record.num_admins;
		"commPrivacyType":=v_community_record.privacy_type;

        -- Assuming you have the interests in a table, fetch them as an array
 

        SELECT array_agg(jsonb_build_object('id', i.id, 'name', i."name" )) INTO "Interests"
        FROM community_interests AS ci
        INNER JOIN interests AS i ON i.id = ci.interest_id
        WHERE ci.community_id = p_community_id;

         "canUserInvite" := v_is_member AND (v_community_record.can_invite = 'E' OR (v_community_record.can_invite = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record.can_invite = 'A' AND v_role_name = 'admin')) OR v_is_creator;

        IF v_role_id IS NOT NULL THEN
            "isMember" := jsonb_build_object('roleId', v_role_id, 'role', v_role_name,'id', p_user_id);
        END IF;

        SELECT array_agg(json_build_object(
            'id', "INV"."id",
            'role',"R"."name",
            'roleId',"R"."id",
            'createdAt',"INV"."created_at",
            'updatedAt',"INV"."updated_at",
            'hostId',"INV"."host",
            'guestId',"INV"."guest"
        )) INTO "pendingInvitation"
       FROM community_invitation_requests AS "INV" 
       INNER JOIN community_roles AS "R" ON "R"."id" = "INV"."community_role_id"
       WHERE "INV".community_id=p_community_id 
       AND "INV".guest=p_user_id AND "INV"."response" IS NULL;

       SELECT array_agg(
        jsonb_build_object(
        'id', u."id",
        'firstName', u."first_name",
        'lastName', u."last_name",
        'profilePicture', u."profile_picture"
              )) 
       INTO "members"
       FROM community_users AS cu
       INNER JOIN users AS u ON u.id = cu.user_id
       WHERE cu.community_id = p_community_id;

       SELECT jsonb_build_object(
        'id', u."id", 
        'firstName', u."first_name", 
        'lastName', u."last_name", 
        'profilePicture', u."profile_picture" ) 
        INTO creator
       FROM users AS u
       WHERE id = v_community_record.user_id;

        RETURN NEXT;
    ELSE
        RAISE EXCEPTION 'User does not have the permission to view the community % and %', v_is_creator, v_is_public;
        RETURN;
    END IF;
END;
$function$
