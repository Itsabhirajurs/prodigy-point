-- Create messages table for faculty-student communication
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('student', 'faculty')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_messages_student_id ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_faculty_id ON messages(faculty_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- IMPORTANT: Disable RLS for now to test - re-enable after verifying it works
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Students can view messages where they are the student
CREATE POLICY "Students can view their own messages"
    ON messages FOR SELECT
    USING (student_id = auth.uid());

-- Faculty can view all messages they sent or received
CREATE POLICY "Faculty can view their messages"
    ON messages FOR SELECT
    USING (faculty_id = auth.uid());

-- Students can insert messages to faculty
CREATE POLICY "Students can send messages to faculty"
    ON messages FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND sender_type = 'student'
    );

-- Faculty can insert messages to students
CREATE POLICY "Faculty can send messages to students"
    ON messages FOR INSERT
    WITH CHECK (
        faculty_id = auth.uid()
        AND sender_type = 'faculty'
    );

-- Students can update read status on their messages
CREATE POLICY "Students can mark messages as read"
    ON messages FOR UPDATE
    USING (student_id = auth.uid());

-- Faculty can update read status on their messages
CREATE POLICY "Faculty can mark messages as read"
    ON messages FOR UPDATE
    USING (faculty_id = auth.uid());

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();
