const prompt = require('prompt-sync')({ sigint: true });
const term = require('terminal-kit').terminal;

class Field {
  _playerPosition = {
    x: null,
    y: null,
  };
  _width;
  _height;
  _holesPercentage;
  _map;

  // TODO: extensions
  // _score;
  // _level;
  // _mode;

  constructor(width, height, holesPercentage) {
    this._width = width;
    this._height = height;
    this._holesPercentage = holesPercentage;
    this.generateMap();
  }

  static hat = '^';
  static hole = 'O';
  static fieldCharacter = '░';
  static pathCharacter = '*';

  generateMap() {
    const newMap = [];
    const mapSize = this._width * this._height;
    const holeCount = Math.floor((mapSize - 2) * this._holesPercentage);
    const fieldCharacterCount = mapSize - holeCount - 2;
    const mapElements = [Field.hat, Field.pathCharacter]
      .concat(Array(holeCount).fill(Field.hole))
      .concat(Array(fieldCharacterCount).fill(Field.fieldCharacter));

    for (let i = 0; i < this._height; i++) {
      newMap[i] = [];
      for (let j = 0; j < this._width; j++) {
        const rand = Math.floor(Math.random() * mapElements.length);
        newMap[i].push(mapElements[rand]);
        mapElements.splice(rand, 1);
      }
    }

    this._map = newMap;
  }

  printMap(message) {
    console.clear();
    console.log(
      `Current position: {${this._playerPosition.x},${this._playerPosition.y}}\n`
    );

    for (let x = 0; x < this._height; x++) {
      for (let y = 0; y < this._width; y++) {
        if (this._map[x][y].toString() === Field.hat) {
          term.brightYellow.bold(Field.hat, ' ');
        } else if (this._map[x][y].toString() === Field.hole) {
          term.red.bold(Field.hole, ' ');
        } else if (this._map[x][y].toString() === Field.pathCharacter) {
          if (this._playerPosition.x === x && this._playerPosition.y === y) {
            term.green.bold(Field.pathCharacter, ' ');
          } else {
            term.white.bold(Field.pathCharacter, ' ');
          }
        } else if (this._map[x][y].toString() === Field.fieldCharacter) {
          term.bold(Field.fieldCharacter, ' ');
        }
      }
      console.log('\n');
    }

    if (message !== undefined) {
      term.red(message, '\n\n');
    }
  }

  // TODO: extensions
  // scoreboard() {}

  setStartPosition() {
    for (const [rowIndex, row] of this._map.entries()) {
      const pathCharacterIndex = row.indexOf(Field.pathCharacter);
      if (pathCharacterIndex >= 0) {
        this._playerPosition.x = rowIndex;
        this._playerPosition.y = pathCharacterIndex;
        break;
      }
    }
  }

  movePlayer() {
    let newX, newY;
    let direction = null;
    const moveDirections = {
      w: {
        x: -1,
        y: 0,
      },
      a: {
        x: 0,
        y: -1,
      },
      s: {
        x: 1,
        y: 0,
      },
      d: {
        x: 0,
        y: 1,
      },
    };

    this.printMap();

    while (true) {
      while (!['w', 'a', 's', 'd'].includes(direction)) {
        if (direction !== null) {
          this.printMap('Invalid move!');
        }
        term.blue
          .bold('w = up ')
          .magenta.bold('a = left ')
          .green.bold('s = down ')
          .cyan.bold('d = right');
        console.log('\n');
        direction = prompt('Which way? ').trim().toLowerCase();
      }

      newX = this._playerPosition.x + moveDirections[direction].x;
      newY = this._playerPosition.y + moveDirections[direction].y;

      if (newX < 0 || newY < 0 || newX >= this._height || newY >= this._width) {
        this.printMap('Out of bounds!');
        direction = null;
        continue;
      }

      let playerMove = this._map[newX][newY];

      if (playerMove === Field.hole) {
        term
          .noFormat('\nSorry, you fell down a hole... ')
          .yellow.bold('GAME OVER!');
        break;
      }

      if (playerMove === Field.hat) {
        term.yellow.bold('\nCongrats, you found your hat!');
        break;
      }

      if (
        playerMove === Field.fieldCharacter ||
        playerMove === Field.pathCharacter
      ) {
        this._playerPosition.x = newX;
        this._playerPosition.y = newY;
        this._map[newX][newY] = Field.pathCharacter;
        this.printMap();
        direction = null;
        continue;
      }
    }
  }
}

class Game {
  play() {
    const field = new Field(5, 3, 0.2);

    while (true) {
      field.setStartPosition();
      field.printMap();
      term
        .noFormat('press ')
        .blue.bold('[s]')
        .noFormat(' to start game or ')
        .blue.bold('[any key]')
        .noFormat(' / ')
        .blue.bold('[enter]')
        .noFormat(' to generate new map\n\n');
      const input = prompt(': ');
      if (input === 's') {
        break;
      } else {
        field.generateMap();
      }
    }

    field.movePlayer();
  }

  again() {}
}

const game = new Game();
game.play();
