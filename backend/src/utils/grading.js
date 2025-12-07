const normalize = (str) => {
  if (str === null || str === undefined) return "";
  if (typeof str !== 'string') return String(str);
  return str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
};

exports.checkAnswer = (type, dbAnswer, userAnswer) => {
  // 安全检查：如果数据库里没答案，或者用户没填，直接判错（防止崩溃）
  if (dbAnswer === null || dbAnswer === undefined) return false;
  if (userAnswer === null || userAnswer === undefined) return false;

  // 1. 判断题
  if (type === 'truefalse' || type === 'true_false') {
    // 兼容 dbAnswer 是 [true] 数组的情况 (LeanCloud 修复后的格式)
    let correctVal = dbAnswer;
    if (Array.isArray(dbAnswer) && dbAnswer.length > 0) {
      correctVal = dbAnswer[0];
    }
    return String(correctVal).toLowerCase() === String(userAnswer).toLowerCase();
  }

  // 2. 选择题
  if (type === 'choice') {
    if (Array.isArray(dbAnswer)) return dbAnswer.includes(userAnswer);
    return String(dbAnswer) === String(userAnswer);
  }

  // 3. 填空题
  if (type === 'blank') {
    const correctArr = Array.isArray(dbAnswer) ? dbAnswer : [dbAnswer];
    const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

    // 情况 A: 只有一个空，但数据库有多个备选答案
    if (userArr.length === 1 && correctArr.length > 1) {
      const userVal = normalize(userArr[0]);
      return correctArr.some(ans => normalize(ans) === userVal);
    }

    // 情况 B: 标准对应
    if (userArr.length !== correctArr.length) return false;
    return correctArr.every((ans, index) => normalize(ans) === normalize(userArr[index]));
  }

  return false;
};

exports.calculateExamScore = (questionsDb, userAnswersMap) => {
  let score = 0;
  let wrongList = [];
  const pointsMap = { choice: 2, blank: 1, truefalse: 1, true_false: 1 };

  questionsDb.forEach(q => {
    const sid = q.get('sid');
    const type = q.get('type');
    const isCorrect = exports.checkAnswer(type, q.get('answer'), userAnswersMap[sid]);
    
    if (isCorrect) score += (pointsMap[type] || 0);
    else wrongList.push(sid);
  });

  return { score, wrongList };
};