source_dir=packages/qnweb-whiteboard
target_dir=packages/qnweb-whiteboard-demo

cp ${source_dir}/build/*.js ${target_dir}/public &&
cp -r ${source_dir}/documents ${target_dir} &&
  echo "copy_whiteboard success"
