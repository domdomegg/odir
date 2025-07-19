import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { UserManager, UserManagerSettings } from 'oidc-client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Section, { SectionTitle } from '../components/Section';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { AuthState, useAuthState, useRawReq } from '../helpers/networking';
import Alert from '../components/Alert';
import { LoginMethodsResponse } from '../helpers/generated-api-client';
import { ChevronList, ChevronListButton } from '../components/ChevronList';
import Spinner from '../components/Spinner';
import env from '../env/env';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>
          Directory Navigator: Login
        </title>
        <meta name="robots" content="noindex" />
      </Head>
      <Section className="md:py-12 md:max-w-3xl px-8 my-8 md:my-24 md:bg-primary-100 text-center">
        <Logo className="h-24 mb-8" />
        <SectionTitle className="mb-4 sm:mb-10 ">Join <span className="hidden sm:inline">your colleagues on</span> Directory Navigator</SectionTitle>
        <LoginForm />
      </Section>
    </>
  );
};

export default LoginPage;

export const GoogleLoginCallbackPage: React.FC = () => {
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

export const GovSsoLoginCallbackPage: React.FC = () => {
  const [error, setError] = useState<undefined | Error>();
  const req = useRawReq();
  const [, setAuthState] = useAuthState();
  const router = useRouter();

  useEffect(() => {
    try {
      new UserManager(govSsoUserManagerSettings).signinCallback().then(async (user) => {
        const missingScopes = govSsoRequiredScopes.filter((s) => !user.scopes.includes(s));
        if (missingScopes.length > 0) {
          throw new Error(`Missing scopes: ${JSON.stringify(missingScopes)}`);
        }

        const loginResponse = await req(
          'post /admin/login/gov-sso',
          { idToken: user.id_token },
        );

        setAuthState(loginResponse.data);
        router.push('/');
      });
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

export const EmailLoginCallbackPage: React.FC = () => {
  const [error, setError] = useState<undefined | Error>();
  const [, setAuthState] = useAuthState();
  const req = useRawReq();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get('token');
        if (!token) {
          setError(new Error('Missing token parameter.'));
          return;
        }
        const res = await req('post /admin/login/email', { token });
        setAuthState(res.data);
        router.push('/');
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
  | { state: 'method: gov-sso', email: string }
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

  if (loginFormState.state === 'method: gov-sso') {
    return <LoginViaGovSso loginFormState={loginFormState} setLoginFormState={setLoginFormState} />;
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
  const [defaultEmail, setDefaultEmail] = useState('');
  const { register, handleSubmit, watch } = useForm<LoginTriageFormValues>({
    shouldUseNativeValidation: true,
    defaultValues: {
      email: defaultEmail,
    }
  });
  const req = useRawReq();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(LS_EMAIL_KEY) ?? '';
      setDefaultEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      if (watch('email') === '') {
        localStorage.removeItem(LS_EMAIL_KEY);
      }
    }
  }, [watch('email')]);

  const onSubmit = async ({ email }: LoginTriageFormValues) => {
    try {
      setError(undefined);
      if (!email) {
        return;
      }
      const { data: { methods } } = await req('get /admin/login/methods/{email}', { email });
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_EMAIL_KEY, email);
      }
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

const govSsoRequiredScopes = [
  'email',
  'profile',
  'openid',
];

const govSsoUserManagerSettings: UserManagerSettings = {
  authority: 'https://sso.service.security.gov.uk',
  metadata: {
    issuer: 'https://sso.service.security.gov.uk',
    authorization_endpoint: 'https://sso.service.security.gov.uk/auth/oidc',
    id_token_signing_alg_values_supported: ['RS256'],
    jwks_uri: 'https://sso.service.security.gov.uk/.well-known/jwks.json'
  },
  client_id: 'd2a6766a-26a4-49f8-8cc1-c20e807473e0',
  redirect_uri: `${(typeof window !== 'undefined') ? window.location.origin : ''}/login-callback/gov-sso`,
  scope: govSsoRequiredScopes.join(' '),
  response_type: 'id_token',
  response_mode: 'query',
  signingKeys: [{
    alg: 'RSA256', e: 'AQAB', kid: 'mrk-5d4bc6f375d44b329a14473a5e5db520', kty: 'RSA', n: 'zZVN57t4TAVpVd1qiNJim32G4hW7eHwD_mptOd4TIgzPyTY9LNVwskdQkoajFUGmOTnmiC-3Cert1SBMH4dwiEgZAMRKo5ignLVIms2sLflBRskyfWIFBn2jXs8LW10zYmXuS45Vb4N0geD81WfJhT6GpQ562h0yA0rL0fQh-1kxWZtVX46WyyKxDPVpiY1Q-3Otv0mvIBa9Mj_tMRMkuXywpcriVPWo5nXKvjf3258wQLmRnLjm5X8DpBHq9VCH3aC3VTBN8f05oRXLbW5K26e5lsK91-Jk2zF5jxRJd-bTwvJLEe8PkcW8K7fIRQ1eNV-nw_GvL0VBm3zqe4CAyQ', use: 'sig'
  }],
};

const LoginViaGovSso: React.FC<{
  loginFormState: LoginFormState & { state: 'method: gov-sso' },
  setLoginFormState: (s: LoginFormState) => void
}> = ({ loginFormState }) => {
  useEffect(() => {
    new UserManager(govSsoUserManagerSettings).signinRedirect({ login_hint: loginFormState.email });
  });

  return <Spinner />;
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
  const router = useRouter();

  const attemptLogin = async () => {
    setError(undefined);
    setLoading('Signing you in...');
    try {
      const result = await login();
      setAuthState(result);
      router.push('/');
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
