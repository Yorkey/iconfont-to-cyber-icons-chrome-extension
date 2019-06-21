![screen](https://github.com/Yorkey/iconfont-to-cyber-icons-chrome-extension/blob/master/assets/screen.jpg?raw=true)

# <img src="https://github.com/Yorkey/iconfont-to-cyber-icons-chrome-extension/blob/master/assets/logo.png?raw=true" width="60px" align="right" alt="conFont-helper icon"> IconFont-helper

支持在`iconfont`上一键将当前页面中的所有素材添加进购物车；反选当前页面中的素材；批量下载素材，突破官方限制的单次20个。

> 突破的解决方案是将当前购物车中的所有svg写入到zip二进制流，创建及下载过程，均在前端完成，不请求iconfont接口，不会对iconfont服务器性能造成影响。
> PNG、JPG、WEBP等位图则是将SVG渲染在canvas后，输出base64再导出

> 获取Font Class / Symbol作为文件名,需要切换到Font class 或 Symbol标签下


## 安装方式
#### 方案一（推荐）：商店安装（需要翻墙）
[Google Chrome 商店](https://chrome.google.com/webstore/detail/naogknojdhkjjkbcjndmpkoleijgabdj)

#### 方案二：离线安装
1. 从[Releases](https://github.com/dawangraoming/iconfont-helper-chrome-extension/releases)中下载最新的`crx`文件
2. 使用`--enable-easy-off-store-extension-install`参数启动Chrome浏览器
3. 从Chrome浏览器`更多工具`中打开`扩展程序`
4. 开启`开发者模式`
5. 将crx文件拖入浏览器的`扩展程序`页面中

## 更新日志

### v1.3
使用Font Class / Symbol作为文件名，且kebabCase化

----

![demo](https://github.com/dawangraoming/iconfont-helper-chrome-extension/blob/master/assets/demo.gif?raw=true)

## More ❤️
如果这个项目对你有帮助，请给一个`Star`；
如果你有更好的建议或想法，希望可以在`issues`中看到你的建议哦。


