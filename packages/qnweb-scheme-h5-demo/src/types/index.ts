export interface List {
  /**
   * 每个应用的唯一标识
   */
  id: number;
  /**
   * 应用的名称
   */
  title: string;
  /**
   * 应用对应的图片
   */
  icon: string;
  /**
   * 应用属于什么分类
   * 0:视频营销 1:社交互娱 2:视联网...
   */
  type: number;
  /**
   * 应用的demo演示链接，没有展示空字符串
   */
  url: string;
  /**
   * 应用是否属于热门推荐
   */
  isHot: boolean;
  /**
   * 应用下方展示的链接
   */
  content: string;
}
export interface AppListProps {
  list: List[] | null;
}
/**
 * @desc 搜索栏参数
 */
export interface SearchBarProps {
  iptValue: string;
}
