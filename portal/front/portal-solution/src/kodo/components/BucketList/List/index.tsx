/**
 * @file bucket list component
 * @description bucket 列表
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from "react";
import classNames from "classnames";
import Disposable from "qn-fe-core/disposable";
import {
  action,
  computed,
  observable,
  reaction,
  when,
  makeObservable,
} from "mobx";
import { observer, Observer } from "mobx-react";
import autobind from "autobind-decorator";
import { InjectFunc, Inject } from "qn-fe-core/di";
import { Icon, Table, Tooltip } from "react-icecream/lib";
import Role from "portal-base/common/components/Role";
import { Link, RouterStore } from "portal-base/common/router";
import { ToasterStore as Toaster } from "portal-base/common/toaster";
import { FeatureConfigStore } from "portal-base/user/feature-config";

import { PaginationProps } from "react-icecream/lib/pagination";

import { keysOf, valuesOfEnum } from "kodo/utils/ts";

import { ColumnSortOrder, Filters, OnChange } from "kodo/types/icecream/table";

import { ArrayCompareFn } from "kodo/types/ts";

import { humanizeTimestamp } from "kodo/transforms/date-time";

import { isShared } from "kodo/transforms/bucket/setting/authorization";

import { BucketListStore } from "kodo/stores/bucket/list";
import { ConfigStore } from "kodo/stores/config";
import { KodoIamStore } from "kodo/stores/iam";

import {
  getOverviewPath,
  getResourceV2Path,
  SearchType,
} from "kodo/routes/bucket";

import { BucketRole } from "kodo/constants/role";
import {
  regionAll,
  RegionSymbol,
  RegionSymbolWithAll,
} from "kodo/constants/region";
import {
  privateNameMap,
  PrivateType,
} from "kodo/constants/bucket/setting/access";
import { shareNameMapForConsumer } from "kodo/constants/bucket/setting/authorization";

import { IBucketListItem } from "kodo/apis/bucket/list";

import BucketTags from "../BucketTags";
import styles from "./style.m.less";

export interface IProps {
  region: RegionSymbolWithAll; // 地区
  loading: boolean;
  searchTag?: string; // 标签搜索
  searchName?: string; // 搜索条件
  searchType?: SearchType; // 标签类型
}

interface DiDeps {
  inject: InjectFunc;
}

class BucketTable extends Table<IBucketListItem> {}

class BucketTableColumn extends Table.Column<IBucketListItem> {}

function stringFieldSorter(a: string, b: string) {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

function numberFieldSorter(a: number, b: number) {
  return a - b;
}

@observer
class InternalBucketList extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props);

    makeObservable(this);

    const toaster = this.props.inject(Toaster);
    Toaster.bindTo(this, toaster);
  }

  iamStore = this.props.inject(KodoIamStore);
  routerStore = this.props.inject(RouterStore);
  configStore = this.props.inject(ConfigStore);
  bucketListStore = this.props.inject(BucketListStore);
  featureStore = this.props.inject(FeatureConfigStore);

  disposable = new Disposable();
  @observable currentPage = 1;
  @observable sortKey = "ctime";
  @observable sortOrder: ColumnSortOrder<IBucketListItem> = "descend";
  @observable.ref filteredValues: Partial<Filters<IBucketListItem>> = {};

  componentDidMount() {
    this.fetchBucketList();

    // 处理搜索条件变化
    this.disposable.addDisposer(
      reaction(
        () => this.props.searchName,
        () => {
          // 如果搜索空间确实存在、则 fetch 更新一下信息
          if (
            this.props.searchName &&
            this.bucketListStore.nameList.includes(this.props.searchName)
          ) {
            this.bucketListStore.fetchByName(this.props.searchName);
          }
        }
      )
    );

    // 标签搜索
    this.disposable.addDisposer(
      reaction(
        () => this.props.searchTag,
        () =>
          this.props.searchTag &&
          this.bucketListStore.fetchNameListByTag(this.props.searchTag),
        { fireImmediately: true }
      )
    );
  }

  componentWillUnmount() {
    this.disposable.dispose();
  }

  @computed
  get tableData(): IBucketListItem[] {
    const { searchType, searchTag, searchName, region } = this.props;
    const currentRegionBucketList = !this.isAllTabActive
      ? this.bucketListStore.getListByRegion(region as RegionSymbol) || []
      : this.bucketListStore.list || [];

    if (searchType === "name" && searchName) {
      return currentRegionBucketList.filter((bucket) =>
        bucket.tbl.includes(searchName)
      );
    }
    if (searchType === "tag" && searchTag) {
      const matchTagBucketNames =
        this.bucketListStore.getNameListByTagKey(searchTag);
      if (matchTagBucketNames && matchTagBucketNames.size) {
        return currentRegionBucketList.filter((bucket) =>
          matchTagBucketNames.has(bucket.tbl)
        );
      }
      return []; // 没有匹配就返回空
    }

    return currentRegionBucketList;
  }

  @computed
  get isAllTabActive(): boolean {
    return this.props.region === regionAll.symbol;
  }

  @computed
  get paginationOptions(): PaginationProps {
    return {
      defaultPageSize: 30,
      current: this.currentPage,
      onChange: this.handlePaginationChange,
    };
  }

  // TODO：FiltersOptions 类型下次加到 icecream @huangibnjie
  @computed
  get shareFiltersOptions() {
    return {
      filteredValue: this.filteredValues.perm,
      onFilter: (value: string, record: IBucketListItem): boolean =>
        record.perm.toString() === value,
      filterIcon: (filtered) => (
        // 经过充分测试及源码阅读，And 此处仅接受可包含内容的元素返回，如 div/span 或 <Icon>；<Role> 无法工作，故需要包装
        <span className={styles.filterIcon}>
          <Role name={BucketRole.BucketListTypeFilterCtrl}>
            <Icon
              type="filter"
              theme="filled"
              className={classNames(
                styles.icon,
                filtered && "ant-table-filter-selected"
              )}
            />
          </Role>
        </span>
      ),
      filters: keysOf(shareNameMapForConsumer).map((perm) => ({
        value: String(perm),
        text: shareNameMapForConsumer[perm],
      })),
    };
  }

  @computed
  get privateFiltersOptions() {
    return {
      filteredValue: this.filteredValues.private,
      onFilter(value: string, record: IBucketListItem): boolean {
        return String(record.private) === value;
      },
      filters: valuesOfEnum(PrivateType).map((value) => ({
        text: privateNameMap[value],
        value: value.toString(),
      })),
    };
  }

  @computed
  get isOverviewVisible(): boolean {
    return !this.iamStore.isIamUser;
  }

  @autobind
  isSharedBucket(bucketName: string): boolean {
    return isShared(this.bucketListStore.getByName(bucketName)!.perm);
  }

  @autobind
  isResourceManageAvailable() {
    const config = this.configStore.getFull();
    return (
      (config.objectStorage.resourceManage &&
        config.objectStorage.resourceManage.enable) ||
      false
    );
  }

  @autobind
  resourceManagerPath(bucketName: string) {
    return getResourceV2Path(this.props.inject, { bucketName });
  }

  @autobind
  getBucketNameLink(bucket: IBucketListItem) {
    return !this.isOverviewVisible || this.isSharedBucket(bucket.tbl)
      ? this.resourceManagerPath(bucket.tbl)
      : getOverviewPath(this.props.inject, { bucketName: bucket.tbl });
  }

  @Toaster.handle()
  fetchBucketList() {
    return this.bucketListStore.fetchList();
  }

  // TODO：SortOptions 下次加到 icecream @huangbinjie
  @autobind
  getTableSortOptions<T>(key: keyof T, sorter: ArrayCompareFn<T[keyof T]>) {
    return {
      sortOrder: this.sortKey === key ? this.sortOrder : false,
      sorter: (a, b) => sorter(a[key], b[key]),
    };
  }

  @action.bound
  handlePaginationChange(current: number) {
    this.currentPage = current;
  }

  @action.bound
  handleTableChange: OnChange<IBucketListItem> = (_, filters, sorter) => {
    this.sortKey = sorter.columnKey;
    this.sortOrder = sorter.order;
    this.filteredValues = filters;
  };

  @Toaster.handle()
  async handleIamUserRouterJump(bucketName: string) {
    const params = {
      actionName: "Statistics",
      resource: bucketName,
    } as const;

    this.iamStore.fetchIamActionsByResource(bucketName);
    // 因为需要根据权限决定路由，所以这里需要等到请求结束
    // 调用 fetchIamActionsByResource 后 isLoadingEffects 变为 true，当为 false 时代表请求结束
    // https://mobx.js.org/reactions.html#when
    const promise = when(() => !this.iamStore.isLoadingEffects);
    this.disposable.addDisposer(promise.cancel);
    await promise;

    const path =
      this.iamStore.isActionDeny(params) || this.isSharedBucket(bucketName)
        ? this.resourceManagerPath(bucketName)
        : getOverviewPath(this.props.inject, { bucketName });

    this.routerStore.push(path);
  }

  renderBucketName(data: IBucketListItem): React.ReactElement {
    // iam 用户需要调用接口看 action 权限才能确定进入页面，所以这里把是否是 iam 用户分开判断
    const buttonView = (
      <Link
        to={!this.iamStore.isIamUser ? this.getBucketNameLink(data) : ""}
        {...(this.iamStore.isIamUser && {
          onClick: (e) => {
            e.preventDefault();
            this.handleIamUserRouterJump(data.tbl);
          },
        })}
        target="_blank"
        rel="noopener noreferrer"
      >
        {data.tbl}
      </Link>
    );

    return isShared(data.perm) &&
      !this.featureStore.isDisabled("KODO.KODO_BUCKET_SHARE") ? (
      <Tooltip placement="bottomLeft" title={`所属：${data.oemail}`}>
        {buttonView}
      </Tooltip>
    ) : (
      buttonView
    );
  }

  // 空间设置
  renderSetting(data: IBucketListItem): React.ReactElement {
    const bucketName = data.tbl;

    const sharedButtonsView = (
      <Link
        className={styles.operationButton}
        to={this.resourceManagerPath(bucketName)}
      >
        文件
      </Link>
    );

    const defaultButtonsView = (
      <>
        {this.isOverviewVisible && (
          <Link
            className={styles.operationButton}
            to={getOverviewPath(this.props.inject, { bucketName })}
            target="_blank"
            rel="noopener noreferrer"
          >
            概览
          </Link>
        )}
        {/* <Link */}
        {/*  className={styles.operationButton} */}
        {/*  to={this.resourceManagerPath(bucketName)} */}
        {/* > */}
        {/*  文件 */}
        {/* </Link> */}
        {/* <Auth notIamUser featureKeys={['KODO.KODO_BUCKET_SETTING']}> */}
        {/*  <Link */}
        {/*    className={styles.operationButton} */}
        {/*    to={getSettingPath(this.props.inject, { bucketName })} */}
        {/*  > */}
        {/*    设置 */}
        {/*  </Link> */}
        {/* </Auth> */}
        {/* {isDomainAvailable(this.props.inject, data.region) && ( */}
        {/*  <Link */}
        {/*    className={styles.operationButton} */}
        {/*    to={getDomainPath(this.props.inject, { bucketName })} */}
        {/*  > */}
        {/*    域名 */}
        {/*  </Link> */}
        {/* )} */}
      </>
    );

    return (
      <span className={styles.icons}>
        {isShared(data.perm) ? sharedButtonsView : defaultButtonsView}
      </span>
    );
  }

  @computed
  get bucketTableView() {
    return (
      <BucketTable
        rowKey="tbl"
        dataSource={this.tableData}
        loading={this.props.loading}
        onChange={this.handleTableChange}
        pagination={this.paginationOptions}
      >
        <BucketTableColumn
          key="tbl"
          title="空间名称"
          dataIndex="tbl"
          className={styles.bucketName}
          render={(_, data) => (
            <Observer render={() => this.renderBucketName(data)} />
          )}
          {...this.getTableSortOptions<IBucketListItem>(
            "tbl",
            stringFieldSorter
          )}
        />
        {!this.iamStore.isIamUser && (
          <BucketTableColumn
            key="tag"
            title="空间标签"
            width="120px"
            align="center"
            render={(_, { tbl, perm }) => (
              <BucketTags bucketName={tbl} shareType={perm} />
            )}
          />
        )}
        <BucketTableColumn
          key="perm"
          title="空间类型"
          width="120px"
          {...this.shareFiltersOptions}
          render={(_, { perm }) => shareNameMapForConsumer[perm]}
        />
        {
          // 只在 `全部` 标签页底下显示 存储区域
          this.isAllTabActive && (
            <BucketTableColumn
              key="region"
              title="存储区域"
              width="160px"
              align="center"
              render={(_, { region }) => (
                <Observer
                  render={() => {
                    const regionConfig = this.configStore.getRegion({ region });
                    return <>{regionConfig.name}</>;
                  }}
                />
              )}
            />
          )
        }
        {/* <BucketTableColumn
         width="10%"
         title="存储量"
         key="storage"
         // align="right"
         dataIndex="storage_size"
         render={(_, { storage_size }) => humanizeStorageSize(storage_size)}
         {...this.getTableSortOptions<IBucketListItem>('storage_size', this.numberFieldSorter)}
         />
         <BucketTableColumn
         key="files"
         width="10%"
         // align="right"
         title="对象数量"
         dataIndex="file_num"
         render={(_, { file_num }) => humanizeBigNumber(file_num)}
         {...this.getTableSortOptions<IBucketListItem>('file_num', this.numberFieldSorter)}
         /> */}
        <BucketTableColumn
          key="private"
          title="访问控制"
          width="120px"
          {...this.privateFiltersOptions}
          render={(_, { private: isPrivate }) => privateNameMap[isPrivate]}
        />
        <BucketTableColumn
          key="ctime"
          title="创建时间"
          width="200px"
          align="center"
          render={(_, { ctime }) => humanizeTimestamp(ctime * 1000)}
          {...this.getTableSortOptions<IBucketListItem>(
            "ctime",
            numberFieldSorter
          )}
        />
        <BucketTableColumn
          key="setting"
          title="操作"
          width="180px"
          render={(_, bucket) => (
            <Observer render={() => this.renderSetting(bucket)} />
          )}
        />
      </BucketTable>
    );
  }

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.bucketTable}>{this.bucketTableView}</div>
      </div>
    );
  }
}

export default function BucketList(props: IProps) {
  return (
    <Inject
      render={({ inject }) => <InternalBucketList {...props} inject={inject} />}
    />
  );
}
