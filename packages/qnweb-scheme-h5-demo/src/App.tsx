import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

import routes from './router';

function App() {
	const element = useRoutes(routes);
	return <Suspense>{element}</Suspense>;
}
export default App;
