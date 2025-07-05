-- Migration script to insert universities with proper UUIDs and short_name fields

-- First, make sure the universities table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'universities') THEN
        CREATE TABLE universities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            short_name VARCHAR(50) NOT NULL,
            logo_url TEXT,
            primary_color VARCHAR(7) DEFAULT '#5B7FFF',
            location VARCHAR(100),
            website VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Clear existing universities to avoid duplicates
TRUNCATE universities CASCADE;

-- Insert universities with explicit UUIDs
INSERT INTO universities (id, name, short_name, logo_url, primary_color, location, website) VALUES
(
    '11111111-1111-1111-1111-111111111111',  -- Fixed UUID for UCT
    'University of Cape Town',
    'uct',
    'https://dl.dropboxusercontent.com/scl/fi/dyjlpfpaltavtf38dffjz/uct-logo.jpg?rlkey=8de25f3886rurik2ot0q3wuzs&st=862cm4kq',
    '#003B71',
    'Cape Town, South Africa',
    'https://www.uct.ac.za'
),
(
    '22222222-2222-2222-2222-222222222222',  -- Fixed UUID for Wits
    'University of the Witwatersrand',
    'wits',
    'https://dl.dropboxusercontent.com/scl/fi/na0itqoufuuwkhqodz2ld/witswater.jpg.webp?rlkey=db3k297ze63jgo26h4tf23sz2&st=cl59az85',
    '#005BBB',
    'Johannesburg, South Africa',
    'https://www.wits.ac.za'
),
(
    '33333333-3333-3333-3333-333333333333',  -- Fixed UUID for UP
    'University of Pretoria',
    'up',
    'https://dl.dropboxusercontent.com/scl/fi/nu95h9dxyx1ueewxtiryx/images.png?rlkey=5mbqtla2i3hk15vztaa9gwoc0&st=mn9clqmr',
    '#7C225E',
    'Pretoria, South Africa',
    'https://www.up.ac.za'
),
(
    '44444444-4444-4444-4444-444444444444',  -- Fixed UUID for UKZN
    'University of KwaZulu-Natal',
    'ukzn',
    'https://dl.dropboxusercontent.com/scl/fi/9qqlf4te838vmgllq7maq/UKZN.jpg?rlkey=goq6f4unzzmp8r6pqzf09wwfx&st=piw1xz3w',
    '#F7941D',
    'Durban, South Africa',
    'https://www.ukzn.ac.za'
),
(
    '55555555-5555-5555-5555-555555555555',  -- Fixed UUID for UFS
    'University of the Free State',
    'ufs',
    'https://dl.dropboxusercontent.com/scl/fi/64ogwnzgrrl2klkqnqvk4/University-of-Free-State.png?rlkey=ijkfwqv4ysviftksai60s9d3e&st=cwvgyzby',
    '#003366',
    'Bloemfontein, South Africa',
    'https://www.ufs.ac.za'
);

-- Create an index on short_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_universities_short_name ON universities(short_name); 