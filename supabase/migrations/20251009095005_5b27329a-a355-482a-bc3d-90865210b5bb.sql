-- Update the handle_new_user function to create wallet and loyalty records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  -- Create wallet with initial balance of 0
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (new.id, 0, 'USD');
  
  -- Create loyalty points record with initial 0 points
  INSERT INTO public.loyalty_points (user_id, points, tier, total_earned, total_spent)
  VALUES (new.id, 0, 'bronze', 0, 0);
  
  RETURN new;
END;
$$;

-- Create the wallet and loyalty records for existing users who don't have them
-- First for user a997ad2e-5445-432c-a48b-29a89aa1d36a
INSERT INTO public.wallets (user_id, balance, currency)
SELECT 'a997ad2e-5445-432c-a48b-29a89aa1d36a', 0, 'USD'
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallets WHERE user_id = 'a997ad2e-5445-432c-a48b-29a89aa1d36a'
);

INSERT INTO public.loyalty_points (user_id, points, tier, total_earned, total_spent)
SELECT 'a997ad2e-5445-432c-a48b-29a89aa1d36a', 0, 'bronze', 0, 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.loyalty_points WHERE user_id = 'a997ad2e-5445-432c-a48b-29a89aa1d36a'
);

-- For user b0045531-6ef8-4d4f-bd9a-098902cf7e36
INSERT INTO public.wallets (user_id, balance, currency)
SELECT 'b0045531-6ef8-4d4f-bd9a-098902cf7e36', 0, 'USD'
WHERE NOT EXISTS (
  SELECT 1 FROM public.wallets WHERE user_id = 'b0045531-6ef8-4d4f-bd9a-098902cf7e36'
);

INSERT INTO public.loyalty_points (user_id, points, tier, total_earned, total_spent)
SELECT 'b0045531-6ef8-4d4f-bd9a-098902cf7e36', 0, 'bronze', 0, 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.loyalty_points WHERE user_id = 'b0045531-6ef8-4d4f-bd9a-098902cf7e36'
);