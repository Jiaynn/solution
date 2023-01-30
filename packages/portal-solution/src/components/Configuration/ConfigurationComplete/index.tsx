import React from 'react';
import { Button } from 'react-icecream-2';
import { CheckCircleFilledIcon } from 'react-icecream-2/icons';
import styles from './style.m.less';
import { observer } from 'mobx-react';

interface IProps {
	buyResourcesURI: string;
}

export default observer(function ConfigurationComplete({ buyResourcesURI }: IProps) {

	return (
		<div className={styles.wrapper}>

			<div className={styles.checkIcon}>
				<CheckCircleFilledIcon color="#42c532" fontSize="60px" />
			</div>
			<div className={styles.text}>
				您已经完成了图片加速处理方案的基本配置，可以尝试上传文件并进行服务提供了。
			</div>
			<div className={styles.text}>
				除此之外，您还需要购买存储和加速的资源包以保障能够持续使用方案服务
			</div>
			<a href={buyResourcesURI}>
				<Button type="primary" className={styles.btnBuyResources}>
					购买资源包
				</Button>
			</a>
		</div>
	);
})
