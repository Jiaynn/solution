import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';

import { SearchBarProps } from '@/types';

import './index.scss';

export const SearchBar: FC<SearchBarProps> = memo(function SearchBar(props) {
	const { iptValue, goSearch } = props;
	const inputRef = useRef<HTMLInputElement | null>(null);
	const searchIcon = useRef<any>(null);
	const [searchValue, setSearchValue] = useState(iptValue);
	function handleSearch(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		inputRef.current?.blur();
		goSearch(searchValue);
	}
	function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
		setSearchValue(e.target.value);
		if (searchIcon.current) {
			searchIcon.current.style.display = 'none';
		}
	}
	useEffect(() => {
		if (searchIcon.current && searchValue == '') {
			searchIcon.current.style.display = 'block';
		} else {
			searchIcon.current.style.display = 'none';
		}
	}, [searchValue]);
	return (
		<div className="search">
			<form onSubmit={(e) => handleSearch(e)}>
				<SearchOutlined className="icon" ref={searchIcon} />
				<input
					ref={inputRef}
					type="search"
					placeholder="搜索"
					value={searchValue}
					onChange={(e) => handleOnChange(e)}
				/>
			</form>
		</div>
	);
});
