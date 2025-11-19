-- seed.sql
-- Seed data for Personal Finance Tracker

-- ===== USERS =====
-- password_hash is just a placeholder; you'll replace it with a real bcrypt hash later.
INSERT INTO users (id, email, password_hash, full_name, is_active)
VALUES
    (1, 'demo.user@example.com', 'not-set-yet', 'Demo User', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Make sure the sequence is ahead of our manual id
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), TRUE);

-- ===== TRANSACTIONS =====
-- Sample data for January 2025, tied to user_id = 1

INSERT INTO transactions (user_id, type, category, amount, date, note)
VALUES
    (1, 'INCOME',  'Salary',     2500.00, '2025-01-31', 'Monthly salary'),
    (1, 'EXPENSE', 'Rent',        900.00, '2025-01-01', 'January rent'),
    (1, 'EXPENSE', 'Food',        150.00, '2025-01-10', 'Groceries & eating out'),
    (1, 'EXPENSE', 'Transport',    60.00, '2025-01-05', 'Bus pass'),
    (1, 'INCOME',  'Freelance',   300.00, '2025-01-15', 'Side project');

SELECT setval(pg_get_serial_sequence('transactions', 'id'), COALESCE((SELECT MAX(id) FROM transactions), 1), TRUE);

-- ===== BUDGETS =====
-- Budgets for January 2025 for the same user

INSERT INTO budgets (user_id, category, amount, period_month, period_year)
VALUES
    (1, 'Food',         400.00, 1, 2025),
    (1, 'Rent',         900.00, 1, 2025),
    (1, 'Transport',    150.00, 1, 2025),
    (1, 'Entertainment',100.00, 1, 2025)
ON CONFLICT (user_id, category, period_month, period_year) DO NOTHING;

SELECT setval(pg_get_serial_sequence('budgets', 'id'), COALESCE((SELECT MAX(id) FROM budgets), 1), TRUE);