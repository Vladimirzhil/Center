import React from 'react';
import { MdLocalPhone } from "react-icons/md";
import { MdMail } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";
import logofooter from "../Image/logofooter.gif"


export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-text">
                <img src={logofooter} alt="ЦИСКиМ" className="footer-logo" />
                <div className="map-container">
                    <div>
                        <h4>ОФИС</h4>
                        <p><FaMapMarkerAlt /> 390023, Рязань, ул. Электрозаводская, д. 87, помещение Н1</p>
                        <p><MdLocalPhone /> +7 (4912) 24-02-85, 95-03-39</p>
                        <p><MdMail /> <a href="mailto:ciskim@mail.ru">ciskim@mail.ru</a></p>
                        <iframe
                        title="Company Location1"
                        src="https://yandex.ru/map-widget/v1/-/CHCiA2~y"
                        width="500"
                        height="300"
                        style={{ border: 0, margin:'10px' }}
                        allowFullScreen=""
                        aria-hidden="false"
                        tabIndex="0"/>
                    </div>
                <div className="footer-right">
                        <h4>ЛАБОРАТОРИЯ</h4>
                        <p><FaMapMarkerAlt /> 390010, Рязань, проезд Шабулина, 8 </p>
                        <p><MdLocalPhone /> +7 (4912) 46-41-03</p>
                        <p href="mailto:lab-ciskim@yandex.ru"><MdMail/> <a href="mailto:lab-ciskim@yandex.ru">lab-ciskim@yandex.ru</a></p>  
                        <iframe
                        title="Company Location2"
                        src="https://yandex.ru/map-widget/v1/-/CHCiA2~y"
                        width="500"
                        height="300"
                        style={{ border: 0, margin:'10px'}}
                        allowFullScreen=""
                        aria-hidden="false"
                        tabIndex="0"/>
                    </div>
                </div>
            </div>
        </footer>
    );
}