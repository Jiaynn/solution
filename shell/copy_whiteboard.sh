source_dir=packages/qnweb-whiteboard
target_dir=packages/qnweb-whiteboard-demo

cp ${source_dir}/build/*.js ${target_dir}/sdk &&
cp -r ${source_dir}/documents ${target_dir} &&
  echo "copy_whiteboard success"
