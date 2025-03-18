export async function onRequest(context) {
  // Extract the request from the context
  const { request } = context;
  
  // Clone the request to be able to modify it
  const url = new URL(request.url);
  
  // Don't process requests for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return context.next();
  }
  
  // For all other routes, serve the index.html file
  const response = await context.env.ASSETS.fetch(new URL('/index.html', request.url));
  
  // Add security headers to the response
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  
  return newResponse;
} 