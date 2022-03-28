source_dir=packages/sdk/qnweb-rtc-ai
target_dir=packages/demo/qnweb-rtc-ai-demo

cp ${source_dir}/build/qnweb-rtc-ai.*.js ${target_dir}/src/sdk &&
 cp ${source_dir}/*.md ${target_dir} &&
 echo "copy_rtc_ai success"
