-- init.sql: runs automatically on first database initialization
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username TEXT NOT NULL UNIQUE,
                                     email TEXT NOT NULL UNIQUE,
                                     password TEXT NOT NULL DEFAULT 'testpassword',
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

INSERT INTO users (username, email) VALUES
                                        ('user', 'user@example.com'),
                                        ('admin',   'admin@example.com'),
                                        ('test', 'test@example.com');