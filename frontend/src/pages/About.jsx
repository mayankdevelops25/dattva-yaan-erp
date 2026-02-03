import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'Dattva Yaan'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <p>
            Website : <a href="https://dattvayaan.live">dattvayaan.live</a>{' '}
          </p>
          <p>
            GitHub :{' '}
            <a href="https://github.com/mayankdevelops25">
              https://github.com/mayankdevelops25
            </a>
          </p>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://mayankjain.me/`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
