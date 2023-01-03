import React, { FC, useEffect, useState } from "react";
import { list, tabs } from "@/data";
import { filterApp, hot } from "@/utils";
import "./index.scss";
import { List } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { AppList } from "@/components/AppList";
export const Home: FC = () => {
  const [hotList, setHotList] = useState<List[] | null>(null); //热门推荐列表
  const [activeIndex, setActiveIndex] = useState(0); //当前tab选中
  const [curTypeList, setCurTypeList] = useState<List[] | null>(null); //当前分类的列表

  /**
   * @desc 处理tab选中
   * @param index
   */
  const handleActiveTab = (index: number) => {
    setActiveIndex(index);
    const curTypeApps = filterApp(list, index);
    setCurTypeList(curTypeApps);
  };
  useEffect(() => {
    const hotRes = hot(list);
    setHotList(hotRes);
    setCurTypeList(filterApp(list, 0));
  }, []);
  return (
    <div id="container">
      <SearchBar iptValue={""}></SearchBar>
      <div className="hot">
        <strong>热门推荐</strong>
        <AppList list={hotList}></AppList>
      </div>
      <div className="content">
        <div className="nav-wrapper">
          <ul>
            {tabs.map((item, index) => {
              return (
                <li
                  key={item.id}
                  className={index == activeIndex ? "tabActive tab" : "tab"}
                  onClick={() => handleActiveTab(index)}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="app-list">
          <AppList list={curTypeList}></AppList>
        </div>
      </div>
    </div>
  );
};
