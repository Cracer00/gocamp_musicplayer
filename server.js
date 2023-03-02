import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import {Playlist, Song} from "./playlist.js";
import {MongoClient} from 'mongodb';
import fs from 'fs';

// Путь к .proto с определениями сервиса
const PROTO_FILE = "./service_def.proto";

// Опции proto
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// Загружаем proto
const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);

// Загружаем определение в gRPC
const userProto = grpc.loadPackageDefinition(pkgDefs);

// Создаем сервер
const server = new grpc.Server();

// Создаем глобальный плейлист для теста
const playlist = new Playlist();

// Грузим обьект с плейлистом
LoadPlaylistFromFile();

// Если использовать MongoDB: Функция помогает избежать циклических свойств в объекте, для сохранения в MongoDB, потому что BSON, которая используется для сериализации и десериализации данных в MongoDB, не может обработать такие объекты
function ConvertPlaylist(playlist) {
    const songsList = playlist.listSongs();
    for (let song of songsList) {
        console.log(song.name + " " + song.duration)
    }
    return songsList;
}

function SavePlaylistToFile() {
    const songsList = ConvertPlaylist(playlist);
    const playlistObj = {songs: songsList}; // создание объекта, содержащего массив песен
    const fileName = 'playlist.json';
    fs.writeFile(fileName, JSON.stringify(playlistObj), (err) => {
        if (err) throw err;
        console.log('Плейлист сохранен.');
    });
}

function LoadPlaylistFromFile() {
    const fileName = 'playlist.json';
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // Проверка на пустоту
        if (!data.trim()) {
            console.log('Файл плейлиста пуст.');
            return;
        }
        // Обработка данных из файла
        const songsData = JSON.parse(data);
        const songsList = songsData.songs;
        for (let songData of songsList) {
            playlist.addSong(songData.duration, songData.name); // добавление песни в плейлист
        }
        console.log(playlist.listSongs());
    });
}

// Добавляем сервис для работы с пользователями. Можно реализовать пользовательские плейлисты...
server.addService(userProto.UserService.service, {
    // Имплементируем GetUser
    GetUser: (input, callback) => {
        try {
            callback(null, {name: "User"}); // Тестовый юзер
        } catch (error) {
            callback(error, null);
        }
    },
});

// Добавляем сервис для работы с плейлистом
server.addService(userProto.PlaylistService.service, {
    // Получить текущий плейлист
    GetPlaylist: (request, callback) => {
        try {
            const songList = playlist.listSongs();
            if (songList.length === 0) {
                throw new Error('Список песен пуст');
            }
            const response = {song_list: songList, total_songs: songList.length};
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    // Добавить песню
    AddSong: (request, callback) => {
        try {
            const song = playlist.addSong(request.request.duration_mseconds, request.request.song_name);
            // Если из функции пришел null - песня не добавлена
            if (song === null) {
                throw new Error('Не удается добавить песню.');
            }
            // Если вместо объекта пришла строка - выводим ошибку
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Песня успешно добавлена в плейлист."};
            SavePlaylistToFile();
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    // Получить текущую песню
    GetSong: (request, callback) => {
        try {
            const song = playlist.getCurrentSong();
            // Если из функции пришел null - песня не добавлена
            if (song === null) {
                throw new Error('Не удается получить песню.');
            }
            // Если вместо объекта пришла строка - выводим ошибку
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {
                song: {
                    song_name: song.name,
                    duration_mseconds: song.duration
                }
            };
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    // Удалить текущую песню
    DeleteSong: (request, callback) => {
        try {
            const song = playlist.deleteSong(request.request.song_position);
            // Если из функции пришла строка - песня не удалена
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Песня " + song.name + " успешно удалена."};
            SavePlaylistToFile();
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    // Изменить песню
    UpdateSong: (request, callback) => {
        try {
            const song = playlist.updateSong(request.request.song_position, request.request.song_name, request.request.duration_mseconds);
            // Если из функции пришла строка - песня не изменена
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Песня успешно изменена."};
            SavePlaylistToFile();
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    // Начать воспроизведение
    PlaySong: (request, callback) => {
        try {
            const position = request.request.song_position;
            const song = playlist.play(position);
            // Если из функции пришла строка - выдаем ошибку
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Песня " + song.name + " проигрывается."};
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    Pause: (request, callback) => {
        try {
            const song = playlist.pause();
            // Если из функции пришла строка - выдаем ошибку
            if (typeof song === "string") {
                throw new Error(song);
            }
            if (typeof song === "boolean") {
                const response = {success: true, message: "Плейлист поставлен на паузу."};
                callback(null, response);
            } else throw new Error("Ошибка. Плейлист не может быть поставлен на паузу сейчас.");
        } catch (error) {
            callback(error, null);
        }
    },
    PlayNext: (request, callback) => {
        try {
            const song = playlist.next();
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Плейлист переключен на следующую песню: " + song.name};
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
    PlayPrevious: (request, callback) => {
        try {
            const song = playlist.prev();
            if (typeof song === "string") {
                throw new Error(song);
            }
            const response = {success: true, message: "Плейлист переключен на предыдущую песню: " + song.name};
            callback(null, response);
        } catch (error) {
            callback(error, null);
        }
    },
});

// Запускаем сервер
server.bindAsync(
    // Указываем IP:PORT
    "127.0.0.1:5000",
    // Настройки аутентификации
    grpc.ServerCredentials.createInsecure(),
    // Коллбэк для информации
    (error, port) => {
        console.log(`Сервер запущен на порту ${port}`);
        server.start();
    }
);