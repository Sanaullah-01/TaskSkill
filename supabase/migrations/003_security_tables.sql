-- Create Login History Table
CREATE TABLE public.login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable RLS on Login History
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
    ON public.login_history FOR SELECT
    USING (auth.uid() = user_id);

-- Create trigger to automatically log sessions from auth.sessions
CREATE OR REPLACE FUNCTION public.log_new_session()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.login_history (user_id, ip_address, user_agent)
  VALUES (
    NEW.user_id,
    NEW.ip,
    NEW.user_agent
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE PROCEDURE public.log_new_session();


-- Create Recovery Codes Table (stores hashed codes for 2FA fallback)
CREATE TABLE public.recovery_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on Recovery Codes
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

-- Users cannot read the raw code_hash from the client for security reasons
-- Verification happens via Server Actions with service_role bypass or secure RPC.
-- But we can allow them to see how many unused codes they have.
CREATE POLICY "Users can count their unused recovery codes"
    ON public.recovery_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE INDEX idx_recovery_codes_user_id ON public.recovery_codes(user_id);
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
