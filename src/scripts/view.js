import Button from "./controls/button";
import ease from '@/scripts/eases/view/index';
import { HistoryT } from '@/scripts/units/history';
import embeddedRects from '@/scripts/eases/view/embedded-controls-rects';
import easeRender from '@/scripts/eases/view/render/index'
import enums, { buttonStates } from '@/scripts/units/enums';
import Chat from "./controls/chat";
import HandsList from "./controls/hand-list";
import displayPositions from "./units/display-positions";
import { pointInRect } from "./units/fns";
import CheckBox from "./controls/checkbox";
import { drawPoweredBy } from '@/scripts/eases/view/render/table/index';


export default class View {

    static canvasAux = document.createElement('canvas');
    static contextAux = View.canvasAux.getContext('2d');

    constructor() {

        this.coordsDiv = document.querySelector('#mouse-coords');

        this.loadHH = document.querySelector('#load-hand-history');

        /** @type {HTMLCanvasElement} */
        this.canvas = document.querySelector('#canvas');
        this.context = this.canvas.getContext('2d');

        const { handsList } = embeddedRects;
        const { table, mainInfo } = easeRender.rects;
        this.canvas.width = handsList.width + table.width;
        this.canvas.height = mainInfo.height + table.height;

        /** @type {HTMLCanvasElement} */
        this.canvasToolTip = document.querySelector('#canvas-tool-tip');
        this.contextToolTip = this.canvasToolTip.getContext('2d');
        this.canvasToolTip.width = this.canvas.width;
        this.canvasToolTip.height = this.canvas.height;

        this.embeddables = [];
        this.createEmbeddedControls();

        this.images = {};

        // intervals em table
        this.inter = null;

        this.setCallOffEmbeddedControls();
    }

    /**
     * 
     * @param {*} tryLoadFromOnlineDB callback
     */
    async setImages(tryLoadFromOnlineDB) {

        try {

            this.images = await ease.loadImages();

            await this.setEmbeddedControlsImages();

            this.embeddables.forEach(x => x.draw());

            tryLoadFromOnlineDB();

        } catch (error) {

            console.error(error);
        }
    }

    createEmbeddedControls() {

        const { navigation: rect, handsList: handsListRect } = embeddedRects;

        const state = buttonStates.disabled;

        this.previousHand = new Button(this, rect.previousHand, { state });
        this.previousAction = new Button(this, rect.previousAction, { state });
        this.play = new Button(this, rect.play, { state });
        this.nextAction = new Button(this, rect.nextAction, { state });
        this.nextHand = new Button(this, rect.nextHand, { state });

        const { chat: chatRect, showBigBlinds: showBBsRect } = embeddedRects;

        this.chat = new Chat(this, chatRect);

        this.handsList = new HandsList(this, handsListRect);

        const showBBsText = 'Show Stack Values in Big Blinds';
        this.showBigBlinds = new CheckBox(this, showBBsRect, showBBsText);


        const {
            searchHand: searchHandRect,
            clearHandFilter: clearRect,
            shareHand: shareHandRect
        } = embeddedRects;
        const hiddenNot3d = { state: buttonStates.hidden, is3d: false };
        this.searchHand = new Button(this, searchHandRect, hiddenNot3d);

        this.clearHandsFilter = new Button(this, clearRect, hiddenNot3d);

        this.shareHand = new Button(this, shareHandRect, { state: buttonStates.hidden });
    }

    async setEmbeddedControlsImages() {

        // NOTE:: Os buttons 3d vão buscar o background 
        // (nao pode ficar so no resetScreen)
        const { table } = easeRender.rects;
        this.context.drawImage(this.images.background, table.x, table.y);

        await this.previousHand.setImages(this.images.navigation, { row: 0 })
        await this.previousAction.setImages(this.images.navigation, { row: 1 });
        await this.play.setImages(this.images.navigation, { row: 2 });
        await this.nextAction.setImages(this.images.navigation, { row: 3 });
        await this.nextHand.setImages(this.images.navigation, { row: 4 });

        await this.chat.setImage(this.images.chat);

        // NOTE:: carrega as imagens da scrollbar internamente
        await this.handsList.setImage();

        await this.searchHand.setImages(this.images.searchHand, { row: 0 });
        await this.clearHandsFilter.setImages(this.images.clearHandFilter, { row: 0 });
        await this.shareHand.setImages(this.images.openShareButtons, { row: 1 });

        this.resetScreen();
    }

    bindControls(handlers) {

        // this.coordsDiv.innerHTML = e.offsetX
        this.loadHH.addEventListener('change', handlers.loadHandHistory);
        this.canvas.addEventListener('mousemove', handlers.canvasMouseMove);
        this.canvas.addEventListener('mousedown', handlers.canvasMouseDown);
        this.canvas.addEventListener('mouseup', handlers.canvasMouseUp);
        this.canvas.addEventListener('keyup', handlers.canvasKeyUp);
    }

    bindEmbeddedControls(handlers) {

        this.previousHand.bind(handlers.previousHand);
        this.previousAction.bind(handlers.previousAction);
        this.play.bind(handlers.play);
        this.nextAction.bind(handlers.nextAction);
        this.nextHand.bind(handlers.nextHand);
        this.handsList.bind(handlers.handsList);
        this.showBigBlinds.bind(handlers.showBigBlinds);
        this.searchHand.bind(handlers.searchHand);
        this.clearHandsFilter.bind(handlers.clearHandsFilter);
        this.shareHand.bind(handlers.shareHand);
    }

    setCallOffEmbeddedControls() {

        this.canvas.addEventListener('mouseout', (e) => {

            this.handsList.clearHover();
            this.chat.clearHover();
            this.searchHand.clearHover();
            this.clearHandsFilter.clearHover();
            this.shareHand.clearHover();
        });

        window.addEventListener('mouseup', () => {

            this.handsList.unpressScrollBar();
            this.chat.unpressScrollBar();
        });
    }

    resetScreen() {

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const { table, logo } = easeRender.rects;

        this.context.drawImage(this.images.background, table.x, table.y);
        this.context.drawImage(this.images.logo, table.x + logo.x, table.y + logo.y);
        drawPoweredBy.call(this, { fromView: true });

        this.showBigBlinds.setImage();

        if (this.inter !== null) {

            clearInterval(this.inter);
            this.inter = null;
        }

        const navs = {
            previousHand: false,
            previousAction: false,
            play: false,
            nextAction: false,
            nextHand: false
        };

        this.updateNavigation(navs);

        this.embeddables.forEach(x => x.draw());
    }

    /**
     * @param {HistoryT} history 
     * @param {string} navigation enums.navigation
     */
    updateChat(history, navigation) {

        const work = {

            previousHand: () => {
                this.chat.removeAll();
                this.chat.addRange(history.line);
            },
            previousAction: () => this.chat.remove(),
            nextAction: () => this.chat.add(history.line),
            nextHand: () => {
                this.chat.removeAll();
                this.chat.addRange(history.line);
            }
        };

        work[navigation].call();
    };

    /**
     * 
     * @param {HistoryT} history 
     * @param {MainInfoT} mainInfo
     */
    render(history, mainInfo, handFiltered) {

        ease.render.call(this, history, mainInfo, handFiltered);
    }

    hoverHero(hero, mousePoint, tableMax) {

        if (!hero && !tableMax) return;

        const displayPosition = displayPositions(tableMax).find(x => hero.seat === x.seatAjusted);

        const { table: tableRect } = easeRender.rects;

        const heroRect = {

            x: displayPosition.emptySeat.x + tableRect.x,
            y: displayPosition.emptySeat.y + tableRect.y,
            width: this.images.emptySeat.width,
            height: this.images.emptySeat.height
        };

        return pointInRect(mousePoint, heroRect);
    }

    showHeroFolderHoleCards(hero, model) {

        if (hero.inPlay) return;

        ease.showHeroFoldedHoleCards.call(this, hero, model);
    }

    updateNavigation(enables) {

        Object.entries(enables).forEach(([key, enable]) => {

            const states = enums.buttonStates;

            const isHover = this[key].state === states.hover;

            const state = enable ? states.normal : states.disabled;

            // Se tiver hover e manter-se enable, nem altera nada (if contrario)
            if (!(enable && isHover)) this[key].setState = state;
        });

    }

    unpressScrollBars() {

        this.handsList.unpressScrollBar();
        this.chat.unpressScrollBar();
    }

    adjustHandsList() {

        this.handsList.adjustRowsOffSet();
    }

    async tooglePlayback(nextActionHandler, model) {

        if (this.play.data === undefined) {

            this.play.data = {
                playing: false,
                speed: 500,
                inter: null
            };
        }

        this.play.data.playing = !this.play.data.playing;

        const { playing } = this.play.data;

        if (!playing) clearInterval(this.play.data.inter);

        else this.play.data.inter = setInterval(() => {

            if (model.isVeryLastAction) return;

            nextActionHandler({ fromPlay: true });

        }, this.play.data.speed);

        const row = playing ? 5 : 2;

        await this.play.setImages(this.images.navigation, { row });

        this.play.draw();
    }


    stopPlayback() {

        const { playing } = { ... this.play.data };

        if (!playing) return;

        this.tooglePlayback();
    }

    resetHandSearchFilterVisibility() {

        this.clearHandsFilter.setState = buttonStates.hidden;
        this.searchHand.setState = buttonStates.normal;
    }


    toogleHandSearchFilterVisibility() {

        this.clearHandsFilter.toogleVisibility();
        this.searchHand.toogleVisibility();
    }

    /**
     * 
     * @param {number} index 
     * @param {number} count 
     */
    drawLoadingBar(index, count) {

        const { table, logo } = easeRender.rects;

        const x = table.x + logo.x;
        const y = table.y + logo.y + this.images.logo.height + 10;

        this.context.setTransform(1, 0, 0, 1, x, y);

        const maxWidth = this.images.logo.width;

        if (index === 0) {

            this.context.fillStyle = '#ffffe1';
            this.context.fillRect(-3, -3, maxWidth + 6, 16);
            this.context.fillStyle = 'gray';
            this.context.fillRect(-2, -2, maxWidth + 4, 16 - 2);
        }

        this.context.fillStyle = '#ffffe1';

        const width = index * maxWidth / count;

        this.context.fillRect(0, 0, width, 10);
    }

    enableShareHand() {

        this.shareHand.setState = buttonStates.normal;
    }

    disableShareHand() {

        this.shareHand.setState = buttonStates.hidden;
    }
}
