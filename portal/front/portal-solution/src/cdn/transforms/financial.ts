import NP from "number-precision";

import {
  ChargeType,
  chargeTypeTextMap,
  SubChargeType,
  subChargeTypeTextMap,
  chargeUnitTextMap,
} from "cdn/constants/oem";

export function humanizeChargeType(
  type: ChargeType,
  bandwidthType?: SubChargeType
) {
  // 只有带宽计费才需要"子计费类型"
  return ChargeType.Traffic === type
    ? chargeTypeTextMap[type]
    : `${chargeTypeTextMap[type]}-${subChargeTypeTextMap[bandwidthType!]}`;
}

export function transformUsageForEdit(
  val: number,
  chargeType: ChargeType
): string {
  const result =
    chargeType === ChargeType.Bandwidth
      ? NP.divide(val, 1000 ** 2)
      : NP.divide(val, 1024 ** 3);
  return result.toFixed(4);
}

export function transformUsageForSave(
  val: number,
  chargeType: ChargeType
): number {
  const result =
    chargeType === ChargeType.Bandwidth
      ? NP.times(val, 1000 ** 2)
      : NP.times(val, 1024 ** 3);
  return Math.floor(result);
}

export function transformCentToYuan(val: number) {
  return NP.divide(val, 100);
}

export function transformYuanToCent(val: number) {
  return Math.floor(NP.times(val, 100));
}

export function transformCoefficientForEdit(val: number) {
  return NP.divide(val, 100);
}

export function transformCoefficientForSave(val: number) {
  return Math.floor(NP.times(val, 100));
}

export function humanizeUnitPrice(value: number, type: ChargeType) {
  const yuan = transformCentToYuan(value);
  const unit = chargeUnitTextMap[type];

  return `${yuan} ${unit}`;
}
