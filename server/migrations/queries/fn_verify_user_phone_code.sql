CREATE OR REPLACE FUNCTION verify_user_code(user_id VARCHAR, phone_number VARCHAR, provided_code VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_phone_id INT;
    v_stored_code VARCHAR(10);
    v_code_sent_time TIMESTAMP;
    v_expiry_duration INT;
    v_error_message TEXT;
BEGIN
    -- Retrieve phone ID and the stored verification code
    SELECT p.phone_id, u.verification_code, u.code_sent_time
    INTO v_phone_id, v_stored_code, v_code_sent_time
    FROM PhoneNumbers p
    JOIN UserPhoneVerifications u ON p.phone_id = u.phone_id
    WHERE p.phone_number = phone_number AND u.user_id = user_id;

    -- If no record is found, return an error message
    IF NOT FOUND THEN
        SELECT error_message INTO v_error_message FROM ErrorCodes WHERE error_code = 'NO_CODE_ERR';
        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error';
        ELSE
            RAISE EXCEPTION '%', v_error_message;
        END IF;
    END IF;

    -- Retrieve expiry duration for the phone verification
    SELECT expiry_duration INTO v_expiry_duration FROM RequestExpiryConfig WHERE request_type = 'Phone Verification';

    -- Check if the code has expired
    IF v_code_sent_time + (v_expiry_duration * interval '1 minute') < NOW() THEN
        SELECT error_message INTO v_error_message FROM ErrorCodes WHERE error_code = 'CODE_EXPIRED_ERR';
        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error';
        ELSE
            RAISE EXCEPTION '%', v_error_message;
        END IF;
    END IF;

    -- Check if the provided code matches the stored code
    IF provided_code = v_stored_code THEN
        RETURN 'The code is correct and verified.';
    ELSE
        SELECT error_message INTO v_error_message FROM ErrorCodes WHERE error_code = 'CODE_INCORRECT_ERR';
        IF v_error_message IS NULL THEN
            RAISE EXCEPTION 'Uncategorized error';
        ELSE
            RAISE EXCEPTION '%', v_error_message;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
