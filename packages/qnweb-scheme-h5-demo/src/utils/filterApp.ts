import { List } from "@/types";
/**
 * @desc 筛选不同类型的应用
 * @param list
 * @param curIndex
 * @returns 当前分类的列表
 */
export function filterApp(list: List[], curIndex: number) {
  const sameTypeApps = list.filter((item) => item.type == curIndex);
  return sameTypeApps;
}
