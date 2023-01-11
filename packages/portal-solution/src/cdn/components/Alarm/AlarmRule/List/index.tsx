/**
 * @file 告警规则 table
 * @author zhouhang <zhouhang@qiniu.com>
 */
import React, { useState } from 'react'
import { Button, Popover, Switch, Table, TableColumnOptions } from 'react-icecream-2'

import { humanizeTimeUTC } from 'cdn/transforms/datetime'

import { AlarmRuleConfig, MetricsItem } from 'cdn/apis/alarm/rule'
import RuleConfigMetricsItem from './RuleConfigMetricsItem'
import { AlarmModalType } from '../Modal/AlarmModal'

export interface RuleListProps {
  configs: AlarmConfigForDisplay[]
  selectedIds: string[]
  loading: boolean
  onChange: (rule: string[]) => void
  onView: (config: AlarmConfigForDisplay, type: AlarmModalType) => void
  onDelete: (ruleId: string) => void
  onSwitch: (config: AlarmConfigForDisplay, isEnabled: boolean) => void
}

export interface AlarmConfigForDisplay extends AlarmRuleConfig {
  domains: string[]
}

export default function RuleList(props: RuleListProps) {
  const { configs, loading, onView, onDelete, onSwitch } = props
  const { records, currentPage, pageSize, total, setPageInfo } = useTableProps(configs, loading)

  const columnRule: TableColumnOptions<AlarmConfigForDisplay, 'name'> = {
    title: '规则名称',
    width: '150px',
    accessor: 'name'
  }

  const columnConfig: TableColumnOptions<AlarmConfigForDisplay> = {
    title: '告警规则',
    accessor: 'ruleId',
    render(_: unknown, config: AlarmConfigForDisplay) {
      return (
        <RuleConfig config={config} />
      )
    }
  }

  const columnRelation: TableColumnOptions<AlarmConfigForDisplay, 'independent'> = {
    title: '触发告警条件',
    accessor: 'independent',
    render: independent => (independent ? '或' : '且')
  }

  const columnDomainCount: TableColumnOptions<AlarmConfigForDisplay, 'domains'> = {
    title: '关联域名个数',
    accessor: 'domains',
    render: domains => (domains || []).length + ' 个'
  }

  const columnEnabled: TableColumnOptions<AlarmConfigForDisplay, 'isEnable'> = {
    title: '告警启停',
    accessor: 'isEnable',
    render(isEnable, item) {
      return (
        <Switch
          checked={isEnable}
          onChange={status => {
            onSwitch(item, status)
          }}
        />
      )
    }
  }

  const columnUpdateAt: TableColumnOptions<AlarmConfigForDisplay, 'modified'> = {
    title: '最后更新时间',
    accessor: 'modified',
    render(modified) { return humanizeTimeUTC(modified) }
  }

  const columnOperation: TableColumnOptions<AlarmConfigForDisplay> = {
    title: '操作',
    width: '210px',
    render(_: unknown, config: AlarmConfigForDisplay) {
      return (
        <RuleOperation onView={onView} onDelete={onDelete} config={config} />
      )
    }
  }

  function handlePageChange(nextPage: number, nextPageSize: number) {
    setPageInfo(nextPage, nextPageSize)
  }

  return (
    <Table<AlarmConfigForDisplay>
      columns={[
        columnRule,
        columnConfig,
        columnRelation,
        columnDomainCount,
        columnUpdateAt,
        columnEnabled,
        columnOperation]}
      records={records}
      loading={props.loading}
      recordIdAccessor="ruleId"
      selection={{ selectedIds: props.selectedIds, onChange: props.onChange }}
      pagination={{ currentPage, pageSize, total, onChange: handlePageChange }}
    />
  )
}

function useTableProps(configs: AlarmConfigForDisplay[], loading: boolean) {
  const [{ currentPage, pageSize }, setPageInfo] = useState({ pageSize: 10, currentPage: 0 })
  function handleSetPageInfo(nextCurrentPage: number, nextPageSize: number) {
    setPageInfo({ pageSize: nextPageSize, currentPage: nextCurrentPage })
  }

  return {
    records: configs.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    currentPage,
    pageSize,
    setPageInfo: handleSetPageInfo,
    total: configs.length,
    loading
  }
}

interface RuleConfigProps {
  config: AlarmConfigForDisplay
}

function RuleConfig({ config }: RuleConfigProps) {
  return (
    <>
      {
        config.metrics.map((item: MetricsItem, index: number) => (
          <RuleConfigMetricsItem
            key={index}
            item={item}
          />
        ))
      }
    </>
  )
}

interface RuleOperationProps extends RuleConfigProps {
  onView: (config: AlarmConfigForDisplay, type: AlarmModalType) => void
  onDelete: (ruleId: string) => void
}

function RuleOperation({ config, onView, onDelete }: RuleOperationProps) {
  return (
    <>
      <Button type="link" onClick={() => onView(config, AlarmModalType.View)}>查看</Button>
      <Button type="link" style={{ marginLeft: '10px' }} onClick={() => onView(config, AlarmModalType.Edit)}>编辑</Button>
      <Popover
        trigger="click"
        content={'确定删除 ' + config.name + ' 吗？'}
        buttons={{
          onOk: () => onDelete(config.ruleId)
        }}
      >
        <Button type="link" style={{ marginLeft: '10px' }}>删除</Button>
      </Popover>
    </>
  )
}

