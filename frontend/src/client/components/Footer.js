import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './Footer.css';



import {AiFillInstagram} from 'react-icons/ai'
import {BsFacebook} from 'react-icons/bs'
import {AiOutlineTwitter} from 'react-icons/ai'
import logo from '../../assets/img/logo.png'
import qrcode from '../../assets/img/qrcode.jpg'

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-4">
      <Container>
        <Row>
          {/* About Us Section */}
          <Col md={2}>
            <h6 className="text-uppercase fw-bold">About Us</h6>
            <ul className="list-unstyled">
              <li>About N&B</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms of Use</li>
              <li>International</li>
              <li>Sitemap</li>
            </ul>
          </Col>

          {/* Customer Care Section */}
          <Col md={2}>
            <h6 className="text-uppercase fw-bold">Customer Care</h6>
            <ul className="list-unstyled">
              <li>Delivery</li>
              <li>FAQs</li>
              <li>Contact Us</li>
            </ul>
          </Col>

          {/* Rewards Section */}
          <Col md={3} className="text-center">
            <h6 className="text-uppercase fw-bold">Beauty Pass Rewards</h6>
            <div className="my-2">
              <img
                src={logo}
                alt="N&B Logo"
                className="img-fluid"
                style={{ maxWidth: '100px' }}
              />
            </div>
            <Button variant="outline-dark">Explore Benefits</Button>
          </Col>

          {/* QR Code Section */}
          <Col md={2} className="text-center">
            <h6 className="text-uppercase fw-bold">Access the Website</h6>
            <img
              src={qrcode}
              alt="QR Code"
              className="img-fluid"
              style={{ maxWidth: '100px' }}
            />
          </Col>

          {/* Social Media & Payments Section */}
          <Col md={3} className="text-center">
            <h6 className="text-uppercase fw-bold">Connect with Us</h6>
            <div class=''>
              <div class=''>
                <a href='https://www.facebook.com/nandbcorp?mibextid=kFxxJD'><BsFacebook class='mx-2' style={{ height: '20px', width: '20px'}}/></a>
                <a href='https://www.instagram.com/nandbbeauty?igsh=MW5pd3Rndzl6YzkzeA=='><AiFillInstagram class='mx-2'  style={{ height: '20px', width: '20px'}}/></a>
                
                {/* <AiOutlineTwitter class='mx-2' style={{ height: '20px', width: '20px'}}/> */}
              </div>
            </div>
            <h6 className="text-uppercase fw-bold mt-3">Payment Option</h6>
            <div>
              
              <p className="mt-2">Cash on Delivery</p>
            </div>
          </Col>
        </Row>
        <hr></hr>
        <Row className="pt-1">
          <Col md={12} className="text-center">
            <p className="text-muted small">
              Copyright © 2024 N&B Digital SEA Pte Ltd
              <br />
              <a href="/terms" className="text-dark">Terms of Use</a> | <a href="/privacy" className="text-dark">Privacy Policy</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
