import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

import { AppList } from '@/components/AppList';
import { SearchBar } from '@/components/SearchBar';
import { list, tabs } from '@/data';
import { List } from '@/types';
import { filterApp, hot } from '@/utils';

import './index.scss';

export default function Home() {
	const [hotList, setHotList] = useState<List[] | null>(null); //热门推荐列表
	const [, setActiveIndex] = useState(0); //当前tab选中
	const [curTypeList, setCurTypeList] = useState<List[] | null>(null); //当前分类的列表

	/**
	 * @desc 处理tab选中
	 * @param index
	 */
	const handleActiveTab = (i: string) => {
		const index = parseInt(i);
		setActiveIndex(index);
		const curTypeApps = filterApp(list, index);
		setCurTypeList(curTypeApps);
		console.log('curTypeApps', curTypeApps);
	};
	useEffect(() => {
		const hotRes = hot(list);
		setHotList(hotRes);
		setCurTypeList(filterApp(list, 0));
	}, []);

	const navigate = useNavigate();
	function goSearch(value: string) {
		navigate('/search', { state: { search: value } });
	}
	return (
		<div id="container">
			<SearchBar iptValue={''} goSearch={goSearch}></SearchBar>
			<div className="hot">
				<p>热门推荐</p>
				<AppList list={hotList}></AppList>
			</div>
			<div className="content">
				<div className="nav-wrapper">
					<ul className="tabs_nav">
						<Tabs
							defaultActiveKey="0"
							style={{ height: 220 }}
							onTabClick={(key) => handleActiveTab(key)}
							items={tabs.map((item, i) => {
								const id = String(i);
								return {
									label: item.title,
									key: id,
									children: <AppList list={curTypeList}></AppList>
								};
							})}
						/>
					</ul>
				</div>
			</div>
		</div>
	);
}
