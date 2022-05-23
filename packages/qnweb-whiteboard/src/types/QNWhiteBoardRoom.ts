export interface QNUser {
  /**
   * 用户头像url
   */
  headPic: string;
  /**
   * 用户昵称
   */
  nickName: string;
  /**
   * sessionId
   */
  sessionId: string;
  /**
   * 用户 id
   */
  userId: string;
}

export interface QNDocument {
  /**
   * 白板页背景色
   */
  bgColor: string;
  /**
   * 白板页 Id
   */
  documentId: string;
  /**
   * 白板序列号
   */
  documentNo: number;
}

export interface QNRoomEvent {
  /**
   * 加入房间成功
   * @param userList{QNUser[]} 当前房间用户列表
   */
  onJoinSuccess?: (userList: QNUser[]) => void;
  /**
   * 加入房间失败
   */
  onJoinFailed?: () => void;
  /**
   * 房间连接状态改变
   * @param code 连接状态码 0: 连接成功 1: 正在连接房间 2: 已链接房间 3: 连接失败
   */
  onRoomStatusChanged?: (code: number) => void;
  /**
   * 有人加入房间
   * @param user{QNUser} 加入房间的用户
   */
  onUserJoin?: (user: QNUser) => void;
  /**
   * 有人离开房间
   * @param user{QNUser} 离开房间的用户
   */
  onUserLeave?: (user: QNUser) => void;
  /**
   * 白板页列表发生了变化
   * @param documentList {QNDocument[]} 白板页列表
   */
  onDocumentListChanged?: (documentList: QNDocument[]) => void;
  /**
   * 白板页翻页
   * @param documentId {string} 白板页 Id
   */
  onDocumentPageChanged?: (documentId: string) => void;
}
