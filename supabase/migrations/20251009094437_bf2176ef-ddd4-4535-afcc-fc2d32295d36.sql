-- Assign master admin role to the current user
-- First, remove any existing roles for this user to avoid conflicts
DELETE FROM public.user_roles WHERE user_id = 'a997ad2e-5445-432c-a48b-29a89aa1d36a';

-- Insert admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('a997ad2e-5445-432c-a48b-29a89aa1d36a', 'admin');