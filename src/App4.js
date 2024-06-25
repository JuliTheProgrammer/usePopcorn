import {useState} from "react";
import {useSpring, animated} from "react-spring";

export default function App() {
    const [isVisible, setIsVisible] = useState(false);
    const fade = useSpring({
       opacity: isVisible ? 1 : 0,
    })

    return (
        <>
            <animated.h1 style={fade}>Hello</animated.h1>
            <button onClick={() => setIsVisible(is => !is)}>Toggle</button>
        </>
    )
}