INSERT INTO app_user (
    first_name,
    second_name,
    user_name,
    password_hash,
    user_type,
    profile_picture_path
)
VALUES (
    'Admin',
    'User',
    'admin',
    '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS',
    'ADMIN',
    NULL
);