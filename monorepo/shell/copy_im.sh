sdk_dir=packages/qnweb-im
demo_dir=packages/qnweb-im-demo

cp ${sdk_dir}/build/qnweb-im.*.js ${demo_dir}/src/sdk &&
cp -r ${sdk_dir}/documents ${demo_dir} &&
echo "copy_im success"
