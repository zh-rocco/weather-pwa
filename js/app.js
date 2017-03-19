(function () {
    'use strict';

    let app = {
        isLoading: true,
        visibleCards: {},
        selectedCities: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        daysOfWeek: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    };


    /*****************************************************************************
     *
     * 为页面上的按钮添加事件：
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        /*刷新所有的天气预报*/
        app.updateForecasts();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        /*打开 添加新城市弹窗*/
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {
        /*添加新选中的城市*/
        let select = document.getElementById('selectCityToAdd');
        let selected = select.options[select.selectedIndex];
        let key = selected.value;
        let label = selected.textContent;

        /*初始化 app.selectedCities 数组*/
        if (!app.selectedCities) {
            app.selectedCities = [];
        }

        /*将选中的城市 push 到 app.selectedCities 数组*/
        console.log('from butAddCity');
        app.getForecast(key, label);
        app.selectedCities.push({key: key, label: label});
        app.saveSelectedCities();

        /*关闭弹窗*/
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        /*关闭弹窗*/
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * 更新界面：
     *
     ****************************************************************************/

    /* 显示/隐藏 添加新城市弹窗 */
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    /* 更新天气卡片数据。如果卡片不存在，先克隆模板 app.cardTemplate，在添加到页面 */
    app.updateForecastCard = function (data) {
        if (data) {
            let dataLastUpdated = new Date(data.created);
            let sunrise = data.channel.astronomy.sunrise;
            let sunset = data.channel.astronomy.sunset;
            let current = data.channel.item.condition;
            let humidity = data.channel.atmosphere.humidity;
            let wind = data.channel.wind;

            /*如果卡片不存在，从模板 app.cardTemplate 克隆，然后更新 app.visibleCards 数据*/
            let card = app.visibleCards[data.key];
            if (!card) {
                card = app.cardTemplate.cloneNode(true);
                card.classList.remove('cardTemplate');
                card.querySelector('.location').textContent = data.label;
                card.removeAttribute('hidden');
                app.container.appendChild(card);
                app.visibleCards[data.key] = card;
            }

            /*检验已经显示的 .card-last-updated 是否为最新数据，不是的话更新数据*/
            let cardLastUpdatedElem = card.querySelector('.card-last-updated');
            let cardLastUpdated = cardLastUpdatedElem.textContent;
            if (cardLastUpdated) {
                cardLastUpdated = new Date(cardLastUpdated);
                /*如果服务器有新的数据，就更新 .card-last-updated 显示的时间*/
                if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
                    return;
                }
            }
            cardLastUpdatedElem.textContent = data.created;

            /*将数据写入天气卡片*/
            card.querySelector('.description').textContent = current.text;
            card.querySelector('.date').textContent = current.date;
            card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
            card.querySelector('.current .temperature .value').textContent = app.temperatureF2C(current.temp);
            card.querySelector('.current .sunrise').textContent = sunrise;
            card.querySelector('.current .sunset').textContent = sunset;
            card.querySelector('.current .humidity').textContent = Math.round(humidity) + '%';
            card.querySelector('.current .wind .value').textContent = app.windMph2Ms(wind.speed);
            card.querySelector('.current .wind .direction').textContent = app.windDegree2Direction(wind.direction);
            let nextDays = card.querySelectorAll('.future .oneday');
            let today = new Date();
            today = today.getDay();
            for (let i = 0; i < 7; i++) {
                let nextDay = nextDays[i];
                let daily = data.channel.item.forecast[i];
                if (daily && nextDay) {
                    nextDay.querySelector('.date').textContent = app.daysOfWeek[(i + today) % 7];
                    nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
                    nextDay.querySelector('.temp-high .value').textContent = app.temperatureF2C(daily.high);
                    nextDay.querySelector('.temp-low .value').textContent = app.temperatureF2C(daily.low);
                }
            }
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /* 华氏度转摄氏度 */
    app.temperatureF2C = function (value) {
        return Math.round((value - 32) / 1.8)
    };

    /* 风力英里每小时（mph）转米每秒（m/s） */
    app.windMph2Ms = function (value) {
        return Math.round(value * 0.44704)
    };


    /* 风向度转方向 */
    app.windDegree2Direction = function (value) {
        let level = Math.floor(value / 22.5);
        switch (level) {
            case 0:
            case 15:
            case 16:
                return '北风';
            case 1:
            case 2:
                return '东北风';
            case 3:
            case 4:
                return '东风';
            case 5:
            case 6:
                return '东南风';
            case 7:
            case 8:
                return '东风';
            case 9:
            case 10:
                return '西南风';
            case 11:
            case 12:
                return '西风';
            case 13:
            case 14:
                return '西北风';
        }
    };


    /*****************************************************************************
     *
     * 获取天气数据：
     *
     ****************************************************************************/

    /*
     * 更新特定城市的天气预报。
     * getForecast()函数 首先检测天气数据是否被缓存了，如果是就用缓存中的数据更新天气卡片，然后 getForecast()函数 从服务器端获取数据。
     * 如果服务器返回新数据，就再跟新天气卡片。
     */
    app.getForecast = function (key, label) {
        let statement = 'select * from weather.forecast where woeid=' + key;
        let url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' + statement;

        /*缓存逻辑*/
        if ('caches' in window) {
            /*
             * 检查 service worker 是否已缓存此城市的天气数据。
             * 如果 service worker 有数据，则在应用程序获取最新数据时显示缓存的数据。
             */
            caches.match(url).then(function (response) {
                if (response) {
                    response.json()
                        .then(function updateFromCache(json) {
                            let results = json.query.results;
                            results.key = key;
                            results.label = label;
                            results.created = json.query.created;
                            app.updateForecastCard(results);
                        });
                }
            });
        }

        /*从雅虎服务器获取最新的数据*/
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    let response = JSON.parse(request.response);
                    let results = response.query.results;
                    results.key = key;
                    results.label = label;
                    results.created = response.query.created;
                    app.updateForecastCard(results);
                }
            } else {
                app.updateForecastCard();
            }
        };
        request.open('GET', url);
        request.send();
    };

    /* 遍历所有的天气卡片，然后获取最新天气预报 */
    app.updateForecasts = function () {
        let keys = Object.keys(app.visibleCards);
        keys.forEach(function (key) {
            app.getForecast(key);
        });
    };

    /* 将城市列表存入 localStorage */
    app.saveSelectedCities = function () {
        localStorage.selectedCities = JSON.stringify(app.selectedCities);
    };

    /* 根据 weatherCode 生成天气 */
    app.getIconClass = function (weatherCode) {
        // Weather codes: https://developer.yahoo.com/weather/documentation.html#codes
        weatherCode = parseInt(weatherCode);
        switch (weatherCode) {
            case 25: // cold
            case 32: // sunny
            case 33: // fair (night)
            case 34: // fair (day)
            case 36: // hot
            case 3200: // not available
                return 'clear-day';
            case 0: // tornado
            case 1: // tropical storm
            case 2: // hurricane
            case 6: // mixed rain and sleet
            case 8: // freezing drizzle
            case 9: // drizzle
            case 10: // freezing rain
            case 11: // showers
            case 12: // showers
            case 17: // hail
            case 35: // mixed rain and hail
            case 40: // scattered showers
                return 'rain';
            case 3: // severe thunderstorms
            case 4: // thunderstorms
            case 37: // isolated thunderstorms
            case 38: // scattered thunderstorms
            case 39: // scattered thunderstorms (not a typo)
            case 45: // thundershowers
            case 47: // isolated thundershowers
                return 'thunderstorms';
            case 5: // mixed rain and snow
            case 7: // mixed snow and sleet
            case 13: // snow flurries
            case 14: // light snow showers
            case 16: // snow
            case 18: // sleet
            case 41: // heavy snow
            case 42: // scattered snow showers
            case 43: // heavy snow
            case 46: // snow showers
                return 'snow';
            case 15: // blowing snow
            case 19: // dust
            case 20: // foggy
            case 21: // haze
            case 22: // smoky
                return 'fog';
            case 24: // windy
            case 23: // blustery
                return 'windy';
            case 26: // cloudy
            case 27: // mostly cloudy (night)
            case 28: // mostly cloudy (day)
            case 31: // clear (night)
                return 'cloudy';
            case 29: // partly cloudy (night)
            case 30: // partly cloudy (day)
            case 44: // partly cloudy
                return 'partly-cloudy-day';
        }
    };


    /****************************************************************************
     *
     * 以下是用来启动应用的代码
     *
     * 注意: 为了简化入门指南, 我使用了 localStorage。
     *   localStorage 是一个同步的 API，有严重的性能问题。它不应该被用于生产环节的应用中！
     *   应该考虑使用, IDB (https://www.npmjs.com/package/idb) 或者
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     *
     ****************************************************************************/

    if (localStorage.selectedCities) {
        app.selectedCities = JSON.parse(localStorage.selectedCities);
        app.selectedCities.forEach(function (city) {
            console.log('***** 1 *****');
            app.getForecast(city.key, city.label);
        });
    } else {
        app.getForecast(2151330, '北京');
        app.selectedCities.push({key: 2151330, label: '北京'});
        app.saveSelectedCities();
    }

    /*
     * 注册 Service Worker
     * 附加：
     * Chrome 输入 chrome://inspect/#service-workers 可以查看 Service Worker 是否已启用
     * Chrome 输入 chrome://serviceworker-internals 可以查看 Service Worker 详情
     */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('../service-worker.js')
            .then(function (registration) {
                console.log('Service Worker 注册成功，域名: ', registration.scope);
            })
            .catch(function (err) {
                console.log('Service Worker 注册失败: ', err);
            });

    }
})();
