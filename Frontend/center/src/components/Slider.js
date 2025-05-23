import React from 'react';
import { Carousel } from 'react-bootstrap';
import Dostavka from '../Image/Dostavka.jpg';
import Obed from '../Image/obed.jpg';

export default function Slider() {
    return (
        <Carousel>
            <Carousel.Item>
                <img
                    className="d-block w-100 slider-image"
                    src={Dostavka}
                    alt="First slide"
                />
                <Carousel.Caption className="slider-caption-container">
                    <h3 className="slider-caption">Бесплатная доставка</h3>
                </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100 slider-image"
                    src={Obed}
                    alt="Second slide"
                />
                <Carousel.Caption className="slider-caption-container">
                    <h3 className="slider-caption">Доставка комплексных обедов</h3>
                </Carousel.Caption>
            </Carousel.Item>
        </Carousel>
    );
}