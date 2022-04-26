import { GlobalOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { getLocale, setLocale } from 'umi';
import { ClickParam } from 'antd/es/menu';
import React from 'react';
import classNames from 'classnames';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import request from 'umi-request';
import { API_URL, getUserData } from '@/utils/utils';
import uk from '../../assets/en-uk.png';
import nl from '../../assets/nl-nl.png';
import uk16 from '../../assets/en-uk-16.png';
import nl16 from '../../assets/nl-nl-16.png';

interface SelectLangProps {
  className?: string;
}

const SelectLang: React.FC<SelectLangProps> = (props) => {
  const { className } = props;
  const selectedLang = getLocale();

  const changeLang = ({ key }: ClickParam): void => {
    const userData = getUserData();
    
    const lang = {
      "language": key
    }
    request
      .put(API_URL+`user/set-language`, {
        headers: {
          token: userData.token,
          userid: userData.id
        },
        data: lang
      })
      .then((response) => {
        console.log(response);
        setLocale(key);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const locales = ['en-US', 'nl-NL'];
  const languageLabels1 = {
    'en-US': 'English',
    'nl-NL': 'Nederlands / Dutch',
  };
  const languageLabels2 = {
    'en-US': 'English / Engels',
    'nl-NL': 'Nederlands',
  };
  const langMenu = (
    <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={changeLang}>
      {locales.map((locale) => (
        <Menu.Item key={locale}>
          {
            locale === 'en-US' &&
            <img alt="English" className={styles.logo} src={uk16} />
          }
          {
            locale === 'nl-NL' &&
            <img alt="Dutch" className={styles.logo} src={nl16} />
          }
          {' '}
          {
            selectedLang === 'en-US' &&
            languageLabels1[locale]
          }
          {
            selectedLang === 'nl-NL' &&
            languageLabels2[locale]
          }
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <HeaderDropdown overlay={langMenu} placement="bottomRight">
      <span className={classNames(styles.dropDown, className)}>
        {/* <GlobalOutlined title="Language" /> */}
        {
          selectedLang === 'en-US' &&
          <img alt="English" className={styles.logo} src={uk} />
        }
        {
          selectedLang === 'nl-NL' &&
          <img alt="Dutch" className={styles.logo} src={nl} />
        }
      </span>
    </HeaderDropdown>
  );
};

export default SelectLang;
