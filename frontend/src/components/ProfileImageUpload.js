import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Modal, Spinner } from 'react-bootstrap';
import {getCroppedImg} from './cropImageHelper';

function ProfileImageUpload() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowModal(true); // Show modal for cropping
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Upload image function
  const uploadImage = async () => {
    try {
      setIsUploading(true);
      const croppedImageData = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImageData); // Preview or send to backend
      setIsUploading(false);
      setShowModal(false); // Close modal after cropping
      alert('Cropped image is ready for upload!'); // Simulate success message
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="profile-image-upload">
      {isUploading && (
        <div className="upload-spinner">
          <Spinner animation="border" role="status">
          </Spinner>
          <span className="sr-only">Uploading...</span>
        </div>
      )}
      {!isUploading && (
        <>
          <div className="profile-image-preview">
            {croppedImage ? (
              <img src={croppedImage} alt="Profile Preview"/>
            ) : (
              <img src="https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg" alt="Default Profile" />
            )}
          </div>

          <div className="image-upload">
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Modal for cropping */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Crop Your Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="crop-container" style={{ position: 'relative', width: '100%', height: 300 }}>
                {imageSrc && (
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={uploadImage}>
                Crop and Upload
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}

export default ProfileImageUpload;
