-- Allow anon role to read courses (RLS policy filters to published = true only)
GRANT SELECT ON public.courses TO anon;
