-- Test toàn bộ luồng CRUD phỏng vấn
DO $$
DECLARE
  test_user_id UUID := '48fc41f6-797c-44d1-9b57-969b1a176698';
  new_interview_id UUID;
  new_question_id UUID;
BEGIN
  -- Test INSERT interview
  INSERT INTO interviews (user_id, topic, level, language, status)
  VALUES (test_user_id, 'Test Frontend React', 'Junior', 'vi', 'in_progress')
  RETURNING id INTO new_interview_id;
  RAISE NOTICE 'PASS: Created interview: %', new_interview_id;

  -- Test INSERT interview_question
  INSERT INTO interview_questions (interview_id, question_text, question_order)
  VALUES (new_interview_id, 'Test cau hoi ve React hooks?', 0)
  RETURNING id INTO new_question_id;
  RAISE NOTICE 'PASS: Created question: %', new_question_id;

  -- Test UPDATE answer + evaluation
  UPDATE interview_questions
  SET user_answer  = 'useState la hook de quan ly state',
      ai_evaluation = 'DIEM: 8/10' || chr(10) || 'DIEM MANH: Hieu dung khai niem',
      score        = 8.0,
      answered_at  = NOW()
  WHERE id = new_question_id;
  RAISE NOTICE 'PASS: Updated answer OK';

  -- Test COMPLETE interview
  UPDATE interviews
  SET status       = 'completed',
      overall_score = 8.0,
      overall_feedback = 'Hoan thanh 1 cau hoi. Diem trung binh: 8.00/10.',
      completed_at = NOW()
  WHERE id = new_interview_id;
  RAISE NOTICE 'PASS: Completed interview OK';

  -- Test SELECT (simulating get_user_interviews query)
  PERFORM i.id, i.topic, i.level, i.language, i.status,
          i.overall_score, i.started_at, i.completed_at,
          COUNT(iq.id) AS total_questions
  FROM interviews i
  LEFT JOIN interview_questions iq ON iq.interview_id = i.id
  WHERE i.user_id = test_user_id
  GROUP BY i.id, i.topic, i.level, i.language, i.status,
           i.overall_score, i.overall_feedback, i.started_at, i.completed_at;
  RAISE NOTICE 'PASS: SELECT query OK';

  -- Cleanup
  DELETE FROM interviews WHERE id = new_interview_id;
  RAISE NOTICE 'ALL TESTS PASSED - Cleanup done';
END $$;
