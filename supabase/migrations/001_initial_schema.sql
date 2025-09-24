-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "language": "zh",
        "theme": "system",
        "sync_enabled": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    template_id TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Create sync logs table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sync')),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    local_version INTEGER NOT NULL,
    cloud_version INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'synced', 'conflict', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(updated_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only access their own resumes
CREATE POLICY "Users can view own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own sync logs
CREATE POLICY "Users can view own sync logs" ON public.sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON public.sync_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger function to update updated_at field
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to relevant tables
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_resumes
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, preferences)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        '{
            "language": "zh",
            "theme": "system",
            "sync_enabled": true
        }'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
