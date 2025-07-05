-- Sample Data for Home Page (Fixed UUID Arrays)
-- This script creates sample events and community posts to populate the Home page

-- First, let's get or create some sample universities if they don't exist
INSERT INTO universities (id, name, short_name, logo_url, primary_color, location, website) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'University of Technology', 'UTech', 'https://example.com/utech-logo.png', '#1E40AF', 'Tech City', 'https://utech.edu'),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'State University', 'SU', 'https://example.com/su-logo.png', '#059669', 'State City', 'https://stateuniversity.edu'),
    ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Metropolitan College', 'Metro', 'https://example.com/metro-logo.png', '#DC2626', 'Metro City', 'https://metro.edu')
ON CONFLICT (id) DO NOTHING;

-- Sample Events
INSERT INTO events (
    id, title, description, organizer_id, organizer_name, organizer_university_id,
    event_date, event_time, location, is_online, meeting_link, max_attendees,
    current_attendees, tags, university_ids, is_active
) VALUES 
    -- Tech Workshop
    (
        '660e8400-e29b-41d4-a716-446655440001'::uuid,
        'React Native Workshop: Building Mobile Apps',
        'Join us for a comprehensive workshop on React Native development. Learn how to build cross-platform mobile applications from scratch. Perfect for beginners and intermediate developers looking to expand their mobile development skills.',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Tech Society',
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        CURRENT_DATE + INTERVAL '7 days',
        '14:00:00',
        'Computer Lab A-101',
        false,
        NULL,
        50,
        12,
        ARRAY['technology', 'workshop', 'mobile', 'react-native'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid],
        true
    ),
    
    -- Virtual Career Fair
    (
        '660e8400-e29b-41d4-a716-446655440002'::uuid,
        'Virtual Career Fair 2024',
        'Connect with top employers and explore exciting career opportunities. Over 50 companies will be participating including tech giants, startups, and established corporations. Bring your resume and be ready to network!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Career Services',
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        CURRENT_DATE + INTERVAL '10 days',
        '10:00:00',
        NULL,
        true,
        'https://zoom.us/j/virtual-career-fair-2024',
        200,
        89,
        ARRAY['career', 'networking', 'jobs', 'virtual'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid],
        true
    ),
    
    -- Study Group
    (
        '660e8400-e29b-41d4-a716-446655440003'::uuid,
        'Data Structures & Algorithms Study Group',
        'Weekly study group for CS students preparing for technical interviews and improving their problem-solving skills. We''ll cover common algorithms, data structures, and practice coding challenges together.',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'CS Study Group',
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        CURRENT_DATE + INTERVAL '3 days',
        '18:00:00',
        'Library Study Room 3B',
        false,
        NULL,
        15,
        8,
        ARRAY['study', 'computer-science', 'algorithms', 'interview-prep'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid],
        true
    ),
    
    -- Hackathon
    (
        '660e8400-e29b-41d4-a716-446655440004'::uuid,
        'Sustainability Hackathon 2024',
        'Join us for a 48-hour hackathon focused on creating innovative solutions for environmental challenges. Teams will work on projects related to renewable energy, waste reduction, and sustainable living. Prizes worth $5000!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Innovation Hub',
        '550e8400-e29b-41d4-a716-446655440003'::uuid,
        CURRENT_DATE + INTERVAL '14 days',
        '09:00:00',
        'Innovation Center',
        false,
        NULL,
        100,
        45,
        ARRAY['hackathon', 'sustainability', 'innovation', 'competition'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid],
        true
    ),
    
    -- Online Workshop
    (
        '660e8400-e29b-41d4-a716-446655440005'::uuid,
        'Introduction to Machine Learning',
        'Discover the fundamentals of machine learning in this beginner-friendly workshop. Learn about supervised learning, unsupervised learning, and neural networks. No prior experience required!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'AI/ML Club',
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        CURRENT_DATE + INTERVAL '5 days',
        '16:00:00',
        NULL,
        true,
        'https://teams.microsoft.com/ml-workshop',
        75,
        23,
        ARRAY['machine-learning', 'ai', 'workshop', 'beginner'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid],
        true
    );

-- Sample Community Posts
INSERT INTO community_posts (
    id, title, content, author_id, author_name, author_university_id,
    post_type, tags, university_ids, is_pinned, like_count, comment_count, share_count
) VALUES 
    -- Welcome Post
    (
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        'Welcome to the new semester! 🎉',
        'Hey everyone! Welcome back to another exciting semester at UTech. We''ve got some amazing events and opportunities lined up for you. Don''t forget to check out the career fair next week and join our study groups. Let''s make this semester count!

#NewSemester #UTech #StudentLife',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Student Council',
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        'announcement',
        ARRAY['welcome', 'semester', 'announcement'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid],
        true,
        24,
        8,
        5
    ),
    
    -- Achievement Post
    (
        '770e8400-e29b-41d4-a716-446655440002'::uuid,
        'Congratulations to our Hackathon Winners! 🏆',
        'Huge congratulations to Team "EcoSmart" for winning first place in the Regional Hackathon! Their innovative solution for smart waste management impressed all the judges. They''ve secured a $10,000 prize and mentorship opportunities.

Special shoutout to Sarah Johnson, Mike Chen, and Alex Rodriguez for representing our university with excellence!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Dean of Engineering',
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        'achievement',
        ARRAY['hackathon', 'winners', 'achievement', 'engineering'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid],
        false,
        67,
        15,
        12
    ),
    
    -- News Post
    (
        '770e8400-e29b-41d4-a716-446655440003'::uuid,
        'New Partnership with Tech Giants Announced',
        'We''re thrilled to announce new partnerships with Google, Microsoft, and Amazon! These collaborations will provide:

• Exclusive internship opportunities
• Access to cutting-edge technology
• Guest lectures from industry experts
• Potential job placements for graduates

Applications for the first round of internships open next month. Stay tuned for more details!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Career Services',
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        'news',
        ARRAY['partnership', 'internships', 'career', 'tech'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid],
        true,
        45,
        22,
        18
    ),
    
    -- General Community Post
    (
        '770e8400-e29b-41d4-a716-446655440004'::uuid,
        'Study Tips for Finals Week 📚',
        'Finals week is approaching! Here are some proven study tips from our academic success center:

1. Create a study schedule and stick to it
2. Form study groups with classmates
3. Use active recall techniques
4. Take regular breaks (Pomodoro technique)
5. Get enough sleep and exercise
6. Use campus resources like tutoring centers

Remember, you''ve got this! The library will be open 24/7 during finals week. Good luck everyone! 💪',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Academic Success Center',
        '550e8400-e29b-41d4-a716-446655440003'::uuid,
        'general',
        ARRAY['study-tips', 'finals', 'academic', 'success'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid],
        false,
        91,
        28,
        14
    ),
    
    -- Research Opportunity Post
    (
        '770e8400-e29b-41d4-a716-446655440005'::uuid,
        'Undergraduate Research Opportunities Available',
        'The Computer Science Department is offering undergraduate research positions for the upcoming semester. We''re looking for motivated students to work on cutting-edge projects in:

• Artificial Intelligence & Machine Learning
• Cybersecurity & Privacy
• Human-Computer Interaction
• Data Science & Analytics

Requirements:
- GPA of 3.5 or higher
- Completed CS fundamentals courses
- Strong problem-solving skills
- Commitment of 10-15 hours per week

Apply by submitting your resume and a brief statement of interest. This is a great opportunity to gain research experience and work closely with faculty members!',
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Dr. Smith - CS Department',
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        'announcement',
        ARRAY['research', 'undergraduate', 'computer-science', 'opportunity'],
        ARRAY['550e8400-e29b-41d4-a716-446655440001'::uuid],
        false,
        33,
        11,
        7
    );

-- Sample Post Interactions (likes, bookmarks, shares)
INSERT INTO post_interactions (post_id, user_id, interaction_type) 
SELECT 
    cp.id,
    u.id,
    CASE 
        WHEN random() < 0.6 THEN 'like'
        WHEN random() < 0.8 THEN 'bookmark'
        ELSE 'share'
    END
FROM community_posts cp
CROSS JOIN (SELECT id FROM users ORDER BY created_at DESC LIMIT 10) u
WHERE random() < 0.3; -- 30% chance of interaction per user-post combination

-- Sample Comments
INSERT INTO post_comments (post_id, user_id, content) VALUES 
    (
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'So excited for the new semester! Looking forward to all the opportunities 🚀'
    ),
    (
        '770e8400-e29b-41d4-a716-446655440002'::uuid,
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Amazing achievement! These students are truly inspiring. Congratulations to the whole team! 👏'
    ),
    (
        '770e8400-e29b-41d4-a716-446655440003'::uuid,
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'This is incredible news! When will more details about the internship applications be available?'
    ),
    (
        '770e8400-e29b-41d4-a716-446655440004'::uuid,
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Great tips! The Pomodoro technique has been a game-changer for me. Thanks for sharing!'
    ),
    (
        '770e8400-e29b-41d4-a716-446655440005'::uuid,
        (SELECT id FROM users ORDER BY created_at DESC LIMIT 1),
        'Very interested in the AI/ML research position. Where can I submit my application?'
    );

-- Update comment counts to match actual comments
UPDATE community_posts 
SET comment_count = (
    SELECT COUNT(*) 
    FROM post_comments 
    WHERE post_comments.post_id = community_posts.id
);

-- Sample Event Registrations
INSERT INTO event_attendees (event_id, user_id, status) 
SELECT 
    e.id,
    u.id,
    'registered'
FROM events e
CROSS JOIN (SELECT id FROM users ORDER BY created_at DESC LIMIT 5) u
WHERE random() < 0.4; -- 40% chance of registration per user-event combination

-- Update event attendee counts
UPDATE events 
SET current_attendees = (
    SELECT COUNT(*) 
    FROM event_attendees 
    WHERE event_attendees.event_id = events.id
);

-- Success message
SELECT 'Sample data created successfully! Your Home page should now have events and community posts.' as message; 