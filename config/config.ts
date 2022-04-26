// https://umijs.org/config/
import { defineConfig, utils } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import webpackPlugin from './plugin.config';
const { winPath } = utils; // preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。

const { REACT_APP_ENV, GA_KEY } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  analytics: GA_KEY
    ? {
        ga: GA_KEY,
      }
    : false,
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/',
      component: '../layouts/BlankLayout',
      routes: [
        {
          path: '/user',
          component: '../layouts/UserLayout',
          routes: [
            {
              path: '/user',
              redirect: '/user/login',
            },
            {
              name: 'login',
              // icon: 'smile',
              path: '/user/login',
              component: './user/login',
            },
            {
              name: 'forgot-password',
              path: '/user/forgot-password',
              component: './user/forgot-password',
            },
            {
              name: 'change-password',
              path: '/user/change-password',
              component: './user/change-password',
            },
            {
              name: 'force-change-password',
              path: '/user/force-change-password',
              component: './user/force-change-password',
            },
            {
              component: './exception/403',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/BasicLayout',
          Routes: ['src/pages/Authorized'],
          routes: [
            {
              authority: ['student'],
              path: '/',
              component: './dashboard2',
            },
            {
              authority: ['student'],
              path: '/dashboard',
              name: 'DASHBOARD',
              // icon: 'dashboard',
              component: './dashboard2',
            },
            {
              authority: ['student'],
              path: '/progress',
              name: 'PROGRESS',
              component: './progress',
            },
            {
              authority: ['student'],
              path: '/skills',
              name: 'SKILLS',
              component: './skills',
            },
            {
              authority: ['student'],
              path: '/progress-course',
              component: './progress-course',
            },
            {
              authority: ['student'],
              path: '/course',
              component: './course-page',
            },
            {
              authority: ['student'],
              path: '/section',
              component: './section-page',
            },
            {
              authority: ['student'],
              path: '/subsection',
              component: './subsection-page',
            },
            {
              authority: ['student'],
              path: '/exercise',
              component: './exercise-page',
            },
            {
              authority: ['student'],
              path: '/exercise-overview',
              component: './exercise-overview-page',
            },
            {
              authority: ['student'],
              path: '/exercise-instructions',
              component: './exercise-instructions',
            },


            {
              authority: ['manager'],
              path: '/admin/users',
              name: 'USERS',
              component: './admin/users',
            },
            {
              authority: ['manager'],
              path: '/admin/groups',
              name: 'GROUPS',
              component: './admin/groups',
            },
            {
              authority: ['manager'],
              path: '/admin/courses',
              name: 'COURSES',
              component: './admin/courses',
            },
            {
              authority: ['manager'],
              path: '/admin/course',
              component: './admin/course',
            },
            {
              authority: ['manager'],
              path: '/admin/section',
              component: './admin/section',
            },
            {
              authority: ['manager'],
              path: '/admin/subsection',
              component: './admin/subsection',
            },
            {
              authority: ['manager'],
              path: '/admin/exercise',
              component: './admin/exercise',
            },
            {
              authority: ['manager'],
              path: '/admin/exercise-test',
              component: './admin/exercise-test',
            },
            {
              authority: ['manager'],
              path: '/admin/questions',
              name: 'QUESTIONS',
              component: './admin/questions',
            },
            {
              authority: ['manager'],
              path: '/admin/videos',
              name: 'VIDEOS',
              component: './admin/videos',
            },
            {
              authority: ['manager'],
              path: '/admin/skills',
              name: 'SKILLS',
              component: './admin/skills',
            },


            {
              authority: ['tutor'],
              path: '/tutor-dashboard',
              name: 'DASHBOARD',
              component: './tutor/dashboard',
            },
            {
              authority: ['tutor'],
              path: '/tutor-groups',
              name: 'GROUPS',
              component: './tutor/groups',
            },
            {
              authority: ['tutor'],
              path: '/student-progress',
              component: './tutor/student-progress',
            },
            {
              authority: ['tutor'],
              path: '/student-progress-course',
              component: './tutor/student-progress-course',
            },
            {
              authority: ['tutor'],
              path: '/student-exercise-tries',
              component: './tutor/student-exercise-tries',
            },
           
            {
              authority: ['manager', 'admin', 'student', 'super admin', 'tutor', 'parent'],
              path: '/account',
              routes: [
                {
                  name: 'settings',
                  // icon: 'smile',
                  path: '/account/settings',
                  component: './account/settings',
                },
              ],
            },
            {
              component: './exception/403'
            }
          ]
        }
      ]
    }
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  define: {
    REACT_APP_ENV: REACT_APP_ENV || false
  },
  ignoreMomentLocale: true,
  lessLoader: {
    javascriptEnabled: true,
  },
  cssLoader: {
    modules: {
      getLocalIdent: (
        context: {
          resourcePath: string;
        },
        _: string,
        localName: string,
      ) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }

        const match = context.resourcePath.match(/src(.*)/);

        if (match && match[1]) {
          const antdProPath = match[1].replace('.less', '');
          const arr = winPath(antdProPath)
            .split('/')
            .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
            .map((a: string) => a.toLowerCase());
          return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
        }

        return localName;
      },
    },
  },
  manifest: {
    basePath: '/',
  },
  proxy: proxy[REACT_APP_ENV || 'dev'],
  chainWebpack: webpackPlugin,
});
