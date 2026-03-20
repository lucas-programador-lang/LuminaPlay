export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Tenta servir o arquivo vindo dos assets
    try {
      // Se a URL terminar sem extensão, ex: /series, tenta adicionar .html
      if (!url.pathname.includes('.') && url.pathname !== '/') {
        url.pathname += '.html';
      }
      
      return await env.ASSETS.fetch(new Request(url, request));
    } catch (e) {
      // Se der erro, volta para o index (Comportamento de SPA)
      return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
    }
  }
};
