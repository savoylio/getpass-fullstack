// backend/src/routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 1. 引入所有控制器 (检查这 4 行是否都在)
const authController = require('../controllers/authController');
const questionController = require('../controllers/questionController');
const examController = require('../controllers/examController'); // 必须有这个
const socialController = require('../controllers/socialController');

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getProfile);
router.put('/auth/update', auth, authController.updateProfile);
router.put('/auth/password', auth, authController.changePassword);

// Exercise
router.get('/questions/exercise', auth, questionController.getExerciseQuestions);
router.post('/questions/check', auth, questionController.checkAnswer);
router.post('/questions/finish', auth, questionController.finishPracticeRound); // 必须有这个
router.get('/wrongbook', auth, questionController.getWrongBook);

// Exam (检查这 2 行是否都在！)
router.get('/exam/generate', auth, examController.generateExam);
router.post('/exam/submit', auth, examController.submitExam);

// Social
router.get('/leaderboard', auth, socialController.getLeaderboard);
router.post('/message/send', auth, socialController.sendMessage);
router.get('/message/my', auth, socialController.getMyMessages);

module.exports = router;