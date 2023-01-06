import { List } from '@/types';
/**
 * @desc 筛选热门推荐
 * @param list
 * @returns 热门推荐列表
 */
export function hot(list: List[]) {
	const hot = list.filter((item: List) => item.isHot);
	return hot;
}
