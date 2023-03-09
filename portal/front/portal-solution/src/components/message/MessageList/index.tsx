
import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import './style.less'
import { MessageSolutionApi } from 'apis/message'
import { GetMessageListResultDataList } from 'apis/_types/messageType'

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
    <div className="list-wrapper">
      <ul>
        {
          messageList
            ? messageList.map((item: GetMessageListResultDataList) => (<li className="list" key={item.id}>
              <div className="list-content">
                <div className="list-icon">
                  <img src={item.icon_image_url} alt="" />
                </div>
                <div className="list-desc">
                  <div className="list-desc-title">{item.title}</div>
                  <div className="list-desc-content">{item.describe}</div>
                </div>
              </div>
              <div className="link">
                {
                  item.bottom_list.length
                    ? <><a href={item.bottom_list[0].link_url} target="_blank" rel="noreferrer">{item.bottom_list[0].link_mark}</a><span></span>
                      <a href={item.bottom_list[1].link_url} target="_blank" rel="noreferrer">{item.bottom_list[1].link_mark}</a><span></span>
                      <a href={item.bottom_list[2].link_url} target="_blank" rel="noreferrer">{item.bottom_list[2].link_mark}</a></>
                    : <div className="wait">敬请期待</div>
                }

              </div>

            </li>))
            : null
        }
      </ul>
    </div>
  )

}
