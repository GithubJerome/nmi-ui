import React, { useState, useEffect } from 'react';
import { history, useIntl } from 'umi';
import { Radio } from 'antd';


const SectionNavigation: React.FC<{}> = () => {
    const [activeSection, setActiveSection] = useState<string>();
    const intl = useIntl();

    const changeGroupUserView = (e) => {
        const {value} = e.target;
        setActiveSection(value);
        history.replace(`/admin/${value}`);
    };

    useEffect(() => {
        const page = history.location.pathname.replace("/admin/", "");
        setActiveSection(page);
    }, []);
    
    return (
        <>
            <Radio.Group
                onChange={changeGroupUserView}
                options={[
                    { label: intl.formatMessage({
                        id: 'pages.manager.navigation.users',
                        defaultMessage: 'Users',
                      }), value: 'users' },
                    { label: intl.formatMessage({
                        id: 'pages.manager.navigation.groups',
                        defaultMessage: 'Groups',
                      }), value: 'groups' },
                    { label: intl.formatMessage({
                        id: 'pages.manager.navigation.courses',
                        defaultMessage: 'Courses',
                      }), value: 'courses' },
                ]}
                value={activeSection}
                optionType="button"
                buttonStyle="solid"
            />
        </>
    );
}

export default SectionNavigation;