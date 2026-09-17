---
layout: default
title: "节点"
lang: zh-CN
section: nodes
---

编辑器中的名称可能随语言变化。下文说明各节点的用途。

## Hue Bridge 配置

在 Controller 的 Hue Bridge 选择框中创建配置。发现桥接器或输入 IP，点击 **CONNECT**，再按桥接器的实体按钮。保存并部署。也可以复用已有凭据，无需重新配对。多个 Controller 可以共用同一桥接器。

## HUE Controller

选择 Hue Bridge 和资源，启用端口，并在命令和状态字段中填写 topic。编辑器只显示所选资源支持的功能。

例如，将亮度命令映射为 `living-room/brightness`，发送 `msg.topic = "living-room/brightness"` 和 `msg.payload = 60`。用另一个 topic 接收亮度状态。传感器只需配置状态 topic 并启用输出端口。

每个实例对应一个所选资源。可添加另一个 Controller 控制其他设备，也可以让一个实例使用 Node-RED 消息，另一个使用 KNX 模式。

## 消息与数值

开关使用布尔值 `true` / `false`；亮度使用 0–100 的数字；色温使用开尔文。状态消息在 `msg.topic` 中包含配置的 topic，在 `msg.payload` 中包含值。还可能输出 RAW 事件；如只需要映射状态，请按 `msg.topic` 筛选。

## KNX 模式

**本包也可以与 KNX Ultimate 配合使用。** 集成为原生功能：安装 `node-red-contrib-knx-ultimate` 并选择其网关，即可启用 **KNX 模式**。同一组映射字段将使用组地址和 DPT，并提供已导入 ETS 项目的地址建议。命令和状态直接通过总线传输，这些映射无需额外的 Function 节点。

[示例]({{ "/zh-CN/examples.html" | relative_url }})
