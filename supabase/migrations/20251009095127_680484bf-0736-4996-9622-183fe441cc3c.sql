-- Update RLS policies to allow users to manage their own wallet and loyalty transactions

-- Drop the old restrictive policy for wallet transactions
DROP POLICY IF EXISTS "System can create wallet transactions" ON public.wallet_transactions;

-- Allow users to create their own wallet transactions
CREATE POLICY "Users can create own wallet transactions" 
ON public.wallet_transactions 
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = wallet_transactions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

-- Drop the old restrictive policy for loyalty transactions
DROP POLICY IF EXISTS "System can create transactions" ON public.loyalty_transactions;

-- Allow users to create their own loyalty transactions
CREATE POLICY "Users can create own loyalty transactions" 
ON public.loyalty_transactions 
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update wallets policy to allow users to update their own wallet
DROP POLICY IF EXISTS "System can manage wallets" ON public.wallets;

CREATE POLICY "Admins can manage all wallets" 
ON public.wallets 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own wallet" 
ON public.wallets 
FOR UPDATE
USING (auth.uid() = user_id);

-- Update loyalty_points policy to allow users to update their own points
DROP POLICY IF EXISTS "System can manage loyalty points" ON public.loyalty_points;

CREATE POLICY "Admins can manage all loyalty points" 
ON public.loyalty_points 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own loyalty points" 
ON public.loyalty_points 
FOR UPDATE
USING (auth.uid() = user_id);