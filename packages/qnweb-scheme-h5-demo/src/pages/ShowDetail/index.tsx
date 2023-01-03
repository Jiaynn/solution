import React, { FC, useEffect, useRef } from "react";
import "./index.scss";
import { useLocation } from "react-router-dom";
import { loadPdf } from "@/utils";

export const ShowDetail: FC = () => {
  const stateParams = useLocation();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const {
    appInfo: { content, title, url },
  } = stateParams.state;
  /**
   * @desc demo演示跳转
   */
  const handleDemo = () => {
    window.router
      ? window.router.routerNative(url)
      : alert("请在app上运行哦～");
  };

  useEffect(() => {
    content.includes("pdf") ? loadPdf(contentRef.current, content) : null;
  }, [content]);

  return (
    <div className="container">
      <div className="top-wrapper">
        <div className="app-name">{title}</div>
        {url !== "" ? (
          <button className="demo-btn" onClick={handleDemo}>
            demo 演示
          </button>
        ) : null}
      </div>
      <div className="content-wrapper" ref={contentRef}>
        {content.includes("pdf") ? null : <iframe src={content}></iframe>}
        {/*  */}
      </div>
    </div>
  );
};
