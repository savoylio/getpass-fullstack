const AV = require('../config/leancloud');
const { v4: uuidv4 } = require('uuid');

// Generate a new math challenge
exports.getCaptcha = async (req, res) => {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const answer = num1 + num2;
  const captchaId = uuidv4();

  try {
    // Store in a temporary 'Captcha' class in DB
    const Captcha = new AV.Object('Captcha');
    Captcha.set('captchaId', captchaId);
    Captcha.set('answer', String(answer));
    // Set explicit TTL via cloud function or cleanup script ideally, 
    // but here we just rely on validation timestamp check.
    await Captcha.save();

    res.json({
      captchaId,
      question: `${num1} + ${num2} = ?`
    });
  } catch (err) {
    res.status(500).json({ error: 'Captcha generation failed' });
  }
};

// Internal utility to verify and delete captcha
exports.verifyCaptcha = async (captchaId, userAnswer) => {
  const query = new AV.Query('Captcha');
  query.equalTo('captchaId', captchaId);
  const record = await query.first();

  if (!record) return false;

  const correct = record.get('answer') === String(userAnswer);
  
  // Always destroy after use (one-time use)
  await record.destroy(); 
  
  // Optional: check createdAt for expiration (e.g. 5 mins)
  const now = new Date();
  const diff = (now - record.createdAt) / 1000;
  if (diff > 300) return false; // Expired

  return correct;
};