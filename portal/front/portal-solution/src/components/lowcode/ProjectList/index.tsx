import * as React from 'react'
import { Table, TableType } from 'react-icecream-2'
import { Button } from 'react-icecream'

enum BucketType {
  Private = 'private',
  Public = 'public'
}

type Bucket = {
  name: string
  type: BucketType
}

// 在这里通过将 Table 赋值给 BucketTable 对所需的泛型进行声明（Bucket）
// 这样后续在使用 BucketTable 时 TS 会结合 Bucket 类型进行检查
const BucketTable: TableType<Bucket> = Table

const records: Bucket[] = [
  { name: 'fusion-qiniucdn-1', type: BucketType.Public },
  { name: 'fusion-qiniucdn-2', type: BucketType.Private }
]

export function ProjectList() {
  const onAndroid = () => {
    window.api.openEditor({
      editor: 'android',
      fileName: 'demo-1.0.1.zip'
    })
  }
  const oniOS = () => {
    window.api.openEditor({
      editor: 'iOS',
      fileName: 'demo-1.0.1.zip'
    })
  }
  return (
    <BucketTable records={records}>
      <BucketTable.Column
        title="项目名称"
        accessor="name"
      />
      <BucketTable.Column
        title="操作"
        render={() => <>
          <Button type="primary" size="small" onClick={onAndroid}>安卓打开</Button>
          <Button type="primary" size="small" onClick={oniOS}>iOS打开</Button>
        </>}
      />
    </BucketTable>
  )
}
