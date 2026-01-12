/** 格式化專案名稱 */
export default (projectName: string): string => {
  let startIndex = 0;
  let hyphenIndex = projectName.indexOf("-", startIndex);

  while (hyphenIndex !== -1) {
    const nextCharIndex = hyphenIndex + 1;

    // 如果 "-" 是最後一個字元，回傳空字串 (因為後面沒有東西了)
    if (nextCharIndex >= projectName.length) {
      return "";
    }

    const nextChar = projectName[nextCharIndex];
    // 檢查是否為英文字母 (A-Z, a-z)
    const isEnglish = /^[a-zA-Z]$/.test(nextChar);
    // 檢查是否為 "("
    const isParen = nextChar === "(";

    // 如果 "-" 後面"不是"接英文字母且"不是"接 "("，就回傳後面的字串
    if (!isEnglish && !isParen) {
      return projectName.substring(nextCharIndex);
    }

    // 繼續往後找
    startIndex = hyphenIndex + 1;
    hyphenIndex = projectName.indexOf("-", startIndex);
  }

  // 如果都沒找到符合條件的 "-"，回傳原始名稱
  return projectName;
};
