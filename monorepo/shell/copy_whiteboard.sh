sdk_dir=packages/qnweb-whiteboard
demo_dir=packages/qnweb-whiteboard-demo

cp ${sdk_dir}/build/*.js ${demo_dir}/public/sdk &&
cp ${sdk_dir}/webassembly/* ${demo_dir}/public/webassembly &&
cp -r ${sdk_dir}/documents ${demo_dir} &&
  echo "copy_whiteboard success"
