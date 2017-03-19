/* 天气数据缓存 */
let dataCacheName = 'weatherData-v1';
/* 文件缓存 */
let cacheName = 'weatherPWA-final-v1';
/* 需要缓存的文件集合 */
let filesToCache = [
    '/',
    '/index.html',
    '/js/app.js',
    '/css/inline.css',
    '/images/clear.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

/* 安装 Service Worker 线程 */
self.addEventListener('install', function (e) {
    console.log('[Service Worker]: 安装');
    e.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                console.log('[Service Worker]: 缓存应用外壳');
                // cache.addAll() 是链式操作，如果某个文件缓存失败了，那么整个缓存就会失败！
                return cache.addAll(filesToCache);
            })
    );
});

/* 更新 Service Worker 线程 */
self.addEventListener('activate', function (e) {
    console.log('[Service Worker]: 激活');
    e.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== cacheName && key !== dataCacheName) {
                        console.log('[ServiceWorker] 移除过时缓存', key);
                        return caches.delete(key);
                    }
                }));
            })
    );

    return self.clients.claim();
});

/* 返回缓存响应 */
self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] 获取', e.request.url);
    let dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        e.respondWith(
            caches.open(dataCacheName)
                .then(function (cache) {
                    return fetch(e.request)
                        .then(function (response) {
                            cache.put(e.request.url, response.clone());
                            return response;
                        });
                })
        );
    } else {
        /*
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request)
                .then(function (response) {
                    return response || fetch(e.request);
                })
        );
    }
});














