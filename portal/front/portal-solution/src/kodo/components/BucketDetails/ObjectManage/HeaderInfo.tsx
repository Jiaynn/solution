/**
 * @file component HeaderInfo 文件管理界面的头部信息
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import React from "react";
import { observer } from "mobx-react";
import { reaction, computed, makeObservable } from "mobx";
import autobind from "autobind-decorator";
import { Inject, InjectFunc } from "qn-fe-core/di";
import Disposable from "qn-fe-core/disposable";
import { Alert } from "react-icecream-2";
import PopupContainer from "react-icecream/lib/popup-container";
import { Select, Tooltip, Icon, Button } from "react-icecream/lib";

import { FeatureConfigStore } from "portal-base/user/feature-config";
import { ToasterStore } from "portal-base/common/toaster";
import { UserInfoStore } from "portal-base/user/account";
import { Link } from "portal-base/common/router";

import { humanizeStorageSize } from "kodo/transforms/unit";
import { isDomainAvailable, isDomainEnabled } from "kodo/transforms/domain";
import {
  getFormattedDateRangeValue,
  getMomentRangeBaseDuration,
} from "kodo/transforms/date-time";

import { DomainStore } from "kodo/stores/domain";
import { BucketStore, IStorageFetchOptions } from "kodo/stores/bucket";
import { ConfigStore } from "kodo/stores/config";

import { getDomainPath } from "kodo/routes/bucket";

import { DomainSourceType } from "kodo/constants/domain";
import { Granularity } from "kodo/constants/date-time";
import { storageTypeTextMap, StorageType } from "kodo/constants/statistics";

import HelpDocLink from "kodo/components/common/HelpDocLink";
import Store from "./store";

import styles from "./style.m.less";

export interface IProps {
  bucketName: string;
  store: Store;
}

interface DiDeps {
  inject: InjectFunc;
}

@observer
class InternalHeaderInfo extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props);

    makeObservable(this);

    const toaster = this.props.inject(ToasterStore);
    ToasterStore.bindTo(this, toaster);
  }

  disposable = new Disposable();
  domainStore = this.props.inject(DomainStore);
  configStore = this.props.inject(ConfigStore);
  bucketStore = this.props.inject(BucketStore);
  userInfoStore = this.props.inject(UserInfoStore);
  featureConfigStore = this.props.inject(FeatureConfigStore);

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName);
  }

  @computed
  get bucketStorageInfo() {
    return this.bucketStore.getStorageInfoByName(this.props.bucketName) || {};
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull();
  }

  @computed
  get regionConfig() {
    return (
      this.bucketInfo &&
      this.configStore.getRegion({
        region: this.bucketInfo.region,
      })
    );
  }

  @computed
  get options(): IStorageFetchOptions | undefined {
    if (!this.bucketInfo) {
      return;
    }

    const [begin, end] = getFormattedDateRangeValue(
      getMomentRangeBaseDuration()
    );
    return {
      region: this.bucketInfo.region,
      bucket: this.props.bucketName,
      g: Granularity.OneDay,
      begin,
      end,
    };
  }

  @ToasterStore.handle()
  fetchStandardStorageInfo() {
    if (!this.options) {
      return;
    }
    return this.bucketStore.fetchStandardStorageInfo(this.options);
  }

  @ToasterStore.handle()
  fetchLineStorageInfo() {
    if (!this.options) {
      return;
    }
    return this.bucketStore.fetchLineStorageInfo(this.options);
  }

  @ToasterStore.handle()
  fetchArchiveStorageInfo() {
    if (!this.options) {
      return;
    }
    return this.bucketStore.fetchArchiveStorageInfo(this.options);
  }

  @ToasterStore.handle()
  fetchDeepArchiveStorageInfo() {
    if (!this.options) {
      return;
    }
    return this.bucketStore.fetchDeepArchiveStorageInfo(this.options);
  }

  @autobind
  fetchStorageInfo() {
    if (!this.globalConfig) return;

    this.fetchStandardStorageInfo();

    if (this.globalConfig.objectStorage.storageType.lowFrequency.enable) {
      this.fetchLineStorageInfo();
    }

    if (this.globalConfig.objectStorage.storageType.archive.enable) {
      this.fetchArchiveStorageInfo();
    }

    if (this.globalConfig.objectStorage.storageType.deepArchive.enable) {
      this.fetchDeepArchiveStorageInfo();
    }
  }

  componentDidMount() {
    console.log("InternalHeaderInfo componentDidMount");
    this.disposable.addDisposer(
      reaction(
        () => Boolean(this.bucketInfo && this.regionConfig),
        (allow) => {
          if (allow) {
            this.fetchStorageInfo();
          }
        },
        { fireImmediately: true }
      )
    );
  }

  componentWillUnmount() {
    this.disposable.dispose();
  }

  renderDefaultDomainTooltip(domain: string) {
    return (
      <Tooltip title={domain}>
        <div className={styles.defaultDomain}>
          <div className={styles.name}>{domain}</div>
        </div>
      </Tooltip>
    );
  }

  @computed
  get isShared() {
    return this.bucketStore.isShared(this.props.bucketName);
  }

  @computed
  get CDNDomains() {
    // eslint-disable-line @typescript-eslint/naming-convention
    return this.domainStore.getCDNAvailableDomainListByBucketName(
      this.props.bucketName
    );
  }

  @computed
  get sourceDomains() {
    return this.domainStore.getSourceDomainListByBucketName(
      this.props.bucketName
    );
  }

  @computed
  get defaultDomain() {
    return this.domainStore.defaultDomainMap.get(this.props.bucketName);
  }

  @computed
  get isDefaultDomainAvailable() {
    return !!(this.defaultDomain && this.defaultDomain.isAvailable);
  }

  @computed
  get CDNOptGroupView() {
    // eslint-disable-line @typescript-eslint/naming-convention
    if (this.isShared) {
      return null;
    }

    if (!this.globalConfig.fusion.domain.enable) {
      return null;
    }

    if (this.featureConfigStore.isDisabled("KODO.KODO_DOMAIN_SETTING")) {
      return null;
    }

    // IAM用户，cdn 域名的权限是可以精确到具体域名，可能会出现拿到的默认域名是 cdn 域名但是 cdn 接口没有该域名或者接口直接被 403 的情况
    // 当遇到这种情况时，需要在 cdn 选项中插入该默认域名

    const isDefaultDomainCDNType =
      this.isDefaultDomainAvailable &&
      this.defaultDomain &&
      this.defaultDomain.domainType === DomainSourceType.CDN;

    const needInsertDefaultDomain =
      isDefaultDomainCDNType &&
      !this.CDNDomains.find((item) => item.name === this.defaultDomain!.domain);

    if (!this.CDNDomains.length && !needInsertDefaultDomain) {
      return null;
    }

    return (
      <Select.OptGroup label="CDN 域名">
        {this.CDNDomains.map((domain) => {
          const isDefaultDomain =
            this.defaultDomain && this.defaultDomain.domain === domain.name;

          return (
            <Select.Option
              key={domain.name}
              value={`${DomainSourceType.CDN}:${domain.name}`}
            >
              {isDefaultDomain && isDefaultDomainCDNType ? (
                this.renderDefaultDomainTooltip(domain.name)
              ) : (
                <Tooltip title={domain.name}>{domain.name}</Tooltip>
              )}
            </Select.Option>
          );
        })}
        {needInsertDefaultDomain && (
          <Select.Option
            value={`${this.defaultDomain!.domainType}:${
              this.defaultDomain!.domain
            }`}
          >
            {this.renderDefaultDomainTooltip(this.defaultDomain!.domain)}
          </Select.Option>
        )}
      </Select.OptGroup>
    );
  }

  @computed
  get sourceOptGroupView() {
    if (this.isShared) {
      return null;
    }

    if (!this.regionConfig || !this.regionConfig.objectStorage.domain.enable) {
      return null;
    }

    if (this.featureConfigStore.isDisabled("KODO.KODO_SOURCE_DOMAIN")) {
      return null;
    }

    const isDefaultDomainSourceType =
      this.isDefaultDomainAvailable &&
      this.defaultDomain!.domainType === DomainSourceType.Source;

    const needInsertDefaultDomain =
      isDefaultDomainSourceType &&
      !this.sourceDomains.find(
        (domainInfo) => domainInfo.domain === this.defaultDomain!.domain
      );

    if (!this.sourceDomains.length && !needInsertDefaultDomain) {
      return null;
    }

    return (
      <Select.OptGroup label="源站域名">
        {this.sourceDomains.map((domainInfo) => {
          const isDefaultDomain =
            this.defaultDomain &&
            this.defaultDomain.domain === domainInfo.domain;

          return (
            <Select.Option
              key={domainInfo.domain}
              value={`${DomainSourceType.Source}:${domainInfo.domain}`}
            >
              {isDefaultDomain && isDefaultDomainSourceType ? (
                this.renderDefaultDomainTooltip(domainInfo.domain)
              ) : (
                <Tooltip title={domainInfo.domain}>{domainInfo.domain}</Tooltip>
              )}
            </Select.Option>
          );
        })}
        {needInsertDefaultDomain && (
          <Select.Option
            value={`${this.defaultDomain!.domainType}:${
              this.defaultDomain!.domain
            }`}
          >
            {this.renderDefaultDomainTooltip(this.defaultDomain!.domain)}
          </Select.Option>
        )}
      </Select.OptGroup>
    );
  }

  @computed
  get sensitiveFileWarningView() {
    const { store } = this.props;
    if (!store.hasSensitive) {
      return null;
    }

    return (
      <div className={styles.sensitiveInfo}>
        <Alert
          closable
          type="warning"
          message="根据相关法律法规和政策，您的部分文件因存在敏感信息而无法显示"
        />
      </div>
    );
  }

  @computed
  get sharedView() {
    return (
      this.isShared &&
      this.defaultDomain &&
      this.defaultDomain.isAvailable && (
        <Select.Option
          value={`${this.defaultDomain.domainType}:${this.defaultDomain.domain}`}
        >
          {this.defaultDomain.domain}
        </Select.Option>
      )
    );
  }

  // 没有域名提示
  @computed
  get notExistDomainWarningView() {
    const { store, bucketName } = this.props;
    const isHasBaseUrl = !!store.baseUrl;

    if (
      this.isShared != null &&
      !this.isShared &&
      store.hasInitDomain &&
      !isHasBaseUrl &&
      this.bucketInfo &&
      isDomainAvailable(this.props.inject, this.bucketInfo.region)
    ) {
      return (
        <p>
          没有外链域名时，无法预览、下载、复制外链，
          <Link to={getDomainPath(this.props.inject, { bucketName })}>
            请绑定一个自定义域名
          </Link>
          。
        </p>
      );
    }

    return null;
  }

  // 存储统计信息
  @computed
  get storageStatisticsView() {
    const content = Object.keys(this.bucketStorageInfo)
      .sort()
      .map((type) => {
        const currentTypeStorageStatistics =
          this.bucketStorageInfo[type as unknown as StorageType];
        const { fileCount, storageSize } = currentTypeStorageStatistics || {
          fileCount: 0,
          storageSize: 0,
        };

        if (fileCount === 0 && storageSize === 0) {
          return null;
        }

        return (
          <span key={type} style={{ display: "inline-block" }}>
            <span className={styles.storageName}>
              {storageTypeTextMap[type]}：
            </span>
            <Icon type="folder" />
            <span className={styles.gapSpan}>
              共 {Number.isFinite(fileCount) ? fileCount : "--"} 个文件
            </span>
            <Icon type="database" className={styles.storageName} />
            <span className={styles.gapSpan}>
              共{" "}
              {Number.isFinite(storageSize)
                ? humanizeStorageSize(storageSize!)
                : "--"}{" "}
              存储量
            </span>
          </span>
        );
      })
      .filter((item) => item != null);

    if (content.length === 0) {
      return null;
    }

    return (
      <div className={styles.storageData}>
        <div className={styles.content}>{content}</div>
      </div>
    );
  }

  // 选择域名
  @computed
  get domainSelectView() {
    const { store } = this.props;
    if (
      !this.bucketInfo ||
      !isDomainEnabled(this.props.inject, this.bucketInfo.region)
    ) {
      return;
    }

    return (
      <div className={styles.defaultDomain}>
        <div>
          <label>外链域名：</label>
          <Select
            className={styles.domainSelect}
            value={
              store.selectedDomainInfo
                ? `${store.selectedDomainInfo.type}:${store.selectedDomainInfo.domain}`
                : undefined
            }
            disabled={!!this.isShared}
            onChange={(value: string) => {
              const [domainSourceType, domain] = value.split(":");
              store.updateSelectedDomainData({
                domain,
                type: +domainSourceType,
              });
            }}
          >
            {this.CDNOptGroupView}
            {this.sourceOptGroupView}
            {this.sharedView}
          </Select>
          {store.saveDefaultDomainFailed && (
            <Button
              type="link"
              className={styles.saveButton}
              onClick={store.saveSelectedDefaultDomain}
            >
              重试保存默认域名
            </Button>
          )}
        </div>
        <div>
          <HelpDocLink doc="resourceManage">
            <Icon type="file-text" /> 了解文件管理
          </HelpDocLink>
        </div>
      </div>
    );
  }

  render() {
    console.log("render render");
    return (
      <div className={styles.header}>
        <PopupContainer>
          {this.sensitiveFileWarningView}
          {this.storageStatisticsView}
          {this.notExistDomainWarningView}
          {this.domainSelectView}
        </PopupContainer>
      </div>
    );
  }
}

export default function HeaderInfo(props: IProps) {
  console.log("HeaderInfo render");
  return (
    <Inject
      render={({ inject }) => {
        console.log("HeaderInfo render");
        return <InternalHeaderInfo {...props} inject={inject} />;
      }}
    />
  );
}
