import { AppListProps, List } from "@/types";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
export const AppList: FC<AppListProps> = (props) => {
  const { list } = props;
  const navigate = useNavigate();
  const appDetail = (appInfo: List) => {
    navigate("/detail", { state: { appInfo } });
  };
  return (
    <ul className="list-wrapper">
      {list?.map((item) => (
        <li key={item.id} onClick={() => appDetail(item)}>
          <img className="icon-pic" src={item.icon} title={item.title} />
          <div className="app-title">{item.title}</div>
        </li>
      ))}
    </ul>
  );
};
