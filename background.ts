console.log('Hello from the background script!')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // message: 发送的消息内容
    // sender: 包含发送方信息（如 tab 信息、扩展 ID 等）
    // sendResponse: 用于回复消息的函数
    console.log("receive message:", message)
    console.log("sender:", sender)

    let origin = sender.origin
    let url = sender.url

    let id = message.id
    let type = message.type
    let params = message.params

    sendResponse({ id: id, response: "Hello from background script!" });
    chrome.action.openPopup()
});