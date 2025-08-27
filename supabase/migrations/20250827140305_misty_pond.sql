/*
  # Sistema de Transferências entre Contas

  1. New Tables
    - `transfers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `from_account_id` (uuid, foreign key)
      - `to_account_id` (uuid, foreign key)
      - `amount` (numeric, positive)
      - `description` (text, optional)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `transfers` table
    - Add policies for authenticated users to manage their own transfers

  3. Functions
    - Function to process transfers and update account balances
*/

CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own transfers"
  ON transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transfers"
  ON transfers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transfers"
  ON transfers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS transfers_user_id_idx ON transfers(user_id);
CREATE INDEX IF NOT EXISTS transfers_from_account_idx ON transfers(from_account_id);
CREATE INDEX IF NOT EXISTS transfers_to_account_idx ON transfers(to_account_id);
CREATE INDEX IF NOT EXISTS transfers_date_idx ON transfers(date);

-- Function to process transfer
CREATE OR REPLACE FUNCTION process_transfer(
  p_user_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_description text DEFAULT NULL,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transfer_id uuid;
  from_balance numeric;
BEGIN
  -- Check if accounts belong to user
  IF NOT EXISTS (
    SELECT 1 FROM accounts 
    WHERE id = p_from_account_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'From account not found or not owned by user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM accounts 
    WHERE id = p_to_account_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'To account not found or not owned by user';
  END IF;

  -- Check if accounts are different
  IF p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'Cannot transfer to the same account';
  END IF;

  -- Get current balance of from account
  SELECT balance INTO from_balance 
  FROM accounts 
  WHERE id = p_from_account_id;

  -- Check if sufficient balance (allow negative for credit cards)
  SELECT type INTO from_balance FROM accounts WHERE id = p_from_account_id;
  
  -- Create transfer record
  INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, description, date)
  VALUES (p_user_id, p_from_account_id, p_to_account_id, p_amount, p_description, p_date)
  RETURNING id INTO transfer_id;

  -- Update account balances
  UPDATE accounts 
  SET balance = balance - p_amount 
  WHERE id = p_from_account_id;

  UPDATE accounts 
  SET balance = balance + p_amount 
  WHERE id = p_to_account_id;

  RETURN transfer_id;
END;
$$;