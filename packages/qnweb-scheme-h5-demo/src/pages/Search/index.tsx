import { SearchBar } from "@/components/SearchBar";
import React, { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./index.scss";
import { searchApp } from "@/utils";
import { AppList } from "@/components/AppList";
import { List } from "@/types";
export const Search: FC = () => {
  const {
    state: { search },
  } = useLocation();
  const [searchList, setSearchList] = useState<List[]>([]);
  useEffect(() => {
    setSearchList(searchApp(search));
  }, [search]);

  return (
    <div className="container">
      <SearchBar iptValue={search}></SearchBar>
      <div className="search-list">
        <strong>搜索结果</strong>
        {searchList.length ? (
          <AppList list={searchList}></AppList>
        ) : (
          <div className="empty">
            <img
              src="http://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a0082b7754fbdb2d98a5c18d0b0edd25.png~tplv-uwbnlip3yd-webp.webp"
              alt=""
            />
            <div className="empty-des">空空如也</div>
          </div>
        )}
      </div>
    </div>
  );
};
