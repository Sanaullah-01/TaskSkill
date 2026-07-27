-- 1. Categories Table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#808080' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE public.tasks ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 2. Labels Table
CREATE TABLE public.labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#808080' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Task Labels Junction Table
CREATE TABLE public.task_labels (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

-- 3. Comments Table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Attachments Table
CREATE TABLE public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g., 'created', 'status_changed', 'comment_added', 'attachment_added'
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    link TEXT, -- Optional link to navigate when clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Categories
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Labels
CREATE POLICY "Users can manage own labels" ON public.labels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Task Labels
-- Users can manage task labels if they own the task and the label
CREATE POLICY "Users can manage own task labels" ON public.task_labels FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.labels WHERE id = label_id AND user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.labels WHERE id = label_id AND user_id = auth.uid())
    );

-- Comments
CREATE POLICY "Users can manage own comments" ON public.comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Attachments
CREATE POLICY "Users can manage own attachments" ON public.attachments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity Logs (Read-only on client, mostly created by server actions)
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- STORAGE BUCKET FOR ATTACHMENTS
-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('task_attachments', 'task_attachments', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for task_attachments bucket
CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task_attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'task_attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'task_attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
