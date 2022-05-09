sdk_dir=packages
demo_dir=packages

rm -rf ${sdk_dir}/qnuniapp-im \
${sdk_dir}/qnweapp-im  \
${sdk_dir}/qnweb-exam-sdk \
${sdk_dir}/qnweb-im \
${sdk_dir}/qnweb-rtc-ai \
${sdk_dir}/qnweb-whiteboard \
${sdk_dir}/whiteboard \
${demo_dir}/qnuniapp-im-demo \
${demo_dir}/qnweapp-im-demo \
${demo_dir}/qnweb-im-demo \
${demo_dir}/qnweb-rtc-ai-demo \
${demo_dir}/qnweb-whiteboard-demo &&

cp cube-template/** . &&

rm -rf docs \
cube-template \
scripts \
shell

