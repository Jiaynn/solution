import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream-2'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'
import SettingCard from '../Card'
import StaticPageDrawer from './StaticPageDrawer'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

const StaticPage = observer(function StaticPage(props: IProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <>
      <SettingCard
        title="静态页面"
        doc="staticPageDetail"
        tooltip="支持设置默认首页、HTTP 请求时的 404 页面"
        className={styles.card}
      >
        <Button
          onClick={() => { setVisible(true) }}
          {...sensorsTagFlag('portalKodo@bucketSetting', 'staticPage')}
        >
          设置
        </Button>
      </SettingCard>
      <StaticPageDrawer
        visible={visible}
        setVisible={setVisible}
        {...props}
      />
    </>
  )
})

export default StaticPage
