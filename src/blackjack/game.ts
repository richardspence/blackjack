import { inherits } from "util";
import { threadId } from "worker_threads";

export interface GameRules {
    numDecks: number;
    lateSurrender: boolean;
    insurance: boolean;
    cut: number;
}
export enum SuiteSymbol {
    Spades = "♠️",
    Clubs = "♣️",
    Hearts = "♥️",
    Diamonds = "♦️",
}

export enum Suite {
    Spades,
    Clubs,
    Hearts,
    Diamonds,
}

export enum HandStatus {
    Playing,
    Blackjack,
    TwentyOne,
    Bust,
    Stand,
    Surrender,
}

export enum FaceValue {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace
}

const defaultRules: GameRules = {
    numDecks: 6,
    lateSurrender: true,
    insurance: false,
    cut: 1.5,
};

export interface Card {
    faceValue: FaceValue;
    suite: Suite,

}

export interface HandCard {
    card: Card,
    score: number;
    shown: boolean;
}

function assert(condition: any): asserts condition {
    if (!condition) {
        throw new Error('Asertion failed');
    }
}

export class Hand {
    surrender() {
        assert(this.status === HandStatus.Playing);
        this.status = HandStatus.Surrender;
    }
    public cards: HandCard[] = [];
    public status: HandStatus;
    public score: number;

    constructor(private deck: Deck, public bet: number) {
        this.status = HandStatus.Playing;
        this.score = 0;
    }

    scoreCard(card: Card, acesHigh = true) {
        let score;
        switch (card.faceValue) {
            case FaceValue.Ten:
            case FaceValue.Jack:
            case FaceValue.Queen:
            case FaceValue.King:
                score = 10;
                break;
            case FaceValue.Ace:
                if (acesHigh) {
                    score = 11;
                } else {
                    score = 1;
                }
                break;
            default:
                score = card.faceValue + 2;
        }
        return score;
    }

    hit(showCard = true) {
        this.addCard(showCard);
    }

    stand() {
        this.status = HandStatus.Stand;
    }

    doubleDown() {
        this.bet *= 2;
        this.hit();
        if (this.status === HandStatus.Playing) {
            this.stand();
        }
    }

    private addCard(shown = true) {
        assert(this.status === HandStatus.Playing);
        const card = this.deck.pullCard();
        const score = this.scoreCard(card);
        this.cards.push({
            card, score, shown
        });
        this.checkScore();
    }

    get isSoft() {
        return this.cards.some(p => p.score === 11);
    }

    checkScore(): number {
        const score = this.cards.reduce((l, p) => l + p.score, 0);
        if (score > 21) {
            if (this.isSoft) {
                const aceHigh = this.cards.find(p => p.score === 11)!;
                aceHigh.score = 1;
                return this.checkScore();
            }
            this.status = HandStatus.Bust;
        } else if (score === 21) {
            if (this.cards.length === 2) {
                this.status = HandStatus.Blackjack;
            } else {
                this.status = HandStatus.TwentyOne;
            }
        }
        // set the score
        this.score = score;
        return score;
    }
}

export class Player {
    doubleDown() {
        assert(this.hand);
        this.chipsTotal -= this.hand!.bet;
        this.hand?.doubleDown();
    }
    public hand?: Hand;

    public chipsTotal: number;
    constructor(private game: Game) {
        this.chipsTotal = 1000;
        this.hand = new Hand(this.game.deck, 0);

    }
    public play(bet: number) {
        this.hand = new Hand(this.game.deck, bet);
        this.chipsTotal -= bet;
    }

    public surrender() {
        assert(this.hand);
        this.hand!.surrender();
    }

    public settleBet(isPush = false) {
        assert(this.hand);
        let winnings = 0;
        let totalReturn = 0;
        const bet = this.hand.bet;
        if (this.hand.status === HandStatus.Blackjack) {
            winnings = bet * 1.5;
            totalReturn = bet + winnings;
        } else if (this.hand.status === HandStatus.Surrender) {
            totalReturn = bet / 2;
        } else if (!isPush) {
            winnings = bet;
            totalReturn = 2 * winnings;
        } else {
            // push
            totalReturn = bet;
        }

        this.chipsTotal += totalReturn;

        return { winnings, totalReturn };
    }
}

export class Deck {

    private _cards: Card[] = [];

    constructor(private numDecks = 1) {
    }

    private init() {
        for (let deckIndex = 0; deckIndex < this.numDecks; deckIndex++) {
            for (let suiteIndex = 0; suiteIndex < 4; suiteIndex++) {
                for (let cardIndex = 0; cardIndex <= FaceValue.Ace; cardIndex++) {
                    this._cards.push({
                        faceValue: cardIndex,
                        suite: suiteIndex,
                    });
                }
            }
        }
    }

    public get cardsLeft() {
        return this._cards.length;
    }

    public get decksLeft() {
        return this.cardsLeft / 52;
    }


    public shuffle(init = true) {
        if (init) {
            this.init();
        }
        const shuffledCards: Card[] = [];
        while (this._cards.length) {
            const index = Math.floor(Math.random() * (this._cards.length));
            const [card] = this._cards.splice(index, 1);
            shuffledCards.push(card);
        }
        this._cards = shuffledCards;
    }

    public pullCard() {
        return this._cards.shift()!;
    }

}

export enum GameStatus {
    bet,
    play,
    end
}

export class Game {
    rules: GameRules;
    dealer: Hand;
    player!: Player;
    deck!: Deck;
    public get deckProgress() {
        const zero = this.rules.cut * 52;
        const max = this.rules.numDecks * 52;
        const val = ((this.deck.cardsLeft - zero) / (max - zero)) * 100;
        return Math.max(0, val);
    }

    get isPlaying() {
        return this.player.hand?.status === HandStatus.Playing
            && this.player.hand?.cards.length !== 0;
    }

    get canHit() {
        return this.isPlaying;
    }

    get canDouble() {
        return this.isPlaying && this.player.hand?.cards.length === 2;
    }

    get canSurrender() {
        return this.isPlaying && this.player.hand?.cards.length === 2;
    }

    constructor(ruleSet: Partial<GameRules> = {}) {
        this.rules = {
            ...defaultRules,
            ...ruleSet
        };
        this.init();
        this.dealer = new Hand(this.deck!, 0);
        this.player = new Player(this);
    }

    init() {
        this.deck = new Deck(this.rules.numDecks);
        this.deck.shuffle();
    }

    reshuffleIfRequired() {
        if (this.deck.decksLeft < this.rules.cut) {
            this.deck.shuffle();
            this.lastMessage += '; New Shuffle';
        }
    }

    start() {
        assert(this.player.hand?.cards.length === 0);
        this.dealer = new Hand(this.deck, 0);
        this.reshuffleIfRequired();
        assert(this.player.hand);
        this.player.hand.hit();
        this.dealer.hit();
        this.player.hand.hit();
        this.dealer.hit(false);

        if (!this.rules.insurance || !this.isInsurance) {
            this.checkEnd();
        }
    }

    get isInsurance() {
        return this.dealer.cards[0].card.faceValue === FaceValue.Ace;
    }

    checkEnd() {
        if (!this.isPlaying) {
            this.end();
        }
        if (this.dealer.status === HandStatus.Blackjack) {
            this.end();
        }
    }

    public lastMessage: string = '';

    public lastResult?: { won: boolean, winnings: number; totalReturn: number };

    playDealer() {
        const playerSurrender = this.player.hand?.status === HandStatus.Surrender;
        const playerBust = this.player.hand?.status === HandStatus.Bust;
        if (playerSurrender) {
            return;
        }

        this.dealer.cards[1].shown = true;

        if (!playerBust) {
            while (this.dealer.score < 17) {
                this.dealer.hit();
            }
        }
    }

    end() {
        assert(this.player.hand);
        this.playDealer();
        let result: {
            won: boolean,
            winnings: number;
            totalReturn: number;
        } = {
            won: false,
            winnings: 0,
            totalReturn: 0
        };
        if (this.dealer.status === HandStatus.Blackjack
            && this.player.hand.status !== HandStatus.Blackjack) {
            this.lastMessage = `Dealer blackjacked`;
            this.player.hand.stand();
        } else if (this.player.hand.status !== HandStatus.Surrender &&
            this.player.hand.status !== HandStatus.Bust) {
            if (this.player.hand.status === HandStatus.Blackjack
                && this.dealer.status !== HandStatus.Blackjack) {
                this.lastMessage = 'Blackjack!';
                result = {
                    ...this.player.settleBet(),
                    won: true,
                };
            } else if (this.player.hand.score > this.dealer.score) {
                result = {
                    ...this.player.settleBet(),
                    won: true,
                };
                this.lastMessage = `You won high score ${this.player.hand.score} vs ${this.dealer.score}`;
            } else if (this.dealer.status === HandStatus.Bust) {
                this.lastMessage = `Dealer busted ${this.dealer.score}`;
                result = {
                    ...this.player.settleBet(),
                    won: true,
                };
            } else if (this.dealer.status !== HandStatus.Blackjack) {
                if (this.player.hand.score === this.dealer.score) {
                    // push
                    this.lastMessage = `Score tied with ${this.player.hand.score}`;
                    result = {
                        ...this.player.settleBet(true),
                        won: false,
                    };
                } else {
                    this.lastMessage = `Dealer won with ${this.dealer.score}`;
                }

            }

        } else if (this.player.hand.status === HandStatus.Surrender) {
            this.lastMessage = `You surrendered`;
            result = {
                ...this.player.settleBet(),
                won: false,
            };
        } else if (this.player.hand.status === HandStatus.Bust) {
            this.lastMessage = `You busted with ${this.player.hand.score}`;
        }

        this.lastResult = result;
        this.lastMessage += `\nReturn:${result.totalReturn}`;
    }

}