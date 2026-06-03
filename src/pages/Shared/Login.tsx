// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { authService } from '../../services/auth.service';

// const loginSchema = z.object({
//     email: z.string().email('Invalid email format'),
//     password: z.string().min(1, 'Password is required'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// export default function Login() {
//     const navigate = useNavigate();
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
//         resolver: zodResolver(loginSchema),
//     });

//     const onSubmit = async (data: LoginFormData) => {
//         setLoading(true);
//         setError('');
        
//         try {
//             const response = await authService.login(data);
//             localStorage.setItem('token', response.token);
//             localStorage.setItem('user', JSON.stringify(response.user));
//             navigate('/dashboard');
//         } catch (err: any) {
//             setError(err.response?.data?.message || 'Login failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
//             {/* Login Card */}
//             <div className="w-full max-w-md">
//                 {/* Logo/Brand Section */}
//                 <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-2xl shadow-lg mb-4">
//                         <span className="text-3xl font-bold text-cyan-900">I</span>
//                     </div>
//                     <h1 className="text-2xl font-bold text-cyan-900">INVENTORY</h1>
//                     <p className="text-sm text-cyan-700 mt-1">Management System</p>
//                 </div>

//                 {/* Login Form Card */}
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                     <div className="bg-cyan-900 px-6 py-4">
//                         <h2 className="text-xl font-bold text-white">Login</h2>
//                         <p className="text-sm text-blue-200 mt-1">Sign in to your account</p>
//                     </div>

//                     <div className="p-6">
//                         {error && (
//                             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <p className="text-sm text-red-600">{error}</p>
//                             </div>
//                         )}

//                         <form onSubmit={handleSubmit(onSubmit)}>
//                             <div className="mb-5">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-2">
//                                     Email Address
//                                 </label>
//                                 <input
//                                     type="email"
//                                     {...register('email')}
//                                     placeholder="Your email please...."
//                                     className={`
//                                         w-full px-4 py-2.5 border rounded-lg
//                                         focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-transparent
//                                         transition
//                                         ${errors.email ? 'border-red-500' : 'border-gray-300'}
//                                     `}
//                                 />
//                                 {errors.email && (
//                                     <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//                                 )}
//                             </div>

//                             <div className="mb-6">
//                                 <label className="block text-sm font-semibold text-cyan-900 mb-2">
//                                     Password
//                                 </label>
//                                 <input
//                                     type="password"
//                                     {...register('password')}
//                                     placeholder="••••••••"
//                                     className={`
//                                         w-full px-4 py-2.5 border rounded-lg
//                                         focus:outline-none focus:ring-1 focus:ring-cyan-200 focus:border-transparent
//                                         transition
//                                         ${errors.password ? 'border-red-500' : 'border-gray-300'}
//                                     `}
//                                 />
//                                 {errors.password && (
//                                     <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
//                                 )}
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="
//                                     w-full py-2.5
//                                     bg-cyan-500 hover:bg-cyan-400
//                                     text-cyan-900 font-bold
//                                     rounded-lg
//                                     transition duration-200
//                                     disabled:opacity-50 disabled:cursor-not-allowed
//                                 "
//                             >
//                                 {loading ? 'Logging in...' : 'Sign In'}
//                             </button>
//                         </form>

//                         <div className="mt-6 pt-4 border-t border-gray-200">
//                             <p className="text-xs text-center text-gray-500">
//                                 Join Us In
//                             </p>
//                             <p className="text-xs text-center text-gray-500 mt-1">
//                                 Inventory Management System
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }




import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/auth.service';

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError('');
        
        try {
            const response = await authService.login(data);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
            {/* Login Card */}
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl font-bold text-cyan-900">I</span>
                    </div>
                    <h1 className="text-2xl font-bold text-cyan-900">INVENTORY</h1>
                    <p className="text-sm text-cyan-700 mt-1">Management System</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-cyan-900 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">Login</h2>
                        <p className="text-sm text-blue-200 mt-1">Sign in to your account</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Email Field with Floating Label */}
                            <div className="mb-5 relative">
                                <input
                                    type="email"
                                    {...register('email')}
                                    id="email"
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`
                                        w-full px-4 py-3 border rounded-lg
                                        focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-transparent
                                        transition-all duration-200
                                        bg-white
                                        ${errors.email ? 'border-red-500' : 'border-gray-300'}
                                        ${(focusedField === 'email' || emailValue) ? 'pt-5 pb-1' : 'py-3'}
                                    `}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="email"
                                    className={`
                                        absolute left-4 transition-all duration-200 pointer-events-none
                                        ${(focusedField === 'email' || emailValue) 
                                            ? 'text-xs top-2 text-cyan-600' 
                                            : 'text-gray-500 top-1/2 -translate-y-1/2'
                                        }
                                        ${errors.email ? 'text-red-500' : ''}
                                    `}
                                >
                                    Email Address
                                </label>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field with Floating Label + Show/Hide Button */}
                            <div className="mb-6 relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    id="password"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`
                                        w-full px-4 py-3 border rounded-lg
                                        focus:outline-none focus:ring-1 focus:ring-cyan-200 focus:border-transparent
                                        transition-all duration-200
                                        bg-white
                                        pr-12
                                        ${errors.password ? 'border-red-500' : 'border-gray-300'}
                                        ${(focusedField === 'password' || passwordValue) ? 'pt-5 pb-1' : 'py-3'}
                                    `}
                                    placeholder=" "
                                />
                                <label
                                    htmlFor="password"
                                    className={`
                                        absolute left-4 transition-all duration-200 pointer-events-none
                                        ${(focusedField === 'password' || passwordValue) 
                                            ? 'text-xs top-2 text-cyan-600' 
                                            : 'text-gray-500 top-1/2 -translate-y-1/2'
                                        }
                                        ${errors.password ? 'text-red-500' : ''}
                                    `}
                                >
                                    Password
                                </label>
                                
                                {/* Show/Hide Password Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                                
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">{errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full py-2.5
                                    bg-cyan-500 hover:bg-cyan-400
                                    text-cyan-900 font-bold
                                    rounded-lg
                                    transition duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            >
                                {loading ? 'Logging in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-xs text-center text-gray-500">
                                Join Us In
                            </p>
                            <p className="text-xs text-center text-gray-500 mt-1">
                                Inventory Management System
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}