import React, { FC, memo, useRef, useState } from 'react';

import { SearchBarProps } from '@/types';

import './index.scss';

export const SearchBar: FC<SearchBarProps> = memo(function SearchBar(props) {
	const { iptValue, goSearch } = props;
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [searchValue, setSearchValue] = useState(iptValue);
	function handleSearch(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		inputRef.current?.blur();
		goSearch(searchValue);
	}
	return (
		<div className="search">
			<form onSubmit={(e) => handleSearch(e)}>
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
});
