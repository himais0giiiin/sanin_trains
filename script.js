document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const stationListDiv = document.getElementById('station-list');
    const trainListDiv = document.getElementById('train-list');
    const suspensionListDiv = document.getElementById('suspension-list');
    const currentTimeDiv = document.getElementById('current-time');
    const announcementsDiv = document.getElementById('announcements-board');
    const tooltip = document.getElementById('tooltip');
    const legendWaitingIcon = document.querySelector('.legend-icon.waiting');

    // 時計アイコンのSVG
    legendWaitingIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>`;

    // --- データ定義 ---
    const announcements = [
        { id: 'info0', message: 'ダイヤは2023年改正分の表示' },
        { id: 'info1', message: '2時55分~3時06分の間は、梅ケ峠～小串駅間で、データの試験用列車が走行中です。' },
        { id: 'info2', message: '線路保守工事のため、9時14分～15時13分の間、下関～小串駅間で運転を取り止めます。この件について、代行輸送を実施します。' }
        ];
    const operationalIssues = [
        //{ trainId: '825D', stationId: 6, reason: '信号確認のため停車中です。' }
    ];
    const suspendedSections = [
        //{ fromStationId: 7, toStationId: 10, reason: '大雨による土砂災害のため、梅ヶ峠～小串駅間で終日運転を見合わせています。' },
        { fromStationId: 0, toStationId: 10, reason: '線路保守工事のため、9時14分～15時13分の間、下関～小串駅間で運転を取り止めます。', startTime: '09:14', endTime: '15:13' }
    ];
const stations = [
    { id: 0, name: '下関' }, { id: 1, name: '幡生' }, { id: 2, name: '綾羅木' }, { id: 3, name: '梶栗郷台地' }, { id: 4, name: '安岡' }, { id: 5, name: '福江' }, { id: 6, name: '吉見' }, { id: 7, name: '梅ヶ峠' }, { id: 8, name: '黒井村' }, { id: 9, name: '川棚温泉' }, { id: 10, name: '小串' }, { id: 11, name: '湯玉' }, { id: 12, name: '宇賀本郷' }, { id: 13, name: '長門二見' }, { id: 14, name: '滝部' }
];

// 列車時刻表データ (平日・全データ・発着時刻形式)
const trainSchedules = [
    { trainId: '821D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '05:40' }, { stationId: 1, arrival: '05:44', departure: '05:45' }, { stationId: 2, arrival: '05:49', departure: '05:50' }, { stationId: 3, arrival: '05:52', departure: '05:53' }, { stationId: 4, arrival: '05:55', departure: '05:56' }, { stationId: 5, arrival: '05:59', departure: '06:00' }, { stationId: 6, arrival: '06:04', departure: '06:05' }, { stationId: 7, arrival: '06:10', departure: '06:11' }, { stationId: 8, arrival: '06:14', departure: '06:15' }, { stationId: 9, arrival: '06:18', departure: '06:19' }, { stationId: 10, arrival: '06:21', departure: '06:22' }, { stationId: 11, arrival: '06:26', departure: '06:27' }, { stationId: 12, arrival: '06:33', departure: '06:34' }, { stationId: 13, arrival: '06:38', departure: '06:39' }, { stationId: 14, arrival: '06:45' }
    ]},
    { trainId: '823D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '06:40' }, { stationId: 1, arrival: '06:44', departure: '06:45' }, { stationId: 2, arrival: '06:50', departure: '06:51' }, { stationId: 3, arrival: '06:53', departure: '06:54' }, { stationId: 4, arrival: '06:56', departure: '06:57' }, { stationId: 5, arrival: '07:00', departure: '07:01' }, { stationId: 6, arrival: '07:05', departure: '07:06' }, { stationId: 7, arrival: '07:11', departure: '07:12' }, { stationId: 8, arrival: '07:15', departure: '07:16' }, { stationId: 9, arrival: '07:19', departure: '07:20' }, { stationId: 10, arrival: '07:22', departure: '07:23' }, { stationId: 11, arrival: '07:27', departure: '07:28' }, { stationId: 12, arrival: '07:34', departure: '07:35' }, { stationId: 13, arrival: '07:39', departure: '07:40' }, { stationId: 14, arrival: '07:45' }
    ]},
    { trainId: '1825D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '07:01' }, { stationId: 1, arrival: '07:05', departure: '07:06' }, { stationId: 2, arrival: '07:10', departure: '07:11' }, { stationId: 3, arrival: '07:13', departure: '07:14' }, { stationId: 4, arrival: '07:16', departure: '07:17' }, { stationId: 5, arrival: '07:21', departure: '07:22' }, { stationId: 6, arrival: '07:26', departure: '07:27' }, { stationId: 7, arrival: '07:32', departure: '07:33' }, { stationId: 8, arrival: '07:36', departure: '07:37' }, { stationId: 9, arrival: '07:40', departure: '07:41' }, { stationId: 10, arrival: '07:43' }
    ]},
    { trainId: '825D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '07:26' }, { stationId: 1, arrival: '07:30', departure: '07:31' }, { stationId: 2, arrival: '07:35', departure: '07:36' }, { stationId: 3, arrival: '07:38', departure: '07:39' }, { stationId: 4, arrival: '07:41', departure: '07:42' }, { stationId: 5, arrival: '07:45', departure: '07:46' }, { stationId: 6, arrival: '07:50', departure: '07:51' }, { stationId: 7, arrival: '07:56', departure: '07:57' }, { stationId: 8, arrival: '08:00', departure: '08:01' }, { stationId: 9, arrival: '08:04', departure: '08:05' }, { stationId: 10, arrival: '08:07', departure: '08:14' }, { stationId: 11, arrival: '08:18', departure: '08:19' }, { stationId: 12, arrival: '08:25', departure: '08:26' }, { stationId: 13, arrival: '08:30', departure: '08:31' }, { stationId: 14, arrival: '08:39' }
    ]},
    { trainId: '1827D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '08:05' }, { stationId: 1, arrival: '08:09', departure: '08:10' }, { stationId: 2, arrival: '08:14', departure: '08:15' }, { stationId: 3, arrival: '08:17', departure: '08:18' }, { stationId: 4, arrival: '08:20', departure: '08:21' }, { stationId: 5, arrival: '08:24', departure: '08:25' }, { stationId: 6, arrival: '08:29', departure: '08:30' }, { stationId: 7, arrival: '08:35', departure: '08:36' }, { stationId: 8, arrival: '08:39', departure: '08:40' }, { stationId: 9, arrival: '08:43', departure: '08:44' }, { stationId: 10, arrival: '08:46' }
    ]},
    { trainId: '1829D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '08:40' }, { stationId: 1, arrival: '08:44', departure: '08:45' }, { stationId: 2, arrival: '08:49', departure: '08:50' }, { stationId: 3, arrival: '08:52', departure: '08:53' }, { stationId: 4, arrival: '08:55', departure: '08:56' }, { stationId: 5, arrival: '08:59', departure: '09:00' }, { stationId: 6, arrival: '09:04', departure: '09:05' }, { stationId: 7, arrival: '09:10', departure: '09:11' }, { stationId: 8, arrival: '09:14', departure: '09:15' }, { stationId: 9, arrival: '09:18', departure: '09:19' }, { stationId: 10, arrival: '09:21' }
    ]},
    { trainId: '1831D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '09:48' }, { stationId: 1, arrival: '09:52', departure: '09:53' }, { stationId: 2, arrival: '09:57', departure: '09:58' }, { stationId: 3, arrival: '10:00', departure: '10:01' }, { stationId: 4, arrival: '10:03', departure: '10:04' }, { stationId: 5, arrival: '10:07', departure: '10:08' }, { stationId: 6, arrival: '10:12', departure: '10:13' }, { stationId: 7, arrival: '10:18', departure: '10:19' }, { stationId: 8, arrival: '10:22', departure: '10:23' }, { stationId: 9, arrival: '10:26', departure: '10:27' }, { stationId: 10, arrival: '10:30' }
    ]},
    { trainId: '1833D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '10:36' }, { stationId: 1, arrival: '10:40', departure: '10:41' }, { stationId: 2, arrival: '10:45', departure: '10:46' }, { stationId: 3, arrival: '10:48', departure: '10:49' }, { stationId: 4, arrival: '10:51', departure: '10:52' }, { stationId: 5, arrival: '10:55', departure: '10:56' }, { stationId: 6, arrival: '11:00', departure: '11:01' }, { stationId: 7, arrival: '11:06', departure: '11:07' }, { stationId: 8, arrival: '11:10', departure: '11:11' }, { stationId: 9, arrival: '11:14', departure: '11:15' }, { stationId: 10, arrival: '11:17' }
    ]},
    { trainId: '1835D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '12:03' }, { stationId: 1, arrival: '12:07', departure: '12:08' }, { stationId: 2, arrival: '12:12', departure: '12:13' }, { stationId: 3, arrival: '12:15', departure: '12:16' }, { stationId: 4, arrival: '12:18', departure: '12:19' }, { stationId: 5, arrival: '12:22', departure: '12:23' }, { stationId: 6, arrival: '12:27', departure: '12:28' }, { stationId: 7, arrival: '12:33', departure: '12:34' }, { stationId: 8, arrival: '12:37', departure: '12:38' }, { stationId: 9, arrival: '12:41', departure: '12:42' }, { stationId: 10, arrival: '12:46' }
    ]},
    { trainId: '1837D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '13:14' }, { stationId: 1, arrival: '13:18', departure: '13:19' }, { stationId: 2, arrival: '13:23', departure: '13:24' }, { stationId: 3, arrival: '13:26', departure: '13:27' }, { stationId: 4, arrival: '13:29', departure: '13:30' }, { stationId: 5, arrival: '13:33', departure: '13:34' }, { stationId: 6, arrival: '13:38', departure: '13:39' }, { stationId: 7, arrival: '13:44', departure: '13:45' }, { stationId: 8, arrival: '13:48', departure: '13:49' }, { stationId: 9, arrival: '13:52', departure: '13:53' }, { stationId: 10, arrival: '13:55' }
    ]},
    { trainId: '837D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '14:31' }, { stationId: 1, arrival: '14:35', departure: '14:36' }, { stationId: 2, arrival: '14:40', departure: '14:41' }, { stationId: 3, arrival: '14:43', departure: '14:44' }, { stationId: 4, arrival: '14:46', departure: '14:47' }, { stationId: 5, arrival: '14:50', departure: '14:51' }, { stationId: 6, arrival: '14:55', departure: '14:56' }, { stationId: 7, arrival: '15:01', departure: '15:02' }, { stationId: 8, arrival: '15:05', departure: '15:06' }, { stationId: 9, arrival: '15:09', departure: '15:10' }, { stationId: 10, arrival: '15:12', departure: '15:13' }, { stationId: 11, arrival: '15:17', departure: '15:18' }, { stationId: 12, arrival: '15:24', departure: '15:25' }, { stationId: 13, arrival: '15:29', departure: '15:30' }, { stationId: 14, arrival: '15:36' }
    ]},
    { trainId: '1839D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '15:37' }, { stationId: 1, arrival: '15:41', departure: '15:42' }, { stationId: 2, arrival: '15:46', departure: '15:47' }, { stationId: 3, arrival: '15:49', departure: '15:50' }, { stationId: 4, arrival: '15:52', departure: '15:53' }, { stationId: 5, arrival: '15:56', departure: '15:57' }, { stationId: 6, arrival: '16:01', departure: '16:02' }, { stationId: 7, arrival: '16:07', departure: '16:08' }, { stationId: 8, arrival: '16:11', departure: '16:12' }, { stationId: 9, arrival: '16:15', departure: '16:16' }, { stationId: 10, arrival: '16:18' }
    ]},
    { trainId: '839D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '16:11' }, { stationId: 1, arrival: '16:15', departure: '16:16' }, { stationId: 2, arrival: '16:20', departure: '16:21' }, { stationId: 3, arrival: '16:23', departure: '16:24' }, { stationId: 4, arrival: '16:26', departure: '16:27' }, { stationId: 5, arrival: '16:30', departure: '16:31' }, { stationId: 6, arrival: '16:35', departure: '16:36' }, { stationId: 7, arrival: '16:41', departure: '16:42' }, { stationId: 8, arrival: '16:45', departure: '16:46' }, { stationId: 9, arrival: '16:49', departure: '16:50' }, { stationId: 10, arrival: '16:52', departure: '16:56' }, { stationId: 11, arrival: '17:00', departure: '17:01' }, { stationId: 12, arrival: '17:07', departure: '17:08' }, { stationId: 13, arrival: '17:12', departure: '17:13' }, { stationId: 14, arrival: '17:20' }
    ]},
    { trainId: '1841D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '16:48' }, { stationId: 1, arrival: '16:52', departure: '16:53' }, { stationId: 2, arrival: '16:57', departure: '16:58' }, { stationId: 3, arrival: '17:00', departure: '17:01' }, { stationId: 4, arrival: '17:03', departure: '17:04' }, { stationId: 5, arrival: '17:07', departure: '17:08' }, { stationId: 6, arrival: '17:12', departure: '17:13' }, { stationId: 7, arrival: '17:18', departure: '17:19' }, { stationId: 8, arrival: '17:22', departure: '17:23' }, { stationId: 9, arrival: '17:26', departure: '17:27' }, { stationId: 10, arrival: '17:33' }
    ]},
    { trainId: '841D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '17:26' }, { stationId: 1, arrival: '17:30', departure: '17:31' }, { stationId: 2, arrival: '17:35', departure: '17:36' }, { stationId: 3, arrival: '17:38', departure: '17:39' }, { stationId: 4, arrival: '17:41', departure: '17:42' }, { stationId: 5, arrival: '17:45', departure: '17:46' }, { stationId: 6, arrival: '17:50', departure: '17:51' }, { stationId: 7, arrival: '17:56', departure: '17:57' }, { stationId: 8, arrival: '18:00', departure: '18:01' }, { stationId: 9, arrival: '18:04', departure: '18:05' }, { stationId: 10, arrival: '18:07', departure: '18:08' }, { stationId: 11, arrival: '18:12', departure: '18:13' }, { stationId: 12, arrival: '18:19', departure: '18:20' }, { stationId: 13, arrival: '18:24', departure: '18:25' }, { stationId: 14, arrival: '18:35' }
    ]},
    { trainId: '1843D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '18:04' }, { stationId: 1, arrival: '18:08', departure: '18:09' }, { stationId: 2, arrival: '18:13', departure: '18:14' }, { stationId: 3, arrival: '18:16', departure: '18:17' }, { stationId: 4, arrival: '18:19', departure: '18:20' }, { stationId: 5, arrival: '18:23', departure: '18:24' }, { stationId: 6, arrival: '18:28', departure: '18:29' }, { stationId: 7, arrival: '18:34', departure: '18:35' }, { stationId: 8, arrival: '18:38', departure: '18:39' }, { stationId: 9, arrival: '18:42', departure: '18:43' }, { stationId: 10, arrival: '18:47' }
    ]},
    { trainId: '843D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '18:39' }, { stationId: 1, arrival: '18:43', departure: '18:44' }, { stationId: 2, arrival: '18:48', departure: '18:49' }, { stationId: 3, arrival: '18:51', departure: '18:52' }, { stationId: 4, arrival: '18:54', departure: '18:55' }, { stationId: 5, arrival: '18:58', departure: '18:59' }, { stationId: 6, arrival: '19:03', departure: '19:04' }, { stationId: 7, arrival: '19:09', departure: '19:10' }, { stationId: 8, arrival: '19:13', departure: '19:14' }, { stationId: 9, arrival: '19:17', departure: '19:18' }, { stationId: 10, arrival: '19:20', departure: '19:23' }, { stationId: 11, arrival: '19:27', departure: '19:28' }, { stationId: 12, arrival: '19:34', departure: '19:35' }, { stationId: 13, arrival: '19:39', departure: '19:40' }, { stationId: 14, arrival: '19:46' }
    ]},
    { trainId: '1845D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '19:09' }, { stationId: 1, arrival: '19:13', departure: '19:14' }, { stationId: 2, arrival: '19:18', departure: '19:19' }, { stationId: 3, arrival: '19:21', departure: '19:22' }, { stationId: 4, arrival: '19:24', departure: '19:25' }, { stationId: 5, arrival: '19:28', departure: '19:29' }, { stationId: 6, arrival: '19:33', departure: '19:34' }, { stationId: 7, arrival: '19:39', departure: '19:40' }, { stationId: 8, arrival: '19:43', departure: '19:44' }, { stationId: 9, arrival: '19:47', departure: '19:48' }, { stationId: 10, arrival: '19:50' }
    ]},
    { trainId: '1847D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '19:46' }, { stationId: 1, arrival: '19:50', departure: '19:51' }, { stationId: 2, arrival: '19:55', departure: '19:56' }, { stationId: 3, arrival: '19:58', departure: '19:59' }, { stationId: 4, arrival: '20:01', departure: '20:02' }, { stationId: 5, arrival: '20:05', departure: '20:06' }, { stationId: 6, arrival: '20:10', departure: '20:11' }, { stationId: 7, arrival: '20:16', departure: '20:17' }, { stationId: 8, arrival: '20:20', departure: '20:21' }, { stationId: 9, arrival: '20:24', departure: '20:25' }, { stationId: 10, arrival: '20:27' }
    ]},
    { trainId: '845D', type: '普通', direction: 'up', destination: '滝部', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '20:20' }, { stationId: 1, arrival: '20:24', departure: '20:25' }, { stationId: 2, arrival: '20:29', departure: '20:30' }, { stationId: 3, arrival: '20:32', departure: '20:33' }, { stationId: 4, arrival: '20:35', departure: '20:36' }, { stationId: 5, arrival: '20:39', departure: '20:40' }, { stationId: 6, arrival: '20:44', departure: '20:45' }, { stationId: 7, arrival: '20:50', departure: '20:51' }, { stationId: 8, arrival: '20:54', departure: '20:55' }, { stationId: 9, arrival: '20:58', departure: '20:59' }, { stationId: 10, arrival: '21:01', departure: '21:02' }, { stationId: 11, arrival: '21:06', departure: '21:07' }, { stationId: 12, arrival: '21:13', departure: '21:14' }, { stationId: 13, arrival: '21:18', departure: '21:19' }, { stationId: 14, arrival: '21:25' }
    ]},
    { trainId: '1849D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '21:09' }, { stationId: 1, arrival: '21:13', departure: '21:14' }, { stationId: 2, arrival: '21:18', departure: '21:19' }, { stationId: 3, arrival: '21:21', departure: '21:22' }, { stationId: 4, arrival: '21:24', departure: '21:25' }, { stationId: 5, arrival: '21:28', departure: '21:29' }, { stationId: 6, arrival: '21:33', departure: '21:34' }, { stationId: 7, arrival: '21:39', departure: '21:40' }, { stationId: 8, arrival: '21:43', departure: '21:44' }, { stationId: 9, arrival: '21:47', departure: '21:48' }, { stationId: 10, arrival: '21:50' }
    ]},
    { trainId: '1851D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '22:00' }, { stationId: 1, arrival: '22:04', departure: '22:05' }, { stationId: 2, arrival: '22:09', departure: '22:10' }, { stationId: 3, arrival: '22:12', departure: '22:13' }, { stationId: 4, arrival: '22:15', departure: '22:16' }, { stationId: 5, arrival: '22:19', departure: '22:20' }, { stationId: 6, arrival: '22:24', departure: '22:25' }, { stationId: 7, arrival: '22:30', departure: '22:31' }, { stationId: 8, arrival: '22:34', departure: '22:35' }, { stationId: 9, arrival: '22:38', departure: '22:39' }, { stationId: 10, arrival: '22:41' }
    ]},
    { trainId: '1853D', type: '普通', direction: 'up', destination: '小串', delayMinutes: 0, timetable: [
        { stationId: 0, departure: '23:06' }, { stationId: 1, arrival: '23:10', departure: '23:11' }, { stationId: 2, arrival: '23:15', departure: '23:16' }, { stationId: 3, arrival: '23:18', departure: '23:19' }, { stationId: 4, arrival: '23:21', departure: '23:22' }, { stationId: 5, arrival: '23:25', departure: '23:26' }, { stationId: 6, arrival: '23:30', departure: '23:31' }, { stationId: 7, arrival: '23:36', departure: '23:37' }, { stationId: 8, arrival: '23:40', departure: '23:41' }, { stationId: 9, arrival: '23:44', departure: '23:45' }, { stationId: 10, arrival: '23:47' }
    ]},








    // --- 下り (滝部 -> 下関方面) ---
    // stationIdが大きい方から小さい方へ向かう列車
    { trainId: '1820D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '05:58' }, { stationId: 9, arrival: '06:00', departure: '06:01' }, { stationId: 8, arrival: '06:04', departure: '06:05' }, { stationId: 7, arrival: '06:08', departure: '06:09' }, { stationId: 6, arrival: '06:14', departure: '06:15' }, { stationId: 5, arrival: '06:19', departure: '06:20' }, { stationId: 4, arrival: '06:23', departure: '06:24' }, { stationId: 3, arrival: '06:26', departure: '06:27' }, { stationId: 2, arrival: '06:29', departure: '06:30' }, { stationId: 1, arrival: '06:35', departure: '06:36' }, { stationId: 0, arrival: '06:40' }
    ]},
    { trainId: '1822D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '06:33' }, { stationId: 9, arrival: '06:35', departure: '06:36' }, { stationId: 8, arrival: '06:39', departure: '06:40' }, { stationId: 7, arrival: '06:43', departure: '06:44' }, { stationId: 6, arrival: '06:49', departure: '06:50' }, { stationId: 5, arrival: '06:54', departure: '06:55' }, { stationId: 4, arrival: '06:58', departure: '06:59' }, { stationId: 3, arrival: '07:01', departure: '07:02' }, { stationId: 2, arrival: '07:04', departure: '07:05' }, { stationId: 1, arrival: '07:10', departure: '07:11' }, { stationId: 0, arrival: '07:15' }
    ]},
    { trainId: '822D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '06:29' }, { stationId: 13, arrival: '06:34', departure: '06:35' }, { stationId: 12, arrival: '06:39', departure: '06:40' }, { stationId: 11, arrival: '06:46', departure: '06:47' }, { stationId: 10, arrival: '06:52', departure: '06:53' }, { stationId: 9, arrival: '06:55', departure: '06:56' }, { stationId: 8, arrival: '06:59', departure: '07:00' }, { stationId: 7, arrival: '07:03', departure: '07:04' }, { stationId: 6, arrival: '07:09', departure: '07:10' }, { stationId: 5, arrival: '07:14', departure: '07:15' }, { stationId: 4, arrival: '07:18', departure: '07:19' }, { stationId: 3, arrival: '07:21', departure: '07:22' }, { stationId: 2, arrival: '07:24', departure: '07:25' }, { stationId: 1, arrival: '07:30', departure: '07:31' }, { stationId: 0, arrival: '07:35' }
    ]},
    { trainId: '1824D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '06:58' }, { stationId: 9, arrival: '07:00', departure: '07:01' }, { stationId: 8, arrival: '07:04', departure: '07:05' }, { stationId: 7, arrival: '07:08', departure: '07:09' }, { stationId: 6, arrival: '07:14', departure: '07:15' }, { stationId: 5, arrival: '07:19', departure: '07:20' }, { stationId: 4, arrival: '07:23', departure: '07:24' }, { stationId: 3, arrival: '07:26', departure: '07:27' }, { stationId: 2, arrival: '07:29', departure: '07:30' }, { stationId: 1, arrival: '07:35', departure: '07:36' }, { stationId: 0, arrival: '07:40' }
    ]},
    { trainId: '1826D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '07:25' }, { stationId: 9, arrival: '07:27', departure: '07:28' }, { stationId: 8, arrival: '07:31', departure: '07:32' }, { stationId: 7, arrival: '07:35', departure: '07:36' }, { stationId: 6, arrival: '07:41', departure: '07:42' }, { stationId: 5, arrival: '07:46', departure: '07:47' }, { stationId: 4, arrival: '07:50', departure: '07:51' }, { stationId: 3, arrival: '07:53', departure: '07:54' }, { stationId: 2, arrival: '07:56', departure: '07:57' }, { stationId: 1, arrival: '08:02', departure: '08:03' }, { stationId: 0, arrival: '08:08' }
    ]},
    { trainId: '824D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '07:18' }, { stationId: 13, arrival: '07:23', departure: '07:24' }, { stationId: 12, arrival: '07:28', departure: '07:29' }, { stationId: 11, arrival: '07:35', departure: '07:36' }, { stationId: 10, arrival: '07:41', departure: '07:42' }, { stationId: 9, arrival: '07:44', departure: '07:45' }, { stationId: 8, arrival: '07:48', departure: '07:49' }, { stationId: 7, arrival: '07:52', departure: '07:53' }, { stationId: 6, arrival: '07:58', departure: '07:59' }, { stationId: 5, arrival: '08:03', departure: '08:04' }, { stationId: 4, arrival: '08:07', departure: '08:08' }, { stationId: 3, arrival: '08:10', departure: '08:11' }, { stationId: 2, arrival: '08:13', departure: '08:14' }, { stationId: 1, arrival: '08:19', departure: '08:20' }, { stationId: 0, arrival: '08:25' }
    ]},
    { trainId: '828D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '08:00' }, { stationId: 13, arrival: '08:05', departure: '08:06' }, { stationId: 12, arrival: '08:10', departure: '08:11' }, { stationId: 11, arrival: '08:17', departure: '08:18' }, { stationId: 10, arrival: '08:23', departure: '08:24' }, { stationId: 9, arrival: '08:26', departure: '08:27' }, { stationId: 8, arrival: '08:30', departure: '08:31' }, { stationId: 7, arrival: '08:34', departure: '08:35' }, { stationId: 6, arrival: '08:40', departure: '08:41' }, { stationId: 5, arrival: '08:45', departure: '08:46' }, { stationId: 4, arrival: '08:49', departure: '08:50' }, { stationId: 3, arrival: '08:52', departure: '08:53' }, { stationId: 2, arrival: '08:55', departure: '08:56' }, { stationId: 1, arrival: '09:01', departure: '09:02' }, { stationId: 0, arrival: '09:07' }
    ]},
    { trainId: '1830D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '08:46' }, { stationId: 9, arrival: '08:48', departure: '08:49' }, { stationId: 8, arrival: '08:52', departure: '08:53' }, { stationId: 7, arrival: '08:56', departure: '08:57' }, { stationId: 6, arrival: '09:02', departure: '09:03' }, { stationId: 5, arrival: '09:07', departure: '09:08' }, { stationId: 4, arrival: '09:11', departure: '09:12' }, { stationId: 3, arrival: '09:14', departure: '09:15' }, { stationId: 2, arrival: '09:17', departure: '09:18' }, { stationId: 1, arrival: '09:23', departure: '09:24' }, { stationId: 0, arrival: '09:28' }
    ]},
    { trainId: '1832D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '09:40' }, { stationId: 9, arrival: '09:42', departure: '09:43' }, { stationId: 8, arrival: '09:46', departure: '09:47' }, { stationId: 7, arrival: '09:50', departure: '09:51' }, { stationId: 6, arrival: '09:56', departure: '09:57' }, { stationId: 5, arrival: '10:01', departure: '10:02' }, { stationId: 4, arrival: '10:05', departure: '10:06' }, { stationId: 3, arrival: '10:08', departure: '10:09' }, { stationId: 2, arrival: '10:11', departure: '10:12' }, { stationId: 1, arrival: '10:17', departure: '10:18' }, { stationId: 0, arrival: '10:22' }
    ]},
    { trainId: '830D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '10:48' }, { stationId: 13, arrival: '10:53', departure: '10:54' }, { stationId: 12, arrival: '10:58', departure: '10:59' }, { stationId: 11, arrival: '11:05', departure: '11:06' }, { stationId: 10, arrival: '11:11', departure: '11:12' }, { stationId: 9, arrival: '11:14', departure: '11:15' }, { stationId: 8, arrival: '11:18', departure: '11:19' }, { stationId: 7, arrival: '11:22', departure: '11:23' }, { stationId: 6, arrival: '11:28', departure: '11:29' }, { stationId: 5, arrival: '11:33', departure: '11:34' }, { stationId: 4, arrival: '11:37', departure: '11:38' }, { stationId: 3, arrival: '11:40', departure: '11:41' }, { stationId: 2, arrival: '11:43', departure: '11:44' }, { stationId: 1, arrival: '11:49', departure: '11:50' }, { stationId: 0, arrival: '11:54' }
    ]},
    { trainId: '1834D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '11:41' }, { stationId: 9, arrival: '11:43', departure: '11:44' }, { stationId: 8, arrival: '11:47', departure: '11:48' }, { stationId: 7, arrival: '11:51', departure: '11:52' }, { stationId: 6, arrival: '11:57', departure: '11:58' }, { stationId: 5, arrival: '12:02', departure: '12:03' }, { stationId: 4, arrival: '12:06', departure: '12:07' }, { stationId: 3, arrival: '12:09', departure: '12:10' }, { stationId: 2, arrival: '12:12', departure: '12:13' }, { stationId: 1, arrival: '12:18', departure: '12:19' }, { stationId: 0, arrival: '12:23' }
    ]},
    { trainId: '1836D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '13:00' }, { stationId: 9, arrival: '13:02', departure: '13:03' }, { stationId: 8, arrival: '13:06', departure: '13:07' }, { stationId: 7, arrival: '13:10', departure: '13:11' }, { stationId: 6, arrival: '13:16', departure: '13:17' }, { stationId: 5, arrival: '13:21', departure: '13:22' }, { stationId: 4, arrival: '13:25', departure: '13:26' }, { stationId: 3, arrival: '13:28', departure: '13:29' }, { stationId: 2, arrival: '13:31', departure: '13:32' }, { stationId: 1, arrival: '13:37', departure: '13:38' }, { stationId: 0, arrival: '13:42' }
    ]},
    { trainId: '1838D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '14:02' }, { stationId: 9, arrival: '14:04', departure: '14:05' }, { stationId: 8, arrival: '14:08', departure: '14:09' }, { stationId: 7, arrival: '14:12', departure: '14:13' }, { stationId: 6, arrival: '14:18', departure: '14:19' }, { stationId: 5, arrival: '14:23', departure: '14:24' }, { stationId: 4, arrival: '14:27', departure: '14:28' }, { stationId: 3, arrival: '14:30', departure: '14:31' }, { stationId: 2, arrival: '14:33', departure: '14:34' }, { stationId: 1, arrival: '14:39', departure: '14:40' }, { stationId: 0, arrival: '14:45' }
    ]},
    { trainId: '832D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '14:43' }, { stationId: 13, arrival: '14:48', departure: '14:49' }, { stationId: 12, arrival: '14:53', departure: '14:54' }, { stationId: 11, arrival: '15:00', departure: '15:01' }, { stationId: 10, arrival: '15:06', departure: '15:07' }, { stationId: 9, arrival: '15:09', departure: '15:10' }, { stationId: 8, arrival: '15:13', departure: '15:14' }, { stationId: 7, arrival: '15:17', departure: '15:18' }, { stationId: 6, arrival: '15:23', departure: '15:24' }, { stationId: 5, arrival: '15:28', departure: '15:29' }, { stationId: 4, arrival: '15:32', departure: '15:33' }, { stationId: 3, arrival: '15:35', departure: '15:36' }, { stationId: 2, arrival: '15:38', departure: '15:39' }, { stationId: 1, arrival: '15:44', departure: '15:45' }, { stationId: 0, arrival: '15:49' }
    ]},
    { trainId: '1840D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '15:42' }, { stationId: 9, arrival: '15:44', departure: '15:45' }, { stationId: 8, arrival: '15:48', departure: '15:49' }, { stationId: 7, arrival: '15:52', departure: '15:53' }, { stationId: 6, arrival: '15:58', departure: '15:59' }, { stationId: 5, arrival: '16:03', departure: '16:04' }, { stationId: 4, arrival: '16:07', departure: '16:08' }, { stationId: 3, arrival: '16:10', departure: '16:11' }, { stationId: 2, arrival: '16:13', departure: '16:14' }, { stationId: 1, arrival: '16:19', departure: '16:20' }, { stationId: 0, arrival: '16:24' }
    ]},
    { trainId: '836D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '16:30' }, { stationId: 13, arrival: '16:35', departure: '16:36' }, { stationId: 12, arrival: '16:40', departure: '16:41' }, { stationId: 11, arrival: '16:47', departure: '16:48' }, { stationId: 10, arrival: '16:53', departure: '16:54' }, { stationId: 9, arrival: '16:56', departure: '16:57' }, { stationId: 8, arrival: '17:00', departure: '17:01' }, { stationId: 7, arrival: '17:04', departure: '17:05' }, { stationId: 6, arrival: '17:10', departure: '17:11' }, { stationId: 5, arrival: '17:15', departure: '17:16' }, { stationId: 4, arrival: '17:19', departure: '17:20' }, { stationId: 3, arrival: '17:22', departure: '17:23' }, { stationId: 2, arrival: '17:25', departure: '17:26' }, { stationId: 1, arrival: '17:31', departure: '17:32' }, { stationId: 0, arrival: '17:36' }
    ]},
    { trainId: '1842D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '17:00' }, { stationId: 9, arrival: '17:02', departure: '17:03' }, { stationId: 8, arrival: '17:06', departure: '17:07' }, { stationId: 7, arrival: '17:10', departure: '17:11' }, { stationId: 6, arrival: '17:16', departure: '17:17' }, { stationId: 5, arrival: '17:21', departure: '17:22' }, { stationId: 4, arrival: '17:25', departure: '17:26' }, { stationId: 3, arrival: '17:28', departure: '17:29' }, { stationId: 2, arrival: '17:31', departure: '17:32' }, { stationId: 1, arrival: '17:37', departure: '17:38' }, { stationId: 0, arrival: '17:42' }
    ]},
    { trainId: '1844D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '17:40' }, { stationId: 9, arrival: '17:42', departure: '17:43' }, { stationId: 8, arrival: '17:46', departure: '17:47' }, { stationId: 7, arrival: '17:50', departure: '17:51' }, { stationId: 6, arrival: '17:56', departure: '17:57' }, { stationId: 5, arrival: '18:01', departure: '18:02' }, { stationId: 4, arrival: '18:05', departure: '18:06' }, { stationId: 3, arrival: '18:08', departure: '18:09' }, { stationId: 2, arrival: '18:11', departure: '18:12' }, { stationId: 1, arrival: '18:17', departure: '18:18' }, { stationId: 0, arrival: '18:22' }
    ]},
    { trainId: '838D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '17:50' }, { stationId: 13, arrival: '17:55', departure: '17:56' }, { stationId: 12, arrival: '18:00', departure: '18:01' }, { stationId: 11, arrival: '18:07', departure: '18:08' }, { stationId: 10, arrival: '18:13', departure: '18:14' }, { stationId: 9, arrival: '18:16', departure: '18:17' }, { stationId: 8, arrival: '18:20', departure: '18:21' }, { stationId: 7, arrival: '18:24', departure: '18:25' }, { stationId: 6, arrival: '18:30', departure: '18:31' }, { stationId: 5, arrival: '18:35', departure: '18:36' }, { stationId: 4, arrival: '18:39', departure: '18:40' }, { stationId: 3, arrival: '18:42', departure: '18:43' }, { stationId: 2, arrival: '18:45', departure: '18:46' }, { stationId: 1, arrival: '18:51', departure: '18:52' }, { stationId: 0, arrival: '18:57' }
    ]},
    { trainId: '1846D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '18:26' }, { stationId: 9, arrival: '18:28', departure: '18:29' }, { stationId: 8, arrival: '18:32', departure: '18:33' }, { stationId: 7, arrival: '18:36', departure: '18:37' }, { stationId: 6, arrival: '18:42', departure: '18:43' }, { stationId: 5, arrival: '18:47', departure: '18:48' }, { stationId: 4, arrival: '18:51', departure: '18:52' }, { stationId: 3, arrival: '18:54', departure: '18:55' }, { stationId: 2, arrival: '18:57', departure: '18:58' }, { stationId: 1, arrival: '19:03', departure: '19:04' }, { stationId: 0, arrival: '19:08' }
    ]},
    { trainId: '1848D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '19:16' }, { stationId: 9, arrival: '19:18', departure: '19:19' }, { stationId: 8, arrival: '19:22', departure: '19:23' }, { stationId: 7, arrival: '19:26', departure: '19:27' }, { stationId: 6, arrival: '19:32', departure: '19:33' }, { stationId: 5, arrival: '19:37', departure: '19:38' }, { stationId: 4, arrival: '19:41', departure: '19:42' }, { stationId: 3, arrival: '19:44', departure: '19:45' }, { stationId: 2, arrival: '19:47', departure: '19:48' }, { stationId: 1, arrival: '19:53', departure: '19:54' }, { stationId: 0, arrival: '19:58' }
    ]},
    { trainId: '840D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '19:33' }, { stationId: 13, arrival: '19:38', departure: '19:39' }, { stationId: 12, arrival: '19:43', departure: '19:44' }, { stationId: 11, arrival: '19:50', departure: '19:51' }, { stationId: 10, arrival: '19:56', departure: '19:57' }, { stationId: 9, arrival: '19:59', departure: '20:00' }, { stationId: 8, arrival: '20:03', departure: '20:04' }, { stationId: 7, arrival: '20:07', departure: '20:08' }, { stationId: 6, arrival: '20:13', departure: '20:14' }, { stationId: 5, arrival: '20:18', departure: '20:19' }, { stationId: 4, arrival: '20:22', departure: '20:23' }, { stationId: 3, arrival: '20:25', departure: '20:26' }, { stationId: 2, arrival: '20:28', departure: '20:29' }, { stationId: 1, arrival: '20:34', departure: '20:35' }, { stationId: 0, arrival: '20:39' }
    ]},
    { trainId: '1850D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '20:31' }, { stationId: 9, arrival: '20:33', departure: '20:34' }, { stationId: 8, arrival: '20:37', departure: '20:38' }, { stationId: 7, arrival: '20:41', departure: '20:42' }, { stationId: 6, arrival: '20:47', departure: '20:48' }, { stationId: 5, arrival: '20:52', departure: '20:53' }, { stationId: 4, arrival: '20:56', departure: '20:57' }, { stationId: 3, arrival: '20:59', departure: '21:00' }, { stationId: 2, arrival: '21:02', departure: '21:03' }, { stationId: 1, arrival: '21:08', departure: '21:09' }, { stationId: 0, arrival: '21:13' }
    ]},
    { trainId: '842D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 14, departure: '21:04' }, { stationId: 13, arrival: '21:09', departure: '21:10' }, { stationId: 12, arrival: '21:14', departure: '21:15' }, { stationId: 11, arrival: '21:21', departure: '21:22' }, { stationId: 10, arrival: '21:27', departure: '21:28' }, { stationId: 9, arrival: '21:30', departure: '21:31' }, { stationId: 8, arrival: '21:34', departure: '21:35' }, { stationId: 7, arrival: '21:38', departure: '21:39' }, { stationId: 6, arrival: '21:44', departure: '21:45' }, { stationId: 5, arrival: '21:49', departure: '21:50' }, { stationId: 4, arrival: '21:53', departure: '21:54' }, { stationId: 3, arrival: '21:56', departure: '21:57' }, { stationId: 2, arrival: '21:59', departure: '22:00' }, { stationId: 1, arrival: '22:05', departure: '22:06' }, { stationId: 0, arrival: '22:10' }
    ]},
    { trainId: '1852D', type: '普通', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '21:55' }, { stationId: 9, arrival: '21:57', departure: '21:58' }, { stationId: 8, arrival: '22:01', departure: '22:02' }, { stationId: 7, arrival: '22:05', departure: '22:06' }, { stationId: 6, arrival: '22:11', departure: '22:12' }, { stationId: 5, arrival: '22:16', departure: '22:17' }, { stationId: 4, arrival: '22:20', departure: '22:21' }, { stationId: 3, arrival: '22:23', departure: '22:24' }, { stationId: 2, arrival: '22:26', departure: '22:27' }, { stationId: 1, arrival: '22:32', departure: '22:33' }, { stationId: 0, arrival: '22:37' }
    ]},
    { trainId: 'TEST', type: '臨時', direction: 'down', destination: '下関', delayMinutes: 0, timetable: [
        { stationId: 10, departure: '02:55' }, { stationId: 9, arrival: '02:57', departure: '02:58' }, { stationId: 8, arrival: '03:01', departure: '03:02' }, { stationId: 7, arrival: '03:06'}
    ]},    
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
                item.innerHTML = `<div class="announcement-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg></div><span>${info.message}</span>`;
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
                trainDiv.className = 'train stopped';
                trainDiv.style.top = `${trainY - 11}px`;
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
                    trainDiv.className = 'train waiting';
                    trainDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>`;
                    trainDiv.style.top = `${trainY - 11}px`;
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
                        trainDiv.className = `train ${train.direction} ${train.delayMinutes > 0 ? 'delayed' : ''}`;
                        trainDiv.style.top = `${trainY - 8}px`;
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
