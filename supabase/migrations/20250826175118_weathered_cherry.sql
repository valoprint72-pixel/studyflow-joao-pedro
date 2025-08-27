/*
  # Create function to update account balance

  1. Functions
    - `update_account_balance` - Updates account balance when transactions are created
*/

CREATE OR REPLACE FUNCTION update_account_balance(account_id uuid, amount_change numeric)
RETURNS void AS $$
BEGIN
  UPDATE accounts 
  SET balance = balance + amount_change
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;