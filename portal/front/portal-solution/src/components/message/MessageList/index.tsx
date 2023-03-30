
import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import './style.less'
import { Tooltip } from 'react-icecream-2'

import { MessageSolutionApi } from 'apis/message'
import { GetMessageListResultDataList } from 'apis/_types/messageType'

const prefixCls = 'message-list'
export const MessageList = () => {
  const messageApi = useInjection(MessageSolutionApi)

  const [messageList, setMessageList] = useState<GetMessageListResultDataList[]>()
  useEffect(() => {
    const getData = async () => {
      const result = await messageApi.getMessageList({ page_num: 1, page_size: 100 })
      setMessageList(result.list)
    }
    getData()
  }, [messageApi])

  return (
    <div className={`${prefixCls}-wrapper`}>
      <ul>
        {
          messageList
            ? messageList.map((item: GetMessageListResultDataList) => (<li className={`${prefixCls}`} key={item.id}>
              <div className={`${prefixCls}-content`}>
                <div className={`${prefixCls}-content-icon`}>
                  <img src={item.icon_image_url} alt="" />
                </div>
                <div className={`${prefixCls}-content-desc`}>
                  <div className={`${prefixCls}-content-desc-title`}>{item.title}</div>
                  <Tooltip placement="bottom" title={item.describe}><div className={`${prefixCls}-content-desc-content`}>{item.describe}</div></Tooltip>
                </div>
              </div>
              <div className={`${prefixCls}-link`}>
                {
                  item.bottom_list.length
                    ? <><a href={item.bottom_list[0].link_url} target="_blank" rel="noreferrer">{item.bottom_list[0].link_mark}</a><span></span>
                      <a href={item.bottom_list[1].link_url} target="_blank" rel="noreferrer">{item.bottom_list[1].link_mark}</a><span></span>
                      <a href={item.bottom_list[2].link_url} target="_blank" rel="noreferrer">{item.bottom_list[2].link_mark}</a></>
                    : <div className={`${prefixCls}-link-wait`}>敬请期待</div>
                }

              </div>

            </li>))
            : null
        }
      </ul>
    </div>
  )

}
