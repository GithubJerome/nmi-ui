import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'umi';

const a403Page: React.FC<{}> = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you don't have access to this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

export default a403Page;
