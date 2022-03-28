import { Popover } from 'antd';
import React, { useCallback, useContext } from 'react';
import { storeContext } from '../../store';
import { PenType } from 'qnweb-whiteboard';
import Icon from '../icon';

interface GestureProps {
  setInputMode: () => void;
}

/**
 * 手势
 * @constructor
 */
const Gesture: React.FC<GestureProps> = props => {

  const { setInputMode } = props;

  const { dispatch } = useContext(storeContext);

  const setPenType = useCallback((index: number) => {
    const pointers = [
      PenType.Pointer2,
      PenType.Pointer1,
      PenType.Pointer3,
      PenType.Pointer4
    ];
    dispatch({
      type: 'updatePenType',
      payload: pointers[index]
    });
  }, [dispatch]);

  return <Popover
    trigger='click'
    content={
      ['icon-gesture', 'icon-laser-2', 'icon-laser-3', 'icon-laser-4'].map((icon, index) => {
        return <Icon
          style={{ width: '30px', height: '30px' }}
          type={icon}
          key={icon}
          onClick={() => setPenType(index)}
        />;
      })
    }
  >
    <Icon type='icon-gesture' onClick={setInputMode} />
  </Popover>;
};

export default Gesture;
