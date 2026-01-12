// @ts-check
/**
 * @type {import('prettier').Config}
 */
const config = {
  singleQuote: true, // 使用單引號
  printWidth: 120, // 每行文字數量達 120 字元就換到新的一行
  trailingComma: 'none', // 如 Object、Array 內的元素不需要尾隨逗號
  quoteProps: 'consistent'
};
// vue/singleline-html-element-content-newline
export default config;
