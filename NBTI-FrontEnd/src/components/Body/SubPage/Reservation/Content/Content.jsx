import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import styles from "./Content.module.css";
import { List } from "./List/List";
import { MeetingRoom } from "./MeetingRoom/MeetingRoom";
import { Supplies } from "./Supplies/Supplies";
import { Car } from "./Car/Car";
import { Manager } from "./Manager/Manager";


export const Content = () => {
    return(
        <div className={styles.container}>
            <Routes>
                <Route path="/" element={<List/>}></Route>
                <Route path="list" element={<List/>}></Route>
                <Route path="meetingRoom" element={<MeetingRoom/>}></Route>
                <Route path="supplies" element={<Supplies/>}></Route>
                <Route path="car" element={<Car/>}></Route>
                <Route path="manager/*" element={<Manager/>}></Route>
            </Routes>
        </div>
    )
}