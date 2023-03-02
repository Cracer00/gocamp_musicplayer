import {Playlist, Song} from "../playlist.js";

describe("Playlist", () => {
    let playlist;

    beforeEach(() => {
        playlist = new Playlist();
        playlist.addSong(5000, "Песня 1");
        playlist.addSong(6000, "Песня 2");
    });

    test("Плейлист должен начинать воспроизведение первой песни при вызове функции play", () => {
        playlist.play();
        expect(playlist.current.name).toBe("Песня 1");
        expect(playlist.isPlaying).toBe(true);
    });

    test("Плейлист должен переключаться на следующую песню после окончания текущей песни", () => {
        playlist.play();
        jest.advanceTimersByTime(5000); // Перематываем таймер
        expect(playlist.current.name).toBe("Песня 2");
        expect(playlist.isPlaying).toBe(true);
    });

    test("Плейлист должен переключать песню на следующую при вызове функции next", () => {
       playlist.play();
       playlist.next();
        expect(playlist.current.name).toBe("Песня 2");
        expect(playlist.isPlaying).toBe(true);
    });

    test("Плейлист должен переключать песню на предыдущую при вызове функции prev", () => {
        playlist.play();
        jest.advanceTimersByTime(5000);
        playlist.prev();
        expect(playlist.current.name).toBe("Песня 1");
        expect(playlist.isPlaying).toBe(true);
    });

    test("Плейлист должен приостанавливать воспроизведение при вызове функции pause", () => {
        playlist.play();
        jest.advanceTimersByTime(1000); // Перематываем таймер
        playlist.pause();
        expect(playlist.isPlaying).toBe(false);
    });

    test("Плейлист должен отдавать список песен в массиве при вызове функции listSongs", () => {
        playlist.play();
        const songList = playlist.listSongs();
        expect([songList]).toEqual([["Песня 1", "Песня 2"]]);
    });

    test("Плейлист должен останавливать воспроизведение после окончания последней песни", () => {
        playlist.play();
        jest.advanceTimersByTime(11000); // Перематываем таймер
        expect(playlist.current.name).toBe("Песня 1");
        expect(playlist.isPlaying).toBe(false);
    });
});