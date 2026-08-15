(() => {
  // Diagnostic only: expose page-level WebSocket lifecycle events to the
  // extension's isolated content world. No messages are modified or sent.
  if (window.__AVIATOR_WS_HOOK__) return;
  window.__AVIATOR_WS_HOOK__ = true;
  const OriginalWebSocket = window.WebSocket;
  if (!OriginalWebSocket) return;

  function emit(type, detail) {
    try { window.dispatchEvent(new CustomEvent('__aviator_ws__', { detail: { type, ...detail } })); } catch (_) {}
  }

  window.WebSocket = function(...args) {
    const ws = new OriginalWebSocket(...args);
    emit('open_socket', { url: String(args[0] || '') });
    ws.addEventListener('open', () => emit('open', { url: ws.url }));
    ws.addEventListener('message', e => {
      // Only metadata is forwarded initially. Payloads are intentionally not
      // persisted; this is a connectivity diagnostic, not packet replay.
      emit('message', { url: ws.url, size: typeof e.data === 'string' ? e.data.length : 0 });
    });
    ws.addEventListener('close', () => emit('close', { url: ws.url }));
    return ws;
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
})();
