CREATE OR REPLACE FUNCTION public.fn_get_community_by_id(
    p_user_id UUID, 
    p_community_id UUID
)
RETURNS TABLE(
    comm_id UUID, 
    community_name TEXT, 
    description TEXT,  
    profilePicture TEXT, 
    coverPicture TEXT, 
    numMembers INTEGER, 
    numAdmins INTEGER,  
    Interests JSONB[], 
    canUserPost BOOLEAN, 
    canUserInvite BOOLEAN, 
    canUserUploadDoc BOOLEAN, 
    canUserUploadPhotos BOOLEAN,
    canUserUploadVideo BOOLEAN, 
    canMessageUserInGroup BOOLEAN, 
    isMember JSONB, 
    pendingInvitation JSONB[], 
    haveDiscussionForum BOOLEAN, 
    creator JSONB, 
    commPrivacyType TEXT, 
    commUserId UUID
)
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
        SELECT 1 
        FROM community_bans
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
        SELECT 1 
        FROM communities
        WHERE id = p_community_id 
        AND user_id = p_user_id
    ) INTO v_is_creator;

    -- Check if the community is public
    SELECT EXISTS(
        SELECT 1 
        FROM communities
        WHERE id = p_community_id 
        AND privacy_type = 'public'
    ) INTO v_is_public;

    -- Fetch the user's role if they are a member of the community
    SELECT community_role_id, name 
    INTO v_role_id, v_role_name
    FROM community_users 
    JOIN roles ON roles.id = community_users.community_role_id
    WHERE user_id = p_user_id AND community_id = p_community_id;

    -- Check if user is a member of the community
    SELECT EXISTS(
        SELECT 1 
        FROM community_users
        WHERE user_id = p_user_id 
        AND community_id = p_community_id
    ) INTO v_is_member;
    
    -- Fetch community if any of the conditions is met
    IF v_is_creator OR v_is_public OR v_is_member THEN
        SELECT * INTO v_community_record
        FROM communities
        WHERE id = p_community_id;

        comm_id := v_community_record.id;
        community_name := v_community_record.name;
        description := v_community_record.description;
        commUserId := v_community_record.user_id;
        profilePicture := v_community_record.profile_picture;
        coverPicture := v_community_record.cover_picture;
        numMembers := v_community_record.num_members;
        numAdmins := v_community_record.num_admins;
        commPrivacyType := v_community_record.privacy_type;
        haveDiscussionForum := v_community_record.have_discussion_forum;

        -- Fetch interests as an array
        SELECT array_agg(jsonb_build_object(
            'id', i.id, 
            'name', i.name 
        )) INTO Interests
        FROM community_interests AS ci
        INNER JOIN interests AS i ON i.id = ci.interest_id
        WHERE community_id = p_community_id;

        canUserPost := v_is_member AND (
            v_community_record.can_in_post = 'E' OR 
            (v_community_record.can_in_post = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
            (v_community_record.can_in_post = 'A' AND v_role_name = 'admin')
        ) OR v_is_creator;

        canUserInvite := v_is_member AND (
            v_community_record.can_invite = 'E' OR 
            (v_community_record.can_invite = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
            (v_community_record.can_invite = 'A' AND v_role_name = 'admin')
        ) OR v_is_creator;

        canUserUploadDoc := v_is_member AND (
            v_community_record.can_in_upload_doc = 'E' OR 
            (v_community_record.can_in_upload_doc = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
            (v_community_record.can_in_upload_doc = 'A' AND v_role_name = 'admin')
        ) OR v_is_creator;

        canUserUploadPhotos := v_is_member AND (
            v_community_record.can_in_upload_photos = 'E' OR 
            (v_community_record.can_in_upload_photos = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
            (v_community_record.can_in_upload_photos = 'A' AND v_role_name = 'admin')
        ) OR v_is_creator;

        --canUserUploadVideo := v_is_member AND (
          --  v_community_record.can_in_upload_videos = 'E' OR 
         --   (v_community_record.can_in_upload_videos = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
        --    (v_community_record.can_in_upload_videos = 'A' AND v_role_name = 'admin')
     --   ) OR v_is_creator;

        canMessageUserInGroup := v_is_member AND (
            v_community_record.can_message_in_group = 'E' OR 
            (v_community_record.can_message_in_group = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR 
            (v_community_record.can_message_in_group = 'A' AND v_role_name = 'admin')
        ) OR v_is_creator;

        IF v_role_id IS NOT NULL THEN
            isMember := jsonb_build_object('roleId', v_role_id, 'role', v_role_name, 'id', p_user_id);
        END IF;

        SELECT array_agg(json_build_object(
            'id', invr.id,
            'role', roles.name,
            'roleId', roles.id,
            'createdAt', invr.created_at,
            'updatedAt', invr.updated_at,
            'hostId', invr.host_id,
            'guestId', invr.guest_id
        )) INTO pendingInvitation
        FROM community_invitation_requests AS invr 
        INNER JOIN roles ON roles.id = invr.community_role_id
        WHERE invr.community_id = p_community_id 
        AND invr.guest_id = p_user_id 
        AND invr.response IS NULL;

        SELECT jsonb_build_object(
            'id', u.id, 
            'firstName', u.first_name, 
            'lastName', u.last_name, 
            'profilePicture', u.profile_picture 
        ) INTO creator
        FROM users AS u
        WHERE id = v_community_record.user_id;

        RETURN NEXT;
    ELSE
        RAISE EXCEPTION 'User does not have the permission to view the community';
        RETURN;
    END IF;
END;
$function$;
