function convertChoice() {
  const raw = readExcel('excel/choice.xlsx');

  const output = raw.map((row, index) => {
    let correct = row.correct_answer;

    // 如果 correct 是 "B:Ulysses S. Grant"，我们取前面 "B"
    if (correct.includes(':')) {
      correct = correct.split(':')[0].trim();
    }

    return {
      id: index + 1,
      type: "choice",
      question: row.question,
      options: row.options.split(';'),
      options_translation: row.options_translation.split(';'),
      correct_answer: [correct],     // ← 数组！LeanCloud 就不会报错！
      translation: row.translation
    };
  });

  saveJSON(output, 'choice');
}