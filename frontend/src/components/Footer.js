import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer d-flex justify-content-center align-items-center">
      <Container className="text-center">
        <Row className="justify-content-center footer-content py-4">
          {/* About Us Section */}
          <Col md={2}>
            <h5>ABOUT US</h5>
            <ul className="list-unstyled">
              <li><a href="/about-nb">About N&B</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-use">Terms of Use</a></li>
              <li><a href="/international">International</a></li>
              <li><a href="/sitemap">Sitemap</a></li>
            </ul>
          </Col>

          {/* Customer Care Section */}
          <Col md={2}>
            <h5>CUSTOMER CARE</h5>
            <ul className="list-unstyled">
              <li><a href="/delivery">Delivery</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact-us">Contact Us</a></li>
            </ul>
          </Col>

          {/* Beauty Pass Rewards Section */}
          <Col md={2}>
            <h5>BEAUTY PASS REWARDS</h5>
            <Button variant="outline-dark" href="/explore-benefits">Explore Benefits</Button>
          </Col>

          

          {/* Social Icons Section */}
          <Col md={2}>
            <h5>CONNECT WITH US</h5>
            <div className="social-icons">
            <a href="https://www.facebook.com/nandbcorp?mibextid=kFxxJD" target="_blank" rel="noopener noreferrer">
                <i className='bx bxl-facebook bx-md'></i>
              </a>
              <a href="https://www.instagram.com/nandbbeauty?igsh=MW5pd3Rndzl6YzkzeA==" target="_blank" rel="noopener noreferrer">
                <i className='bx bxl-instagram bx-md'></i>
              </a>
            </div>
            <h6>PAYMENT OPTIONS</h6>
            <div className="payment-options">
              <span>Cash on Delivery</span>
            </div>
          </Col>
        </Row>

        <Row className="text-center py-2">
          <Col>
            <small>&copy; 2024 N&B Digital SEA Pte Ltd</small>
            <br />
            <small>
              <a href="/terms-of-use">Terms of Use</a> | <a href="/privacy-policy">Privacy Policy</a>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
