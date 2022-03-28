import { Divider } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useContext } from 'react';
import { storeContext } from '../../store';
import { GeometryMode } from 'qnweb-whiteboard';
import Icon from '../icon';
import PenPanel from '../pen-panel';
import './index.scss';

interface GeometryPanelProps {

}

const GeometryPanel: React.FC<GeometryPanelProps> = props => {

  const { state, dispatch } = useContext(storeContext);

  const geometries = [
    { icon: 'icon-solid-line', value: GeometryMode.Line },
    { icon: 'icon-arrow-line', value: GeometryMode.Arrow },
    { icon: 'icon-rectangle-line', value: GeometryMode.Rectangle },
    { icon: 'icon-circle-line', value: GeometryMode.Circle }
  ];

  /**
   * 设置图形模式
   */
  const setGeometryMode = useCallback((mode: GeometryMode) => {
    dispatch({
      type: 'updateGeometryMode',
      payload: mode
    });
  }, [dispatch]);

  return <div className='geometry-panel'>
    <div className='geometry-panel--icon-panel'>
      {
        geometries.map(geometry => {
          const active = geometry.value === state.geometryMode;
          return <Icon
            style={{ width: '30px', height: '30px' }}
            type={geometry.icon}
            key={geometry.value}
            className={classNames('common-icon', { active })}
            onClick={() => setGeometryMode(geometry.value)}
          />;
        })
      }
    </div>
    <Divider style={{ margin: '15px 0' }} />
    <PenPanel />
  </div>;
};

export default GeometryPanel;
