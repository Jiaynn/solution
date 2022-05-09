import { Popover } from 'antd';
import React from 'react';
import GeometryPanel from '../geometry-panel';
import Icon from '../icon';

interface Props {
  setInputMode: () => void;
}

/**
 * 几何图形
 * @constructor
 */
const Geometry: React.FC<Props> = props => {

  const { setInputMode } = props;

  return <Popover
    trigger='click'
    content={
      <GeometryPanel />
    }
  >
    <Icon type='icon-geometry' onClick={setInputMode} />
  </Popover>;
};

export default Geometry;