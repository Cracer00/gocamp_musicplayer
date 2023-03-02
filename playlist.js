export class Song {
    constructor(duration, name) {
        this.duration = duration;
        this.name = name;
        this.next = null;
        this.prev = null;
        this.currentTime = 0; // текущее время воспроизведения
        this.currentTimeOnPause = 0; // время воспроизведения в момент постановки на паузу
    }
}

export class Playlist {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null; // текущая песня
        this.isPlaying = false; // статус воспроизведения
        this.timerId = null; // свойство для идентификатора таймера
    }

    /**
     * Начать воспроизведение
     */
    play(position) {
        if (this.isPlaying) return "Плейлист уже проигрывается.";

        if (position < 0) {
            return "Позиция должна быть неотрицательным числом.";
        }

        if (this.current.currentTimeOnPause > 0) {
            this.current.currentTime = this.current.currentTimeOnPause;
        }
        if (position === undefined) {
            if (!this.current) {
                this.current = this.head;
            }
        } else {
            if (position >= this.getLength() || position < 0) {
                return "Некорректная позиция песни.";
            }
            let i = 0;
            let song = this.head;
            while (song) {
                if (i === position) {
                    this.current = song;
                    break;
                }
                i++;
                song = song.next;
            }
        }
        console.log('Сейчас играет: ' + this.current.name);
        console.log('Продолжительность: ' + this.current.duration);
        this.isPlaying = true;
        this.timerId = setInterval(() => {
            this.current.currentTime += 1000;
            if (this.current.currentTime >= this.current.duration) {
                this.isPlaying = false;
                this.next();
            }
        }, 1000);
        return this.current;
    }

    // Эта функция перебирает все элементы связанного списка плейлиста и увеличивает переменную count на 1 для каждого элемента, пока не достигнет конца списка. Затем она возвращает общее количество песен в плейлисте. Эта функция используется в коде, чтобы определить, является ли позиция, переданная в функцию play(), корректной или нет. Если позиция больше или равна общему количеству песен в плейлисте или меньше 0, функция play() вернет сообщение об ошибке.
    getLength() {
        let count = 0;
        let song = this.head;
        while (song) {
            count++;
            song = song.next;
        }
        return count;
    }

    /**
     * Получить текущую проигрываемую песню
     * @returns {string|Song} - возвращает строку если произошла ошибка, в ином случае возвращает Song
     */
    getCurrentSong() {
        if (!this.isPlaying) return "Сейчас ничего не проигрывается.";
        return this.current;
    }

    /**
     * Добавить песню в плейлист
     * @param duration - длина песни в ms
     * @param name - наименование песни
     */
    addSong(duration, name) {
        if (name.replace(/\s/g, "").length < 3) {
            return "Имя песни должно быть длиннее 3-х символов.";
        }
        if (duration <= 0) {
            return "Длительность песни должна быть больше 0 секунд.";
        }
        const newSong = new Song(duration, name);
        if (!this.head) {
            this.head = newSong;
            this.tail = newSong;
            this.current = newSong;
        } else {
            newSong.prev = this.tail;
            this.tail.next = newSong;
            this.tail = newSong;
        }
        return newSong;
    }

    /**
     * Удалить песню из плейлиста
     * @param position - позиция песни в списке
     * @returns {string|{prev}} - возвращает строку если произошла ошибка, в ином случае возвращает Song
     */
    deleteSong(position) {
        if (position < 0) {
            return "Позиция должна быть неотрицательным числом.";
        }
        let currentSong = this.head;
        let index = 0;
        while (currentSong) {
            if (index === position) {
                if (currentSong === this.current) {
                    return "Невозможно удалить песню - она проигрывается в данный момент";
                }
                if (currentSong.prev) {
                    currentSong.prev.next = currentSong.next;
                } else {
                    this.head = currentSong.next;
                }
                if (currentSong.next) {
                    currentSong.next.prev = currentSong.prev;
                } else {
                    this.tail = currentSong.prev;
                }
                if (currentSong === this.current) {
                    this.pause();
                    this.current = this.current.next || this.current.prev;
                    if (this.current) {
                        this.play();
                    }
                }
                return currentSong;
            }
            currentSong = currentSong.next;
            index++;
        }
        return "Песня с такой позицией не найдена.";
    }

    /**
     * Позволяет изменить песню в списке указав позицию
     * @param position - позиция в списке
     * @param newName - новое имя песни
     * @param newDuration - новая продолжительность
     * @returns {string|Song} - возвращает строку если произошла ошибка, в ином случае возвращает Song
     */
    updateSong(position, newName, newDuration) {
        if (position < 0) {
            return "Позиция должна быть неотрицательным числом.";
        }
        let currentSong = this.head;
        let index = 0;
        while (currentSong) {
            if (index === position) {
                if (currentSong === this.current) {
                    return "Невозможно изменить песню - она проигрывается в данный момент";
                }
                currentSong.name = newName;
                currentSong.duration = newDuration;
                return currentSong;
            }
            currentSong = currentSong.next;
            index++;
        }
        return "Песня с такой позицией не найдена.";
    }

    /**
     * Получить список песен
     * @returns {*[]} Массив с именами песен
     */
    listSongs() {
        const songs = [];
        let currentSong = this.head;
        while (currentSong) {
            songs.push({name: currentSong.name, duration: currentSong.duration});
            currentSong = currentSong.next;
        }
        return songs;
    }

    /**
     * Поставить воспроизведение на паузу
     */
    pause() {
        if (!this.isPlaying) return "Плейлист не проигрывается.";

        if (this.timerId) { // проверяем, что таймер запущен
            this.current.currentTimeOnPause = this.current.currentTime;
            clearTimeout(this.timerId);
            this.isPlaying = false;
            return true;
        }
    }

    /**
     * Воспроизвести следующую песню
     */
    next() {
        clearTimeout(this.timerId);
        this.isPlaying = false;
        this.current.currentTimeOnPause = 0;
        if (this.current.next) {
            this.current = this.current.next;
            this.play();
            return this.current;
        } else {
            this.current = this.head;
            return "Плейлист закончился.";
        }
    }

    /**
     * Воспроизвести предыдущую песню
     */
    prev() {
        clearTimeout(this.timerId);
        this.isPlaying = false;
        this.current.currentTimeOnPause = 0;
        this.pause(); // останавливаем таймер перед переходом к предыдущей песне
        if (this.current.prev) {
            this.current = this.current.prev;
            this.play();
            return this.current;
        } else {
            this.current = this.tail;
            return "Плейлист закончился.";
        }
    }
}