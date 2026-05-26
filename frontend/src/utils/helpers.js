/**
 * helpers.js
 * Các hàm tiện ích dùng chung trong toàn app.
 */

/**
 * Lấy 2 chữ cái đầu của username hoặc email để làm avatar.
 */
export function getAvatar(user) {
  if (!user) return '/avatar-default.jpg';
  return user.avatar_url || '/avatar-default.jpg';
}

/**
 * Tính điểm trung bình từ mảng điểm số.
 */
export function calcAvgScore(scores) {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return parseFloat((sum / scores.length).toFixed(2));
}

/**
 * Rút ngắn chuỗi văn bản nếu vượt quá maxLen ký tự.
 */
export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
