-- Execute este SQL no seu painel do Supabase (SQL Editor)
-- Para garantir que a função update_account_balance existe

CREATE OR REPLACE FUNCTION update_account_balance(account_id uuid, amount_change numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts 
  SET balance = balance + amount_change
  WHERE id = account_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with id % not found', account_id;
  END IF;
END;
$$;
