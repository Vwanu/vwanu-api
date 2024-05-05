CREATE OR REPLACE FUNCTION add_or_associate_phone(user_id VARCHAR, phone_number VARCHAR, phone_type VARCHAR, country_code VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_phone_id INT;
    v_error_message TEXT;
    v_new_code TEXT;
BEGIN
    -- Check if the phone number exists
    SELECT phone_id INTO v_phone_id FROM phones WHERE phone_number = phone_number;

    -- If the phone number does not exist, insert it
    IF v_phone_id IS NULL THEN
        INSERT INTO PhoneNumbers(phone_number, phone_type, country_code)
        VALUES(phone_number, phone_type, country_code)
        RETURNING phone_id INTO v_phone_id;
    END IF;
    
    -- Check if the phone number is already associated with the user
    IF EXISTS (SELECT 1 FROM user_phone_verifications WHERE user_id = user_id AND phone_id = v_phone_id) THEN
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
        INSERT INTO UserPhoneVerifications(user_id, phone_id, verification_code, code_sent_time)
        VALUES(user_id, v_phone_id, v_new_code, NOW());
    END IF;
END;
$$ LANGUAGE plpgsql;
