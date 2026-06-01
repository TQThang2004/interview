/**
 * helpers.js
 * Các hàm tiện ích dùng chung trong toàn app.
 */

/**
 * Lấy URL avatar của user. Fallback về avatar mặc định.
 */
export function getAvatar(user) {
  if (!user) return '/avatar-default.jpg';
  return user.avatar_url || '/avatar-default.jpg';
}
