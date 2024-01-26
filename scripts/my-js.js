//任何时候，你都可以在 Javascript 中调用 load() 方法来重置媒体。
//如果有多个由 <source> 标签指定的媒体来源，浏览器会从选择媒体来源开始重新加载媒体。
const mediaElem = document.getElementById("my-media-element");
mediaElem.load();

//你可以监控媒体元素中的音频轨道，当音轨被添加或删除时，你可以通过监听相关事件来侦测到。
//具体来说，通过监听 AudioTrackList (en-US) 对象的 addtrack 事件
//（即 HTMLMediaElement.audioTracks 对象），你可以及时对音轨的增加做出响应。
const mediaElem2 = document.querySelector("video");
mediaElem.audioTracks.onaddtrack = function (event) {
  audioTrackAdded(event.track);
};

