#!/bin/zsh
cd -- "${0:A:h}"
url='http://127.0.0.1:8878/'
preview_dir="$HOME/Library/Caches/da-ji-tou-jiao-preview"
mkdir -p "$preview_dir"
/usr/bin/ditto "$PWD" "$preview_dir"
/bin/launchctl remove local.da-ji-tou-jiao.preview 2>/dev/null
/bin/launchctl submit -l local.da-ji-tou-jiao.preview -o "$preview_dir/preview.log" -e "$preview_dir/preview-error.log" -- /usr/bin/python3 "$preview_dir/serve.py" --port 8878 --no-open
for attempt in {1..30}; do
  /usr/bin/curl --silent --fail "$url" >/dev/null && break
  sleep 0.1
done
if /usr/bin/curl --silent --fail "$url" >/dev/null; then
  open "$url"
  echo '《打極投絞》已启动，关闭此窗口不会停止游戏服务。'
else
  echo '启动失败，请查看 preview-error.log。'
fi
