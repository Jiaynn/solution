import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { renderImageUrl } from '@/utils';

import './index.scss';

export default function AppInfo() {
	const stateParams = useLocation();
	const contentRef = useRef<HTMLDivElement | null>(null);
	const {
		appInfo: { content, title, url, folder }
	} = stateParams.state;
	/**
	 * @desc demo演示跳转
	 */
	const handleDemo = () => {
		window.router
			? window.router.routerNative(url)
			: alert('请在app上运行哦～');
	};
	useEffect(() => {
		if (!content.includes('http')) {
			renderImageUrl(content, folder, contentRef.current);
		}
	}, [content, folder]);

	return (
		<div className="container">
			<div className="top-wrapper">
				<div className="app-name">{title}</div>
				{url !== '' ? (
					<button className="demo-btn" onClick={handleDemo}>
						demo 演示
					</button>
				) : null}
			</div>
			<div className="content-wrapper" ref={contentRef}>
				{content.includes('http') ? <iframe src={content}></iframe> : null}
			</div>
		</div>
	);
}
