import React, { lazy } from 'react';

import AppInfo from '@/pages/AppInfo';

const Home = lazy(() => import('@/pages/Home'));
const ShowDetail = lazy(() => import('@/pages/ShowDetail'));
const Search = lazy(() => import('@/pages/Search'));
export default [
	{
		path: '/',
		element: <Home></Home>
	},
	{
		path: '/detail',
		element: <ShowDetail></ShowDetail>
	},
	{
		path: '/search',
		element: <Search></Search>
	},
	{
		path: '/appInfo',
		element: <AppInfo></AppInfo>
	}
];
