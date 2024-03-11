import { useLocation } from 'react-router-dom';
import './App.css'

function ErrorPage() {
	const location = useLocation();
	const { message, statusCode } = location.state || { message: 'An unknown error occurred.', statusCode: '' };
	console.log("AIUSHD ", statusCode);

	return (
		<div className='flex text-center items-center flex-col'>
			<h1 className='text-red-500 text-2xl'>ERROR</h1>
			{statusCode && <img className='w-1/2' src={`https://http.cat/${statusCode}`} alt='Error Cat' />}
			<p>Error Details: {message}</p>
		</div>
	)
}

export default ErrorPage;
