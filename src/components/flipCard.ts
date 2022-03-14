import { gsap } from "gsap"

let duration = 1;

const setToHidden = (card : GSAPTweenTarget) => {
	 gsap.set(card, {
        rotationY: 90
    });
}

const setToShown = (card: GSAPTweenTarget) => {
     gsap.set(card, {
        rotationY: 0
    });
}


const hide = (card: GSAPTweenTarget, callback?: GSAPCallback) => {
     gsap.to(card, {
        duration: 0.5 * duration,
        rotationY: -90,
        onComplete: callback,
    });
}

const show = (card: GSAPTweenTarget, callback?: GSAPCallback) => {
	 gsap.to(card, {
        duration: 0.5 * duration,
        rotationY: 0,
        onComplete: callback,
    });
}

export const flipCard = (animation: string, card: GSAPTweenTarget, callback?: GSAPCallback) => {
    switch (animation) {
        

        case `setToShown`:
            return setToShown(card)

        case `setToHidden`:
            return setToHidden(card)

        case `hide`:
            return hide(card, callback)

        case `show`:
            return show(card, callback)

        default: {
            return null
        }
    }
}