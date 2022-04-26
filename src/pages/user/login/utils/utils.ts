import { parse } from 'qs';

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function setAuthority(authority: string | string[]) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('nmi-authority', JSON.stringify(proAuthority));
  // hard code
  // reload Authorized component
  try {
    if ((window as any).reloadAuthorized) {
      (window as any).reloadAuthorized();
    }
  } catch (error) {
    // do not need do anything
  }

  return authority;
}

export function setUserData(userData: string | string[]) {
  localStorage.setItem('nmi-user', JSON.stringify(userData));

  return userData;
}


export function getUserData() {
  return localStorage.getItem('nmi-user');
}


export function setLocale(langData: string) {
  localStorage.setItem('umi_locale', langData);
  return langData;
}