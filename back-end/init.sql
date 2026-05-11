INSERT INTO app_user (
    first_name,
    second_name,
    user_name,
    email,
    born_date,
    password_hash,
    user_type,
    profile_picture_path,
    currency
)
VALUES (
    'Admin',
    'User',
    'admin',
    'admin@marketsimulator.com',
    '1990-01-01',
    '$2b$12$6cdleoSsH9EtO.vo2bT84Ohltj4SthGTl5dZbsV0bDXogVEEXuICS',
    'ADMIN',
    NULL,
    10000
);
