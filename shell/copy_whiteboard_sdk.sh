source_dir=packages/sdk/qnweb-whiteboard
target_dir=packages/demo/qnweb-whiteboard-demo

cp ${source_dir}/build/*.umd.js ${target_dir}/public &&
  echo "copy_white_board_sdk success"
