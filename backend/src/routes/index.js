const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const questionController = require('../controllers/questionController');
const examController = require('../controllers/examController');
const socialController = require('../controllers/socialController');
const captchaController = require('../controllers/captchaController');

// Captcha
router.get('/captcha/new', captchaController.getCaptcha);

// Auth
router.post('/auth/login', authController.login);
// router.post('/auth/register', authController.register); // DISABLED public register
router.get('/auth/me', auth, authController.getProfile);
router.put('/auth/update', auth, authController.updateProfile);
router.put('/auth/password', auth, authController.changePassword);

// Feature Gates (Middleware for Guest Check could be added here, 
// but currently handled by auth middleware requiring valid token)

// Exercise
router.get('/questions/exercise', auth, questionController.getExerciseQuestions);
router.post('/questions/check', auth, questionController.checkAnswer);
router.post('/questions/finish', auth, questionController.finishPracticeRound);
router.get('/wrongbook', auth, questionController.getWrongBook);

// Exam
router.get('/exam/generate', auth, examController.generateExam);
router.post('/exam/submit', auth, examController.submitExam);

// Social
router.get('/leaderboard', auth, socialController.getLeaderboard); // Guests might read this? If so, relax auth
router.post('/message/send', auth, socialController.sendMessage);
router.get('/message/my', auth, socialController.getMyMessages);
router.post('/message/read', auth, socialController.markAllRead);

// ... (保留上方代码)

// Admin Routes (Reset Password System)
router.post('/admin/user/search', auth, authController.adminGetUser);
router.post('/auth/reset-password', auth, authController.adminResetPassword);

module.exports = router;