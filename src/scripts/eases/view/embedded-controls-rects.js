import render from '@/scripts/eases/view/render/index';

const tableRect = render.rects.table;

const phi = 1.618;

export default {

    openHH: {
        x: 2 + tableRect.x,
        y: 2 + tableRect.y,
        width: 223, height: 29
    },

    navigation: {

        /*    previousHand: {
               x: 470 + tableRect.x,
               y: 470 + tableRect.y,
               width: 50, height: 28
           },
           previousAction: {
               x: 525 + tableRect.x,
               y: 470 + tableRect.y,
               width: 50, height: 28
           },
           play: {
               x: 580 + tableRect.x,
               y: 470 + tableRect.y,
               width: 50, height: 28
           },
           nextAction: {
               x: 635 + tableRect.x,
               y: 470 + tableRect.y,
               width: 50, height: 28
           },
           nextHand: {
               x: 690 + tableRect.x,
               y: 470 + tableRect.y,
               width: 50, height: 28
           } */
        previousHand: {
            x: 430 + tableRect.x,
            y: 470 + tableRect.y,
            width: 50, height: 28
        },
        previousAction: {
            x: 485 + tableRect.x,
            y: 470 + tableRect.y,
            width: 50, height: 28
        },
        play: {
            x: 540 + tableRect.x,
            y: 470 + tableRect.y,
            width: 50, height: 28
        },
        nextAction: {
            x: 595 + tableRect.x,
            y: 470 + tableRect.y,
            width: 50, height: 28
        },
        nextHand: {
            x: 650 + tableRect.x,
            y: 470 + tableRect.y,
            width: 50, height: 28
        }
    },

    chat: {
        x: 3 + tableRect.x,
        y: 442 + tableRect.y,
        width: 329, height: 108
    },

    handsList: {
        x: 0, y: 0,
        width: 96, height: 595 - 44
    },

    showBigBlinds: {
        x: 99, y: 462,
        width: 10, height: 14
    },

    searchHand: {
        x: 0, y: 595 - 44,
        width: 96, height: 44
    },

    clearHandFilter: {
        x: 66, y: 565,
        width: 28, height: 28
    },

    shareHand: {
        x: tableRect.x + tableRect.width - 227,
        y: tableRect.y + tableRect.height - 33,
        width: 223, height: 29
    },

    navigationMobile: {

        previousHand: {
            x: 342 + tableRect.x,
            y: 484 + tableRect.y,
            width: 50 * phi, height: 28 * phi
        },
        previousAction: {
            x: 432 + tableRect.x,
            y: 484 + tableRect.y,
            width: 50 * phi, height: 28 * phi
        },
        play: {
            x: 522 + tableRect.x,
            y: 484 + tableRect.y,
            width: 50 * phi, height: 28 * phi
        },
        nextAction: {
            x: 612 + tableRect.x,
            y: 484 + tableRect.y,
            width: 50 * phi, height: 28 * phi
        },
        nextHand: {
            x: 702 + tableRect.x,
            y: 484 + tableRect.y,
            width: 50 * phi, height: 28 * phi
        }
    },

    fullWindowed: {
        x: 753 + tableRect.x,
        y: 420 + tableRect.y,
        width: 26, height: 24
    },

    settings: {
        x: 80 + tableRect.x,
        y: 390 + tableRect.y,
        width: 28, height: 28
    },

    startBySummary: {
        x: 14 + tableRect.x,
        y: 490 + tableRect.y,
        width: 10, height: 14
    },

    showPlayersProfit: {
        x: 14 + tableRect.x,
        y: 512 + tableRect.y,
        width: 10, height: 14
    },

    closeSettings: {
        x: 295 + tableRect.x,
        y: 468 + tableRect.y,
        width: 28, height: 28
    },

    streetNavigation: {

        preflop: {
            x: 540 + tableRect.x,
            y: 420 + tableRect.y,
            width: 28, height: 28
        },
        flop: {
            x: 572 + tableRect.x,
            y: 420 + tableRect.y,
            width: 28, height: 28
        },
        turn: {
            x: 604 + tableRect.x,
            y: 420 + tableRect.y,
            width: 28, height: 28
        },
        river: {
            x: 636 + tableRect.x,
            y: 420 + tableRect.y,
            width: 28, height: 28
        },
        summary: {
            x: 672 + tableRect.x,
            y: 420 + tableRect.y,
            width: 28, height: 28
        },
    },
    streetNavigationMobile: {

        preflop: {
            x: 500 + tableRect.x,
            y: 410 + tableRect.y,
            width: 28 * phi, height: 28 * phi
        },
        flop: {
            x: 555 + tableRect.x,
            y: 410 + tableRect.y,
            width: 28 * phi, height: 28 * phi
        },
        turn: {
            x: 610 + tableRect.x,
            y: 410 + tableRect.y,
            width: 28 * phi, height: 28 * phi
        },
        river: {
            x: 665 + tableRect.x,
            y: 410 + tableRect.y,
            width: 28 * phi, height: 28 * phi
        },
        summary: {
            x: 730 + tableRect.x,
            y: 410 + tableRect.y,
            width: 28 * phi, height: 28 * phi
        },
    }
};