import {Playlist, Song} from "./playlist.js";

// Создаем экземпляр плейлиста
const playlist = new Playlist();

playlist.addSong(18000, "Кукла колдуна.mp3");
playlist.addSong(16000, "Трасса Е95.mp3");
playlist.addSong(16000, "Отель Калифорния.mp3");
playlist.addSong(16000, "Киллинг Стрэнджерс.mp3");

// Начинаем воспроизведение
playlist.play(2);

setTimeout(() => {
    /*console.log(playlist.listSongs());
    const temp = playlist.pause();
    console.log(temp);
    console.log(playlist.listSongs());*/
}, 3000);