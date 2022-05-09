source_dir=packages/qnweb-whiteboard
target_dir=packages/qnweb-whiteboard-demo

cp ${source_dir}/build/*.umd.js ${target_dir}/public &&
cp ${source_dir}/README.md ${target_dir}/SDK.md &&
  echo "copy_white_board_sdk success"
