sdk_dir=packages/qnweb-rtc-ai
demo_dir=packages/qnweb-rtc-ai-demo

cp ${sdk_dir}/build/qnweb-rtc-ai.*.js ${demo_dir}/public/sdk &&
cp -r ${sdk_dir}/documents ${demo_dir} &&
 echo "copy_rtc_ai success"
