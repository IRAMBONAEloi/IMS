import { useState, type FormEvent } from 'react';
import { ArrowRight, Boxes, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../services/auth-context-value';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const isRegister = window.location.pathname === '/register';
  const [registerMode, setRegisterMode] = useState(isRegister);
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setError('');
    const nextMode = !registerMode;
    setRegisterMode(nextMode);
    navigate(nextMode ? '/register' : '/login', { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = registerMode
        ? await authService.register(name.trim(), email.trim().toLowerCase(), password, shopName.trim())
        : await authService.login(email.trim().toLowerCase(), password);
      setUser(result.user);
      navigate(result.user.role === 'ADMIN' ? '/dashboard' : '/staff-dashboard', { replace: true });
    } catch (cause) {
      const responseMessage = (cause as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(responseMessage || 'We could not sign you in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="IMS inventory platform">
        <div className="auth-brand"><span className="ims-brand-mark"><Boxes size={22} /></span><strong>IMS</strong><span>STOCK CONTROL</span></div>
        <div className="auth-story-content">
          <p className="auth-kicker"><span /> INVENTORY, IN GOOD ORDER</p>
          <h1>See your stock.<br /><em>Own your day.</em></h1>
          <p className="auth-story-description">A calmer way to track what you have, what is moving, and what needs attention next.</p>
          <div className="auth-story-stat"><span className="auth-stat-icon"><Boxes size={18} /></span><div><strong>Clear stock. Confident decisions.</strong><small>Your shop, your numbers, always in view.</small></div></div>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-orbit auth-orbit-one" /><div className="auth-orbit auth-orbit-two" />
          <div className="auth-stack"><span className="stack-bar stack-bar-one" /><span className="stack-bar stack-bar-two" /><span className="stack-bar stack-bar-three" /><span className="stack-bar stack-bar-four" /></div>
          <span className="auth-visual-label">STOCK, IN SYNC</span>
        </div>
        <p className="auth-footer-note">Built for the people who keep business moving.</p>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-top"><span>INVENTORY MANAGEMENT</span><span>01 <i>/</i> 01</span></div>
        <div className="auth-form-wrap">
          <p className="auth-form-kicker">{registerMode ? 'A BETTER WAY TO RUN YOUR SHOP' : 'WELCOME BACK'}</p>
          <h2>{registerMode ? 'Set up your shop' : 'Good to have you back.'}</h2>
          <p className="auth-form-subtitle">{registerMode ? 'Create a private workspace for your inventory and team.' : 'Sign in to see what is happening across your inventory.'}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {registerMode && <>
              <label className="ims-field"><span>Your name</span><input autoComplete="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Aline Mukamana" /></label>
              <label className="ims-field"><span>Shop or company name</span><input autoComplete="organization" required minLength={2} value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="e.g. Umucyo Market" /></label>
            </>}
            <label className="ims-field"><span>Work email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourshop.com" /></label>
            <label className="ims-field"><span>Password</span><span className="ims-password-wrap"><input type={visible ? 'text' : 'password'} autoComplete={registerMode ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={registerMode ? 'At least 8 characters' : 'Enter your password'} /><button type="button" className="ims-password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {error && <div className="ims-form-error" role="alert">{error}</div>}
            <button className="ims-button ims-button-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : registerMode ? 'Create my workspace' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-switch">{registerMode ? 'Already have a workspace?' : 'New to IMS?'} <button type="button" onClick={toggleMode}>{registerMode ? 'Sign in' : 'Create a workspace'}</button></div>
          <div className="auth-assurance"><ShieldCheck size={16} /><span>Your inventory belongs to your workspace. Team data stays private.</span></div>
        </div>
        <div className="auth-form-bottom"><span>IMS STOCK CONTROL</span><span>SECURE WORKSPACE ACCESS</span></div>
      </section>
    </main>
  );
}
