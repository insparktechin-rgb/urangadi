import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function getPathFromLocation() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) return hash;
  const pathname = window.location.pathname;
  return pathname || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getPathFromLocation);

  useEffect(() => {
    const onLocationChange = () => {
      setPath(getPathFromLocation());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onLocationChange);
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('hashchange', onLocationChange);
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (window.location.hash || !window.history.pushState) {
      window.location.hash = to;
    } else {
      window.history.pushState({}, '', to);
      setPath(to);
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({
  to,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </a>
  );
}
