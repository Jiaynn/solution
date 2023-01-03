import { buildDemo, buildSDK, runShell } from './utils';

export const preRunTask = {
  // Cube
  'qnweb-cloud-class-demo': {
    title: '云课堂场景',
    async run() {
      await buildSDK('whiteboard');
      await buildSDK('qnweb-whiteboard');
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
      await buildSDK('qnweb-cube-ui');
    }
  },
  'qnweb-exam-system-demo': {
    title: '监考系统场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
      await buildSDK('qnweb-exam-sdk');
      await buildSDK('qnweb-cube-ui');
    }
  },
  'qnweb-interview-demo': {
    title: '面试场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
      await buildSDK('qnweb-cube-ui');
    }
  },
  'qnweb-overhaul-demo': {
    title: '检修场景',
    async run() {
      await buildSDK('whiteboard');
      await buildSDK('qnweb-whiteboard');
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
      await buildSDK('qnweb-cube-ui');
    }
  },
  'qnweb-video-together-demo': {
    title: '一起看视频场景',
    async run() {
      await buildSDK('qnweb-im');
      await buildSDK('qnweb-high-level-rtc');
      await buildSDK('qnweb-cube-ui');
    }
  },

  // Other
  'qnweb-im-demo': {
    title: 'im demo',
    async run() {
      await buildSDK('qnweb-im');
      await runShell('copy_im');
    }
  },
  'qnweb-rtc-ai-demo': {
    title: 'rtc ai demo',
    async run() {
      await buildSDK('qnweb-rtc-ai');
      await runShell('copy_rtc_ai');
    }
  },
  'qnweb-whiteboard-demo': {
    title: '白板 demo',
    async run() {
      await buildSDK('qnweb-whiteboard');
      await runShell('copy_whiteboard');
    }
  },
  'qnweb-scheme-h5-demo':{
    title:'牛魔方方案h5 demo',
    async run(){
      await buildSDK('qnweb-scheme-h5-demo')
    }
  }
};

export type TPackageName = keyof typeof preRunTask;
