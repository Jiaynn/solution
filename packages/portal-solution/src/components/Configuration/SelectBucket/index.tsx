import { BucketListStore } from 'kodo/stores/bucket/list';
import { observer } from 'mobx-react';
import { useInjection } from 'qn-fe-core/di';
import React, { useEffect, useState } from 'react';
import { Select, SelectOption as Option } from 'react-icecream-2';
import styles from './style.m.less';

interface IProps {
	defaultBucketName: string;
	onChange: (bucketName: string) => void;
}

export default observer(function SelectBucket({
	defaultBucketName,
	onChange
}: IProps) {
	const bucketListStore = useInjection(BucketListStore);
	const [bucketNames, setBucketNames] = useState<string[]>([]);

	useEffect(() => {
		bucketListStore.fetchList().then(() => {
			setBucketNames(bucketListStore.nameList.sort());
		});
	}, []);

	return (
		<div className={styles.wrapper}>
			<div className={styles.blueBar}></div>
			<div className={styles.title}>当前空间：</div>
			<Select
				className={styles.selector}
				searchable
				size="large"
				onChange={onChange}
				defaultValue={defaultBucketName}
			>
				{bucketNames.map((bucketName) => {
					return (
						<Option key={bucketName} value={bucketName}>
							{bucketName}
						</Option>
					);
				})}
			</Select>
		</div>
	);
});
