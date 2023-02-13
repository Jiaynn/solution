import { runBuild, runShell } from './utils';

export const preRunTask = {
	// Cube
	'qnweb-cloud-class-demo': {
		title: '云课堂场景',
		async run() {
			await runBuild('qnweb-whiteboard');
			await runBuild('qnweb-im');
			await runBuild('qnweb-high-level-rtc');
			await runBuild('qnweb-cube-ui');
		}
	},
	'qnweb-exam-system-demo': {
		title: '监考系统场景',
		async run() {
			await runBuild('qnweb-im');
			await runBuild('qnweb-high-level-rtc');
			await runBuild('qnweb-exam-sdk');
			await runBuild('qnweb-cube-ui');
		}
	},
	'qnweb-interview-demo': {
		title: '面试场景',
		async run() {
			await runBuild('qnweb-im');
			await runBuild('qnweb-high-level-rtc');
			await runBuild('qnweb-cube-ui');
		}
	},
	'qnweb-overhaul-demo': {
		title: '检修场景',
		async run() {
			await runBuild('qnweb-whiteboard');
			await runBuild('qnweb-im');
			await runBuild('qnweb-high-level-rtc');
			await runBuild('qnweb-cube-ui');
		}
	},
	'qnweb-video-together-demo': {
		title: '一起看视频场景',
		async run() {
			await runBuild('qnweb-im');
			await runBuild('qnweb-high-level-rtc');
			await runBuild('qnweb-cube-ui');
		}
	},

	// Other
	'qnweb-im-demo': {
		title: 'im demo',
		async run() {
			await runBuild('qnweb-im');
			await runShell('copy_im');
		}
	},
	'qnweb-rtc-ai-demo': {
		title: 'rtc ai demo',
		async run() {
			await runBuild('qnweb-rtc-ai');
			await runShell('copy_rtc_ai');
		}
	},
	'qnweb-whiteboard-demo': {
		title: '白板 demo',
		async run() {
			await runBuild('qnweb-whiteboard');
			await runShell('copy_whiteboard');
		}
	}
};

export type TPackageName = keyof typeof preRunTask;
