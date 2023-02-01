import React, { useState, useEffect } from 'react';
import { Modal } from 'react-icecream/lib';
import DomainCreateWithQuery from '../../cdn/components/Domain/Create';
import { Query, RouterStore } from 'portal-base/common/router';
import './index.less';
import Domain from 'kodo/components/BucketDetails/Domain';
import { DomainStore } from 'kodo/stores/domain';
import SelectBucket from 'components/Configuration/SelectBucket';
import { useInjection } from 'qn-fe-core/di';
import { basename } from 'constants/routes';

interface DomainNameProps {
	query: Query;
}

export default function DomainName(props: DomainNameProps) {
	const { query } = props;
	const domainStore = useInjection(DomainStore);
	const routerStore = useInjection(RouterStore);
	const bucketName = String(query.bucket);

	const [visible, setVisible] = useState(false);
	function handleVisible(visible: boolean) {
		setVisible(visible);
	}

	function handleCreate() {
		return domainStore.fetchCDNDomainListByBucketName(bucketName);
	}

	const onChange = (value: string) => {
		routerStore.push(
			`${basename}/configuration/step/2?bucket=${value}&state=1&fixBucket`
		);
		domainStore.fetchCDNDomainListByBucketName(value);
	};
	useEffect(() => {
		if (query.state == '1') {
			setVisible(true);
		} else {
			setVisible(false);
		}
	}, []);

	return (
		<div>
			<Modal
				title="绑定CDN加速域名"
				visible={visible}
				width={800}
				onCancel={() => setVisible(false)}
				footer={null}
				destroyOnClose
			>
				<DomainCreateWithQuery
					query={query}
					visible={handleVisible}
					isCreateDomain={handleCreate}
				/>
			</Modal>
			<SelectBucket defaultBucketName={bucketName} onChange={onChange} />
			<Domain bucketName={bucketName} visible={handleVisible} />
		</div>
	);
}
