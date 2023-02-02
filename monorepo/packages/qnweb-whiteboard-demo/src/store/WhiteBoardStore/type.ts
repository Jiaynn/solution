import QNWhiteBoard from 'qnweb-whiteboard';

export type WhiteBoardState = {
  client?: QNWhiteBoard;
}

export type WhiteBoardAction = {
  type: 'PATCH';
  payload: WhiteBoardState;
} | {
  type: 'SET_CLIENT';
  payload: QNWhiteBoard;
}
