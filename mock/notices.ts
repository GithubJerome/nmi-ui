import { Request, Response } from 'express';

const getNotices = (req: Request, res: Response) => {
  res.json([
    {
      id: '000000001',
      avatar: '',
      title: 'new tasks',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      datetime: '2017-08-09',
      type: 'notification',
    },
    {
      id: '000000002',
      avatar: '',
      title: 'reminders',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      datetime: '2017-08-08',
      type: 'notification',
    },
    {
      id: '000000003',
      avatar: '',
      title: 'new levels',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      datetime: '2017-08-07',
      // read: true,
      type: 'notification',
    },
    {
      id: '000000004',
      avatar: '',
      title: 'new levels',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      datetime: '2017-08-07',
      type: 'notification',
    },
    {
      id: '000000005',
      avatar: '',
      title: 'new tasks',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      datetime: '2017-08-07',
      type: 'notification',
    },
    // {
    //   id: '000000006',
    //   avatar: '',
    //   title: '曲丽丽 评论了你',
    //   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    //   datetime: '2017-08-07',
    //   type: 'message',
    //   clickClose: true,
    // },
    // {
    //   id: '000000007',
    //   avatar: '',
    //   title: '朱偏右 回复了你',
    //   description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
    //   datetime: '2017-08-07',
    //   type: 'message',
    //   clickClose: true,
    // },
    // {
    //   id: '000000008',
    //   avatar: '',
    //   title: '标题',
    //   description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
    //   datetime: '2017-08-07',
    //   type: 'message',
    //   clickClose: true,
    // },
  ]);
};

export default {
  'GET /api/notices': getNotices,
};
