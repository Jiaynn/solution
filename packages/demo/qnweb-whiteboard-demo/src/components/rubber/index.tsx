import { Popover } from 'antd';
import React, { useCallback, useContext } from 'react';
import { storeContext } from '../../store';
import Icon from '../icon';
import './index.scss';

interface RubberProps {
  setInputMode: () => void;
}

/**
 * 橡皮
 * @constructor
 */
const Rubber: React.FC<RubberProps> = props => {

  const { setInputMode } = props;

  const { dispatch } = useContext(storeContext);

  const setRubberSize = useCallback((index: number) => {
    dispatch({
      type: 'updateRubberSize',
      payload: 30 + index * 5
    });
  }, [dispatch]);

  return <Popover
    overlayClassName='rubber-overlay'
    overlayStyle={{ transform: 'scale(1)' }}
    trigger='click'
    content={
      [
        'icon-rubber-30', 'icon-rubber-35', 'icon-rubber-40',
        'icon-rubber-45', 'icon-rubber-50'
      ].map((icon, index) => {
        return <Icon
          type={icon}
          key={icon}
          onClick={() => setRubberSize(index)}
          style={{ transform: 'scale(0.5)' }}
        />;
      })
    }
  >
    <Icon type='icon-rubber' onClick={setInputMode} />
  </Popover>;
};

export default Rubber;