import ImageStyleContent from 'kodo/components/BucketDetails/ImageStyle';
import React, { useEffect, useState } from 'react';
import styles from './style.m.less';
import SelectBucket from '../SelectBucket';
import { observer } from 'mobx-react';
import { useInjection } from 'qn-fe-core/di';
import { BucketStore } from 'kodo/stores/bucket';
import { Spin } from 'antd';
import ConfigurationStore from './ConfigurationStore';

interface IProps {
  isFristVisit: boolean;
  defaultBucketName: string;
}

export default observer(function ConfigureImageStyle({
  isFristVisit,
  defaultBucketName
}: IProps) {
  const [selectedBucketName, setSelectedBucketName] =
    useState(defaultBucketName);
  const [visible, setVisible] = useState(false);
  const bucketStore = useInjection(BucketStore);
  const configurationStore = ConfigurationStore;
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
