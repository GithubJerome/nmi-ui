import React from 'react';
import { Redirect, connect, ConnectProps } from 'umi';
import Authorized from '@/utils/Authorized';
import { getRouteAuthority } from '@/utils/utils';
import { ConnectState, UserModelState } from '@/models/connect';
import { getUserData } from '@/utils/utils';

interface AuthComponentProps extends ConnectProps {
  user: UserModelState;
}

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  route = {
    routes: [],
  },
  location = {
    pathname: '',
  },
  user,
}) => {
  const { currentUser } = getUserData();
  const { routes = [] } = route;
  const isLogin = currentUser && (currentUser.username || currentUser.email);
  console.log("isLogin ", isLogin);
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403" /> : <Redirect to="/user/login" />}
    >
      {children}
    </Authorized>
  );
};

export default connect(({ user }: ConnectState) => ({
  user,
}))(AuthComponent);
