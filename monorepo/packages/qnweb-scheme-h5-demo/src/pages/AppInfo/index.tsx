import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
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
		try {
			const isAndroid = /Android/i.test(navigator.userAgent);
			const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
			if (isAndroid) {
				window.router.routerNative(url);
			}

			if (isIOS) {
				window.webkit.messageHandlers.routerNative.postMessage(url);
			}
		} catch (error) {
			Modal.error({
				content: JSON.stringify(error)
			});
		}
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
