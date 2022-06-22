class MockApi {
  token: string;
  appId: string;
  meetingId: string;
  userId: string;
  bucketId: string;
  recordId: string;

  constructor() {
    // 加入房间参数， 服务端获取
    this.token = 'af230210566aef8a21f8cf663d3322a3';
    this.appId = '29d3757f29d14138949f2c17ae14e957';
    this.meetingId = '05978893594544ca9cf057cad685e7fd';
    this.userId = 'qiniu-user';
    // 加入白板参数， 服务端获取
    this.bucketId = '07f5ab4b-5d9d-42fc-be3f-0c64930bf8ca';
    this.recordId = '60fcf368-00fc-4600-906e-7e4de5d538be';
  }
}

export const MockResult = new MockApi();
