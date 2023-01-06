import * as pdf from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js?url';

pdf.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * @desc 使用pdf.js加载pdf
 * @param contentDom
 * @param url
 */
export const loadPdf = async (
	contentDom: HTMLDivElement | null,
	url: string,
	loadingDom: HTMLDivElement | null
) => {
	const loadingTask = pdf.getDocument({
		url: url,
		disableRange: true
	});
	loadingTask.onProgress = () => {
		if (loadingDom) {
			loadingDom.style.display = 'block';
		}
	};
	loadingTask.promise.then((pdfDoc) => {
		if (loadingDom) {
			loadingDom.style.display = 'none';
		}

		const totalPages = pdfDoc.numPages;
		for (let i = 1; i <= totalPages; i++) {
			pdfDoc.getPage(i).then((page) => {
				const canvas = document.createElement('canvas');
				canvas.setAttribute('id', `the-canvas${i}`);
				const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
				const dpr = window.devicePixelRatio || 1;
				const scaledViewport = page.getViewport({ scale: 1 });

				canvas.height = Math.floor(scaledViewport.height * dpr);
				canvas.width = Math.floor(scaledViewport.width * dpr);
				canvas.style.width = document.body.clientWidth + 'px';
				canvas.style.height =
					document.body.clientWidth / (canvas.width / canvas.height) + 'px';

				const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

				const renderContext = {
					canvasContext: ctx,
					viewport: scaledViewport,
					transform: transform
				};
				page.render(renderContext);
				contentDom?.appendChild(canvas);
			});
		}
	});
};
