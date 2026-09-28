import sqlite3
import json
import os

# Direct path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'database', 'app.db')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'schemes.json')

print(f"📂 Database path: {DB_PATH}")
print(f"📂 Data path: {DATA_PATH}")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    print("🔧 Initializing database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Drop and recreate tables
    cursor.execute("DROP TABLE IF EXISTS schemes;")
    cursor.execute("DROP TABLE IF EXISTS users;")
    cursor.execute("DROP TABLE IF EXISTS whatsapp_sessions;")
    conn.commit()

    # Create tables
    cursor.execute('''
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
        )
    ''')
    
    cursor.execute('''
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
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS whatsapp_sessions (
            pairing_code TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            profile_data TEXT NOT NULL,
            matched_schemes TEXT NOT NULL,
            saved_schemes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Load schemes
    if os.path.exists(DATA_PATH):
        print(f"✅ Found schemes.json at: {DATA_PATH}")
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        
        print(f"📊 Loading {len(schemes)} schemes into database...")
        
        for idx, s in enumerate(schemes):
            try:
                cursor.execute('''
                    INSERT INTO schemes (
                        id, name, ministry, target_beneficiaries, state_or_central,
                        description, simple_description, categories, states,
                        income_limit, age_min, age_max, business_types, support_type,
                        max_project_cost, max_assistance_text, benefits, simple_benefits,
                        required_documents, application_steps, official_source, tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    s.get('id'),
                    s.get('name'),
                    s.get('ministry', 'Government of India'),
                    json.dumps(s.get('target_beneficiaries', [])),
                    s.get('state_or_central', 'Central'),
                    s.get('description', ''),
                    s.get('simple_description', s.get('description', '')),
                    json.dumps(s.get('categories', [])),
                    json.dumps(s.get('states', ['All'])),
                    s.get('income_limit', 0),
                    s.get('age_min', 18),
                    s.get('age_max', 70),
                    json.dumps(s.get('business_types', [])),
                    json.dumps(s.get('support_type', [])),
                    s.get('max_project_cost', 0),
                    s.get('max_assistance_text', 'Financial assistance available'),
                    json.dumps(s.get('benefits', [])),
                    json.dumps(s.get('simple_benefits', s.get('benefits', []))),
                    json.dumps(s.get('required_documents', [])),
                    json.dumps(s.get('application_steps', [])),
                    s.get('official_source', ''),
                    json.dumps(s.get('tags', []))
                ))
            except Exception as e:
                print(f"❌ Error inserting {s.get('id', 'unknown')}: {e}")
        
        conn.commit()
        print("✅ All schemes inserted successfully!")
    else:
        print(f"❌ schemes.json NOT FOUND at: {DATA_PATH}")
        print("Please make sure schemes.json exists in the data folder")
    
    count = cursor.execute('SELECT COUNT(*) FROM schemes').fetchone()[0]
    print(f"✅ Database initialized with {count} schemes")
    
    if count > 0:
        sample = cursor.execute('SELECT id, name FROM schemes LIMIT 5').fetchall()
        print("📋 Sample schemes:")
        for s in sample:
            print(f"   - {s['id']}: {s['name'][:50]}...")
    
    conn.close()
    return count

if __name__ == '__main__':
    init_db()