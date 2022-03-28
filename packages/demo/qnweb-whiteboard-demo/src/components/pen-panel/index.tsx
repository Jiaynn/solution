import { Divider } from 'antd';
import React, { useContext, useMemo } from 'react';
import { storeContext } from '../../store';
import ColorDotBar, { Bar } from '../color-dot-bar';
import './index.scss';

export interface PenPanelProps {}

/**
 * 调节笔的大小和颜色
 * @constructor
 */
const PenPanel: React.FC<PenPanelProps> = props => {

  const store = useContext(storeContext);

  const dots = useMemo(() => {
    return [
      { color: '#000000' },
      { color: '#1F9F8C' },
      { color: '#F44336' },
      { color: '#FFFFFF' },
      { color: '#FFC000' },
      { color: '#0086D0' }
    ];
  }, []);
  return <div className='pen-panel'>
    <ColorDotBar
      dots={dots}
      bar={Bar.Color}
      active={store.state.penColor}
      onChange={v => store.dispatch({
        type: 'updatePenColor',
        payload: v.color
      })}
    />
    <Divider style={{ margin: '15px 0' }} />
    <ColorDotBar
      dots={
        Array
          .from(Array(5))
          .map((_, index) => {
            return { color: '#000000', size: 10 + 5 * index };
          })
      }
      style={{ justifyContent: 'space-around' }}
      bar={Bar.Size}
      active={store.state.penSize}
      onChange={v => store.dispatch({
        type: 'updatePenSize',
        payload: v.size
      })}
    />
  </div>;
};

export default PenPanel;