/* Location */
/* CREATE SCHEMA location;
CREATE SCHEMA application;
CREATE SCHEMA notification;
CREATE SCHEMA authorization;
CREATE SCHEMA networking;
CREATE SCHEMA interactions;
CREATE SCHEMA chat;
CREATE SCHEMA content_management; */

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    country_id INTEGER NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INTEGER NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE IF NOT EXISTS address_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

/* End of location */

/* Application */


CREATE TABLE IF NOT EXISTS error_codes (
    error_code VARCHAR(255) PRIMARY KEY,
    error_message VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expiry_times (
    request_type VARCHAR(255) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    expiry_duration_minutes INTEGER NOT NULL
);
/* End of application */



/* Authorization */


CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    role_access_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS moderation_reasons (
    id SERIAL PRIMARY KEY,
    reason VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);
/* End of authorization */

/* General Tables */
CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


/* End of General Tables */

/* Networking */


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    access_role INTEGER,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    gender BOOLEAN DEFAULT true, -- true for male, false for female
    about VARCHAR(255),
    activation_key VARCHAR(255),
    reset_password_key VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    birthday VARCHAR(255),
    phone VARCHAR(255),
    amount_of_follower INTEGER NOT NULL DEFAULT 0,
    amount_of_following INTEGER DEFAULT 0,
    amount_of_friend INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (access_role) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS user_interests (
    user_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS access_level_logs (
    granted_to INTEGER,
    granted_by INTEGER,
    access_level INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (granted_to) REFERENCES users(id),
    FOREIGN KEY (granted_by) REFERENCES users(id),
    FOREIGN KEY (access_level) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
    requester_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT requester_receiver_unique UNIQUE (requester_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS undesired_friends (
    user_id INTEGER NOT NULL,
    undesired_user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (undesired_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_undesired_user_unique UNIQUE (user_id, undesired_user_id)
);
CREATE TABLE IF NOT EXISTS friends (
    user_one_id INTEGER NOT NULL,
    user_two_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_one_id, user_two_id),
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visitors (
    user_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (visitor_id) REFERENCES users(id)
);
/* End of networking */



/* Notification */

CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    snug VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_messages (
    snug VARCHAR(255) PRIMARY KEY,
    template_body TEXT NOT NULL UNIQUE,
    required_fields JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_types (
    notification_slug VARCHAR(255) PRIMARY KEY,
    notification_name VARCHAR(255) UNIQUE NOT NULL,
    notification_description TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    to_user_id INTEGER,
    message VARCHAR(255),
    type VARCHAR(255),
    entity_name VARCHAR(255),
    entity_id INTEGER,
    sound BOOLEAN NOT NULL,
    notification_type VARCHAR(255) NOT NULL,
    view BOOLEAN DEFAULT false,
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (notification_type) REFERENCES notification_types(notification_slug)
);
/* End of notification */
/* Interaction */


CREATE TABLE IF NOT EXISTS forums (
    id SERIAL PRIMARY KEY,
    cover_picture VARCHAR(255),
    description TEXT,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR
);

CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL,
    num_members INTEGER DEFAULT 0,
    num_admins INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL UNIQUE,
    privacy_type VARCHAR(255) DEFAULT 'public' NOT NULL,
    cover_picture VARCHAR(255),
    description TEXT NOT NULL UNIQUE,
    profile_picture VARCHAR(255),
    default_invitation_email TEXT,
    have_discussion_forum BOOLEAN DEFAULT true,
    search_vector TSVECTOR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS community_interests (
    community_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, interest_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);

CREATE TABLE IF NOT EXISTS community_invitation_requests (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL,
    host_id INTEGER NOT NULL,
    email VARCHAR(255),
    response BOOLEAN,
    response_date TIMESTAMP,
    community_id INTEGER NOT NULL,
    community_role_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (guest_id, community_id, community_role_id),
    FOREIGN KEY (guest_id) REFERENCES users(id),
    FOREIGN KEY (host_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id),
    FOREIGN KEY (community_role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS community_users (
    community_role_id INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_role_id, community_id, user_id),
    FOREIGN KEY (community_role_id) REFERENCES roles(id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT community_users_unique UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_history (
    user_id INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    joined BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, community_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS community_bans (
    user_id INTEGER NOT NULL,
    community_id INTEGER NOT NULL,
    by_user_id INTEGER NOT NULL,
    moderation_reason_id INTEGER NOT NULL,
    comment TEXT,
    until TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id),
    FOREIGN KEY (by_user_id) REFERENCES users(id),
    FOREIGN KEY (moderation_reason_id) REFERENCES moderation_reasons(id)
);
/* End of interactions */

/* Chat */


CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    amount_of_people INTEGER DEFAULT 0,
    amount_of_messages INTEGER DEFAULT 0,
    amount_of_unread_messages INTEGER DEFAULT 0,
    type VARCHAR(255) NOT NULL DEFAULT 'direct',
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message_text TEXT,
    read BOOLEAN DEFAULT false,
    received BOOLEAN DEFAULT false,
    read_date TIMESTAMP,
    received_date TIMESTAMP,
    sender_id INTEGER,
    conversation_id INTEGER,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);


/* End of chat */

/* Content Management */


CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    post_text TEXT,
    privacy_type VARCHAR(255) DEFAULT 'public',
    locked BOOLEAN DEFAULT false,
    original_type VARCHAR(255) DEFAULT 'public',
    user_id INTEGER NOT NULL,
    community_id INTEGER,
    original_post_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (original_post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    title TEXT NOT NULL,
    privacy_type VARCHAR(255) DEFAULT 'public',
    banned BOOLEAN DEFAULT false,
    banned_reason TEXT,
    locked BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS korems (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER NOT NULL,
    user_id INTEGER,
    entity_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    blog_text TEXT,
    blog_title TEXT NOT NULL,
    cover_picture VARCHAR(255),
    publish BOOLEAN DEFAULT false,
    slug TEXT,
    amount_of_likes INTEGER DEFAULT 0,
    amount_of_comments INTEGER DEFAULT 0,
    search_vector TSVECTOR
);

CREATE TABLE IF NOT EXISTS blog_responses (
    id SERIAL PRIMARY KEY,
    response_text TEXT NOT NULL,
    banned BOOLEAN DEFAULT false,
    banned_reason TEXT,
    banned_by INTEGER,
    user_id INTEGER,
    blog_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_interests (
    blog_id SERIAL PRIMARY KEY,
    interest_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (blog_id) REFERENCES blogs(id),
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);

CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    cover_picture VARCHAR(255),
    privacy_type VARCHAR(255) DEFAULT 'public'
);

CREATE TABLE IF NOT EXISTS medias (
    id SERIAL PRIMARY KEY,
    original VARCHAR(255) NOT NULL,
    large VARCHAR(255),
    medium VARCHAR(255),
    small VARCHAR(255),
    tiny VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS post_medias (
    post_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, media_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS  message_medias (
    message_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (message_id, media_id),
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);
CREATE TABLE IF NOT EXISTS  user_notification_settings (
    user_id INTEGER NOT NULL,
    notification_setting_id INTEGER NOT NULL,
    notification_status VARCHAR(20) DEFAULT 'on',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
    /* FOREIGN KEY (notification_setting_id) REFERENCES notification_types(id) */
);

CREATE TABLE IF NOT EXISTS album_medias (
    album_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (album_id, media_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS discussion_medias (
    discussion_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, media_id),
    FOREIGN KEY (discussion_id) REFERENCES discussions(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);
CREATE TABLE IF NOT EXISTS discussion_interests (
    discussion_id INTEGER NOT NULL,
    interest_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, interest_id),
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);
/* End of content management */
/* contact */
CREATE TABLE IF NOT EXISTS phones (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(255),
    country_code INTEGER NOT NULL,
    FOREIGN KEY (country_code) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS user_phone_verifications (
    user_id INTEGER NOT NULL,
    phone_id INTEGER NOT NULL,
    verification_code VARCHAR(255) NOT NULL,
    code_sent_time TIMESTAMP NOT NULL DEFAULT NOW(),
    verified_time TIMESTAMP,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (user_id, phone_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (phone_id) REFERENCES phones(id)
);
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_companies (
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    from_date TIMESTAMP NOT NULL DEFAULT NOW(),
    to_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE OR REPLACE FUNCTION public.delete_phone_association(user_id character varying, phone_number character varying)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_phone_id INT;
    v_error_message TEXT;
BEGIN
    -- Retrieve the phone_id for the given phone number
    SELECT phone_id INTO v_phone_id FROM PhoneNumbers WHERE phone_number = phone_number;

    -- If no phone number is found, retrieve and return the standardized error message
    IF v_phone_id IS NULL THEN
        SELECT error_message INTO v_error_message FROM ErrorCodes WHERE error_code = 'NO_PHONE_FOUND';
        IF v_error_message IS NULL THEN
            RETURN 'No such phone number exists.';
        ELSE
            RETURN v_error_message;
        END IF;
    END IF;

    -- Check if the phone number is associated with the user
    IF NOT EXISTS (SELECT 1 FROM UserPhoneVerifications WHERE user_id = user_id AND phone_id = v_phone_id) THEN
        SELECT error_message INTO v_error_message FROM ErrorCodes WHERE error_code = 'PHONE_NOT_ASSOCIATED';
        IF v_error_message IS NULL THEN
            RETURN 'Phone number not associated with the user.';
        ELSE
            RETURN v_error_message;
        END IF;
    ELSE
        -- Delete the association
        DELETE FROM UserPhoneVerifications WHERE user_id = user_id AND phone_id = v_phone_id;

        -- Check if other users are still associated with this phone number
        IF NOT EXISTS (SELECT 1 FROM UserPhoneVerifications WHERE phone_id = v_phone_id) THEN
            -- If no other users are associated, consider deleting the phone number from PhoneNumbers
            DELETE FROM PhoneNumbers WHERE phone_id = v_phone_id;
            RETURN 'Phone number deleted from the system.';
        ELSE
            RETURN 'Phone number association with the user deleted.';
        END IF;
    END IF;
END;
$function$

/* 

CREATE OR REPLACE FUNCTION public.fn_add_or_associate_phone(p_user_id uuid, p_phone_number character varying, country_code uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_phone_id INT;
    v_error_message TEXT;
    v_new_code TEXT;
BEGIN
    -- Check if the phone number exists
    SELECT id INTO v_phone_id FROM phones WHERE phones.phone_number = p_phone_number;

    -- If the phone number does not exist, insert it
    IF v_phone_id IS NULL THEN
        INSERT INTO phones(phone_number, country_code,created_at,updated_at)
        VALUES(p_phone_number, country_code,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING id INTO v_phone_id;
    END IF;
    
    -- Check if the phone number is already associated with the user
    IF EXISTS (SELECT 1 FROM user_phone_verifications WHERE user_phone_verifications.user_id = p_user_id AND user_phone_verifications.phone_id = v_phone_id) THEN
        -- Retrieve error message for already associated phone
        SELECT error_message INTO v_error_message FROM error_codes WHERE error_code = 'PHN_ASSOC_ERR';
        IF v_error_message IS NULL THEN
            v_error_message := 'Phone is already associated with the user';
        END IF;
        RAISE EXCEPTION '%', v_error_message;
    ELSE
     -- Generate a new 4-digit verification code
        v_new_code := LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        -- Associate the phone number with the user
        INSERT INTO user_phone_verifications(user_id, phone_id, verification_code, code_sent_time,created_at,updated_at)
        VALUES(p_user_id, v_phone_id, v_new_code, NOW(),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
		RETURN v_new_code;
    END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_add_user_notification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_notification_slug RECORD;
BEGIN
    -- Loop through all notification slugs
    FOR v_notification_slug IN SELECT notification_slug FROM notification_types LOOP
        -- Insert a new row into user_notification_types for each notification type
        INSERT INTO user_notification_types (user_id, notification_slug, text, email, sound)
        VALUES (NEW.id, v_notification_slug.notification_slug, FALSE, FALSE, TRUE);
    END LOOP;

    -- Return the new row to indicate successful insertion
    RETURN NEW;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_auto_join_community()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE 
  admin_role_id UUID;
BEGIN
    SELECT id 
    INTO admin_role_id 
    FROM "CommunityRoles"
    WHERE "name" = 'admin';

    INSERT INTO community_users (user_id, community_id, community_role_id, created_at)
    VALUES (NEW."UserId", NEW.id, admin_role_id, CURRENT_TIMESTAMP);
    RETURN NEW;
  
END;
$function$

CREATE OR REPLACE FUNCTION public.fn_get_community_by_id(p_user_id uuid, p_community_id uuid)
 RETURNS TABLE(comm_id uuid, community_name text, description text, "profilePicture" text, "coverPicture" text, "numMembers" integer, "numAdmins" integer, "Interests" jsonb[], "canUserPost" boolean, "canUserInvite" boolean, "canUserUploadDoc" boolean, "canUserUploadPhotos" boolean, "canUserUploadVideo" boolean, "canMessageUserInGroup" boolean, "isMember" jsonb, "pendingInvitation" jsonb[], "haveDiscussionForum" boolean, creator jsonb, "commPrivacyType" text, "commUserId" uuid)
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
        SELECT 1 FROM "Communities"
        WHERE id = p_community_id 
        AND "UserId" = p_user_id
    ) INTO v_is_creator;

    -- Check if the community is public
    SELECT EXISTS(
        SELECT 1 FROM "Communities"
        WHERE id = p_community_id 
        AND "privacyType" = 'public'
    ) INTO v_is_public;

    -- Fetch the user's role if they are a member of the community
    SELECT community_role_id, name 
    INTO v_role_id, v_role_name
    FROM community_users 
    JOIN "CommunityRoles"  ON "CommunityRoles"."id" = community_users.community_role_id
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
        FROM "Communities"
        WHERE id = p_community_id;

        comm_id:= v_community_record.id;
        community_name := v_community_record.name;
		description:= v_community_record.description;
		"commUserId":=v_community_record."UserId";
        "profilePicture" := v_community_record."profilePicture";
        "coverPicture" := v_community_record."coverPicture";
        "numMembers" := v_community_record."numMembers";
        "numAdmins" := v_community_record."numAdmins";
		"commPrivacyType":=v_community_record."privacyType";
        "haveDiscussionForum":= v_community_record."haveDiscussionForum";

        -- Assuming you have the interests in a table, fetch them as an array
 

        SELECT array_agg(jsonb_build_object('id', i.id, 'name', i."name" )) INTO "Interests"
        FROM "Community_Interest" AS ci
        INNER JOIN "Interests" AS i ON i.id = ci."InterestId"
        WHERE "CommunityId" = p_community_id;


        "canUserPost" := v_is_member AND (v_community_record."canInPost" = 'E' OR (v_community_record."canInPost" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canInPost" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

        "canUserInvite" := v_is_member AND (v_community_record."canInvite" = 'E' OR (v_community_record."canInvite" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canInvite" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

        "canUserUploadDoc" := v_is_member AND (v_community_record."canInUploadDoc" = 'E' OR (v_community_record."canInUploadDoc" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canInUploadDoc" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

        "canUserUploadPhotos" := v_is_member AND (v_community_record."canInUploadPhotos" = 'E' OR (v_community_record."canInUploadPhotos" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canInUploadPhotos" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

"canUserUploadVideo" := v_is_member AND (v_community_record."canInUploadVideo" = 'E' OR (v_community_record."canInUploadVideo" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canInUploadVideo" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

"canMessageUserInGroup" := v_is_member AND (v_community_record."canMessageInGroup" = 'E' OR (v_community_record."canMessageInGroup" = 'M' AND (v_role_name = 'moderator' OR v_role_name = 'admin')) OR (v_community_record."canMessageInGroup" = 'A' AND v_role_name = 'admin')) OR v_is_creator;

        IF v_role_id IS NOT NULL THEN
            "isMember" := jsonb_build_object('roleId', v_role_id, 'role', v_role_name,'id', p_user_id);
        END IF;

        SELECT array_agg(json_build_object(
            'id', "INV"."id",
            'role',"R"."name",
            'roleId',"R"."id",
            'createdAt',"INV"."createdAt",
            'updatedAt',"INV"."updatedAt",
            'hostId',"INV"."hostId",
            'guestId',"INV"."guestId"
        )) INTO "pendingInvitation"
       FROM "CommunityInvitationRequests" AS "INV" 
       INNER JOIN "CommunityRoles" AS "R" ON "R"."id" = "INV"."CommunityRoleId"
       WHERE "INV"."CommunityId"=p_community_id AND "INV"."guestId"=p_user_id AND "INV"."response" IS NULL;

       SELECT jsonb_build_object('id', u."id", 'firstName', u."firstName", 'lastName', u."lastName", 'profilePicture', u."profilePicture" ) INTO creator
       FROM "Users" AS u
       WHERE id = v_community_record."UserId";

        RETURN NEXT;
    ELSE
        RAISE EXCEPTION 'User does not have the permission to view the community % and %', v_is_creator, v_is_public;
        RETURN;
    END IF;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_initial_community_assignement()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_community_role_id uuid;
    v_community_id uuid;
    v_city_id uuid;
    v_city_name text;
BEGIN
    
     -- First, get the cityId from the address of the user
    SELECT "CityId" INTO v_city_id
    FROM "Addresses"
    WHERE id = NEW."AddressId";

    -- Next, get the city name from the Cities table
    SELECT name INTO v_city_name
    FROM "Cities"
    WHERE id = v_city_id;

   -- Check if there's a community for the user's city
    SELECT id INTO v_community_id
    FROM "Communities"
    WHERE "Communities".name = v_city_name
    LIMIT 1;

    -- If there's a community for the user's city, assign the user to the community
    IF v_community_id IS NOT NULL THEN
        IF NOT EXISTS(
            SELECT 1
            FROM community_users
            WHERE user_id = NEW."UserId" AND community_id = v_community_id
        ) THEN
            SELECT id INTO v_community_role_id
            FROM "CommunityRoles"
            WHERE name = 'member';
          
            INSERT INTO community_users (user_id, community_id,community_role_id, created_at)
            VALUES (NEW."UserId", v_community_id, v_community_role_id, NOW());
        END IF;
        END IF;
        
    RETURN NULL;
END;
$function$

CREATE OR REPLACE FUNCTION public.fn_join_community_invitation_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE p_role uuid;
BEGIN


IF TG_OP = 'UPDATE' THEN
-- Insert the new user in the community_users table
	IF( NEW.response = true) THEN
		-- Check if the user is already a member of the community
		SELECT community_role_id
		INTO p_role
		FROM community_users
		WHERE user_id = NEW."guestId" AND 
		community_id = NEW."CommunityId";

		IF p_role IS NULL THEN
			INSERT INTO community_users (user_id, community_id, community_role_id, created_at)
			VALUES (NEW."guestId", NEW."CommunityId", NEW."CommunityRoleId", CURRENT_TIMESTAMP);
		ELSE

		-- check if it is the same role as the one in the community_users table

			IF p_role != NEW."CommunityRoleId" THEN
				UPDATE community_users
				SET community_role_id = NEW."CommunityRoleId"
				WHERE user_id = NEW."guestId" AND community_id = NEW."CommunityId";
			
			ELSE 
				RAISE EXCEPTION 'User is already a member of the community';
			END IF;
			END IF;

			
		END IF;
	END IF;
    RETURN null;
END;
$function$


CREATE OR REPLACE FUNCTION public.fn_sync_amount_of_friends()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
  IF TG_OP = 'INSERT' THEN
      -- Increment the followers count for the user being followed
       UPDATE "Users"
       SET "amountOfFriend" = "amountOfFriend" + 1
       WHERE id = NEW."UserId" 
       OR id = NEW."friendId";
  ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the followers count for the user being unfollowed
       UPDATE "Users"
       SET "amountOfFriend" = "amountOfFriend" - 1
       WHERE id = OLD."UserId"
       OR id = OLD."friendId";
   END IF;
    
    RETURN null;
  END;
$function$


CREATE OR REPLACE FUNCTION public.fn_sync_community_participant_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE p_role varchar(10);
BEGIN


IF TG_OP = 'INSERT' THEN
-- Increment the admin| member count. 
	SELECT "name" from "CommunityRoles" 
	INTO p_role
	WHERE "CommunityRoles".id= NEW.community_role_id;
    
	IF p_role ='member' THEN
		UPDATE "Communities"
		SET "numMembers" = "numMembers" + 1
		WHERE id = NEW.community_id;
	ELSIF p_role ='admin' THEN
		UPDATE "Communities"
		SET "numAdmins" = "numAdmins" + 1
		WHERE id = NEW.community_id;
	END IF;
	
ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the the admin| member count.
      SELECT "name" from "CommunityRoles" 
	  INTO p_role
	  WHERE "CommunityRoles".id= OLD.community_role_id;
	  IF p_role ='member' THEN
      	 UPDATE "Communities"
         SET "numMembers" = "numMembers" - 1
         WHERE id = OLD.community_id;
      ELSIF p_role ='admin' THEN
		UPDATE "Communities"
		SET "numAdmins" = "numAdmins" - 1
		WHERE id = OLD.community_id;
   	END IF;
   END IF;
RETURN null;
END; 
$function$

CREATE OR REPLACE FUNCTION public.fn_update_followers_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
  IF TG_OP = 'INSERT' THEN
      -- Increment the followers count for the user being followed
       UPDATE "Users"
       SET "amountOfFollower" = "amountOfFollower" + 1
       WHERE id = NEW."UserId";
      -- Increment the following count for the follower
       UPDATE "Users"
       SET "amountOfFollowing" = "amountOfFollowing" + 1
       WHERE id = NEW."FollowerId";
  ELSIF TG_OP = 'DELETE' THEN
      -- Decrement the followers count for the user being unfollowed
       UPDATE "Users"
       SET "amountOfFollower" = "amountOfFollower" - 1
       WHERE id = OLD."UserId";
      -- Decrement the following count for the follower
       UPDATE "Users"
       SET "amountOfFollowing" = "amountOfFollowing" - 1
       WHERE id = OLD."FollowerId";
   END IF;
    
    RETURN null;
  END;
$function$

CREATE OR REPLACE FUNCTION public.fn_verify_age_and_reject_under_13()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    calculated_age INTEGER;
BEGIN
    IF (NEW.birthday IS NOT NULL AND OLD.birthday IS DISTINCT FROM NEW.birthday ) THEN
        -- Calculate age in years
        calculated_age := DATE_PART('year', AGE(CURRENT_DATE, NEW.birthday::date));

        -- Check if under 13 years
        IF calculated_age < 13 THEN
            RAISE EXCEPTION 'User must be 13 years or older. Given age: % years is not accepted.', calculated_age;
        ELSE
            IF OLD.active_status IS DISTINCT FROM true THEN
                NEW.active_status = true;
            END IF;
        END IF;
    END IF;

    -- If age is 13 or older, or birthday has not changed, simply proceed without making changes
    RETURN NEW;
END;
$function$

CREATE OR REPLACE FUNCTION public.fn_verify_user_phone_code(p_user_id character varying, p_phone_number character varying, provided_code character varying)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_phone_id INT;
    v_stored_code VARCHAR(10);
    v_code_sent_time TIMESTAMP;
    v_expiry_duration INT;
    v_error_message TEXT;
    v_new_code TEXT;
	v_is_verified BOOLEAN;
BEGIN
    -- Retrieve phone ID and the stored verification code
    SELECT p.id, u.verification_code, u.code_sent_time,u.is_verified
    INTO v_phone_id, v_stored_code, v_code_sent_time,v_is_verified
    FROM phones p
    JOIN user_phone_verifications u 
    ON p.id = u.phone_id
    WHERE p.phone_number = p_phone_number ;
    --AND u.user_id = p_user_id;

    -- If no record is found, return an error message
    IF NOT FOUND THEN
        SELECT error_message 
        INTO v_error_message 
        FROM error_codes WHERE error_code = 'NO_CODE_ERR';

        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error: NO_CODE_ERR > Phone or verification code not set';
        ELSE
            RAISE EXCEPTION '%', v_error_message;
        END IF;
    END IF;

    IF v_is_verified =TRUE THEN
     SELECT error_message 
     INTO v_error_message 
     FROM error_codes
     WHERE error_code='VER_ALR';
	    IF v_error_message IS NULL THEN
	     RAISE EXCEPTION 'Uncategorized error : VER_ALR Phone already verified';
	     ELSE
	     	RAISE EXCEPTION '%', v_error_message;
		END IF;
    END IF;
    
    

    -- Retrieve expiry duration for the phone verification
    SELECT expiry_duration_minutes INTO v_expiry_duration FROM expiry_times WHERE request_type = 'PHN_ACT';

    -- Check if the code has expired
    IF v_code_sent_time + (v_expiry_duration * interval '1 minute') > NOW() THEN
        -- Generate a new verification code and update the verification time
        v_new_code := LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        UPDATE user_phone_verifications
        SET verification_code = v_new_code, code_sent_time = NOW()
        WHERE phone_id = v_phone_id AND user_id = p_user_id;

        SELECT error_message INTO v_error_message FROM error_codes WHERE error_code = 'CODE_EXPIRED_ERR';
        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error: Verfication code has already expired';
        ELSE
            RAISE EXCEPTION '%', v_error_message;
        END IF;
    END IF;

    -- Check if the provided code matches the stored code
     
    IF provided_code <> v_stored_code THEN
    
       SELECT error_message INTO v_error_message FROM error_codes WHERE error_code = 'CODE_INCORRECT_ERR';
        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error: CODE_INCORRECT_ERR > The code provided is incorrect % %',v_stored_code,provided_code;
        ELSE
            RAISE EXCEPTION '%,%,%', v_error_message,v_stored_code,provided_code;
        END IF;
    END IF;

UPDATE user_phone_verifications AS us
SET us.is_verified = TRUE
WHERE phone_id = v_phone_id AND user_id = p_user_id;

RETURN 'The code is correct and verified.';
END;
$function$


CREATE OR REPLACE FUNCTION public.get_followers_or_following(user_id uuid, is_followers boolean DEFAULT true, OUT result user_result)
 RETURNS user_result
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF is_followers THEN
        --RETURN QUERY
        result.data:=(SELECT u.*
        FROM "Users" u
        INNER JOIN "User_Follower" uf ON u.id = uf."FollowerId"
        WHERE uf."UserId" = user_id);
        result.total:=(SELECT COUNT(*) FROM "Users");
    ELSE
        --RETURN QUERY
        result.data:=(SELECT u.*
        FROM "Users" u
        INNER JOIN "User_Follower" uf ON u.id = uf."UserId"
        WHERE uf."FollowerId" = user_id);
        result.total:=(SELECT COUNT(*) FROM "Users");
    END IF;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_phone_verification_code(user_id character varying, phone_number character varying)
 RETURNS character varying
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_phone_id INT;
    v_code VARCHAR(10);
    v_expiry_duration INT;
    v_code_sent_time TIMESTAMP;
    v_new_code VARCHAR(4);
    v_error_message TEXT;
BEGIN
    -- Check if phone number is associated with the user
    SELECT phone_id, verification_code, code_sent_time
    INTO v_phone_id, v_code, v_code_sent_time
    FROM UserPhoneVerifications
    WHERE user_id = user_id AND phone_id = (SELECT phone_id FROM PhoneNumbers WHERE phone_number = phone_number);

    -- If no association is found, raise an error using standardized error messages
    IF NOT FOUND THEN
        SELECT error_message INTO v_error_message FROM error_codes WHERE error_code = 'USR_PHN_ASC';
        IF v_error_message IS NULL THEN
            v_error_message := 'Uncategorized error';
        END IF;
        RAISE EXCEPTION '%', v_error_message;
    END IF;

    -- Get the expiry duration for phone verifications
    SELECT expiry_duration INTO v_expiry_duration FROM expiry_time WHERE request_type = 'PHN_VRF';

    -- Check if the current code has expired
    IF v_code_sent_time + (v_expiry_duration * interval '1 minute') < NOW() THEN
        -- Generate a new 4-digit code
        v_new_code := LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');

        -- Update the code in the database
        UPDATE UserPhoneVerifications
        SET verification_code = v_new_code, code_sent_time = NOW()
        WHERE user_id = user_id AND phone_id = v_phone_id;

        -- Return the new code
        RETURN v_new_code;
    ELSE
        -- Return the existing code if it has not expired
        RETURN v_code;
    END IF;
END;
$function$


CREATE OR REPLACE PROCEDURE public.insert_community_ban(p_user_id uuid, p_community_id uuid, p_by_user_id uuid, p_comment text, p_until timestamp without time zone)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    v_role TEXT;
    v_existing_ban_until TIMESTAMP;
BEGIN
    -- Check if the user trying to insert the ban (by_user_id) has the correct role
    SELECT name
    INTO v_role 
    FROM "CommunityRoles" AS roles
    INNER JOIN community_users ON community_users.community_role_id = roles.id
    WHERE user_id = p_by_user_id;
    
    IF v_role IS NULL THEN
        RAISE EXCEPTION 'Error getting the role of the user trying to insert a ban';
    END IF;
    
    IF v_role != 'moderator' AND v_role != 'admin' THEN
        RAISE EXCEPTION 'User does not have the required role to insert a ban';
    END IF;
    
    -- Check if a ban already exists for this user and community with 'until' date in the future
    SELECT until INTO v_existing_ban_until
    FROM community_bans
    WHERE user_id = p_user_id AND community_id = p_community_id AND until > NOW();
    
    IF v_existing_ban_until IS NOT NULL THEN
        RAISE EXCEPTION 'A ban for this user in this community with a future "until" date already exists';
    END IF;
    
    -- If p_until is NULL, set it to 200 years in the future
    IF p_until IS NULL THEN
        p_until := NOW() + INTERVAL '200 years';
    END IF;

    -- If comment is not provided, set a custom message based on the role
    IF p_comment IS NULL THEN
        p_comment := v_role || ' banned this user for 200 years';
    END IF;
    
    -- Insert the new ban
    INSERT INTO community_bans (user_id, community_id, by_user_id, comment, until, created_at)
    VALUES (p_user_id, p_community_id, p_by_user_id, p_comment, p_until, CURRENT_TIMESTAMP);

    Raise notice 'User % banned from community %', p_user_id, p_community_id;
    
END;
$procedure$


CREATE OR REPLACE PROCEDURE public.join_community(p_user_id uuid, p_community_id uuid)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    v_member_role uuid;
    v_existing_ban_until TIMESTAMP;
	v_is_already_member BOOLEAN;
	v_is_public BOOLEAN; 
BEGIN
	-- Check if the community the user is trying to join is public 
	IF NOT EXISTS(
		SELECT 1
		FROM "Communities" 
		WHERE "Communities"."id"= p_community_id AND "Communities"."privacyType"='public') THEN
		
        RAISE EXCEPTION 'Only public community can be joind without an invitation';
    END IF;
	
	 -- Check if a ban already exists for this user and community with 'until' date in the future
    SELECT until INTO v_existing_ban_until
    FROM community_bans
    WHERE user_id = p_user_id AND community_id = p_community_id AND until > NOW();
    
    IF v_existing_ban_until IS NOT NULL THEN
        RAISE EXCEPTION 'You are banned you cannot join/rejoin this community now';
    END IF;

    -- Get the member role id
    SELECT id
    INTO v_member_role  
    FROM "CommunityRoles" AS r
    WHERE r.name = 'member';
    
    IF v_member_role IS NULL THEN
        RAISE EXCEPTION 'Member role configuration error: member role not found';
    END IF;

	-- CHECK IF NOT ALREADY A MEMBER IN THIS COMMUNITY
	IF EXISTS(
	 SELECT 1 
	 FROM community_users
	 WHERE community_users.user_id= p_user_id AND community_users.community_id= p_community_id) THEN
	 RAISE EXCEPTION 'You are already a member in this community ';
	END IF;
    
    -- Insert a new community User
    INSERT INTO community_users (user_id, community_id, community_role_id,created_at)
    VALUES (p_user_id, p_community_id, v_member_role, CURRENT_TIMESTAMP);

	RAISE NOTICE 'SUCCESSFULY ADDED TO THE COMMUNITY';
    
END;
$procedure$

CREATE OR REPLACE FUNCTION public.log_user_community_history()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO community_history (user_id, community_id, joined, created_at)
    VALUES (NEW.user_id, NEW.community_id, true, CURRENT_TIMESTAMP);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO community_history (user_id, community_id, joined, created_at)
    VALUES (OLD.user_id, OLD.community_id, false, CURRENT_TIMESTAMP);
    RETURN OLD;
  END IF;
END;
$function$

CREATE OR REPLACE PROCEDURE public.proc_add_follower(follower uuid, following uuid)
 LANGUAGE plpgsql
AS $procedure$ 
BEGIN
   
  -- Insert the follower
    INSERT INTO "public"."User_Follower" ("UserId", "FollowerId", "createdAt", "updatedAt")
    VALUES (following, follower, current_timestamp, current_timestamp);

    -- Commit the transaction 
        COMMIT;
END;
$procedure$

CREATE OR REPLACE PROCEDURE public.proc_add_friend(p_aprover_id uuid, p_requester_id uuid, p_accept boolean, INOUT id uuid, INOUT "firstName" text, INOUT "lastName" text, INOUT "profilePicture" text, INOUT "createdAt" text, INOUT "updatedAt" text)
 LANGUAGE plpgsql
AS $procedure$
BEGIN

-- Check if theire have been a friend request from the requester. 
IF NOT EXISTS (
SELECT 1 FROM "User_friends_request" 
WHERE "UserId"= p_aprover_id
AND "friendsRequestId"= p_requester_id
)
THEN
 RAISE EXCEPTION 'There is no previous connection request made';
ELSE 
 -- Check if they are already friends. 
 IF EXISTS
 ( 
  SELECT 1 
  FROM "User_friends"
  WHERE 
   ("UserId"= p_aprover_id AND "friendId"= p_requester_id) OR 
   ("UserId"= p_requester_id AND "friendId"= p_aprover_id)
  )
 THEN
  RAISE EXCEPTION 'You are already friends';
 ELSE 
  -- CHECK WHETHER WE SHOULD CREATE FRIENDS OR REJECT FRIENDS 
  IF(p_accept = TRUE)
  THEN 
  -- Add them as friend
    INSERT INTO "User_friends" 
    ("UserId", "friendId", "createdAt", "updatedAt")
    VALUES (p_aprover_id, p_requester_id, current_timestamp, current_timestamp);

-- Make them follow each other 
BEGIN 
    INSERT INTO "User_Follower" 
    ("UserId", "FollowerId", "createdAt", "updatedAt")
    VALUES (p_aprover_id, p_requester_id, current_timestamp, current_timestamp), 
           (p_requester_id, p_aprover_id, current_timestamp, current_timestamp);
EXCEPTION WHEN OTHERS THEN COMMIT;

END;
   ELSE 
    INSERT INTO "User_friends_undesired" 
    ("UserId", "undesiredFriendId", "createdAt", "updatedAt")
    VALUES (p_aprover_id, p_requester_id, current_timestamp, current_timestamp);
 
  END IF;  
   SELECT "U"."id", "U"."firstName", "U"."lastName", "U"."profilePicture", "U"."createdAt", "U"."updatedAt"
    INTO "id", "firstName", "lastName", "profilePicture", "createdAt", "updatedAt"
    FROM "Users" AS "U"
    WHERE "U"."id" = p_requester_id;

    DELETE FROM "User_friends_request" AS "ufr"
    WHERE "ufr"."UserId"= p_aprover_id AND "ufr"."friendsRequestId" =p_requester_id;


 END IF;
END IF;
END;
$procedure$

CREATE OR REPLACE FUNCTION public.proc_get_friends(p_user_id uuid, p_req_id uuid, p_limit integer, p_offset integer)
 RETURNS TABLE(total integer, data json)
 LANGUAGE plpgsql
AS $function$
BEGIN
RETURN QUERY
SELECT
 (SELECT "amountOfFriend" 
  FROM "Users" 
  WHERE "Users"."id"= p_user_id
  ) as "total",
(
SELECT 
json_agg(
  json_build_object(
    'id', "U"."id",
    'firstName', "U"."firstName",
    'lastName', "U"."lastName",
    'profilePicture', "U"."profilePicture",
    'email', "U"."email",
    'amountOfFollower',"U"."amountOfFollower",
    'amountOfFollowing',"U"."amountOfFollowing",
    'amountOfFriend',"U"."amountOfFriend",
    'isFriend', "U"."isFriend",
    'iFollow',"U"."iFollow"
--     'IsAFollower',"IsAFollower"
    )) AS data
  FROM ( 
  SELECT DISTINCT "Us"."id", "Us"."firstName", "Us"."lastName", "Us"."profilePicture", "Us"."email","Us"."amountOfFollower","Us"."amountOfFollowing" ,"Us"."amountOfFriend" ,
   
   (
    EXISTS
    (
     SELECT 1 FROM "User_friends" 
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
$function$

CREATE OR REPLACE PROCEDURE public.proc_remove_follower(userid uuid, followerid uuid)
 LANGUAGE plpgsql
AS $procedure$
BEGIN
    -- Remove the follower from the followers table
    DELETE FROM "public"."User_Follower"
    WHERE "UserId" = userId AND "FollowerId" = followerId;
COMMIT;
END;
$procedure$

CREATE OR REPLACE FUNCTION public.remove_banned_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM community_users
  WHERE user_id = NEW.user_id AND community_id = NEW.community_id;
  
  RETURN NEW;
END;
$function$ */
