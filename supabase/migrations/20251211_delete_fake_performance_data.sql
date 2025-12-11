-- Delete ALL auto-generated fake records created by the populate migration
-- Keep ONLY the manually entered records:
-- - Anjan (Biotech) - entered 2025-12-08 19:19:39
-- - Achuta (IT) - entered 2025-12-08 19:19:39

DELETE FROM student_performance
WHERE created_at >= '2025-12-10 19:00:00'
AND created_at <= '2025-12-10 20:00:00'
AND risk_level IN ('Low Risk', 'Medium Risk', 'High Risk');

-- Verify: Should show only 2 records (Anjan and Achuta from 2025-12-08)
-- SELECT COUNT(*) FROM student_performance;
