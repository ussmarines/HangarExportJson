(function () {
  'use strict';
  if (
    !/^\/(en\/)?account\/pledges$/.test(location.pathname) ||
    document.getElementById('hangar-export-json')
  )
    return;
  const api = globalThis.HangarExportJson;
  const host = document.createElement('section');
  host.id = 'hangar-export-json';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent =
    ':host{display:block;position:fixed;bottom:16px;right:16px;z-index:2147483647;max-width:min(420px,95vw)}section{font:15px/1.5 system-ui;background:#102436;color:#fff;padding:16px;border:1px solid #9ab9d0;border-radius:8px;max-height:70vh;overflow:auto}button{font:inherit;min-height:44px;margin:4px;padding:8px;cursor:pointer}p{margin:8px 0}';
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'HangarExportJson');
  const button = document.createElement('button');
  button.textContent = 'Export my fleet as JSON';
  const cancel = document.createElement('button');
  cancel.textContent = 'Cancel';
  cancel.hidden = true;
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Ready to export your vehicles as JSON.';
  panel.append(button, cancel, status);
  shadow.append(style, panel);
  document.body.append(host);
  let controller;
  cancel.onclick = () => controller?.abort();
  button.onclick = async () => {
    if (controller) return;
    controller = new AbortController();
    const { signal } = controller;
    button.disabled = true;
    cancel.hidden = false;
    let totalBytes = 0;
    const start = Date.now();
    const overallTimer = setTimeout(() => controller?.abort('TIME_LIMIT'), api.LIMITS.duration);
    try {
      const output = await api.collect({
        signal,
        progress: (page) => {
          status.textContent = `Collecting page ${page}…`;
        },
        load: async (page) => {
          if (page > 1)
            await new Promise((resolve, reject) => {
              const onAbort = () => {
                clearTimeout(timer);
                reject(new DOMException('Cancelled', 'AbortError'));
              };
              const timer = setTimeout(() => {
                signal.removeEventListener('abort', onAbort);
                resolve();
              }, api.LIMITS.delay);
              signal.addEventListener('abort', onAbort, { once: true });
            });
          signal.throwIfAborted();
          const url = new URL(api.BASE);
          url.searchParams.set('page', page);
          url.searchParams.set('pagesize', '10');
          const request = new AbortController();
          const abort = () => request.abort();
          signal.addEventListener('abort', abort, { once: true });
          const timer = setTimeout(
            abort,
            Math.min(api.LIMITS.timeout, api.LIMITS.duration - (Date.now() - start)),
          );
          try {
            const response = await fetch(url, {
              method: 'GET',
              credentials: 'same-origin',
              redirect: 'error',
              signal: request.signal,
            });
            if (!response.ok)
              throw new Error(response.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR');
            if (!response.headers.get('content-type')?.includes('text/html'))
              throw new Error('UNEXPECTED_RESPONSE');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let html = '',
              bytes = 0;
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                bytes += value.byteLength;
                totalBytes += value.byteLength;
                if (bytes > api.LIMITS.bytes || totalBytes > api.LIMITS.totalBytes)
                  throw new Error('RESPONSE_LIMIT');
                html += decoder.decode(value, { stream: true });
              }
              html += decoder.decode();
            } finally {
              await reader.cancel().catch(() => {});
            }
            // Template contents stay inert: no scripts, image loads or fetched nodes attached to the page.
            const template = document.createElement('template');
            template.innerHTML = html;
            return api.parse(template.content, page);
          } catch (error) {
            if (request.signal.aborted && !signal.aborted) throw new Error('REQUEST_TIMEOUT');
            throw error;
          } finally {
            clearTimeout(timer);
            signal.removeEventListener('abort', abort);
          }
        },
      });
      signal.throwIfAborted();
      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date()
        .toISOString()
        .replace(/[:T]/g, '-')
        .replace(/\.\d+Z$/, '');
      link.href = url;
      link.download = `hangar-export-${stamp}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      const count = output.fleet.reduce((sum, group) => sum + group.quantity, 0);
      const summary = `${count} vehicle${count === 1 ? '' : 's'} exported to JSON.`;
      status.textContent = output.errors.length
        ? `${summary} Collection interrupted — partial export. Download requested.`
        : count === 0
          ? '0 vehicles exported to JSON. No vehicles could be confirmed. Download requested.'
          : `${summary} Download requested.`;
    } catch (error) {
      status.textContent = signal.aborted
        ? signal.reason === 'TIME_LIMIT'
          ? 'Time limit reached — no file downloaded.'
          : 'Cancelled — no file downloaded.'
        : 'Export failed — no file downloaded.';
    } finally {
      clearTimeout(overallTimer);
      controller = null;
      button.disabled = false;
      cancel.hidden = true;
    }
  };
})();
