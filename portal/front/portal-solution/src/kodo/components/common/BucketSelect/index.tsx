import React from 'react'
import { Observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'

import { Loading, Select, SelectOption, SelectOptionGroup, SelectValue } from 'react-icecream-2'
import { ToasterStore } from 'portal-base/common/toaster'

import { ConfigStore } from 'kodo/stores/config'
import { BucketListStore } from 'kodo/stores/bucket/list'

import { IBucketListItem } from 'kodo/apis/bucket/list'

interface Props<T = string> {
  value: T | undefined | null,
  onChange: (v: T | undefined | null) => void
  disableCheck?: (v: IBucketListItem) => boolean | string
  className?: string
}

export function BucketSelect<T extends SelectValue>(props: Props<T>) {
  const configStore = useInjection(ConfigStore)
  const toasterStore = useInjection(ToasterStore)
  const bucketListStore = useInjection(BucketListStore)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let ignore = false
    setLoading(true)
    toasterStore.promise(bucketListStore.fetchList())
      .finally(() => !ignore && setLoading(false))
    return () => { ignore = true }
  }, [bucketListStore, toasterStore])

  return (
    <Observer render={(() => {
      const { disableCheck, onChange, value, className } = props
      const bucketData = Array.from(bucketListStore.listGroupByRegion.entries())
      return (
        <Loading loading={loading}>
          <Select<T> searchable clearable placeholder="请选择目标空间" {...{ onChange, value, className }}>
            {bucketData.map(([region, buckets]) => {
              if (buckets.length === 0) return null
              const regionName = configStore.getRegion({ region }).name
              return (
                <SelectOptionGroup key={region} title={regionName}>
                  {buckets.map(bucket => {
                    const disabled = disableCheck
                      ? disableCheck(bucket)
                      : false

                    return (
                      <SelectOption
                        key={bucket.tbl}
                        value={bucket.tbl}
                        disabled={!!disabled}
                      >
                        {bucket.tbl}{typeof disabled === 'string' ? ` (${disabled})` : ''}
                      </SelectOption>
                    )
                  })}
                </SelectOptionGroup>
              )
            })}
          </Select>
        </Loading>
      )
    })} />
  )
}
