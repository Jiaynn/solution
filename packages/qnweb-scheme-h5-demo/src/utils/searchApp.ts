import { list } from "@/data";
/**
 * @desc 筛选搜索内容
 * @param value
 * @returns 搜索结果
 */
export function searchApp(value: string) {
  const searchRes = list.filter((item) => item.title.includes(value));
  return searchRes;
}
