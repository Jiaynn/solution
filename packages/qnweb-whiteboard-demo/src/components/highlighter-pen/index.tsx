import { Popover } from 'antd';
import React, { useCallback, useContext } from 'react';
import { storeContext } from '../../store';
import { PenType } from 'qnweb-whiteboard';
import Icon from '../icon';
import PenPanel from '../pen-panel';

interface HighlighterPenProps {
  setInputMode: () => void;
}

/**
 * 荧光笔
 * @param props
 * @constructor
 */
const HighlighterPen: React.FC<HighlighterPenProps> = props => {

  const { setInputMode } = props;

  const { dispatch } = useContext(storeContext);

  const activePenType = useCallback(() => {
    setInputMode();
    dispatch({
      type: 'updatePenType',
      payload: PenType.HighlighterPen
    });
  }, [dispatch, setInputMode]);

  return <Popover
    trigger='click'
    content={
      <PenPanel />
    }
  >
    <Icon type='icon-pen-mark' onClick={activePenType}/>
  </Popover>

}

export default HighlighterPen;
