import React, { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppListProps, List } from '@/types';

import './index.scss';

export const AppList: FC<AppListProps> = memo(function AppList(props) {
	const { list } = props;
	const navigate = useNavigate();
	const appDetail = (appInfo: List) => {
		navigate('/appInfo', { state: { appInfo } });
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
});
