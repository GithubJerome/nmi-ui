import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { Route } from '@/models/connect';
import { sha256 } from "js-sha256";
import { isNil } from 'lodash';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
const { UMI_APP_API_URL, UMI_APP_UI_URL } = process.env;
export const isUrl = (path: string): boolean => reg.test(path);

export const API_URL = UMI_APP_API_URL;
export const UI_URL = UMI_APP_UI_URL;

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({ routes, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

export const encryptText = (text: string) => {
  return sha256(text + "1080PFULLHD20188");
};

export const convertCommaToDot = (value:any) => {
  if(value) {
    return value.toString().replace(",", ".");
  }

  return 0;
}

export const epochToJsDate = (ts: number) => {
  // dd.mm.yyyy
  // return (new Date(ts*1000)).toLocaleString();
  const d = new Date(ts * 1000);
  const dt =
    `${(`00${  d.getUTCDate()}`).slice(-2) 
    }-${ 
    (`00${  d.getUTCMonth() + 1}`).slice(-2) 
    }-${ 
    d.getUTCFullYear()}`;
  return dt;
};

export const epochToJsDatewithTime = (ts: number) => {
  // dd.mm.yyyy
  // return (new Date(ts*1000)).toLocaleString();
  const d = new Date(ts * 1000);
  /* 
  const intlDate = new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d).toString().replace(/(\/)/g, '-'); */

  const intlDateYear = new Intl.DateTimeFormat('default', { year: 'numeric' }).format(d);
  const intlDateMonth = new Intl.DateTimeFormat('default', { month: '2-digit' }).format(d);
  const intlDateDay = new Intl.DateTimeFormat('default', { day: '2-digit' }).format(d);

  const intlTime = new Intl.DateTimeFormat('default', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d).toString();

  /* const dateString = intlDate.map(({type, value}) => {
    switch (type) {
      case 'literal': return `<b>${value}</b>`;
      default : return value;
    }
  }).join(''); */

  /* const dt =
    `${(`00${  d.getUTCDate()}`).slice(-2) 
    }/${ 
    (`00${  d.getUTCMonth() + 1}`).slice(-2) 
    }/${ 
    d.getUTCFullYear()} ${(`0${d.getUTCHours()}`).slice(-2)}:${(`0${d.getUTCMinutes()}`).slice(-2)}`; */
  return `${intlDateDay}-${intlDateMonth}-${intlDateYear} ${intlTime}`;
};

export const textAbstract = (text: string, length: number) => {
  if (text == null) {
      return "";
  }
  if (text.length <= length) {
      return text;
  }
  let txt = text.substring(0, length);
  const last = txt.lastIndexOf(" ");
  txt = txt.substring(0, last);
  return txt + "...";
};


export const getUserData = () => {
  let userData = null;
  if (localStorage && localStorage.getItem('nmi-user')) {
    userData = JSON.parse(localStorage.getItem('nmi-user'));
  }

  if (isNil(userData)) {
    window.location.href = '/user/login';
  }
  return userData;
}

export const updateSidebarUserData = (sidebar: boolean) => {
  if(localStorage.getItem('nmi-user')) {
    let nmiUser = localStorage.getItem('nmi-user');
    nmiUser = nmiUser ? JSON.parse(nmiUser) : {};
    nmiUser.sidebar = sidebar;
    localStorage.setItem('nmi-user', JSON.stringify(nmiUser));
  }
}

export const getLocale = () => {
  let localeData = null;
  if (localStorage && localStorage.getItem('umi_locale')) {
    localeData = localStorage.getItem('umi_locale');
  }
  return localeData;
}

export function setLocale(langData: string) {
  localStorage.setItem('umi_locale', langData);
  return langData;
}
