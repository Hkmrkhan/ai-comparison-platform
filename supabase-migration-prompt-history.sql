-- Create prompt_history table for storing user's search history
CREATE TABLE IF NOT EXISTS prompt_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    responses JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX idx_prompt_history_created_at ON prompt_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own prompt history
CREATE POLICY "Users can view their own prompt history"
    ON prompt_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own prompt history
CREATE POLICY "Users can insert their own prompt history"
    ON prompt_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own prompt history
CREATE POLICY "Users can update their own prompt history"
    ON prompt_history
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own prompt history
CREATE POLICY "Users can delete their own prompt history"
    ON prompt_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_prompt_history_updated_at
    BEFORE UPDATE ON prompt_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE prompt_history IS 'Stores user prompt search history with AI model responses';
COMMENT ON COLUMN prompt_history.prompt IS 'The user input prompt/question';
COMMENT ON COLUMN prompt_history.responses IS 'JSON array of AI model responses with metadata (model, provider, response, time, wordCount, success)';
