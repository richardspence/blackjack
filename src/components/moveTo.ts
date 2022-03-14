import { gsap } from "gsap"

let duration = 1;

type FN = (card: GSAPTweenTarget, callback?: GSAPCallback) => void;
const initCard: FN = (card, callback) => {
    gsap.set(card, {
        opacity: 1,
        scale: 0.25,
        rotation: -30,
        x:-100,
        y: -150
    });
}

const muckCard: FN = (card, callback) => {
     gsap.to(card, {
        duration: 1 * duration,
        scale: 0.25,
        rotation: -30,
        x:-150,
        y: -200,
        onComplete: callback,
    });
}

const dealRiverFirst: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: 155,
        y: -75,
        scale: 0.33
    });
}

const dealRiverSecond: FN= (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: 225,
        y: -75,
        scale: 0.33,
        onComplete: callback,
    });
}

const dealFlopThird: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: 85,
        y: -75,
        scale: 0.33,
        onComplete: callback,
    });
}

const dealFlopSecond: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: 15,
        y: -75,
        scale: 0.33
    });
}

const dealFlopFirst: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: -55,
        y: -75,
        scale: 0.33
    });
}


const makeVisible: FN = (card, callback) => {
     gsap.set(card, {
        opacity: 1,
    });
}

const dealFirst: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: -10,
        y: 110,
        scale: 0.8
    });
}

const dealSecond: FN = (card, callback) => {
     gsap.to(card, {
        rotation: 0,
        duration: 1 * duration,
        x: 160,
        y: 110,
        scale: 0.8,
        onComplete: callback,
    });
}



const placeInDeck: FN = (card, callback) => {
     gsap.set(card, {
        scale: 0.25,
        x: -75,
        y: -100
    });
}

const dealFirstCard: FN = (card, callback) => {
	 gsap.to(card, {
        duration: 0.5 * duration,
        x: 275,
        y: 165,
        scale: 0.75,
        onComplete: callback,
    });
}

export const moveTo = (animation: string, card: GSAPTweenTarget, callback?: GSAPCallback) => {
    switch (animation) {

        case `makeVisible`:
            return makeVisible(card, callback)

        case `dealSecond`:
            return dealSecond(card, callback)
        
        case `dealFirst`:
            return dealFirst(card, callback)
        
        case `initCard`:
            return initCard(card, callback)

        case `placeInDeck`:
            return placeInDeck(card, callback)

        case `dealFirstCard`:
            return dealFirstCard(card, callback)

        case `dealFlopFirst`:
            return dealFlopFirst(card, callback)

        case `dealFlopSecond`:
            return dealFlopSecond(card, callback)

        case `dealFlopThird`:
            return dealFlopThird(card, callback)

        case `dealRiverFirst`:
            return dealRiverFirst(card, callback)

        case `dealRiverSecond`:
            return dealRiverSecond(card, callback)

        case `muckCard`:
            return muckCard(card, callback)
            

        default: {
            return null
        }
    }
}