/**
 * Run once on startup to create tables if they don't exist.
 * Safe to run repeatedly — all statements use IF NOT EXISTS.
 */
const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          TEXT NOT NULL,
        category      TEXT NOT NULL CHECK (category IN ('Bracelets','Necklaces','Accessories')),
        price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
        note          TEXT NOT NULL DEFAULT '',
        image         TEXT NOT NULL,
        image_public_id TEXT,
        tag           TEXT NOT NULL DEFAULT '',
        in_stock      BOOLEAN NOT NULL DEFAULT TRUE,
        featured      BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference           TEXT NOT NULL UNIQUE,
        customer_name       TEXT NOT NULL,
        customer_email      TEXT NOT NULL,
        customer_phone      TEXT,
        items               JSONB NOT NULL DEFAULT '[]',
        total_amount        BIGINT NOT NULL,
        currency            TEXT NOT NULL DEFAULT 'NGN',
        payment_method      TEXT NOT NULL DEFAULT 'paystack',
        payment_status      TEXT NOT NULL DEFAULT 'pending'
                            CHECK (payment_status IN ('pending','paid','failed','refunded')),
        paystack_reference  TEXT,
        delivery_note       TEXT NOT NULL DEFAULT '',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Auto-update updated_at on row change
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated_at'
        ) THEN
          CREATE TRIGGER products_updated_at
          BEFORE UPDATE ON products
          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at'
        ) THEN
          CREATE TRIGGER orders_updated_at
          BEFORE UPDATE ON orders
          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        END IF;
      END $$;
    `);

    console.log('✅  Database tables ready');
  } finally {
    client.release();
  }
}

module.exports = migrate;
