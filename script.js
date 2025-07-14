document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const stationListDiv = document.getElementById('station-list');
    const trainListDiv = document.getElementById('train-list');
    const suspensionListDiv = document.getElementById('suspension-list');
    const currentTimeDiv = document.getElementById('current-time');
    const announcementsDiv = document.getElementById('announcements-board');
    const tooltip = document.getElementById('tooltip');
    const legendWaitingIcon = document.querySelector('.legend-icon.waiting');
    const legendUpIcon = document.querySelector('.legend-icon.up');
    const legendDownIcon = document.querySelector('.legend-icon.down');
    const legendStoppedIcon = document.querySelector('.legend-icon.stopped');

    // 画像パスの定義
    const imagePaths = {
        up: 'images/up_arrow.png',
        down: 'images/down_arrow.png',
        waiting: 'images/waiting_icon.png',
        stopped: 'images/stopped_icon.png',
        info: 'images/info_icon.png',
        suspended_info: 'images/suspended_info.png',
        // 遅延時および代行輸送の方向別画像を追加
        delayed_up: 'images/delayed_up_arrow.png',
        delayed_down: 'images/delayed_down_arrow.png',
        substitute_up: 'images/substitute_up_bus.png',
        substitute_down: 'images/substitute_down_bus.png'
    };

    // 凡例アイコンを画像に置き換え
    legendUpIcon.innerHTML = `<img src="${imagePaths.up}" alt="上り" style="width: 20px; height: 20px;">`;
    legendDownIcon.innerHTML = `<img src="${imagePaths.down}" alt="下り" style="width: 20px; height: 20px;">`;
    legendWaitingIcon.innerHTML = `<img src="${imagePaths.waiting}" alt="停車中(定刻)" style="width: 20px; height: 20px;">`;
    legendStoppedIcon.innerHTML = `<img src="${imagePaths.stopped}" alt="停車中(支障)" style="width: 20px; height: 20px;">`;


    // --- データ定義 ---
    const announcements = [
        // type: 'info' は一般的なお知らせ、'suspended' は運休に関するお知らせ
        // {id: 'info1', type: 'info', message: '2時55分~3時06分の間は、梅ケ峠～小串駅間で、データ試験用列車が運行中です。' },
        {id: 'info2', type: 'info', message:"この走行位置は2025年度改正のダイヤに準拠しています。"},
        {id: 'info3', type: 'info', message:'遅延情報は、複数列車が10分以上遅延したときに反映されます。'},
        //{id: 'suspended1', type: 'suspended', message: '大雨による土砂災害のため、梅ヶ峠～小串駅間で終日運転を見合わせています。'} // 運休お知らせの例
    ];
    const operationalIssues = [
        //{ trainId: '825D', stationId: 6, reason: '信号確認のため停車中です。' }
    ];
    const suspendedSections = [
        //{ fromStationId: 7, toStationId: 10, reason: '大雨による土砂災害のため、梅ヶ峠～小串駅間で終日運転を見合わせています。' },
        //{ fromStationId: 2, toStationId: 4, reason: '線路保守工事のため、9時～17時の間、綾羅木～安岡駅間で運転を見合わせます。', startTime: '09:00', endTime: '17:00' }
    ];
const stations = [
    { id: 0, name: '下関' }, { id: 1, name: '幡生' }, { id: 2, name: '綾羅木' }, { id: 3, name: '梶栗郷台地' }, { id: 4, name: '安岡' }, { id: 5, name: '福江' }, { id: 6, name: '吉見' }, { id: 7, name: '梅ヶ峠' }, { id: 8, name: '黒井村' }, { id: 9, name: '川棚温泉' }, { id: 10, name: '小串' }, { id: 11, name: '湯玉' }, { id: 12, name: '宇賀本郷' }, { id: 13, name: '長門二見' }, { id: 14, name: '滝部' }
];

// 列車時刻表データ (平日・全データ・発着時刻形式)
const trainSchedules = [
    /// Takibe to Shimonoseki

    {"trainId":"821R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"06:35"},{"stationId":13,"arrival":"06:42","departure":"06:43"},{"stationId":12,"arrival":"06:47","departure":"06:48"},{"stationId":11,"arrival":"06:51","departure":"06:52"},{"stationId":10,"arrival":"07:00"}]},
    {"trainId":"823R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"06:57"},{"stationId":13,"arrival":"07:04","departure":"07:05"},{"stationId":12,"arrival":"07:09","departure":"07:10"},{"stationId":11,"arrival":"07:13","departure":"07:14"},{"stationId":10,"arrival":"07:22"}]},
    {"trainId":"1825D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"06:58"},{"stationId":9,"arrival":"07:05","departure":"07:06"},{"stationId":8,"arrival":"07:13","departure":"07:14"},{"stationId":7,"arrival":"07:17","departure":"07:18"},{"stationId":6,"arrival":"07:25","departure":"07:26"},{"stationId":5,"arrival":"07:34","departure":"07:35"},{"stationId":4,"arrival":"07:38","departure":"07:39"},{"stationId":3,"arrival":"07:44","departure":"07:45"},{"stationId":2,"arrival":"07:49","departure":"07:50"},{"stationId":1,"arrival":"07:55","departure":"07:56"},{"stationId":0,"arrival":"07:59"}]},
    {"trainId":"825D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"08:00"},{"stationId":13,"arrival":"08:07","departure":"08:08"},{"stationId":12,"arrival":"08:15","departure":"08:16"},{"stationId":11,"arrival":"08:19","departure":"08:20"},{"stationId":10,"arrival":"08:26","departure":"08:27"},{"stationId":9,"arrival":"08:36","departure":"08:37"},{"stationId":8,"arrival":"08:41","departure":"08:42"},{"stationId":7,"arrival":"08:46","departure":"08:47"},{"stationId":6,"arrival":"08:51","departure":"08:52"},{"stationId":5,"arrival":"08:55","departure":"08:56"},{"stationId":4,"arrival":"08:59","departure":"09:00"},{"stationId":3,"arrival":"09:03","departure":"09:04"},{"stationId":2,"arrival":"09:06","departure":"09:07"},{"stationId":1,"arrival":"09:11","departure":"09:12"},{"stationId":0,"arrival":"09:17"}]},
    {"trainId":"1827R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"08:18"},{"stationId":13,"arrival":"08:25","departure":"08:26"},{"stationId":12,"arrival":"08:30","departure":"08:31"},{"stationId":11,"arrival":"08:34","departure":"08:35"},{"stationId":10,"arrival":"08:43"}]},
    {"trainId":"1829D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"08:46"},{"stationId":13,"arrival":"08:54","departure":"08:55"},{"stationId":12,"arrival":"09:01","departure":"09:02"},{"stationId":11,"arrival":"09:05","departure":"09:06"},{"stationId":10,"arrival":"09:13","departure":"09:14"},{"stationId":9,"arrival":"09:18","departure":"09:19"},{"stationId":8,"arrival":"09:22","departure":"09:23"},{"stationId":7,"arrival":"09:27","departure":"09:28"},{"stationId":6,"arrival":"09:33","departure":"09:34"},{"stationId":5,"arrival":"09:37","departure":"09:38"},{"stationId":4,"arrival":"09:41","departure":"09:42"},{"stationId":3,"arrival":"09:44","departure":"09:45"},{"stationId":2,"arrival":"09:47","departure":"09:48"},{"stationId":1,"arrival":"09:52","departure":"09:53"},{"stationId":0,"arrival":"09:59"}]},
    {"trainId":"1831R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"09:11"},{"stationId":13,"arrival":"09:18","departure":"09:19"},{"stationId":12,"arrival":"09:23","departure":"09:24"},{"stationId":11,"arrival":"09:27","departure":"09:28"},{"stationId":10,"arrival":"09:36"}]},
    {"trainId":"1833R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"11:33"},{"stationId":13,"arrival":"11:40","departure":"11:41"},{"stationId":12,"arrival":"11:45","departure":"11:46"},{"stationId":11,"arrival":"11:49","departure":"11:50"},{"stationId":10,"arrival":"11:58"}]},
    {"trainId":"1835R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"13:13"},{"stationId":13,"arrival":"13:20","departure":"13:21"},{"stationId":12,"arrival":"13:25","departure":"13:26"},{"stationId":11,"arrival":"13:29","departure":"13:30"},{"stationId":10,"arrival":"13:38"}]},
    {"trainId":"1837R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"14:24"},{"stationId":13,"arrival":"14:31","departure":"14:32"},{"stationId":12,"arrival":"14:36","departure":"14:37"},{"stationId":11,"arrival":"14:40","departure":"14:41"},{"stationId":10,"arrival":"14:49"}]},
    {"trainId":"837D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"16:09"},{"stationId":13,"arrival":"16:17","departure":"16:18"},{"stationId":12,"arrival":"16:24","departure":"16:25"},{"stationId":11,"arrival":"16:28","departure":"16:29"},{"stationId":10,"arrival":"16:36","departure":"16:37"},{"stationId":9,"arrival":"16:41","departure":"16:42"},{"stationId":8,"arrival":"16:45","departure":"16:46"},{"stationId":7,"arrival":"16:50","departure":"16:51"},{"stationId":6,"arrival":"16:55","departure":"16:56"},{"stationId":5,"arrival":"17:00","departure":"17:01"},{"stationId":4,"arrival":"17:04","departure":"17:05"},{"stationId":3,"arrival":"17:09","departure":"17:10"},{"stationId":2,"arrival":"17:12","departure":"17:13"},{"stationId":1,"arrival":"17:17","departure":"17:18"},{"stationId":0,"arrival":"17:25"}]},
    {"trainId":"1839R","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":4,"departure":"16:45"},{"stationId":3,"arrival":"16:52","departure":"16:53"},{"stationId":2,"arrival":"16:57","departure":"16:58"},{"stationId":1,"arrival":"17:01","departure":"17:02"},{"stationId":0,"arrival":"17:10"}]},
    {"trainId":"839D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"17:29"},{"stationId":13,"arrival":"17:36","departure":"17:37"},{"stationId":12,"arrival":"17:44","departure":"17:45"},{"stationId":11,"arrival":"17:48","departure":"17:49"},{"stationId":10,"arrival":"17:55","departure":"17:56"},{"stationId":9,"arrival":"18:00","departure":"18:01"},{"stationId":8,"arrival":"18:04","departure":"18:05"},{"stationId":7,"arrival":"18:10","departure":"18:11"},{"stationId":6,"arrival":"18:15","departure":"18:16"},{"stationId":5,"arrival":"18:19","departure":"18:20"},{"stationId":4,"arrival":"18:23","departure":"18:24"},{"stationId":3,"arrival":"18:26","departure":"18:27"},{"stationId":2,"arrival":"18:29","departure":"18:30"},{"stationId":1,"arrival":"18:34","departure":"18:35"},{"stationId":0,"arrival":"18:40"}]},
    {"trainId":"1841R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"17:55"},{"stationId":13,"arrival":"18:02","departure":"18:03"},{"stationId":12,"arrival":"18:07","departure":"18:08"},{"stationId":11,"arrival":"18:11","departure":"18:12"},{"stationId":10,"arrival":"18:20"}]},
    {"trainId":"1843D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"19:10"},{"stationId":13,"arrival":"19:17","departure":"19:18"},{"stationId":12,"arrival":"19:25","departure":"19:26"},{"stationId":11,"arrival":"19:29","departure":"19:30"},{"stationId":10,"arrival":"19:36","departure":"19:37"},{"stationId":9,"arrival":"19:41","departure":"19:42"},{"stationId":8,"arrival":"19:44","departure":"19:45"},{"stationId":7,"arrival":"19:50","departure":"19:51"},{"stationId":6,"arrival":"19:55","departure":"19:56"},{"stationId":5,"arrival":"19:59","departure":"20:00"},{"stationId":4,"arrival":"20:03","departure":"20:04"},{"stationId":3,"arrival":"20:06","departure":"20:07"},{"stationId":2,"arrival":"20:09","departure":"20:10"},{"stationId":1,"arrival":"20:14","departure":"20:15"},{"stationId":0,"arrival":"20:20"}]},
    {"trainId":"843R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"19:35"},{"stationId":13,"arrival":"19:42","departure":"19:43"},{"stationId":12,"arrival":"19:47","departure":"19:48"},{"stationId":11,"arrival":"19:51","departure":"19:52"},{"stationId":10,"arrival":"20:00"}]},
    {"trainId":"1845D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"20:39"},{"stationId":13,"arrival":"20:46","departure":"20:47"},{"stationId":12,"arrival":"20:55","departure":"20:56"},{"stationId":11,"arrival":"20:59","departure":"21:00"},{"stationId":10,"arrival":"21:06","departure":"21:07"},{"stationId":9,"arrival":"21:14","departure":"21:15"},{"stationId":8,"arrival":"21:17","departure":"21:18"},{"stationId":7,"arrival":"21:23","departure":"21:24"},{"stationId":6,"arrival":"21:28","departure":"21:29"},{"stationId":5,"arrival":"21:37","departure":"21:38"},{"stationId":4,"arrival":"21:41","departure":"21:42"},{"stationId":3,"arrival":"21:43","departure":"21:44"},{"stationId":2,"arrival":"21:46","departure":"21:47"},{"stationId":1,"arrival":"21:51","departure":"21:52"},{"stationId":0,"arrival":"21:57"}]},
    {"trainId":"1847R","type":"代行輸送","direction":"down","destination":"小串","delayMinutes":0,"timetable":[{"stationId":14,"departure":"21:15"},{"stationId":13,"arrival":"21:22","departure":"21:23"},{"stationId":12,"arrival":"21:27","departure":"21:28"},{"stationId":11,"arrival":"21:31","departure":"21:32"},{"stationId":10,"arrival":"21:40"}]},
    {"trainId":"1849D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":14,"departure":"21:58"},{"stationId":13,"arrival":"22:06","departure":"22:07"},{"stationId":12,"arrival":"22:14","departure":"22:15"},{"stationId":11,"arrival":"22:19","departure":"22:20"},{"stationId":10,"arrival":"22:26","departure":"22:27"},{"stationId":9,"arrival":"22:31","departure":"22:32"},{"stationId":8,"arrival":"22:34","departure":"22:35"},{"stationId":7,"arrival":"22:40","departure":"22:41"},{"stationId":6,"arrival":"22:45","departure":"22:46"},{"stationId":5,"arrival":"22:49","departure":"22:50"},{"stationId":4,"arrival":"22:53","departure":"22:54"},{"stationId":3,"arrival":"22:56","departure":"22:57"},{"stationId":2,"arrival":"22:59","departure":"23:00"},{"stationId":1,"arrival":"23:04","departure":"23:05"},{"stationId":0,"arrival":"23:10"}]},


    ///kogushi to Shimonoseki

    {"trainId":"420D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"05:45"},{"stationId":9,"arrival":"05:49","departure":"05:50"},{"stationId":8,"arrival":"05:52","departure":"05:53"},{"stationId":7,"arrival":"05:58","departure":"05:59"},{"stationId":6,"arrival":"06:03","departure":"06:04"},{"stationId":5,"arrival":"06:08","departure":"06:09"},{"stationId":4,"arrival":"06:12","departure":"06:13"},{"stationId":3,"arrival":"06:14","departure":"06:15"},{"stationId":2,"arrival":"06:17","departure":"06:18"},{"stationId":1,"arrival":"06:22","departure":"06:23"},{"stationId":0,"arrival":"06:28"}]},
    {"trainId":"426D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"06:28"},{"stationId":9,"arrival":"06:32","departure":"06:33"},{"stationId":8,"arrival":"06:36","departure":"06:37"},{"stationId":7,"arrival":"06:41","departure":"06:42"},{"stationId":6,"arrival":"06:47","departure":"06:48"},{"stationId":5,"arrival":"06:51","departure":"06:52"},{"stationId":4,"arrival":"06:55","departure":"06:56"},{"stationId":3,"arrival":"06:58","departure":"06:59"},{"stationId":2,"arrival":"07:01","departure":"07:02"},{"stationId":1,"arrival":"07:06","departure":"07:07"},{"stationId":0,"arrival":"07:13"}]},
    {"trainId":"429D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"06:46"},{"stationId":9,"arrival":"06:50","departure":"06:51"},{"stationId":8,"arrival":"06:54","departure":"06:55"},{"stationId":7,"arrival":"07:00","departure":"07:01"},{"stationId":6,"arrival":"07:05","departure":"07:06"},{"stationId":5,"arrival":"07:12","departure":"07:13"},{"stationId":4,"arrival":"07:16","departure":"07:17"},{"stationId":3,"arrival":"07:20","departure":"07:21"},{"stationId":2,"arrival":"07:23","departure":"07:24"},{"stationId":1,"arrival":"07:28","departure":"07:29"},{"stationId":0,"arrival":"07:35"}]},
    {"trainId":"435D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"07:54"},{"stationId":9,"arrival":"07:58","departure":"07:59"},{"stationId":8,"arrival":"08:02","departure":"08:03"},{"stationId":7,"arrival":"08:07","departure":"08:08"},{"stationId":6,"arrival":"08:13","departure":"08:14"},{"stationId":5,"arrival":"08:17","departure":"08:18"},{"stationId":4,"arrival":"08:21","departure":"08:22"},{"stationId":3,"arrival":"08:25","departure":"08:26"},{"stationId":2,"arrival":"08:28","departure":"08:29"},{"stationId":1,"arrival":"08:33","departure":"08:34"},{"stationId":0,"arrival":"08:42"}]},
    {"trainId":"437D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"09:53"},{"stationId":9,"arrival":"09:57","departure":"09:58"},{"stationId":8,"arrival":"10:01","departure":"10:02"},{"stationId":7,"arrival":"10:06","departure":"10:07"},{"stationId":6,"arrival":"10:11","departure":"10:12"},{"stationId":5,"arrival":"10:16","departure":"10:17"},{"stationId":4,"arrival":"10:20","departure":"10:21"},{"stationId":3,"arrival":"10:23","departure":"10:24"},{"stationId":2,"arrival":"10:26","departure":"10:27"},{"stationId":1,"arrival":"10:31","departure":"10:32"},{"stationId":0,"arrival":"10:37"}]},
    {"trainId":"439D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"11:02"},{"stationId":9,"arrival":"11:06","departure":"11:07"},{"stationId":8,"arrival":"11:10","departure":"11:11"},{"stationId":7,"arrival":"11:15","departure":"11:16"},{"stationId":6,"arrival":"11:20","departure":"11:21"},{"stationId":5,"arrival":"11:25","departure":"11:26"},{"stationId":4,"arrival":"11:29","departure":"11:30"},{"stationId":3,"arrival":"11:31","departure":"11:32"},{"stationId":2,"arrival":"11:34","departure":"11:35"},{"stationId":1,"arrival":"11:39","departure":"11:40"},{"stationId":0,"arrival":"11:45"}]},
    {"trainId":"441D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"12:11"},{"stationId":9,"arrival":"12:15","departure":"12:16"},{"stationId":8,"arrival":"12:18","departure":"12:19"},{"stationId":7,"arrival":"12:24","departure":"12:25"},{"stationId":6,"arrival":"12:29","departure":"12:30"},{"stationId":5,"arrival":"12:34","departure":"12:35"},{"stationId":4,"arrival":"12:38","departure":"12:39"},{"stationId":3,"arrival":"12:41","departure":"12:42"},{"stationId":2,"arrival":"12:44","departure":"12:45"},{"stationId":1,"arrival":"12:49","departure":"12:50"},{"stationId":0,"arrival":"12:54"}]},
    {"trainId":"443D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"13:19"},{"stationId":9,"arrival":"13:23","departure":"13:24"},{"stationId":8,"arrival":"13:27","departure":"13:28"},{"stationId":7,"arrival":"13:32","departure":"13:33"},{"stationId":6,"arrival":"13:37","departure":"13:38"},{"stationId":5,"arrival":"13:42","departure":"13:43"},{"stationId":4,"arrival":"13:46","departure":"13:47"},{"stationId":3,"arrival":"13:49","departure":"13:50"},{"stationId":2,"arrival":"13:52","departure":"13:53"},{"stationId":1,"arrival":"13:57","departure":"13:58"},{"stationId":0,"arrival":"14:06"}]},
    {"trainId":"445D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"14:20"},{"stationId":9,"arrival":"14:24","departure":"14:25"},{"stationId":8,"arrival":"14:28","departure":"14:29"},{"stationId":7,"arrival":"14:33","departure":"14:34"},{"stationId":6,"arrival":"14:38","departure":"14:39"},{"stationId":5,"arrival":"14:42","departure":"14:43"},{"stationId":4,"arrival":"14:46","departure":"14:47"},{"stationId":3,"arrival":"14:49","departure":"14:50"},{"stationId":2,"arrival":"14:52","departure":"14:53"},{"stationId":1,"arrival":"14:57","departure":"14:58"},{"stationId":0,"arrival":"15:03"}]},
    {"trainId":"447D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"15:25"},{"stationId":9,"arrival":"15:29","departure":"15:30"},{"stationId":8,"arrival":"15:33","departure":"15:34"},{"stationId":7,"arrival":"15:38","departure":"15:39"},{"stationId":6,"arrival":"15:43","departure":"15:44"},{"stationId":5,"arrival":"15:48","departure":"15:49"},{"stationId":4,"arrival":"15:52","departure":"15:53"},{"stationId":3,"arrival":"15:55","departure":"15:56"},{"stationId":2,"arrival":"15:58","departure":"15:59"},{"stationId":1,"arrival":"16:03","departure":"16:04"},{"stationId":0,"arrival":"16:09"}]},
    {"trainId":"449D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"17:18"},{"stationId":9,"arrival":"17:21","departure":"17:22"},{"stationId":8,"arrival":"17:25","departure":"17:26"},{"stationId":7,"arrival":"17:31","departure":"17:32"},{"stationId":6,"arrival":"17:36","departure":"17:37"},{"stationId":5,"arrival":"17:40","departure":"17:41"},{"stationId":4,"arrival":"17:44","departure":"17:45"},{"stationId":3,"arrival":"17:47","departure":"17:48"},{"stationId":2,"arrival":"17:50","departure":"17:51"},{"stationId":1,"arrival":"17:55","departure":"17:56"},{"stationId":0,"arrival":"18:02"}]},
    {"trainId":"451D","type":"普通","direction":"down","destination":"下関","delayMinutes":0,"timetable":[{"stationId":10,"departure":"18:34"},{"stationId":9,"arrival":"18:38","departure":"18:39"},{"stationId":8,"arrival":"18:42","departure":"18:43"},{"stationId":7,"arrival":"18:47","departure":"18:48"},{"stationId":6,"arrival":"18:52","departure":"18:53"},{"stationId":5,"arrival":"18:57","departure":"18:58"},{"stationId":4,"arrival":"19:01","departure":"19:02"},{"stationId":3,"arrival":"19:04","departure":"19:05"},{"stationId":2,"arrival":"19:07","departure":"19:08"},{"stationId":1,"arrival":"19:12","departure":"19:13"},{"stationId":0,"arrival":"19:18"}]},

    //Shimonoseki to Kogushi-Takibe
    {"trainId":"1820D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"05:40"},{"stationId":1,"arrival":"05:44","departure":"05:45"},{"stationId":2,"arrival":"05:49","departure":"05:50"},{"stationId":3,"arrival":"05:52","departure":"05:53"},{"stationId":4,"arrival":"05:55","departure":"05:56"},{"stationId":5,"arrival":"05:59","departure":"06:00"},{"stationId":6,"arrival":"06:03","departure":"06:04"},{"stationId":7,"arrival":"06:09","departure":"06:10"},{"stationId":8,"arrival":"06:14","departure":"06:15"},{"stationId":9,"arrival":"06:18","departure":"06:19"},{"stationId":10,"arrival":"06:22","departure":"06:23"},{"stationId":11,"arrival":"06:30","departure":"06:31"},{"stationId":12,"arrival":"06:35","departure":"06:36"},{"stationId":13,"arrival":"06:43","departure":"06:44"},{"stationId":14,"arrival":"06:51"}]},
    {"trainId":"1822D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"06:40"},{"stationId":1,"arrival":"06:45","departure":"06:46"},{"stationId":2,"arrival":"06:49","departure":"06:50"},{"stationId":3,"arrival":"06:52","departure":"06:53"},{"stationId":4,"arrival":"06:55","departure":"06:56"},{"stationId":5,"arrival":"07:01","departure":"07:02"},{"stationId":6,"arrival":"07:05","departure":"07:06"},{"stationId":7,"arrival":"07:11","departure":"07:12"},{"stationId":8,"arrival":"07:16","departure":"07:17"},{"stationId":9,"arrival":"07:20","departure":"07:21"},{"stationId":10,"arrival":"07:24","departure":"07:25"},{"stationId":11,"arrival":"07:32","departure":"07:33"},{"stationId":12,"arrival":"07:36","departure":"07:37"},{"stationId":13,"arrival":"07:44","departure":"07:45"},{"stationId":14,"arrival":"07:53"}]},
    {"trainId":"822D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"07:01"},{"stationId":1,"arrival":"07:05","departure":"07:06"},{"stationId":2,"arrival":"07:11","departure":"07:12"},{"stationId":3,"arrival":"07:14","departure":"07:15"},{"stationId":4,"arrival":"07:17","departure":"07:18"},{"stationId":5,"arrival":"07:22","departure":"07:23"},{"stationId":6,"arrival":"07:27","departure":"07:28"},{"stationId":7,"arrival":"07:33","departure":"07:34"},{"stationId":8,"arrival":"07:38","departure":"07:39"},{"stationId":9,"arrival":"07:42","departure":"07:43"},{"stationId":10,"arrival":"07:47"}]},
    {"trainId":"1824D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"07:26"},{"stationId":1,"arrival":"07:30","departure":"07:31"},{"stationId":2,"arrival":"07:35","departure":"07:36"},{"stationId":3,"arrival":"07:38","departure":"07:39"},{"stationId":4,"arrival":"07:41","departure":"07:42"},{"stationId":5,"arrival":"07:45","departure":"07:46"},{"stationId":6,"arrival":"07:50","departure":"07:51"},{"stationId":7,"arrival":"07:56","departure":"07:57"},{"stationId":8,"arrival":"08:01","departure":"08:02"},{"stationId":9,"arrival":"08:06","departure":"08:07"},{"stationId":10,"arrival":"08:10","departure":"08:11"},{"stationId":11,"arrival":"08:19","departure":"08:20"},{"stationId":12,"arrival":"08:23","departure":"08:24"},{"stationId":13,"arrival":"08:31","departure":"08:32"},{"stationId":14,"arrival":"08:39"}]},
    {"trainId":"1826D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"08:05"},{"stationId":1,"arrival":"08:10","departure":"08:11"},{"stationId":2,"arrival":"08:15","departure":"08:16"},{"stationId":3,"arrival":"08:18","departure":"08:19"},{"stationId":4,"arrival":"08:21","departure":"08:22"},{"stationId":5,"arrival":"08:26","departure":"08:27"},{"stationId":6,"arrival":"08:30","departure":"08:31"},{"stationId":7,"arrival":"08:36","departure":"08:37"},{"stationId":8,"arrival":"08:41","departure":"08:42"},{"stationId":9,"arrival":"08:45","departure":"08:46"},{"stationId":10,"arrival":"08:50"}]},
    {"trainId":"824D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"08:40"},{"stationId":1,"arrival":"08:45","departure":"08:46"},{"stationId":2,"arrival":"08:54","departure":"08:55"},{"stationId":3,"arrival":"08:57","departure":"08:58"},{"stationId":4,"arrival":"09:00","departure":"09:01"},{"stationId":5,"arrival":"09:04","departure":"09:05"},{"stationId":6,"arrival":"09:08","departure":"09:09"},{"stationId":7,"arrival":"09:14","departure":"09:15"},{"stationId":8,"arrival":"09:19","departure":"09:20"},{"stationId":9,"arrival":"09:26","departure":"09:27"},{"stationId":10,"arrival":"09:31"}]},
    {"trainId":"828D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"09:48"},{"stationId":1,"arrival":"09:52","departure":"09:53"},{"stationId":2,"arrival":"09:57","departure":"09:58"},{"stationId":3,"arrival":"10:00","departure":"10:01"},{"stationId":4,"arrival":"10:03","departure":"10:04"},{"stationId":5,"arrival":"10:07","departure":"10:08"},{"stationId":6,"arrival":"10:11","departure":"10:12"},{"stationId":7,"arrival":"10:17","departure":"10:18"},{"stationId":8,"arrival":"10:22","departure":"10:23"},{"stationId":9,"arrival":"10:26","departure":"10:27"},{"stationId":10,"arrival":"10:30"}]},
    {"trainId":"1830D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"10:36"},{"stationId":1,"arrival":"10:41","departure":"10:42"},{"stationId":2,"arrival":"10:46","departure":"10:47"},{"stationId":3,"arrival":"10:49","departure":"10:50"},{"stationId":4,"arrival":"10:51","departure":"10:52"},{"stationId":5,"arrival":"10:55","departure":"10:56"},{"stationId":6,"arrival":"11:00","departure":"11:01"},{"stationId":7,"arrival":"11:05","departure":"11:06"},{"stationId":8,"arrival":"11:10","departure":"11:11"},{"stationId":9,"arrival":"11:14","departure":"11:15"},{"stationId":10,"arrival":"11:18"}]},
    {"trainId":"1826D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"08:05"},{"stationId":1,"arrival":"08:10","departure":"08:11"},{"stationId":2,"arrival":"08:15","departure":"08:16"},{"stationId":3,"arrival":"08:18","departure":"08:19"},{"stationId":4,"arrival":"08:21","departure":"08:22"},{"stationId":5,"arrival":"08:26","departure":"08:27"},{"stationId":6,"arrival":"08:30","departure":"08:31"},{"stationId":7,"arrival":"08:36","departure":"08:37"},{"stationId":8,"arrival":"08:41","departure":"08:42"},{"stationId":9,"arrival":"08:45","departure":"08:46"},{"stationId":10,"arrival":"08:50"}]},
    {"trainId":"830D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"13:14"},{"stationId":1,"arrival":"13:18","departure":"13:19"},{"stationId":2,"arrival":"13:24","departure":"13:25"},{"stationId":3,"arrival":"13:26","departure":"13:27"},{"stationId":4,"arrival":"13:29","departure":"13:30"},{"stationId":5,"arrival":"13:33","departure":"13:34"},{"stationId":6,"arrival":"13:37","departure":"13:38"},{"stationId":7,"arrival":"13:43","departure":"13:44"},{"stationId":8,"arrival":"13:48","departure":"13:49"},{"stationId":9,"arrival":"13:52","departure":"13:53"},{"stationId":10,"arrival":"13:57"}]},
    {"trainId":"1830D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"14:31"},{"stationId":1,"arrival":"14:36","departure":"14:37"},{"stationId":2,"arrival":"14:41","departure":"14:42"},{"stationId":3,"arrival":"14:43","departure":"14:44"},{"stationId":4,"arrival":"14:46","departure":"14:47"},{"stationId":5,"arrival":"14:50","departure":"14:51"},{"stationId":6,"arrival":"14:54","departure":"14:55"},{"stationId":7,"arrival":"15:00","departure":"15:01"},{"stationId":8,"arrival":"15:05","departure":"15:06"},{"stationId":9,"arrival":"15:09","departure":"15:10"},{"stationId":10,"arrival":"15:13","departure":"15:14"},{"stationId":11,"arrival":"15:41","departure":"15:42"},{"stationId":12,"arrival":"15:45","departure":"15:46"},{"stationId":13,"arrival":"15:53","departure":"15:54"},{"stationId":14,"arrival":"16:02"}]},
    {"trainId":"1832D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"15:37"},{"stationId":1,"arrival":"15:41","departure":"15:42"},{"stationId":2,"arrival":"15:46","departure":"15:47"},{"stationId":3,"arrival":"15:49","departure":"15:50"},{"stationId":4,"arrival":"15:52","departure":"15:53"},{"stationId":5,"arrival":"15:56","departure":"15:57"},{"stationId":6,"arrival":"16:00","departure":"16:01"},{"stationId":7,"arrival":"16:06","departure":"16:07"},{"stationId":8,"arrival":"16:11","departure":"16:12"},{"stationId":9,"arrival":"16:15","departure":"16:16"},{"stationId":10,"arrival":"16:19"}]},
    {"trainId":"830D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"16:11"},{"stationId":1,"arrival":"16:16","departure":"16:17"},{"stationId":2,"arrival":"16:21","departure":"16:22"},{"stationId":3,"arrival":"16:23","departure":"16:24"},{"stationId":4,"arrival":"16:26","departure":"16:27"},{"stationId":5,"arrival":"16:30","departure":"16:31"},{"stationId":6,"arrival":"16:34","departure":"16:35"},{"stationId":7,"arrival":"16:40","departure":"16:41"},{"stationId":8,"arrival":"16:45","departure":"16:46"},{"stationId":9,"arrival":"16:49","departure":"16:50"},{"stationId":10,"arrival":"16:53","departure":"16:54"},{"stationId":11,"arrival":"17:02","departure":"17:03"},{"stationId":12,"arrival":"17:06","departure":"17:07"},{"stationId":13,"arrival":"17:14","departure":"17:15"},{"stationId":14,"arrival":"17:22"}]},
    {"trainId":"1834D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"16:48"},{"stationId":1,"arrival":"16:53","departure":"16:54"},{"stationId":2,"arrival":"16:58","departure":"16:59"},{"stationId":3,"arrival":"17:01","departure":"17:02"},{"stationId":4,"arrival":"17:04","departure":"17:05"},{"stationId":5,"arrival":"17:08","departure":"17:09"},{"stationId":6,"arrival":"17:13","departure":"17:14"},{"stationId":7,"arrival":"17:18","departure":"17:19"},{"stationId":8,"arrival":"17:23","departure":"17:24"},{"stationId":9,"arrival":"17:29","departure":"17:30"},{"stationId":10,"arrival":"17:34"}]},
    {"trainId":"1836D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"16:11"},{"stationId":1,"arrival":"16:16","departure":"16:17"},{"stationId":2,"arrival":"16:21","departure":"16:22"},{"stationId":3,"arrival":"16:23","departure":"16:24"},{"stationId":4,"arrival":"16:26","departure":"16:27"},{"stationId":5,"arrival":"16:30","departure":"16:31"},{"stationId":6,"arrival":"16:34","departure":"16:35"},{"stationId":7,"arrival":"16:40","departure":"16:41"},{"stationId":8,"arrival":"16:45","departure":"16:46"},{"stationId":9,"arrival":"16:49","departure":"16:50"},{"stationId":10,"arrival":"16:53","departure":"16:54"},{"stationId":11,"arrival":"17:02","departure":"17:03"},{"stationId":12,"arrival":"17:06","departure":"17:07"},{"stationId":13,"arrival":"17:14","departure":"17:15"},{"stationId":14,"arrival":"17:22"}]},
    {"trainId":"1838D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"17:26"},{"stationId":1,"arrival":"17:30","departure":"17:31"},{"stationId":2,"arrival":"17:36","departure":"17:37"},{"stationId":3,"arrival":"17:39","departure":"17:40"},{"stationId":4,"arrival":"17:42","departure":"17:43"},{"stationId":5,"arrival":"17:48","departure":"17:49"},{"stationId":6,"arrival":"17:53","departure":"17:54"},{"stationId":7,"arrival":"17:56","departure":"17:57"},{"stationId":8,"arrival":"18:03","departure":"18:04"},{"stationId":9,"arrival":"18:08","departure":"18:09"},{"stationId":10,"arrival":"18:13","departure":"18:14"},{"stationId":11,"arrival":"18:21","departure":"18:22"},{"stationId":12,"arrival":"18:26","departure":"18:27"},{"stationId":13,"arrival":"18:34","departure":"18:35"},{"stationId":14,"arrival":"18:42"}]},
    {"trainId":"832D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"18:04"},{"stationId":1,"arrival":"18:09","departure":"18:10"},{"stationId":2,"arrival":"18:14","departure":"18:15"},{"stationId":3,"arrival":"18:17","departure":"18:18"},{"stationId":4,"arrival":"18:20","departure":"18:21"},{"stationId":5,"arrival":"18:27","departure":"18:28"},{"stationId":6,"arrival":"18:31","departure":"18:32"},{"stationId":7,"arrival":"18:37","departure":"18:38"},{"stationId":8,"arrival":"18:42","departure":"18:43"},{"stationId":9,"arrival":"18:46","departure":"18:47"},{"stationId":10,"arrival":"18:51"}]},
    {"trainId":"1840D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"18:39"},{"stationId":1,"arrival":"18:44","departure":"18:45"},{"stationId":2,"arrival":"18:52","departure":"18:53"},{"stationId":3,"arrival":"18:55","departure":"18:56"},{"stationId":4,"arrival":"18:59","departure":"19:00"},{"stationId":5,"arrival":"19:05","departure":"19:06"},{"stationId":6,"arrival":"19:09","departure":"19:10"},{"stationId":7,"arrival":"19:15","departure":"19:16"},{"stationId":8,"arrival":"19:20","departure":"19:21"},{"stationId":9,"arrival":"19:23","departure":"19:24"},{"stationId":10,"arrival":"19:28","departure":"19:29"},{"stationId":11,"arrival":"19:44","departure":"19:45"},{"stationId":12,"arrival":"19:49","departure":"19:50"},{"stationId":13,"arrival":"19:59","departure":"20:00"},{"stationId":14,"arrival":"20:08"}]},
    {"trainId":"836D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"19:09"},{"stationId":1,"arrival":"19:13","departure":"19:14"},{"stationId":2,"arrival":"19:18","departure":"19:19"},{"stationId":3,"arrival":"19:21","departure":"19:22"},{"stationId":4,"arrival":"19:24","departure":"19:25"},{"stationId":5,"arrival":"19:29","departure":"19:30"},{"stationId":6,"arrival":"19:33","departure":"19:34"},{"stationId":7,"arrival":"19:38","departure":"19:39"},{"stationId":8,"arrival":"19:43","departure":"19:44"},{"stationId":9,"arrival":"19:48","departure":"19:49"},{"stationId":10,"arrival":"19:53"}]},
    {"trainId":"1842D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"19:46"},{"stationId":1,"arrival":"19:51","departure":"19:52"},{"stationId":2,"arrival":"19:56","departure":"19:57"},{"stationId":3,"arrival":"19:59","departure":"20:00"},{"stationId":4,"arrival":"20:02","departure":"20:03"},{"stationId":5,"arrival":"20:07","departure":"20:08"},{"stationId":6,"arrival":"20:11","departure":"20:12"},{"stationId":7,"arrival":"20:16","departure":"20:17"},{"stationId":8,"arrival":"20:21","departure":"20:22"},{"stationId":9,"arrival":"20:25","departure":"20:26"},{"stationId":10,"arrival":"20:30"}]},
    {"trainId":"1844D","type":"普通","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":0,"departure":"20:20"},{"stationId":1,"arrival":"20:25","departure":"20:26"},{"stationId":2,"arrival":"20:32","departure":"20:33"},{"stationId":3,"arrival":"20:34","departure":"20:35"},{"stationId":4,"arrival":"20:37","departure":"20:38"},{"stationId":5,"arrival":"20:41","departure":"20:42"},{"stationId":6,"arrival":"20:45","departure":"20:46"},{"stationId":7,"arrival":"20:51","departure":"20:52"},{"stationId":8,"arrival":"20:56","departure":"20:57"},{"stationId":9,"arrival":"21:00","departure":"21:01"},{"stationId":10,"arrival":"21:04","departure":"21:05"},{"stationId":11,"arrival":"21:17","departure":"21:18"},{"stationId":12,"arrival":"21:22","departure":"21:23"},{"stationId":13,"arrival":"21:32","departure":"21:33"},{"stationId":14,"arrival":"21:41"}]},
    {"trainId":"838D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"21:09"},{"stationId":1,"arrival":"21:13","departure":"21:14"},{"stationId":2,"arrival":"21:18","departure":"21:19"},{"stationId":3,"arrival":"21:21","departure":"21:22"},{"stationId":4,"arrival":"21:24","departure":"21:25"},{"stationId":5,"arrival":"21:27","departure":"21:28"},{"stationId":6,"arrival":"21:32","departure":"21:33"},{"stationId":7,"arrival":"21:37","departure":"21:38"},{"stationId":8,"arrival":"21:42","departure":"21:43"},{"stationId":9,"arrival":"21:46","departure":"21:47"},{"stationId":10,"arrival":"21:51"}]},
    {"trainId":"1846D","type":"普通","direction":"up","destination":"小串","delayMinutes":0,"timetable":[{"stationId":0,"departure":"22:00"},{"stationId":1,"arrival":"22:04","departure":"22:05"},{"stationId":2,"arrival":"22:09","departure":"22:10"},{"stationId":3,"arrival":"22:12","departure":"22:13"},{"stationId":4,"arrival":"22:15","departure":"22:16"},{"stationId":5,"arrival":"22:18","departure":"22:19"},{"stationId":6,"arrival":"22:23","departure":"22:24"},{"stationId":7,"arrival":"22:28","departure":"22:29"},{"stationId":8,"arrival":"22:33","departure":"22:34"},{"stationId":9,"arrival":"22:38","departure":"22:39"},{"stationId":10,"arrival":"22:43"}]},
    {"trainId":"1848R","type":"代行輸送","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":10,"departure":"09:51"},{"stationId":11,"arrival":"10:00","departure":"10:01"},{"stationId":12,"arrival":"10:04","departure":"10:05"},{"stationId":13,"arrival":"10:09","departure":"10:10"},{"stationId":14,"arrival":"10:16"}]},
    {"trainId":"840R","type":"代行輸送","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":10,"departure":"11:24"},{"stationId":11,"arrival":"11:33","departure":"11:34"},{"stationId":12,"arrival":"11:37","departure":"11:38"},{"stationId":13,"arrival":"11:42","departure":"11:43"},{"stationId":14,"arrival":"11:49"}]},
    {"trainId":"840R","type":"代行輸送","direction":"up","destination":"滝部","delayMinutes":0,"timetable":[{"stationId":10,"departure":"13:00"},{"stationId":11,"arrival":"13:09","departure":"13:10"},{"stationId":12,"arrival":"13:13","departure":"13:14"},{"stationId":13,"arrival":"13:18","departure":"13:19"},{"stationId":14,"arrival":"13:25"}]},
];

    // --- ヘルパー関数 ---
    function parseTime(timeStr) {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function isSectionSuspendedNow(section, now) {
        if (!section.startTime || !section.endTime) return true;
        return now >= parseTime(section.startTime) && now < parseTime(section.endTime);
    }

    // --- 描画関数 ---
    function renderAnnouncements() {
        announcementsDiv.innerHTML = '';
        if (announcements && announcements.length > 0) {
            announcements.forEach(info => {
                const item = document.createElement('div');
                item.className = 'announcement-item';
                let iconSrc = '';
                let altText = '';
                if (info.type === 'suspended') {
                    iconSrc = imagePaths.suspended_info;
                    altText = '運休';
                } else {
                    iconSrc = imagePaths.info;
                    altText = 'お知らせ';
                }
                item.innerHTML = `<div class="announcement-icon"><img src="${iconSrc}" alt="${altText}" style="width: 16px; height: 16px;"></div><span>${info.message}</span>`;
                announcementsDiv.appendChild(item);
            });
        }
    }

    function renderStations() {
        stations.forEach(station => {
            const stationDiv = document.createElement('div');
            stationDiv.className = 'station';
            stationDiv.id = `station-${station.id}`;
            stationDiv.innerHTML = `<div class="station-marker"></div><span class="station-name">${station.name}</span>`;
            stationListDiv.appendChild(stationDiv);
        });
    }

    function renderSuspendedSections(now) {
        suspensionListDiv.innerHTML = '';
        suspendedSections.forEach(section => {
            if (!isSectionSuspendedNow(section, now)) return;
            const fromStationElem = document.getElementById(`station-${section.fromStationId}`);
            const toStationElem = document.getElementById(`station-${section.toStationId}`);
            if (!fromStationElem || !toStationElem) return;
            const topY = fromStationElem.offsetTop + fromStationElem.offsetHeight / 2;
            const bottomY = toStationElem.offsetTop + toStationElem.offsetHeight / 2;
            const suspensionDiv = document.createElement('div');
            suspensionDiv.className = 'suspended-section';
            suspensionDiv.style.top = `${topY}px`;
            suspensionDiv.style.height = `${bottomY - topY}px`;
            const tooltipContent = `<b>運休区間:</b> ${stations.find(s=>s.id === section.fromStationId).name}～${stations.find(s=>s.id === section.toStationId).name}<br><b>理由:</b> ${section.reason}`;
            suspensionDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                showTooltip(e.target, tooltipContent);
            });
            suspensionListDiv.appendChild(suspensionDiv);
        });
    }

    // --- ツールチップ関連 ---
    function showTooltip(targetElement, content) {
        tooltip.innerHTML = content;
        tooltip.style.visibility = 'hidden';
        tooltip.style.display = 'block';
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        let top = targetRect.top - tooltipRect.height - 10;
        let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        if (top < 10) top = targetRect.bottom + 10;
        if (left < 10) left = 10;
        else if (left + tooltipRect.width > viewportWidth - 10) left = viewportWidth - tooltipRect.width - 10;
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.visibility = 'visible';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tooltip') && !e.target.closest('.train') && !e.target.closest('.suspended-section')) {
            hideTooltip();
        }
    });

    // --- メインロジック ---
    function updatePositions() {
        const now = new Date();
        // デバッグ用: now.setHours(7, 48, 30);
        currentTimeDiv.textContent = now.toLocaleTimeString('ja-JP');
        trainListDiv.innerHTML = '';
        renderSuspendedSections(now);

        trainSchedules.forEach(train => {
            const trainTime = new Date(now.getTime() - train.delayMinutes * 60 * 1000);
            
            const issue = operationalIssues.find(p => p.trainId === train.trainId);
            if (issue) {
                const stationElem = document.getElementById(`station-${issue.stationId}`);
                if (!stationElem) return;
                const trainY = stationElem.offsetTop + stationElem.offsetHeight / 2;
                const trainDiv = document.createElement('div');
                trainDiv.className = 'train stopped-image'; // 停車中(支障)アイコン
                trainDiv.innerHTML = `<img src="${imagePaths.stopped}" alt="停車中(支障)" style="width: 24px; height: 24px;">`;
                trainDiv.style.top = `${trainY - 12}px`; // 画像の高さの半分を引く
                const tooltipContent = `<b>種別:</b> ${train.type}<br><b>列車番号:</b> ${train.trainId}<br><b>状況:</b> <span style="color: #ffadad;">${issue.reason}</span>`;
                trainDiv.addEventListener('click', (e) => { e.stopPropagation(); showTooltip(e.target, tooltipContent); });
                trainListDiv.appendChild(trainDiv);
                return;
            }

            for (let i = 0; i < train.timetable.length; i++) {
                const currentStop = train.timetable[i];
                const nextStop = train.timetable[i + 1];

                const arrivalTime = parseTime(currentStop.arrival);
                const departureTime = parseTime(currentStop.departure);

                // 状態1: 駅で停車中
                if (arrivalTime && departureTime && trainTime >= arrivalTime && trainTime < departureTime) {
                    const stationElem = document.getElementById(`station-${currentStop.stationId}`);
                    if (!stationElem) continue;
                    const trainY = stationElem.offsetTop + stationElem.offsetHeight / 2;
                    const trainDiv = document.createElement('div');
                    trainDiv.className = 'train waiting-image'; // 停車中(定刻)アイコン
                    trainDiv.innerHTML = `<img src="${imagePaths.waiting}" alt="停車中(定刻)" style="width: 24px; height: 24px;">`;
                    trainDiv.style.top = `${trainY - 12}px`; // 画像の高さの半分を引く
                    const tooltipContent = `<b>種別:</b> ${train.type}<br><b>列車番号:</b> ${train.trainId}<br><b>状況:</b> ${stations.find(s=>s.id === currentStop.stationId).name}駅で停車中`;
                    trainDiv.addEventListener('click', (e) => { e.stopPropagation(); showTooltip(e.target, tooltipContent); });
                    trainListDiv.appendChild(trainDiv);
                    return;
                }

                // 状態2: 駅間を走行中
                if (departureTime && nextStop) {
                    const nextArrivalTime = parseTime(nextStop.arrival);
                    if (nextArrivalTime && trainTime >= departureTime && trainTime < nextArrivalTime) {
                        const isSuspended = suspendedSections.some(section => isSectionSuspendedNow(section, now) && [section.fromStationId, section.toStationId].sort((a,b)=>a-b).join() === [currentStop.stationId, nextStop.stationId].sort((a,b)=>a-b).join());
                        if (isSuspended) return;

                        const progress = (trainTime - departureTime) / (nextArrivalTime - departureTime);
                        const prevStationElem = document.getElementById(`station-${currentStop.stationId}`);
                        const nextStationElem = document.getElementById(`station-${nextStop.stationId}`);
                        if (!prevStationElem || !nextStationElem) continue;

                        const prevStationY = prevStationElem.offsetTop + prevStationElem.offsetHeight / 2;
                        const nextStationY = nextStationElem.offsetTop + nextStationElem.offsetHeight / 2;
                        const trainY = prevStationY + (nextStationY - prevStationY) * progress;

                        const trainDiv = document.createElement('div');
                        let imgSrc = '';
                        let altText = '';
                        let className = 'train'; // 基本クラス

                        if (train.type === '代行輸送') {
                            className += train.direction === 'up' ? ' substitute-up-image' : ' substitute-down-image';
                            imgSrc = train.direction === 'up' ? imagePaths.substitute_up : imagePaths.substitute_down;
                            altText = `代行輸送 ${train.direction === 'up' ? '上り' : '下り'}`;
                        } else if (train.delayMinutes > 0) {
                            // 遅延している列車（代行輸送ではない）
                            className += train.direction === 'up' ? ' delayed-up-image' : ' delayed-down-image';
                            imgSrc = train.direction === 'up' ? imagePaths.delayed_up : imagePaths.delayed_down;
                            altText = `遅延 ${train.direction === 'up' ? '上り' : '下り'}`;
                        } else {
                            // 通常運行の列車（遅延なし、代行輸送ではない）
                            className += train.direction === 'up' ? ' up-image' : ' down-image';
                            imgSrc = train.direction === 'up' ? imagePaths.up : imagePaths.down;
                            altText = train.direction === 'up' ? '上り' : '下り';
                        }
                        
                        trainDiv.className = className;
                        trainDiv.innerHTML = `<img src="${imgSrc}" alt="${altText}" style="width: 24px; height: 24px;">`;
                        trainDiv.style.top = `${trainY - 12}px`; // 画像の高さの半分を引く
                        const tooltipContent = `<b>種別:</b> ${train.type}<br><b>列車番号:</b> ${train.trainId}<br><b>行先:</b> ${train.destination}<br><b>遅延:</b> ${train.delayMinutes}分`;
                        trainDiv.addEventListener('click', (e) => { e.stopPropagation(); showTooltip(e.target, tooltipContent); });
                        trainListDiv.appendChild(trainDiv);
                        return;
                    }
                }
            }
        });
    }
    
    // --- 初期化と実行 ---
    renderAnnouncements();
    renderStations();
    updatePositions();
    setInterval(updatePositions, 100);
});
