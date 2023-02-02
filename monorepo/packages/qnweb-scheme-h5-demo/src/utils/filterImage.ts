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
				? `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/${folder}_0${
						i + 1
				  }.png`
				: `https://demo-qnrtc-files.qnsdk.com/qnweb-scheme-h5-demo/static/${folder}/${folder}_${
						i + 1
				  }.png`;
		const url = new URL(judgeUrl, import.meta.url).href;
		image.setAttribute('src', url);
		image.setAttribute('style', 'width:100%');
		image.setAttribute('loading', 'lazy');
		contentDom?.appendChild(image);
	}
}
