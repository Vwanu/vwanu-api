-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Location Tables
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL,
    country_id UUID NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state_id UUID NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE IF NOT EXISTS address_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
/* End of location */

-- Application Tables
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

-- Authorization Tables
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    role_access_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS moderation_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reason VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);
/* End of authorization */

-- General Tables
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
/* End of General Tables */

-- Networking Tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    access_role UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    gender BOOLEAN DEFAULT true, -- true for male, false for female,
    profile_picture VARCHAR(255) DEFAULT
          'https://images.unsplash.com/photo-1528464884105-28166ef8edd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    cover_picture VARCHAR(255) DEFAULT
          'https://images.unsplash.com/photo-1528464884105-28166ef8edd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    about VARCHAR(255),
    profile_privacy VARCHAR(255) DEFAULT 'public',
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
    online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT NOW(),
    search_vector TSVECTOR,
    FOREIGN KEY (access_role) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS entity_addresses (
    user_id UUID NOT NULL,
    address_type_id UUID NOT NULL,
    address_line_1 VARCHAR(255), 
    address_line_2 VARCHAR(255),
    city_id UUID,
    PRIMARY KEY (user_id, address_type_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_type_id) REFERENCES address_types(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS user_interests (
    user_id UUID NOT NULL,
    interest_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS access_level_logs (
    granted_to UUID,
    granted_by UUID,
    access_level UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (granted_to) REFERENCES users(id),
    FOREIGN KEY (granted_by) REFERENCES users(id),
    FOREIGN KEY (access_level) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
    requester_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT requester_receiver_unique UNIQUE (requester_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS undesired_friends (
    user_id UUID NOT NULL,
    undesired_user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (undesired_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_undesired_user_unique UNIQUE (user_id, undesired_user_id)
);

CREATE TABLE IF NOT EXISTS friends (
    user_one_id UUID NOT NULL,
    user_two_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_one_id, user_two_id),
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS followers (
    follower_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, user_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visitors (
    user_id UUID NOT NULL,
    visitor_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (visitor_id) REFERENCES users(id)
);
/* End of networking */

-- Notification Tables
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_user_id UUID,
    message VARCHAR(255),
    type VARCHAR(255),
    entity_name VARCHAR(255),
    entity_id UUID,
    sound BOOLEAN NOT NULL,
    notification_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    view BOOLEAN DEFAULT false,
    user_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (notification_type) REFERENCES notification_types(notification_slug)
);
/* End of notification */

-- Interaction Tables
CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cover_picture VARCHAR(255),
    description TEXT,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR
);

CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    num_members INTEGER DEFAULT 0,
    num_admins INTEGER DEFAULT 0,
    name VARCHAR(255) NOT NULL UNIQUE,
    privacy_type VARCHAR(255) DEFAULT 'public' NOT NULL,
    cover_picture VARCHAR(255),
    description TEXT NOT NULL UNIQUE,
    profile_picture VARCHAR(255),
    default_invitation_email TEXT,
    have_discussion_forum BOOLEAN DEFAULT true,
    can_invite VARCHAR(255) DEFAULT 'E',
    can_in_post VARCHAR(255) DEFAULT 'E',
    can_in_upload_photos VARCHAR(255) DEFAULT 'E',
    can_in_upload_doc VARCHAR(255) DEFAULT 'E',
    can_in_upload_video VARCHAR(255) DEFAULT 'E',
    can_message_in_group VARCHAR(255) DEFAULT 'E',
    search_vector TSVECTOR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS community_interests (
    community_id UUID NOT NULL,
    interest_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, interest_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);

CREATE TABLE IF NOT EXISTS community_invitation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL,
    host_id UUID NOT NULL,
    email VARCHAR(255),
    response BOOLEAN,
    response_date TIMESTAMP,
    community_id UUID NOT NULL,
    community_role_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (guest_id, community_id, community_role_id),
    FOREIGN KEY (guest_id) REFERENCES users(id),
    FOREIGN KEY (host_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id),
    FOREIGN KEY (community_role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS community_users (
    community_role_id UUID NOT NULL,
    community_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_role_id, community_id, user_id),
    FOREIGN KEY (community_role_id) REFERENCES roles(id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT community_users_unique UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_history (
    user_id UUID NOT NULL,
    community_id UUID NOT NULL,
    joined BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, community_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS community_bans (
    user_id UUID NOT NULL,
    community_id UUID NOT NULL,
    by_user_id UUID NOT NULL,
    moderation_reason_id UUID NOT NULL,
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

-- Chat Tables
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount_of_people INTEGER DEFAULT 0,
    amount_of_messages INTEGER DEFAULT 0,
    amount_of_unread_messages INTEGER DEFAULT 0,
    type VARCHAR(255) NOT NULL DEFAULT 'direct',
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_text TEXT,
    read BOOLEAN DEFAULT false,
    received BOOLEAN DEFAULT false,
    read_date TIMESTAMP,
    received_date TIMESTAMP,
    sender_id UUID,
    conversation_id UUID,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
/* End of chat */

-- Content Management Tables
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_text TEXT,
    privacy_type VARCHAR(255) DEFAULT 'public',
    locked BOOLEAN DEFAULT false,
    original_type VARCHAR(255) DEFAULT 'public',
    user_id UUID NOT NULL,
    community_id UUID,
    original_id UUID,
    post_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (original_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    body TEXT NOT NULL,
    title TEXT NOT NULL,
    user_id UUID NOT NULL,
    privacy_type VARCHAR(255) DEFAULT 'public',
    banned BOOLEAN DEFAULT false,
    banned_reason TEXT,
    locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS korems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    user_id UUID,
    entity_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    blog_text TEXT,
    blog_title TEXT NOT NULL,
    cover_picture VARCHAR(255),
    publish BOOLEAN DEFAULT false,
    slug TEXT,
    amount_of_likes INTEGER DEFAULT 0,
    amount_of_comments INTEGER DEFAULT 0,
    search_vector TSVECTOR,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blog_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_text TEXT NOT NULL,
    banned BOOLEAN DEFAULT false,
    banned_reason TEXT,
    banned_by UUID,
    user_id UUID,
    blog_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_interests (
    blog_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interest_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (blog_id) REFERENCES blogs(id),
    FOREIGN KEY (interest_id) REFERENCES interests(id)
);

CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    cover_picture VARCHAR(255),
    privacy_type VARCHAR(255) DEFAULT 'public'
);

CREATE TABLE IF NOT EXISTS medias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original VARCHAR(255) NOT NULL,
    large VARCHAR(255),
    medium VARCHAR(255),
    small VARCHAR(255),
    tiny VARCHAR(255),
    user_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS post_medias (
    post_id UUID NOT NULL,
    media_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, media_id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS message_medias (
    message_id UUID NOT NULL,
    media_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (message_id, media_id),
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID NOT NULL,
    notification_setting_id UUID NOT NULL,
    notification_status VARCHAR(20) DEFAULT 'on',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
    /* FOREIGN KEY (notification_setting_id) REFERENCES notification_types(id) */
);

CREATE TABLE IF NOT EXISTS album_medias (
    album_id UUID NOT NULL,
    media_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (album_id, media_id),
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS discussion_medias (
    discussion_id UUID NOT NULL,
    media_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, media_id),
    FOREIGN KEY (discussion_id) REFERENCES discussions(id),
    FOREIGN KEY (media_id) REFERENCES medias(id)
);

CREATE TABLE IF NOT EXISTS discussion_interests (
    discussion_id UUID NOT NULL,
    interest_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, interest_id),
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);
/* End of content management */

-- Contact Tables
CREATE TABLE IF NOT EXISTS phones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(255),
    country_code UUID NOT NULL,
    FOREIGN KEY (country_code) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS user_phone_verifications (
    user_id UUID NOT NULL,
    phone_id UUID NOT NULL,
    verification_code VARCHAR(255) NOT NULL,
    code_sent_time TIMESTAMP NOT NULL DEFAULT NOW(),
    verified_time TIMESTAMP,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (user_id, phone_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (phone_id) REFERENCES phones(id)
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_companies (
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    from_date TIMESTAMP NOT NULL DEFAULT NOW(),
    to_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
