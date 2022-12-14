import fns, { head } from "@/scripts/units/fns";

import background from '@/assets/images/bg-vector-792x555.jpg';
import navigation from '@/assets/images/navigation-150x168.png';
import emptySeat from '@/assets/images/empty-seat-90x90.png';
import inPlay from '@/assets/images/in-play-25x30.png';
import chips from '@/assets/images/chips-22-484x20.png';
import status from '@/assets/images/status-93x33.png';
import statusHighlight from '@/assets/images/status-highlight-97x37.png';
import actions from '@/assets/images/actions-300x22.png';
import deck from '@/assets/images/deck-ps-50x70-650x280.png';
import chat from '@/assets/images/chat-329x108.png';
import scrollbarButtons from '@/assets/images/scrollbar-buttons-16x16-32x32.png';
import smallDeck from '@/assets/images/deck-small-16x20-208-80.png';
import searchHand from '@/assets/images/search-hand.png';
import clearHandFilter from '@/assets/images/clear-button-28x28.png';
import logo from '@/assets/images/logo-orange-174x26-30-opacy.png';
import openShareButtons from '@/assets/images/open-share-hand-446x58-223x29.png';
import fullWindowed from '@/assets/images/full-windowed-26x24-52x48.png';
import streetNav from '@/assets/images/street-nav-28x28-140x140.png';
import settings from '@/assets/images/gear-28x28.png';
import settingsContainer from '@/assets/images/settings-329x108.png';

const getImage = async function (file) {

    return new Promise((resolve, reject) => {

        const img = new Image();
        img.onload = () => resolve(img);
        img.src = file;

    });
};

export default {

    async loadImages() {

        try {

            const arrFiles = [
                getImage(background),
                getImage(navigation),
                getImage(emptySeat),
                getImage(inPlay),
                getImage(chips),
                getImage(status),
                getImage(statusHighlight),
                getImage(actions),
                getImage(deck),
                getImage(chat),
                getImage(scrollbarButtons),
                getImage(smallDeck),
                getImage(searchHand),
                getImage(clearHandFilter),
                getImage(logo),
                getImage(openShareButtons),
                getImage(fullWindowed),
                getImage(streetNav),
                getImage(settings),
                getImage(settingsContainer)
            ];

            const r = await Promise.all(arrFiles);

            const images = {};
            images.background = r[0];
            images.navigation = r[1];
            images.emptySeat = r[2];
            images.inPlay = r[3];

            const chips1 = await fns.sprites(r[4], 0, 22, 20);
            images.dealer = head(chips1);
            images.chips = chips1.slice(1);

            images.status = r[5];
            images.statusHighlight = r[6];

            const actions1 = await fns.sprites(r[7], 0, 60, 22);
            images.actions = actions1;

            images.deck = [];
            for (let i = 0; i < 4; i++) {
                const deckSuit = await fns.sprites(r[8], i, 50, 70);
                images.deck[i] = deckSuit;
            }

            images.chat = r[9];
            images.scrollbarButtons = r[10];

            images.smallDeck = [];
            for (let i = 0; i < 4; i++) {
                const deckSuit = await fns.sprites(r[11], i, 16, 20);
                images.smallDeck[i] = deckSuit;
            }

            images.searchHand = r[12];
            images.clearHandFilter = r[13];
            images.logo = r[14];
            images.openShareButtons = r[15];
            images.fullWindowed = r[16];
            images.streetNav = r[17];
            images.settings = r[18];
            images.settingsContainer = r[19];

            return images;

        } catch (error) {

            console.error(error);
        }

    }
};



