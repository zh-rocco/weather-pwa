# 一个天气 PWA
> * Progressive Web App
> * 天气查询
> * 离线访问


---
## 准备：
1\. 如果您的电脑可以翻墙可以跳过此步骤，[安装翻墙工具](https://github.com/XX-net/XX-Net/wiki/%E4%BD%BF%E7%94%A8Chrome%E6%B5%8F%E8%A7%88%E5%99%A8)。

2\. 安装最新的 [Chrome](https://www.google.cn/intl/zh-CN/chrome/browser/desktop/index.html) 浏览器



---
## 使用：
### 1. 搭建本地服务器
**准备：**
> 安装 [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)

1\. 从 Chrome 的书签栏选择 **应用** 打开已安装的应用，点击 **Web Server** 启动 Web Server；

![apps](https://github.com/no-nothing/weather-pwa/blob/master/README/chrome-apps.jpg)
![Web Server icon](https://github.com/no-nothing/weather-pwa/blob/master/README/web-server-icon.jpg)

![Web Server page](https://github.com/no-nothing/weather-pwa/blob/master/README/web-server-page.jpg)

2\. 点击 **CHOOSER FOLDER** 的按钮，然后选择当前项目的根目录，
这可以开启一个本地服务器，服务器根目录为刚才选择的项目目录；

3\. 在 **Options** 中，勾选 "Automatically show index.html"；

4\.然后将 **Web Server: STARTED** 的按钮拉去左边，再拉去右边，以将本地网络服务器关闭并重启；

5\.点击窗口内 **Web Server URL(s)** 下的链接打开页面



### 2. 添加桌面图标
##### 方式一：
点击 Chrome 右上角的 **设置** 按钮（竖排的三个点），选择 **更多工具 | 添加到桌面**。

##### 方式二：
在 Chrome 浏览器内按 **F12** 打开开发者工具，选择 **Application | Manifest | Add to homescreen**。



### 3. 测试离线使用
##### 方式一：
关闭您电脑的网络，点击刚才添加到桌面的图标。

##### 方式二：
在 Chrome 浏览器内按 **F12** 打开开发者工具，选择 **Network**，勾选 **Offline**，刷新浏览器。

##### 方式二：
在 Chrome 浏览器内按 **F12** 打开开发者工具，选择 **Application | Service Workers**，勾选 **Offline**，刷新浏览器。



---
## 参考资料：
1. [下一代 Web 应用模型 — Progressive Web App](https://zhuanlan.zhihu.com/p/25167289)
2. [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
3. [你的首个 Progressive Web App](https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/)










