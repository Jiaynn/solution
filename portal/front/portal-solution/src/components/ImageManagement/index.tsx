import SelectBucket from "components/Configuration/SelectBucket";
import React, { useEffect, useState } from "react";
import { BucketStore } from "kodo/stores/bucket";
import { BucketListStore } from "kodo/stores/bucket/list";
import { useInjection } from "qn-fe-core/di";
import { ObjectManage } from "kodo/components/BucketDetails/ObjectManage";

export default function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState("");
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

  return (
    <div>
      {selectedBucketName !== "" ? (
        <>
          <SelectBucket
            defaultBucketName={selectedBucketName}
            onChange={onChange}
          />

          <ObjectManage
            bucketName={selectedBucketName}
            isUploadModalOpen={false}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
