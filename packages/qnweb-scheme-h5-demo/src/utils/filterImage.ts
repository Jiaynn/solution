/**
 * @desc 筛选图片并展示
 * @param content
 * @param folder
 * @param contentDom
 */
export function renderImageUrl(
	content: string,
	folder: string,
	contentDom: HTMLDivElement | null
) {
	for (let i = 0; i < parseInt(content); i++) {
		const image = document.createElement('img');
		const judgeUrl =
			i < 9
				? `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/Qiniu-Event-Cloud-Annual-Meeting-Solution_page-000${
						i + 1
				  }.jpg`
				: `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/Qiniu-Event-Cloud-Annual-Meeting-Solution_page-00${
						i + 1
				  }.jpg`;
		const url = new URL(judgeUrl, import.meta.url).href;
		image.setAttribute('src', url);
		image.setAttribute('style', 'width:100%');
		image.setAttribute('loading', 'lazy');
		contentDom?.appendChild(image);
	}
}
