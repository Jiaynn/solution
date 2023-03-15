import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppList } from '@/components/AppList';
import { SearchBar } from '@/components/SearchBar';
import { List } from '@/types';
import { searchApp } from '@/utils';

import './index.scss';

export default function Search() {
	const {
		state: { search }
	} = useLocation();
	const [searchList, setSearchList] = useState<List[]>([]);
	useEffect(() => {
		setSearchList(searchApp(search));
	}, [search]);
	const navigate = useNavigate();
	function goSearch(value: string) {
		navigate('/search', { state: { search: value }, replace: true });
	}
	return (
		<div className="container">
			<SearchBar iptValue={search} goSearch={goSearch}></SearchBar>

			<div className="search-list">
				<strong>搜索结果</strong>
				{searchList.length ? (
					<AppList list={searchList}></AppList>
				) : (
					<div className="empty">
						<img
							src="https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/empty.png"
							alt=""
						/>
						<div className="empty-des">空空如也</div>
					</div>
				)}
			</div>
		</div>
	);
}
