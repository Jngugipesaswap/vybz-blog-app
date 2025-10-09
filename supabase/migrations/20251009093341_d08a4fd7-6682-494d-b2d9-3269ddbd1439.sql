-- Add new roles to the app_role enum
DO $$ 
BEGIN
  -- Add 'user' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'user';
  END IF;
  
  -- Add 'content_creator' role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'content_creator' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'content_creator';
  END IF;
END $$;