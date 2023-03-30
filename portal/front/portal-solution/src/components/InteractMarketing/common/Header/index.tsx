import React from 'react'

import logoPNG from './logo.png'

import styles from './style.m.less'

export interface LowcodeHeaderProps {
  style?: React.CSSProperties
}

const Header: React.FC<LowcodeHeaderProps> = props => {
  const { style } = props

  return (
    <div className={styles.header} style={style}>
      <img className={styles.img} src={logoPNG} alt="logo" />
      <div className={styles.text}>
        <div className={styles.title}>互动营销</div>
        <div className={styles.content}>
          七牛互动营销解决方案覆盖娱乐互动直播、电商直播带货、语聊房、互动教育等多应用场景，基于七牛云音视频、AI
          智能算法和网络等先进技术，提供易接入、强扩展、高效部署和覆盖多场景的音视频服务，助力企业快速搭建高品质的专属音视频互动营销业务平台。
        </div>
      </div>
    </div>
  )
}

export default Header
