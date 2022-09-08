import React, { useState } from 'react';

import { AudioPlayer } from '@/components';

export const AudioPage = () => {
  const [playing, setIsPlaying] = useState(false);
  return <div>
    <AudioPlayer
      url="http://r3dg6y3l0.hd-bkt.clouddn.com/mam/audio/demo.mp3"
      isPlaying={playing}
      onPlay={(isPlaying) => setIsPlaying(isPlaying)}
    />
  </div>;
};
