// src/global.d.ts
export {};

declare global {
	interface Window {
		router: any; //全局变量名

		webkit?: any;
	}
}
