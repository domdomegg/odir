import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { UserManager, UserManagerSettings } from 'oidc-client';
import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { navigate } from 'gatsby';
import Section, { SectionTitle } from '../components/Section';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { AuthState, useAuthState, useRawReq } from '../helpers/networking';
import Alert from '../components/Alert';
import { LoginMethodsResponse } from '../helpers/generated-api-client';
import { ChevronList, ChevronListButton } from '../components/ChevronList';
import Spinner from '../components/Spinner';
import env from '../env/env';

const LoginPage: React.FC<RouteComponentProps> = () => {
  return (
    <Section className="md:py-12 md:max-w-3xl px-8 my-8 md:my-24 md:bg-primary-100 text-center">
      <Logo className="h-24 mb-8" />
      <SectionTitle className="mb-4 sm:mb-10 ">Join <span className="hidden sm:inline">your colleagues on</span> Directory Navigator</SectionTitle>
      <LoginForm />
    </Section>
  );
};

export default LoginPage;

export const GoogleLoginCallbackPage: React.FC<RouteComponentProps> = () => {
  const [error, setError] = useState<undefined | Error>();

  useEffect(() => {
    try {
      new UserManager(googleUserManagerSettings).signinCallback();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  return (
    <Section className="mt-8 text-center">
      {error && <Alert variant="error">{error}</Alert>}
      {!error && <h1>Logging you in...</h1>}
    </Section>
  );
};

export const EmailLoginCallbackPage: React.FC<RouteComponentProps> = () => {
  const [error, setError] = useState<undefined | Error>();
  const [, setAuthState] = useAuthState();
  const req = useRawReq();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
          setError(new Error('Missing token parameter.'));
          return;
        }
        const res = await req('post /admin/login/email', { token });
        setAuthState(res.data);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    })();
  }, []);

  return (
    <Section className="mt-8 text-center">
      {error && <Alert variant="error">{error}</Alert>}
      {!error && <h1>Logging you in...</h1>}
    </Section>
  );
};

type LoginFormState =
  | { state: 'triage' }
  | { state: 'method selection', email: string, methods: LoginMethodsResponse['methods'] }
  | { state: 'method: email', email: string }
  | { state: 'method: google', email: string }
  | { state: 'method: microsoft', email: string }
  | { state: 'method: impersonation', email: string };

const LoginForm: React.FC = () => {
  const [loginFormState, setLoginFormState] = useState<LoginFormState>({ state: 'triage' });

  if (loginFormState.state === 'triage') {
    return <LoginTriageForm setLoginFormState={setLoginFormState} />;
  }

  if (loginFormState.state === 'method selection') {
    return <LoginMethodSelector loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
  }

  if (loginFormState.state === 'method: google') {
    return <LoginViaGoogle loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
  }

  if (loginFormState.state === 'method: email') {
    return <LoginViaEmail loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
  }

  if (loginFormState.state === 'method: impersonation') {
    return <LoginViaImpersonation loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
  }

  return <p>Login state not supported: {JSON.stringify(loginFormState)}</p>;
};

type LoginTriageFormValues = {
  email: string
};

const LS_EMAIL_KEY = 'odir_email';
const LoginTriageForm: React.FC<{ setLoginFormState: (s: LoginFormState) => void }> = ({ setLoginFormState }) => {
  const { register, handleSubmit, watch } = useForm<LoginTriageFormValues>({
    shouldUseNativeValidation: true,
    defaultValues: {
      email: localStorage.getItem(LS_EMAIL_KEY) ?? '',
    }
  });
  const req = useRawReq();
  const [error, setError] = useState<Error | undefined>();

  if (watch('email') === '') {
    localStorage.removeItem(LS_EMAIL_KEY);
  }

  const onSubmit = async ({ email }: LoginTriageFormValues) => {
    try {
      setError(undefined);
      if (!email) {
        return;
      }
      const { data: { methods } } = await req('get /admin/login/methods/{email}', { email });
      localStorage.setItem(LS_EMAIL_KEY, email);
      setLoginFormState({ state: 'method selection', methods, email });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <>
      {error && <Alert className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-y-2 justify-center items-center">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input type="email" placeholder="you@work-email.com" autoComplete="email" className="p-3 text-xl sm:text-2xl w-100 max-w-full" autoFocus required {...register('email')} />
        <Button className="shrink-0" size="large" onClick={handleSubmit(onSubmit)}>Sign in</Button>
      </form>
    </>
  );
};

const LoginMethodSelector: React.FC<{ loginFormState: LoginFormState & { state: 'method selection' }, setLoginFormState: (s: LoginFormState) => void }> = ({ loginFormState, setLoginFormState }) => {
  useEffect(() => {
    if (loginFormState.methods.length === 1) {
      setLoginFormState({ state: `method: ${loginFormState.methods[0]}`, email: loginFormState.email });
    }
  }, [loginFormState.methods]);

  return (
    <ChevronList>
      {loginFormState.methods.map((method) => (
        <ChevronListButton
          key={method}
          onClick={() => {
            setLoginFormState({ state: `method: ${method}`, email: loginFormState.email });
          }}
        >
          Sign in with {method.slice(0, 1).toUpperCase() + method.slice(1)}
        </ChevronListButton>
      ))}
    </ChevronList>
  );
};

const googleRequiredScopes = [
  'email',
  'profile',
  'openid',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const googleUserManagerSettings: UserManagerSettings = {
  authority: 'https://accounts.google.com',
  client_id: env.GOOGLE_LOGIN_CLIENT_ID,
  redirect_uri: `${(typeof window !== 'undefined') ? window.location.origin : ''}/login-callback/google`,
  scope: googleRequiredScopes.join(' '),
  response_type: 'id_token',
};

const LoginViaGoogle: React.FC<{
  loginFormState: LoginFormState & { state: 'method: google' },
  setLoginFormState: (s: LoginFormState) => void
}> = ({ loginFormState, setLoginFormState }) => {
  const req = useRawReq();

  const login = async () => {
    const user = await new UserManager(googleUserManagerSettings).signinPopup({ login_hint: loginFormState.email });

    const missingScopes = googleRequiredScopes.filter((s) => !user.scopes.includes(s));
    if (missingScopes.length > 0) {
      throw new Error(`Missing scopes: ${JSON.stringify(missingScopes)}`);
    }

    const loginResponse = await req(
      'post /admin/login/google',
      { idToken: user.id_token },
    );

    return loginResponse.data;
  };

  return <LoginAutomatically login={login} loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
};

const LoginViaImpersonation: React.FC<{
  loginFormState: LoginFormState & { state: 'method: impersonation' },
  setLoginFormState: (s: LoginFormState) => void
}> = ({ loginFormState, setLoginFormState }) => {
  const req = useRawReq();

  const login = async () => {
    const loginResponse = await req(
      'post /admin/login/impersonation',
      { email: loginFormState.email },
    );

    return loginResponse.data;
  };

  return <LoginAutomatically login={login} loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
};

const LoginAutomatically: React.FC<{
  login: () => Promise<AuthState>,
  loginFormState: LoginFormState,
  setLoginFormState: (s: LoginFormState) => void
}> = ({ login, setLoginFormState }) => {
  const [loading, setLoading] = useState<string | false>('Initializing...');
  const [error, setError] = useState<Error | undefined>();

  const [, setAuthState] = useAuthState();

  const attemptLogin = async () => {
    setError(undefined);
    setLoading('Signing you in...');
    try {
      const result = await login();
      setAuthState(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
    setLoading(false);
  };

  useEffect(() => {
    attemptLogin();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        {error && <Alert>{error}</Alert>}
        <Spinner />
        <p className="mt-2">{loading}</p>
      </div>
    );
  }

  return (
    <>
      <Alert className="mb-2">{error ?? 'Something went wrong signing you in'}</Alert>
      <Button onClick={attemptLogin}>Try again</Button>
      <Button variant="secondary" onClick={() => { setLoginFormState({ state: 'triage' }); }}>Cancel</Button>
    </>
  );
};

const LoginViaEmail: React.FC<{
  loginFormState: LoginFormState & { state: 'method: email' },
  setLoginFormState: (s: LoginFormState) => void
}> = ({ loginFormState, setLoginFormState }) => {
  const [loading, setLoading] = useState<string | false>('Initializing...');
  const [error, setError] = useState<Error | undefined>();
  const req = useRawReq();

  const attemptLogin = async () => {
    setError(undefined);
    setLoading('Requesting email login...');
    try {
      await req('post /admin/login/email/initiate', { email: loginFormState.email });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
    setLoading(false);
  };

  useEffect(() => {
    attemptLogin();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        {error && <Alert>{error}</Alert>}
        <Spinner />
        <p className="mt-2">{loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Alert className="mb-2">{error}</Alert>
        <Button onClick={attemptLogin}>Try again</Button>
        <Button variant="secondary" onClick={() => { setLoginFormState({ state: 'triage' }); }}>Cancel</Button>
      </>
    );
  }

  const fromEmailAddress = 'hi@directory.adamjones.me';
  const emailLink = loginFormState.email.endsWith('@gmail.com') ? { name: 'Gmail', href: `https://mail.google.com/mail/u/${loginFormState.email}/#search/from%3A${encodeURIComponent(fromEmailAddress)}` }
    : null;

  return (
    <>
      <p>Login request successful. Check your email to complete login.</p>
      {emailLink && <Button className="mt-4" href={emailLink.href}>Open {emailLink.name}</Button>}
    </>
  );
};
