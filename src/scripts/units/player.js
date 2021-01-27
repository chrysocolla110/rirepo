/**
 * 
 * @param {{name:string, stack:number}} param0 
 */
const Player = ({ name, stack, seat, position, isButton, isHero, bounty }) => {

    // let myProp = null;
    // const setMyProp = value => myProp = value;


    return {
        stack,
        name,
        seat,
        position,
        isButton,
        isHero,
        bounty,
        // setMyProp,
        // get myProp() { return myProp; }
        clone() {

            return Player(this);
        }

    };
};

export default Player;