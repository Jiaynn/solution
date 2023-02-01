import * as React from 'react'
import { observer } from 'mobx-react'
import { InjectFunc, useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Button, Table, Dropdown, TableColumnOptions, Link, MenuItem, Menu, Popover } from 'react-icecream-2'
import { AddIcon, DownTriangleIcon, RefreshIcon } from 'react-icecream-2/icons'

import { getSettingPath, IDetailsBaseOptions } from 'kodo/routes/bucket'

import BackButton from 'kodo/components/common/BackButton'

import { RoutingRule, RoutingApis, KeyType } from 'kodo/apis/bucket/setting/routing'
import RoutingForm, { Form, getValueFromForm } from './Form'

import styles from './style.m.less'

interface Props extends IDetailsBaseOptions { }
interface DiDeps {
  inject: InjectFunc
}
interface Loading {
  Refresh: boolean
  Fetch: boolean
  Save: boolean
}
const RoutingSetting = observer(function _RoutingSetting(props: Props & DiDeps) {
  const routingApis = useInjection(RoutingApis)
  const toasterStore = useInjection(ToasterStore)
  const settingPagePath = getSettingPath(props.inject, { bucketName: props.bucketName })
  const [records, setRecords] = React.useState<RoutingRule[]>([])
  const [dropDownVisible, setDropDownVisible] = React.useState<boolean[]>([])
  const [formVisible, setFormVisible] = React.useState(false)
  const [isEdit, setIsEdit] = React.useState(false)
  const [editIdx, setEditIdx] = React.useState(0)
  const [loading, setLoading] = React.useState<Loading>({ Refresh: false, Fetch: false, Save: false })

  const fetchRules = React.useCallback(async (isRefresh: boolean) => {
    setLoading({ Refresh: isRefresh, Save: false, Fetch: true })
    try {
      return await routingApis.fetchRoutingRules(props.bucketName)
    } catch (e) {
      toasterStore.error('获取规则失败')
    } finally {
      setLoading({ Refresh: false, Save: false, Fetch: false })
    }
    return []
  }, [props.bucketName, routingApis, toasterStore])

  const putRules = React.useCallback(async (rules: RoutingRule[], errorMsg: string, successMsg: string) => {
    try {
      await routingApis.putRoutingRules(props.bucketName, rules)
      toasterStore.success(successMsg)
    } catch (e) {
      toasterStore.error(errorMsg)
    }
  }, [props.bucketName, routingApis, toasterStore])

  // 处理表单提交
  const handleSubmit = React.useCallback((form: Form) => {
    // 最大20条
    if (!isEdit && records.length >= 20) {
      toasterStore.error('规则最多20条')
      return
    }

    form.validate()
      .then(async result => {
        if (result.hasError) return

        const rule = getValueFromForm(form)
        setLoading({ Refresh: false, Save: true, Fetch: false })
        if (isEdit) {
          records[editIdx] = rule
          await putRules([...records], '修改规则失败', '修改规则成功')
        }
        if (!isEdit) {
          await putRules([...records, rule], '新增规则失败', '新增规则成功')
        }
        setFormVisible(false)
        setRecords(await fetchRules(false))
      })
  }, [editIdx, fetchRules, isEdit, putRules, records, toasterStore])

  // 处理删除
  const handleDeleteClick = async (idx: number) => {
    const filter = records.filter((_, index) => index !== idx)
    await putRules(filter, '删除规则失败', '删除规则成功')
    setRecords(await fetchRules(false))
  }

  // 处理优先级变化
  const handleUpAndDown = async (idx: number, rule: RoutingRule, isUp: boolean) => {
    const filter = [...records.filter((_, recordIdx) => recordIdx !== idx)]
    if (isUp) {
      filter.splice(idx - 1, 0, rule)
    } else {
      filter.splice(idx + 1, 0, rule)
    }
    await putRules(filter, '修改规则失败', '修改规则成功')
    setRecords(await fetchRules(false))
  }

  const handleCreateClick = () => {
    setIsEdit(false)
    setFormVisible(true)
  }

  const handleEditClick = (idx: number) => {
    setEditIdx(idx)
    setIsEdit(true)
    setFormVisible(true)
  }

  const handleCancel = () => {
    setIsEdit(false)
    setFormVisible(false)
  }

  const handleMoreVisible = (idx: number) => {
    dropDownVisible[idx] = !dropDownVisible[idx]
    setDropDownVisible([...dropDownVisible])
  }

  const handleRefresh = async () => {
    setRecords(await fetchRules(true))
  }

  React.useEffect(() => {
    const init = async () => {
      setRecords(await fetchRules(false))
      setDropDownVisible(Array<boolean>(records.length).fill(false))
    }
    init()
  }, [fetchRules, records.length])

  const columnCondition: TableColumnOptions<RoutingRule, 'condition'> = {
    title: '重定向触发条件',
    accessor: 'condition',
    width: '350px',
    render: ({ code, prefix, suffix }) => (
      <div className={styles.table}>
        {!!code && <div>匹配 HTTP 状态码：{code}</div>}
        {prefix && <div>匹配文件名前缀：{prefix}</div>}
        {suffix && <div>匹配文件名后缀：{suffix}</div>}
      </div>
    )
  }
  const columnHost: TableColumnOptions<RoutingRule> = {
    title: '重定向地址',
    width: '400px',
    render: (_, { condition, redirect }: RoutingRule) => {
      let { prefix = '', suffix = '' } = condition
      const baseAddr = (redirect.scheme || 'http(s)') + '://' + redirect.host
      let finalAddr = ''
      if (redirect.key_type === KeyType.Default) {
        finalAddr = baseAddr + '/' + prefix + '*' + suffix
      }
      if (redirect.key_type === KeyType.Append) {
        prefix = redirect.prefix + prefix
        suffix += redirect.suffix
        finalAddr = baseAddr + '/' + prefix + '*' + suffix
      }
      if (redirect.key_type === KeyType.Fix) {
        finalAddr = baseAddr + '/' + redirect.path
      }
      if (redirect.key_type === KeyType.Replace) {
        let [replacePrefix, replaceSuffix] = [redirect.prefix, redirect.suffix]
        if (redirect.prefix === '') replacePrefix = condition.prefix
        if (redirect.suffix === '') replaceSuffix = condition.suffix
        prefix = redirect.replace_blank_prefix ? '' : replacePrefix!
        suffix = redirect.replace_blank_suffix ? '' : replaceSuffix!
        finalAddr = baseAddr + '/' + prefix + '*' + suffix
      }
      return <div className={styles.table}>{finalAddr}</div>
    }
  }
  const columnQuery: TableColumnOptions<RoutingRule, 'redirect'> = {
    title: '回源参数',
    accessor: 'redirect',
    width: '120px',
    render: ({ code, retain_query: retainQuery }) => (
      <>
        {retainQuery && <div>URL 参数保留</div>}
        <div>响应状态码：{code}</div>
      </>
    )
  }
  const optionView = (idx: number, rule: RoutingRule) => {
    const dropDownOverlay = (
      <Menu>
        <MenuItem><Link onClick={() => { handleUpAndDown(idx, rule, true) }}>上移</Link></MenuItem>
        <MenuItem><Link onClick={() => { handleUpAndDown(idx, rule, false) }}>下移</Link></MenuItem>
      </Menu>
    )
    const getView = (elem?: JSX.Element) => (
      <div className={styles.opt}>
        <Link onClick={() => { handleEditClick(idx) }}>编辑</Link>
        <Popover
          trigger="click"
          placement="right"
          content="确定要删除这条规则吗？"
          buttons={{ onOk: () => { handleDeleteClick(idx) } }}
          icon
        >
          <Link>删除</Link>
        </Popover>
        {elem}
      </div>
    )

    if (records.length === 1) return getView()
    if (idx === 0) {
      return getView(<Link onClick={() => { handleUpAndDown(idx, rule, false) }}>下移</Link>)
    }
    if (idx === records.length - 1) {
      return getView(<Link onClick={() => { handleUpAndDown(idx, rule, true) }}>上移</Link>)
    }
    return getView(
      <Dropdown
        trigger="hover"
        overlay={dropDownOverlay}
        visible={dropDownVisible[idx]}
        onVisibleChange={() => { handleMoreVisible(idx) }}
      >
        <Link>更多<DownTriangleIcon className={styles.moreIcon} /></Link>
      </Dropdown>
    )
  }
  const columnOption: TableColumnOptions<RoutingRule> = {
    title: '操作',
    width: '140px',
    render: (_, routing: RoutingRule, idx: number) => (optionView(idx, routing))
  }

  return (
    <>
      <div className={styles.toolbar}>
        <BackButton path={settingPagePath} />
        <Button
          type="primary"
          icon={<AddIcon />}
          onClick={handleCreateClick}
          disabled={records.length >= 20}
        >
          创建规则
        </Button>
        <Button icon={<RefreshIcon />} onClick={handleRefresh} loading={loading.Refresh}>刷新</Button>
      </div>
      <div className={styles.content}>
        <Table<RoutingRule>
          records={records}
          columns={[columnCondition, columnHost, columnQuery, columnOption]}
          loading={loading.Fetch}
        />
      </div>
      <RoutingForm
        isEdit={isEdit}
        existedData={records[editIdx]}
        visible={formVisible}
        loading={loading.Save}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </>
  )
})

export default RoutingSetting
