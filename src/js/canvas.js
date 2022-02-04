import platform from "../images/platform.png";
import hills from "../images/hills.png";
import background from "../images/background.png";
import platformSmallTall from "../images/platformSmallTall.png";

import standRight from "../images/spriteStandRight.png";
import standLeft from "../images/spriteStandLeft.png";
import runRight from "../images/spriteRunRight.png";
import runLeft from "../images/spriteRunLeft.png";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;
class Player {
  constructor() {
    this.speed = 10;
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 66;
    this.height = 150;
    this.image = createImage(standRight);
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(standRight),
        left: createImage(standLeft),
        cropWidth: 177,
        width: 66,
      },
      run: {
        right: createImage(runRight),
        left: createImage(runLeft),

        cropWidth: 341,
        width: 127.875,
      },
    };

    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 177;
  }

  draw() {
    c.drawImage(
      this.currentSprite,
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    // CHARACTER MOVE FORWARD AND BACKWARD
    this.frames++;
    if (
      this.frames > 59 &&
      (this.currentSprite === this.sprites.stand.right ||
        this.currentSprite === this.sprites.stand.left)
    )
      this.frames = 0;
    else if (
      this.frames > 29 &&
      (this.currentSprite === this.sprites.run.right ||
        this.currentSprite === this.sprites.run.left)
    )
      this.frames = 0;

    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// SCENARY OBJECTS
class GenericObjects {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

function createImage(imageSrc) {
  let image = new Image();
  image.src = imageSrc;
  return image;
}
let platformImage = createImage(platform);
let platformSmallTallImage = createImage(platformSmallTall);
let player = new Player();
let platforms = [];
let genericObjects = [];

let lastKey;
let keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

let scrollOffset = 0;

function restartGame() {
  platformImage = createImage(platform);
  player = new Player();
  platforms = [
    new Platform({
      x:
        platformImage.width * 3 +
        550 -
        2 +
        platformImage.width -
        platformSmallTallImage.width,
      y: 250,
      image: createImage(platformSmallTall),
    }),
    new Platform({ x: -1, y: 450, image: platformImage }),
    new Platform({ x: platformImage.width - 3, y: 450, image: platformImage }),
    new Platform({
      x: platformImage.width * 2 + 100,
      y: 450,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 3 + 300,
      y: 450,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 3 + 600 - 2,
      y: 450,
      image: platformImage,
    }),
    new Platform({
      x: platformImage.width * 5 + 300 - 2,
      y: 450,
      image: platformImage,
    }),
  ];
  genericObjects = [
    new GenericObjects({
      x: -1,
      y: -1,
      image: createImage(background),
    }),
    new GenericObjects({
      x: 0,
      y: 0,
      image: createImage(hills),
    }),
  ];

  let scrollOffset = 0;
}
// ANIMATION
function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "white";
  c.clearRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((GenericObject) => {
    GenericObject.draw();
  });
  platforms.forEach((platform) => {
    platform.draw();
  });
  player.update();

  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (
    (keys.left.pressed && player.position.x > 100) ||
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
  ) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => {
        platform.position.x -= player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.66;
      });
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed;

      platforms.forEach((platform) => {
        platform.position.x += player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.66;
      });
    }
  }
  // Plarofrm collision to control jumping and landing
  platforms.forEach((platform) => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0;
    }
  });
  // SPRITE SWITCHING
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.frames = 1;

    player.currentSprite = player.sprites.run.right;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.stand.right
  ) {
    player.frames = 1;

    player.currentSprite = player.sprites.stand.right;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.currentSprite = player.sprites.run.left;
    player.currentCropWidth = player.sprites.run.cropWidth;
    player.width = player.sprites.run.width;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.stand.left
  ) {
    player.currentSprite = player.sprites.stand.left;
    player.currentCropWidth = player.sprites.stand.cropWidth;
    player.width = player.sprites.run.width;
  }
  // WIN CONDITION
  if (scrollOffset > platformImage.width * 5 + 300 - 2) {
    console.log("win win");
  }
  // LOSE CONDITION
  if (player.position.y > canvas.height) {
    // console.log("You Lose");
    restartGame();
  }
}
restartGame();
animate();

window.addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      console.log("left");
      keys.left.pressed = true;

      break;

    case 83:
      console.log("down");
      break;

    case 68:
      console.log("right");
      keys.right.pressed = true;
      // player.currentSprite = player.sprites.run.right;
      // player.currentCropWidth = player.sprites.run.cropWidth;
      // player.width = player.sprites.run.width;
      lastKey = "right";

      break;

    case 87:
      console.log("up");
      player.velocity.y -= 20;
      break;
  }
});
// up = 38 , down = 40, left = 37 , right = 39
window.addEventListener("keyup", ({ keyCode }) => {
  // console.log(keyCode);
  switch (keyCode) {
    case 65:
      console.log("left");
      keys.left.pressed = false;
      lastKey = "left";

      break;

    case 83:
      console.log("down");
      break;

    case 68:
      console.log("right");
      keys.right.pressed = false;

      break;

    case 87:
      console.log("up");
      break;
  }
});
