CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    category TEXT,
    annual_income INTEGER,
    state TEXT,
    district TEXT,
    education TEXT,
    employment_status TEXT,
    disability_status TEXT DEFAULT 'No',
    minority_status TEXT DEFAULT 'No',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ministry TEXT,
    target_beneficiaries TEXT,
    state_or_central TEXT,
    description TEXT,
    simple_description TEXT,
    categories TEXT,
    states TEXT,
    income_limit INTEGER DEFAULT 0,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 70,
    business_types TEXT,
    support_type TEXT,
    max_project_cost INTEGER DEFAULT 0,
    max_assistance_text TEXT,
    benefits TEXT,
    simple_benefits TEXT,
    required_documents TEXT,
    application_steps TEXT,
    official_source TEXT,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    pairing_code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_data TEXT NOT NULL,
    matched_schemes TEXT NOT NULL,
    saved_schemes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);