import React from 'react';
import { Carousel } from 'react-bootstrap';

import LabRab from '../Image/labrabot.png';
import Obsledovanie from '../Image/obsledovanie.png';
import Oborydovanie from '../Image/oborydovanie.png';

export default function Slider() {
    return (
        <Carousel fade>
            <Carousel.Item>
                <img
                    className="d-block w-100 slider-image"
                    src={LabRab}
                    alt="Лаборатория"
                />
                <Carousel.Caption className="slider-caption-container">
                    <h3 className="slider-caption">Современная лаборатория для испытаний материалов</h3>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img
                    className="d-block w-100 slider-image"
                    src={Obsledovanie}
                    alt="Обследование зданий"
                />
                <Carousel.Caption className="slider-caption-container">
                    <h3 className="slider-caption">Обследование зданий и сооружений</h3>
                </Carousel.Caption>
            </Carousel.Item>

            <Carousel.Item>
                <img
                    className="d-block w-100 slider-image"
                    src={Oborydovanie}
                    alt="Оборудование"
                />
                <Carousel.Caption className="slider-caption-container">
                    <h3 className="slider-caption">Современное оборудование для точного контроля</h3>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}
