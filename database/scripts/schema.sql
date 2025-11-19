-- schema.sql
-- Postgres schema for Personal Finance Tracker

-- (Optional) If you want UUIDs instead of bigserial, you can enable this:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============
-- USERS
-- ==============
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============
-- TRANSACTIONS
-- ==============
CREATE TABLE IF NOT EXISTS transactions (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category    VARCHAR(100) NOT NULL,
    amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    date        DATE NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful index for querying per user & date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, date);

-- Auto-update updated_at on change (optional but nice)
CREATE OR REPLACE FUNCTION set_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_set_updated_at ON transactions;

CREATE TRIGGER trg_transactions_set_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transactions_updated_at();

-- ==============
-- BUDGETS
-- ==============
CREATE TABLE IF NOT EXISTS budgets (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category     VARCHAR(100) NOT NULL,
    amount       NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    period_month SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year  SMALLINT NOT NULL CHECK (period_year >= 2000),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, category, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period
    ON budgets(user_id, period_year, period_month);