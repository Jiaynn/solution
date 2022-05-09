import HmacSHA1 from "crypto-js/hmac-sha1";
import Base64 from "crypto-js/enc-base64";

/**
 * 生成身份证识别管理凭证
 * @param accessKey
 * @param secretKey
 * @param reqBody
 */
export function generateIDCardAccessToken(accessKey: string, secretKey: string, reqBody: string): string {
  const signingStr = 'POST' + ' ' + '/ocr/idcard' +
    '\nHost: ocr-idcard.qiniuapi.com' +
    '\nContent-Type: application/json' + '\n\n' + reqBody;
  const sign = HmacSHA1(signingStr, secretKey);
  const encodedSign = Base64.stringify(sign).replace(/\//g, '_').replace(/\+/g, '-');
  return accessKey + ':' + encodedSign;
}