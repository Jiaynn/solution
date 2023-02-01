import ImageStyleContent from 'kodo/components/BucketDetails/ImageStyle';
import React, { useEffect, useState } from 'react';
import styles from './style.m.less';
import SelectBucket from '../SelectBucket';
import { observer } from 'mobx-react';
import { useInjection } from 'qn-fe-core/di';
import { BucketStore } from 'kodo/stores/bucket';
import { Spin } from 'antd';
import ConfigurationStore from './ConfigurationStore';
import { Query, RouterStore } from 'portal-base/common/router';
import { basename } from 'constants/routes';
import { getFirstQuery } from 'kodo/utils/url';

interface IProps {
  query: Query
}

export default observer(function ConfigureImageStyle({
  query
}: IProps) {

  const { bucket, state } = query;
  const isFristVisit = getFirstQuery(state) === '1';
  const defaultBucketName = getFirstQuery(bucket) as string

  const [selectedBucketName, setSelectedBucketName] =
    useState(defaultBucketName);

  const [visible, setVisible] = useState(false);
  const bucketStore = useInjection(BucketStore);
  const configurationStore = ConfigurationStore;
  const routerStore = useInjection(RouterStore)

  configurationStore.setIsFristVisit(isFristVisit);

  useEffect(() => {
    bucketStore.fetchDetailsByName(defaultBucketName).then(() => {
      const bucketInfo = bucketStore.getDetailsByName(defaultBucketName);
      if (!bucketInfo) {
        console.error('没有空间');
        return;
      }
      setVisible(true);
    });
  }, []);

  const onChange = (value: string) => {
    routerStore.push(
      `${basename}/configuration/step/3?bucket=${value}&state=${state}&fixBucket`
    );
    setSelectedBucketName(value);
    bucketStore.fetchDetailsByName(value);
  };

  return (
    <div className={styles.wrapper}>
      <SelectBucket defaultBucketName={defaultBucketName} onChange={onChange} />
      {visible ? (
        <ImageStyleContent bucketName={selectedBucketName} />
      ) : (
        <Spin />
      )}
    </div>
  );
});
