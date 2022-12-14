import View from '@/scripts/view';
import Control from './control';
import Scrollbar from './scrollbar';

export default class Chat extends Control {

    /**
     * 
     * @param { View } view 
     * @param {*} rect 
     */
    constructor(view, rect) {

        super(view, rect);

        this.list = [];

        this.image = null;

        this.itemHeight = 90 / 6;

        this.background = null;
        this.visible = true;

        this.createScrollbar();
    }

    async setImage(image) {

        const { x, y, width, height } = this;

        this.background = this.view.context.getImageData(x, y, width + 1, height + 1);

        await this.scrollbar.setImages();

        this.image = image;
    }

    createScrollbar() {

        const rect = { x: 306, y: 13, width: 16, height: 90 };

        this.scrollbar = new Scrollbar(this.view, rect, this);

        this.scrollbar.updateRows({ visible: 6 });
    }

    /**
     * 
     * @param {string|string[]} value 
     */
    add(value) {

        this.list.push(value);

        this.scrollbar.updateRows({ total: this.list.length });

        this.draw();
    }

    /**
     * 
     * @param {string[]} values 
     */
    addRange(values) {

        this.list.push(...values);

        this.scrollbar.updateRows({ total: this.list.length });

        this.draw();
    }

    remove() {

        this.list.pop();

        this.scrollbar.updateRows({ total: this.list.length });

        this.draw();
    }

    removeAll() {

        this.list = [];

        this.scrollbar.updateRows({ total: 0 });

        this.draw();
    }

    unpressScrollBar() {

        this.scrollbar.thumb.pressed = false;
    }

    clearHover() {

        this.scrollbar.clearHover();
    }

    // #region Mandory Methods
    /**
     * @override
     */
    click() { }

    /**
     * @override
     */
    mousedown() { }

    /**
     * @override
     */
    hover() { }

    /**
     * @override
     * @param {{x:number, y:number}} point 
     */
    hitMe({ x, y }) {

        if (!this.visible) return false;

        const right = this.x + this.width - (this.scrollbar.width + 7);
        const bottom = this.y + this.height;

        const horizontal = x >= this.x && x <= right;
        const vertical = y >= this.y && y <= bottom;

        return horizontal && vertical;
    }

    /**
     * @override
     */
    draw() {

        if (!this.visible) return;

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.font = '10px Arial';

        this.context.drawImage(this.image, this.x, this.y);

        const start = this.scrollbar.hidden ? 0 : this.scrollbar.rows.offSet;

        const { visible: visibleRowsCount } = this.scrollbar.rows;

        const targetItens = this.list.slice(start, start + visibleRowsCount);

        this.context.textAlign = 'start';
        this.context.textBaseline = 'middle';

        targetItens.forEach((v, i) => {

            const x = this.x + 12;
            const y = this.y + 7 + 15 * (i + 1);

            if (i % 2 == 0) {

                this.context.fillStyle = '#eee6c3';
                this.context.fillRect(this.x + 7, y - 9, 315, 15);
            }

            this.context.fillStyle = 'black';
            this.context.fillText(v, x, y);
        });

        this.scrollbar.draw();
    }

    // #endregion

    drawBackground() {

        if (!this.background) return;

        this.context.putImageData(this.background, this.x, this.y);
    }

    set visibility(value) {

        this.visible = value;
        this.scrollbar.visibility = value;

        if (value) this.draw();
        else this.drawBackground();
    }

    get visibility() {

        return this.visible;
    }
}