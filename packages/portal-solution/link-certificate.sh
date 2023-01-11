#!/bin/bash

linkDir() {
  if [ -L $2 ]; then
    unlink $2
  fi
  curpath=$(pwd)
  abspath=$(cd $1;pwd)
  cd $curpath
  ln -sv $abspath $2
}

linkDir "../certificate/src" "./src/cdn/certificate"
