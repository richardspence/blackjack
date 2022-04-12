import { FaceValue } from "./Card";
import {  Game } from "./game";

export enum MoveType {
    Hit,
    Stand,
    Double,
    Split,
    Surrender
}


export class Strategy {

    get player() {
        return this.game.player.primaryHand!;
    }

    get isInitial() {
        return this.player.cards.length === 2;
    }

    get dealer() {
        return this.game.dealer;
    }

    get dealerCard() {
        return this.dealer.cards[0].card.faceValue;
    }

    constructor(private game: Game) { }

    determineMove(): MoveType {
        if (this.shouldSplit()) {
            return MoveType.Split;
        }
        if (this.player.isSoft) {
            return this.determineSoftMove();
        }
        return this.determineHardMove()
    }

    determineSoftMove() {
        const playerScore = this.player.score;
        const dealerCard = this.dealerCard;
        if (this.isInitial) {
            if (playerScore <= 18 && dealerCard > FaceValue.Two) {

                if (dealerCard < FaceValue.Seven) {
                    if (dealerCard >= FaceValue.Five) {
                        return MoveType.Double;
                    }
                    if (dealerCard >= FaceValue.Four) {
                        if (playerScore >= 15) {
                            return MoveType.Double;
                        }
                    }
                    if (dealerCard >= FaceValue.Three) {
                        if (playerScore >= 17) {
                            return MoveType.Double;
                        }
                    }
                }
            }
        }
        if(playerScore <= 17)
            return MoveType.Hit;
        if(playerScore === 18){
            if(dealerCard >= FaceValue.Nine){
                return MoveType.Hit;
            }
        }
        return MoveType.Stand;
    }

    determineHardMove() {
        if (this.isInitial) {
            if (this.player.score === 16
                && this.dealerCard >= FaceValue.Nine
                && !this.player.isSplit) {
                return MoveType.Surrender;
            }
            if (this.player.score === 15
                && this.dealerCard >= FaceValue.Ten
                && this.dealerCard < FaceValue.Ace
                && !this.player.isSplit) {
                return MoveType.Surrender;
            }
            if (this.player.score === 11
                && this.dealerCard < FaceValue.Ace) {
                return MoveType.Double;
            }
            if (this.player.score === 10
                && this.dealerCard < FaceValue.Ten) {
                return MoveType.Double;
            }
            if (this.player.score === 9
                && this.dealerCard < FaceValue.Seven
                && this.dealerCard > FaceValue.Two) {
                return MoveType.Double;
            }
        }
        if (this.player.score <= 11) {
            return MoveType.Hit;
        }

        if (this.player.score >= 12
            && this.player.score <= 16) {
            if (this.player.score === 12
                && this.dealerCard < FaceValue.Four) {
                return MoveType.Hit;
            }
            if (this.dealerCard >= FaceValue.Seven) {
                return MoveType.Hit;
            }
        }
        return MoveType.Stand;
    }

    shouldSplit() {
        if (this.isInitial) {
            if (this.player.cards[0].card.faceValue === this.player.cards[1].card.faceValue) {
                const faceValue = this.player.cards[0].card.faceValue;
                const dealerValue = this.dealer.cards[0].card.faceValue;
                switch (faceValue) {
                    case FaceValue.Two:
                    case FaceValue.Three:
                    case FaceValue.Seven:
                        return dealerValue <= FaceValue.Seven;
                    case FaceValue.Six:
                        return dealerValue <= FaceValue.Six;
                    case FaceValue.Four:
                        return dealerValue == FaceValue.Six
                            || dealerValue == FaceValue.Five;
                    case FaceValue.Eight:
                    case FaceValue.Ace:
                        return true;
                    case FaceValue.Nine:
                        return dealerValue != FaceValue.Seven
                            && dealerValue < FaceValue.Ten;

                }
            }
        }

        return false;
    }
}