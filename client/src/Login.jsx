import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PropTypes from 'prop-types';
import './App.css';

function LoginPage({ showLogin, onToggleView }) {
  // Form State Hooks and Error Messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    let valid = true;
    let errors = {};

    if (!username) {
      errors.username = 'Required';
      valid = false;
    }
    if (!password) {
      errors.password = 'Required';
      valid = false;
    }
    if (showLogin === false && !confirmPassword) {
      errors.confirmPassword = 'Required';
      valid = false;
    }
    if (showLogin === false && confirmPassword !== password) {
      errors.password = 'Passwords do not match';
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    if (username.length === 0) {
      errors.username = 'Required';
    }
    else if (username.length < 5 || username.length > 16) {
      errors.username = 'Username must have 5-16 characters'
    }
    if (password.length < 8 || password.length > 32) {
      errors.password = 'Password must have at least 8-32 characters'
    }
    const hasNumber = /\d/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasNumber || !hasLowerCase || !hasUpperCase || !hasSpecialChar) {
      errors.password = 'Password must include a number, a lowercase letter, a uppercase letter and a special character'
    }
    setErrors(errors);
    return valid;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      // Regular expression for valid username characters
      const isValid = /^[a-zA-Z0-9_]+$/.test(value);
      setErrors(prevErrors => ({
        ...prevErrors,
        username: isValid || value === "" ? null : 'Invalid Character. Username can only contains letters, numbers and `_`'
      }));
      if (isValid) {
        setUsername(value);
      }
    }
    else if (name === 'password') {
      setPassword(value);
    }
    else if (name === 'confirm_password') {
      setConfirmPassword(value);
    }
  }

  const ErrorMessage = ({ message }) => {
    return message ? <p className="text-red-500">{message}</p> : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('Invalid Form');
      return;
    }

    const endpoint = showLogin ? '/login' : '/register';

    const data = {
      username,
      password,
      ...(showLogin ? {} : { confirmPassword }),
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          const errorMessage = responseData.message || (response.status === 400 ? 'Bad request. Please check your input.' : 'Unauthorized. Incorrect username or password.');
          setErrors(prevErrors => ({
            ...prevErrors,
            form: errorMessage
          }));
        } else {
          navigate('/error', { state: { message: responseData.message || 'An unexpected error occurred.', statusCode: response.status } });
        }
      } else {
        console.log('Server response:', responseData);
        await login();
        // Handle successful response
      }


    } catch (error) {
      console.log('Error:', error);
      navigate('/error', { state: { message: error.message, statusCode: error.status } });
    }
  }

  const handleToggleView = () => {
    onToggleView();
    setErrors({});
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <>
      <div className='bg-neutral-700'>
        <div className='flex md:container mx-auto h-screen'>
          <div className='flex basis-full my-auto'>
            <div className='bg-neutral-900 flex flex-col basis-1/4 mx-auto h-1/2'>
              <div className='self-center'>
                <h1 className='text-red-600 font-bold text-xl p-3'>bm7Chat</h1>
              </div>
              {showLogin ? (

                <form className='flex flex-col text-center' onSubmit={handleSubmit}>
                  <ErrorMessage message={errors.form} />
                  <label className='text-white' htmlFor='username'>Username</label>
                  <div className='p-2'>
                    <input
                      className='p-2 m-2 rounded-sm'
                      type='text'
                      name='username'
                      id='username'
                      onChange={handleChange}
                      placeholder='Your Username'
                      aria-describedby='usernameError'
                    />
                    <ErrorMessage message={errors.username} />
                  </div>
                  <label className='text-white' htmlFor='password'>Password</label>
                  <div className='p-2'>
                    <input
                      className='p-2 m-2 rounded-sm'
                      type='password'
                      name='password'
                      id='password'
                      onChange={handleChange}
                      placeholder='Your Password'
                      aria-describedby='passwordError'
                    />
                    <ErrorMessage message={errors.password} />
                  </div>
                  <div className='p-2'>
                    <button className='text-white bg-blue-700 hover:bg-blue-800 rounded-sm px-4 py-2 self-center' type='submit'>Login</button>
                  </div>
                </form>
              ) : (
                <form className='flex flex-col text-center' onSubmit={handleSubmit}>
                  <ErrorMessage message={errors.form} />
                  <label className='text-white' htmlFor='username'>Username</label>
                  <div className='p-2'>
                    <input
                      className='p-2 m-2 rounded-sm'
                      type='text'
                      name='username'
                      id='username'
                      onChange={handleChange}
                      placeholder='Your Username'
                      aria-describedby='usernameError'
                    />
                    <ErrorMessage message={errors.username} />
                  </div>
                  <label className='text-white' htmlFor='password'>Password</label>
                  <div className='p-2'>
                    <input
                      className='p-2 m-2 rounded-sm'
                      type='password'
                      name='password'
                      id='password'
                      onChange={handleChange}
                      placeholder='Your Password'
                      aria-describedby='passwordError'
                    />
                    <ErrorMessage message={errors.password} />
                  </div>
                  <label className='text-white' htmlFor='confirm_password'>Confirm Password</label>
                  <div className='p-2'>
                    <input
                      className='p-2 m-2 rounded-sm'
                      type='password'
                      name='confirm_password'
                      id='confirm_password'
                      onChange={handleChange}
                      placeholder='Confirm Your Password'
                      aria-describedby='confirmPasswordError'
                    />
                    <ErrorMessage message={errors.confirmPassword} />
                  </div>
                  <div className='p-2 text-white self-center'>
                    <button className='text-white bg-blue-700 hover:bg-blue-800 rounded-sm px-4 py-2' type='submit'>Register</button>
                  </div>
                </form>
              )}
              <div className='p-2 text-white self-center'>
                <button className='text-white bg-neutral-700 hover:bg-neutral-800 rounded-sm px-4 py-2' onClick={handleToggleView}>
                  {showLogin ? 'Register' : 'Login'}
                </button>
              </div>
            </div>
          </div >
        </div >
      </div >
    </>
  );
}

LoginPage.propTypes = {
  showLogin: PropTypes.bool.isRequired,
  onToggleView: PropTypes.func.isRequired,
};

export default LoginPage;
