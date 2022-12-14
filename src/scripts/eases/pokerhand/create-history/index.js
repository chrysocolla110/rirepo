import biz, { actionAmount, getLineCards } from '@/scripts/units/biz';
import fns, { head, rear } from '@/scripts/units/fns';
import { pipe } from '@/scripts/units/fxnl';
import { History, HistoryT } from '@/scripts/units/history';
import { Player, PlayerT } from '@/scripts/units/player';
import { DelimitersT } from '@/scripts/units/delimiters';
import easeConclusion from './conclusion';
import enums from '@/scripts/units/enums';

/**
 * @param {string[]} lines 
 * @returns {string[]}
 */
const getPostsLines = lines => {

    // PokerStars Hand #76673721561:  Hold'em No Limit ($0.01/$0.02 USD) - 2012/03/05 9:40:04 WET [2012/03/05 4:40:04 ET]
    // Table 'Natalie II' 6-max Seat #3 is the button
    // Seat 1: Repede81 ($1.03 in chips) 
    // Seat 2: Dimon Kers ($1.89 in chips) 
    // Seat 3: Hotei777 ($2.87 in chips) 
    // Seat 4: todd baha ($0.89 in chips) 
    // Seat 5: jackass589 ($0.86 in chips) 
    // Seat 6: vikcch ($5.66 in chips) 
    // todd baha: posts small blind $0.01
    // jackass589: posts big blind $0.02
    // Dimon Kers: posts small & big blinds $0.03
    // *** HOLE CARDS ***

    const holeCardsLineCount = lines.indexOf('*** HOLE CARDS ***');

    // Não inclui a linha '*** HOLE CARDS ***'
    const barePostsLines = lines.slice(2, holeCardsLineCount);

    return barePostsLines.filter(x => /:\sposts\s.*\d(|\sand\sis\sall-in)$/gm.test(x));
};


/**
 *  Dirty porque pode trazes o "Uncalled bet..."
 * 
 * @param {string[]} lines 
 * @returns {{value: string, index: number}[]}
 */
const getDirtyActivityLines = (lines, delimiters) => {

    // *** HOLE CARDS ***
    // Dealt to vik [Ad As]
    // Dealted to rita [4d 6s]
    // Dealted to joana [6s 3d]
    // Dealted to sasdfasdf [2s 6s]
    // sasdfasdf: folds
    // vik: calls 5
    // rita: calls 3
    // joana: checks
    // *** FLOP *** [Qs 4c Th]

    const findDelimiterIndex = line => line.startsWith(delimiters.current);

    const delimiterLineIndexStart = lines.findIndex(findDelimiterIndex);

    // Não inclui a linha do delimiter '*** xxx ***'
    const remainLines = lines.slice(delimiterLineIndexStart + 1);

    const rec = i => {

        delimiters.index = i;
        const r = remainLines.findIndex(findDelimiterIndex);

        if (r === -1) return rec(++i);
        else return r;
    }

    const delimiterLineIndex = rec(delimiters.index);

    const bareActivityLines = remainLines.slice(0, delimiterLineIndex + 1);

    const classify = (value, i) => ({
        value,
        index: delimiterLineIndexStart + 1 + i
    });

    return bareActivityLines.map(classify).filter(x => {

        const v = x.value.trim();

        const lineEnds = [': checks', ': folds', ' and is all-in'];
        const ends = lineEnds.some(vv => v.endsWith(vv));

        const calls = /\:\scalls\s(|.*)\d$/.test(v);
        const bets = /\:\sbets\s(|.*)\d$/.test(v);
        const raises = /\:\sraises\s(|.*)\d$/.test(v);
        const uncalledBet = biz.isUncalledBet(v);

        return ends || calls || bets || raises || uncalledBet;
    });
};

/**
 * 
 * @param {string[]} lines 
 * @returns {{value: string, index: number}}
 */
const getStreetLine = (lines, delimiters) => {

    // ...
    // *** FLOP *** [Qs 4c Th]
    // ...

    const findDelimiterIndex = line => line.startsWith(delimiters.current);

    const delimiterLineIndexStart = lines.findIndex(findDelimiterIndex);

    const phase = `${/\w+(?=\s\*{3})/.exec(delimiters.current)}`.toLowerCase();

    return {
        value: lines[delimiterLineIndexStart],
        index: delimiterLineIndexStart,
        phase
    };
};

/**
 * 
 * @param {string[]} lines 
 * @returns {string[]}
 */
const getConclusionLines = lines => {

    // *** SHOW DOWN ***
    // PoketAces990: shows [2d 2s] (two pair, Queens and Deuces)
    // vikcch: mucks hand 
    // PoketAces990 collected €0.04 from pot
    // *** SUMMARY ***

    // ou 

    // pestmontijo: folds 
    // Uncalled bet (€0.01) returned to AndréRPoker
    // AndréRPoker collected €0.02 from pot
    // *** SUMMARY ***

    // ou 

    // Uncalled bet (88450) returned to VctemoA?
    // *** FLOP *** [4h 9d 2h]
    // *** TURN *** [4h 9d 2h] [Qh]
    // *** RIVER *** [4h 9d 2h Qh] [4c]
    // *** SHOW DOWN ***
    // vikcch: shows [Ah Ks] (a pair of Fours)
    // VctemoA?: shows [Ac Qd] (two pair, Queens and Fours)
    // VctemoA? collected 57850 from pot
    // vikcch finished the tournament in 1710th place and received €28.00.
    // *** SUMMARY ***

    const showdownIndex = lines.indexOf('*** SHOW DOWN ***');
    const summaryIndex = lines.indexOf('*** SUMMARY ***');
    const uncalledIndex = lines.findIndex(v => biz.isUncalledBet(v));

    const hasShowdown = showdownIndex !== -1;

    // Quando não tem "showdown" há sempre 'Uncalled bet' antes de conclusion
    const rdc = (acc, cur, index) => {

        if (index >= summaryIndex) return acc;

        if (index > uncalledIndex) acc.push(cur);

        return acc;
    };

    if (hasShowdown) return lines.slice(showdownIndex + 1, summaryIndex);
    else return lines.reduce(rdc, []);
};

/**
 * 
 * @param {string[]} lines 
 * @param {PlayerT[]} players 
 */
const posts = (lines, players) => {

    const postLines = getPostsLines(lines);

    const newPlayers = players.map(x => x.clone());

    let pot = 0;

    const historyLines = [];

    postLines.forEach(line => {

        const find = player => line.startsWith(`${player.name}: posts`);

        const player = newPlayers.find(find);

        const amount = biz.actionAmount(line);

        player.stack -= amount;

        const isAnte = line.startsWith(`${player.name}: posts the ante `);

        player.amountOnStreet = isAnte ? 0 : amount;

        pot += amount;

        if (!isAnte) historyLines.push(line);
    });

    const history = {

        players: newPlayers,
        pot,
        line: historyLines,
        phase: 'preflop'
    };

    return History(history);
};


/**
 * 
 * @param {string[]} lines 
 * @param {HistoryT} previousHistory
 * @param { DelimitersT } delimiters
 */
const activity = (lines, previousHistory, delimiters) => {

    const dirtyActivityLines = getDirtyActivityLines(lines, delimiters);

    if (!dirtyActivityLines.length) {

        previousHistory.allIn = true;
        return [];
    }

    const hasUncalledBet = biz.isUncalledBet(rear(dirtyActivityLines).value);

    const activityLines = hasUncalledBet
        ? dirtyActivityLines.slice(0, -1)
        : dirtyActivityLines;

    let pot = previousHistory.pot;

    const histories = [];

    activityLines.forEach(item => {

        const { value: line, index: lineIndex } = item;

        const lastHistory = rear(histories) ?? previousHistory;

        const clonedPlayers = lastHistory.players.map(x => x.clone());

        const find = player => line.startsWith(`${player.name}: `);

        const player = clonedPlayers.find(find);

        lastHistory.nextPlayer = player.clone();

        const startAt = `${player.name}: `.length;

        const remainLine = line.substring(startAt);

        const action = head(remainLine.split(' '));

        const amount = actionAmount(line);

        if (action === 'raises') {

            const diff = amount - player.amountOnStreet;
            player.stack -= diff;
            pot += diff;
            player.amountOnStreet = amount;

        } else {

            player.stack -= amount;
            pot += amount;
            player.amountOnStreet += amount;
        }

        if (action === 'folds') {

            player.inPlay = false;
        }

        // NOTE:: Não faz mal copiar a referencia porque todos os `histories`
        // sáo apenas desta 'activity', podia dar pau em "redo"
        const { streetCards } = lastHistory;

        const history = History({

            players: clonedPlayers,
            pot,
            action,
            player,
            line,
            lineIndex,
            streetCards
        });

        histories.push(history);
    });

    if (hasUncalledBet) {
        // NOTE:: O _Live Squeezer_ em all-ins escreve o "Uncalled bet" depois
        // das streets e antes do '*** SHOWDOWN ***', podendo o array `histories`
        // estar vazio, nesse caso usa o paramentro `previousHistory`
        const lastHistory = rear(histories) ?? previousHistory;
        const history = closeActivity(lastHistory, rear(dirtyActivityLines).value);
        histories.push(history);
    }

    return histories;
};

/**
 * 
 * @param {HistoryT} lastHistory 
 * @param {string} uncalledBetLine 
 * @returns {HistoryT}
 */
const closeActivity = (lastHistory, uncalledBetLine) => {

    const amount = biz.uncalledAmount(uncalledBetLine);

    const returnedToIndex = uncalledBetLine.indexOf('returned to');

    const start = returnedToIndex + 'returned to '.length;

    const name = uncalledBetLine.substring(start);

    const newPlayers = lastHistory.players.map(x => x.cloneReset());

    const player = newPlayers.find(x => x.name === name);

    player.stack += amount;

    const { streetCards } = lastHistory;

    const history = History({

        players: newPlayers,
        pot: lastHistory.pot - amount,
        action: '',
        player: null,
        line: uncalledBetLine,
        lineIndex: null,
        streetCards
    });

    return history;
};



/**
 * 
 * @param {string[]} lines 
 * @param {HistoryT} previousHistory
 * @param { DelimitersT } delimiters
 * @returns {History[]} Só um item, mas array para coincidir com `activity`
 */
const street = (lines, previousHistory, delimiters) => {

    const streetLine = getStreetLine(lines, delimiters);

    const streetCards = getLineCards(streetLine.value);

    const newPlayers = previousHistory.players.map(x => x.cloneReset());

    const history = History({

        players: newPlayers,
        pot: previousHistory.pot,
        action: '',
        player: null,
        line: streetLine.value,
        lineIndex: streetLine.index,
        streetCards,
        phase: streetLine.phase
    });

    return [history];
};

/**
 * 
 * @param {string[]} lines 
 * @param {HistoryT} previousHistory
 * @returns {History[]} 
 */
const conclusion = (lines, previousHistory) => {

    // NOTE:: "Uncalled bet" pertence a `closeActivity`

    // PoketAces990: shows [2d 2s] (two pair, Queens and Deuces)
    // vikcch: mucks hand 
    // PoketAces990 collected €0.04 from pot

    // ou 

    // Uncalled bet (€0.01) returned to AndréRPoker
    // AndréRPoker collected €0.02 from pot

    // se tiver side pot:
    // vikcch collected 2120 from side pot
    // vikcch collected 14448 from main pot

    const conclusionLines = getConclusionLines(lines);

    const histories = [];

    // NOTE:: Prop `value` para passar como referencia na function boardRIT()
    // RIT: run it twice, usado apenas nos logs bill
    const streetCards = { value: previousHistory.streetCards };

    const streetCardsRIT = [];

    conclusionLines.forEach(line => {

        const lastHistory = rear(histories) ?? previousHistory;

        const newPlayers = lastHistory.players.map(x => x.cloneReset());

        let phase;

        phase ||= easeConclusion.shows(line, newPlayers);

        phase ||= easeConclusion.mucks(line, newPlayers, lines);

        phase ||= easeConclusion.collects(line, newPlayers);

        phase ||= easeConclusion.boardRIT(line, streetCards, streetCardsRIT);

        if (!phase) return;

        const isTeasing = phase === enums.phase.conclusionShowsTease;
        const pot = isTeasing ? 0 : previousHistory.pot;

        const history = History({

            players: newPlayers,
            pot,
            action: '',
            player: null,
            line: line,
            lineIndex: null,
            streetCards: streetCards.value,
            streetCardsRIT: streetCardsRIT.map(v => v),
            phase
        });

        histories.push(history);
    });

    return histories;
};


/**
 * 
 * @param {HistoryT[]} conclusions
 * @returns {History[]} 
 */
const summary = (conclusions) => {

    // NOTE:: Ultimo do array para ter acesso a holecards
    const newPlayers = conclusions.at(-1).players.map(x => x.cloneReset());

    newPlayers.forEach(v => {

        const totalCollect = conclusions.reduce((acc, cur) => {

            const player = cur.players.find(vv => vv.seat === v.seat);

            return acc + player.collect;
        }, 0);

        v.amountOnStreet = totalCollect;
    });

    const pot = conclusions[0].pot;
    const line = ['*** SUMMARY ***'];
    const lastIndex = conclusions.length - 1;
    const streetCards = conclusions[lastIndex].streetCards;
    const streetCardsRIT = conclusions[lastIndex].streetCardsRIT;

    const summary = History({

        players: newPlayers,
        pot,
        action: '',
        player: null,
        line: line,
        lineIndex: null,
        streetCards,
        streetCardsRIT,
        phase: enums.phase.summary
    });

    return [summary];
};

export default {

    posts,
    activity,
    street,
    conclusion,
    summary
};


export const testables = {
    getDirtyActivityLines,
    getConclusionLines
}