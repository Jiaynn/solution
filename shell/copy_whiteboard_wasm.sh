source_dir=packages/whiteboard/test
sdk_dir=packages/qnweb-whiteboard
demo_dir=packages/qnweb-whiteboard-demo
file_name=whiteboard_webassembly

cp ${source_dir}/${file_name}.data \
${source_dir}/${file_name}.wasm \
${source_dir}/${file_name}.js \
${sdk_dir}/wasm && cp ${source_dir}/${file_name}.data \
${source_dir}/${file_name}.wasm \
${source_dir}/${file_name}.js \
${demo_dir}/public
echo "copy_white_board_wasm success"
