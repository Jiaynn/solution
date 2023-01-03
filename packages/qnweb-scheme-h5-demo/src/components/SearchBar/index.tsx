import React, { FC, useRef, useState } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { SearchBarProps } from "@/types";

export const SearchBar: FC<SearchBarProps> = (props) => {
  const { iptValue } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState(iptValue);
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    inputRef.current?.blur();
    navigate("/search", { state: { search: searchValue }, replace: true });
  }
  return (
    <div className="search">
      <form onSubmit={(e) => handleSearch(e)} action="">
        <input
          ref={inputRef}
          type="search"
          placeholder="搜索应用名称"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
    </div>
  );
};
