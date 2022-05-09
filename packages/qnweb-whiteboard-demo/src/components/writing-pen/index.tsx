import { Popover } from 'antd';
import React, { useCallback, useContext } from 'react';
import { storeContext } from '../../store';
import { PenType } from 'qnweb-whiteboard';
import Icon from '../icon';
import PenPanel, { PenPanelProps } from '../pen-panel';

type Props = PenPanelProps & {
  setInputMode: () => void;
}

/**
 * 书写笔
 * @param props
 * @constructor
 */
const WritingPen: React.FC<Props> = props => {

  const { dispatch } = useContext(storeContext);

  const { setInputMode, ...restProps } = props;

  const activePenType = useCallback(() => {
    setInputMode();
    dispatch({
      type: 'updatePenType',
      payload: PenType.WritingPen
    });
  }, [dispatch, setInputMode]);

  return <Popover
    trigger='click'
    content={
      <PenPanel
        {...restProps}
      />
    }
  >
    <Icon type='icon-pen-pencil' onClick={activePenType} />
  </Popover>;
};

export default WritingPen;
