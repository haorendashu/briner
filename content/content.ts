console.log('Hello from the content script!');

// inject nostr_script.js
const script = document.createElement('script');
script.setAttribute('async', 'false');
script.setAttribute('type', 'text/javascript');
let nostrScriptUrl = chrome.runtime.getURL('/scripts/nostr_script.js');
console.log(nostrScriptUrl);
script.setAttribute('src', nostrScriptUrl);
document.head.appendChild(script);

// 统一的消息监听器
window.addEventListener('message', message => {
    // 检查是否是来自页面的请求消息
    if (
        message.data &&
        message.data.ext === 'briner' &&
        message.data.type &&
        message.data.id &&
        !message.data.response // 确保不是响应消息
    ) {
        console.log('Content script received request from page:', message.data);

        // 转发消息给 background script
        chrome.runtime.sendMessage(message.data, response => {
            console.log('Content script received response from background:', response);
            window.postMessage({
                ext: 'briner',
                id: message.data.id,
                response: response.response
            }, '*');
        });

        return;
    }
});

console.log('Content script loaded successfully');