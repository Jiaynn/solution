source_dir=packages/qnweb-rtc-ai
target_dir=packages/qnweb-rtc-ai-demo

cp ${source_dir}/build/qnweb-rtc-ai.*.js ${target_dir}/src/sdk &&
 cp ${source_dir}/*.md ${target_dir} &&
 echo "copy_rtc_ai success"
