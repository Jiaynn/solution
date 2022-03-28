import React from 'react';
import './index.scss';

interface Props {
  loading: boolean
}

const RoomLoading: React.FC<Props> = props => {
  const { loading } = props;
  return loading ? <div className='room-loading'>
    <img src={require('../../assets/images/icon-room-loading.svg').default} alt='' />
  </div> : null;
};

export default RoomLoading;