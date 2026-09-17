---
layout: default
title: "示例"
lang: zh-CN
section: examples
---

## 导入示例

下载下方 JSON，然后选择 **Node-RED 菜单 → 导入 → 选择文件**。阅读 Comment 节点，选择自己的桥接器/控制器和设备，按需设置 KNX 网关，然后部署。示例不含凭据，也不含自动触发的 Inject。完成配置后再手动点击 Inject。

## 灯具：Node-RED 命令

使用 Node-RED 消息开关和调节真实灯具，在 Debug 中查看配置的状态 topic。

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## 运动：流程中的事件

接收 Hue 运动传感器的布尔占用状态变化。

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## 灯具：原生 KNX

将真实灯具直接连接到 KNX 命令和反馈地址。请选择已有网关。

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## 更多示例

examples 目录还包含其他设备示例。部署前请阅读其中的 Comment 节点。

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
