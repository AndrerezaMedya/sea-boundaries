import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'; 

import ScrollToTop from '@/components/ScrollToTop';

const PortalHomePage = lazy(() => import('@/pages/PortalHomePage'));
const RequestDataPage = lazy(() => import('@/pages/RequestDataPage'));
const RequestDataSuccessPage = lazy(() => import('@/pages/RequestDataSuccessPage'));
const UserGuidePage = lazy(() => import('@/pages/UserGuidePage'));
const MethodologyPage = lazy(() => import('@/pages/MethodologyPage'));
const WebGisPage = lazy(() => import('@/pages/WebGisPage'));

const App = () => {
	return (
		<>
			<ScrollToTop />
			<Suspense
			fallback={
				<div className='flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm font-medium text-slate-600'>
					Memuat halaman portal...
				</div>
			}
		>
			<Routes>
				<Route path='/' element={<PortalHomePage />} />
				<Route path='/request-data' element={<RequestDataPage />} />
				<Route path='/request-data/success' element={<RequestDataSuccessPage />} />
				<Route path='/user-guide' element={<UserGuidePage />} />
				<Route path='/metodologi' element={<MethodologyPage />} />
				<Route path='/peta' element={<WebGisPage />} />
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Suspense>
		</>
	);
};

export default App;
