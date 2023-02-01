import SelectBucket from 'components/Configuration/SelectBucket';
import ResourceManage from 'kodo/components/BucketDetails/ResourceManage';
import React, { useEffect, useState } from 'react';
import { BucketStore } from 'kodo/stores/bucket';
import { BucketListStore } from 'kodo/stores/bucket/list';
import { useInjection } from 'qn-fe-core/di';
import BucketDetails from 'kodo/components/BucketDetails';
// import { DomainStore } from 'kodo/stores/domain';
export default function ImageManagement() {
	const [selectedBucketName, setSelectedBucketName] = useState('');
	const bucketListStore = useInjection(BucketListStore);
	const bucketStore = useInjection(BucketStore);
  // const domainStore = useInjection(DomainStore);
	const onChange = (value: string) => {
		setSelectedBucketName(value);
		bucketStore.fetchDetailsByName(value);
    // domainStore.fetchCDNDomainListByBucketName(value);
	};

	useEffect(() => {
		bucketListStore.fetchList().then(() => {
			const { nameList } = bucketListStore;
			setSelectedBucketName(nameList.sort()[0]);
		});
	}, []);
console.log('d当前的props',selectedBucketName);

	return (
		<div>
			{selectedBucketName !== '' ? (
				<>
					<SelectBucket
						defaultBucketName={selectedBucketName}
						onChange={onChange}
					/>
         
          {/* <BucketDetails bucketName={selectedBucketName}></BucketDetails> */}
					<ResourceManage bucketName={selectedBucketName} />
				</>
			) : (
				<></>
			)}
		</div>
	);
}
