/**
 * @file money transform
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

export function formatMoney(
  input: number,
  decimal = 2,
  ratio = 10000,
  withYuan = true
): string {
  const money = (Number(input) / ratio).toFixed(decimal)
  return (withYuan ? '￥ ' : '') + money
}
