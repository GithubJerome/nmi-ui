import component from './nl-NL/component';
import globalHeader from './nl-NL/globalHeader';
import menu from './nl-NL/menu';
import pages from './nl-NL/pages';
import help from './nl-NL/help';
import notifs from './nl-NL/notifs';

export default {
  'navBar.lang': 'Talen',
  'layout.user.link.help': 'Helpen',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Voorwaarden',
  ...globalHeader,
  ...menu,
  ...component,
  ...pages,
  ...help,
  ...notifs
};
