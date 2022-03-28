source_dir=packages/sdk/whiteboard/test
sdk_dir=packages/sdk/qnweb-whiteboard
demo_dir=packages/demo/qnweb-whiteboard-demo
file_name=whiteboard_webassembly

cp ${source_dir}/${file_name}.data \
${source_dir}/${file_name}.wasm \
${source_dir}/${file_name}.js \
${sdk_dir}/wasm && cp ${source_dir}/${file_name}.data \
${source_dir}/${file_name}.wasm \
${source_dir}/${file_name}.js \
${demo_dir}/public
echo "copy_white_board_wasm success"
