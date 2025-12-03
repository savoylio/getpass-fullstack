const normalize = (str) => {
  if (typeof str !== 'string') return String(str);
  return str.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
};

exports.checkAnswer = (type, dbAnswer, userAnswer) => {
  if (userAnswer === null || userAnswer === undefined) return false;

  // 1. 判断题：兼容带下划线和不带下划线
  if (type === 'truefalse' || type === 'true_false') {
    return String(dbAnswer).toLowerCase() === String(userAnswer).toLowerCase();
  }

  // 2. 选择题
  if (type === 'choice') {
    if (Array.isArray(dbAnswer)) return dbAnswer.includes(userAnswer);
    return dbAnswer === userAnswer;
  }

  // 3. 填空题
  if (type === 'blank') {
    const correctArr = Array.isArray(dbAnswer) ? dbAnswer : [dbAnswer];
    const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

    // 只有一个空但有多个备选答案
    if (userArr.length === 1 && correctArr.length > 1) {
      const userVal = normalize(userArr[0]);
      return correctArr.some(ans => normalize(ans) === userVal);
    }

    if (userArr.length !== correctArr.length) return false;
    return correctArr.every((ans, index) => normalize(ans) === normalize(userArr[index]));
  }

  return false;
};

exports.calculateExamScore = (questionsDb, userAnswersMap) => {
  let score = 0;
  let wrongList = [];
  // 这里的 map 也要加上 true_false
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