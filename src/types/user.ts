/** 当前登录用户信息 */
export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  role: 'user' | 'admin';
}
