import CryptoJS from 'crypto-js';

/**
 * 模拟生成 aiToken
 */
export function generateAiToken(): string {
  const accessKey = 'bsOUqUaLN-cJ3DlmdD6jU8B7_Nq5fo6IDZVAhtLe';
  const secretKey = 'B8IUczRc8wlbttCxesVLzS0pEWZ_aKEQ63Cz9CzR';
  const app_id = 'testApp';
  const src = `${app_id}:${Math.floor(Date.now() / 1000 + 6 * 60 * 60 * 12)}`;
  const encodedSrc = btoa(unescape(encodeURIComponent(src)));
  const sign = CryptoJS.HmacSHA1(encodedSrc, secretKey);
  const encodedSign = CryptoJS.enc.Base64.stringify(sign).replace(/\//g, '_').replace(/\+/g, '-');
  const aiToken = 'QD ' + accessKey + ':' + encodedSign + ':' + encodedSrc;
  console.log('aiToken', aiToken);
  return aiToken;
}

/**
 * 模拟生成 signToken，主要用于语音转文字
 * @param url
 */
export async function generateSignToken(url: string): Promise<string> {
  const accessKey = 'QxZugR8TAhI38AiJ_cptTl3RbzLyca3t-AAiH-Hh';
  const secretKey = '4yv8mE9kFeoE31PVlIjWvi3nfTytwT0JiAxWjCDa';
  const SKSign = CryptoJS.HmacSHA1(url, secretKey);
  const SKEncodedSign = CryptoJS.enc.Base64.stringify(SKSign).replace(/\//g, '_').replace(/\+/g, '-');
  const signToken = `${accessKey}:${SKEncodedSign}`;
  return signToken;
}