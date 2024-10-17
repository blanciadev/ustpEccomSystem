import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { getCroppedImg } from './cropImageHelper'; // Import the helper function
import ToastNotification from './ToastNotification'; // Assuming a ToastNotification component is already created

function ProfileImageUpload({ formData }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size < 1024) {
                alert('File is too small. Please upload a larger image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result); // Set image data URL
                setShowModal(true); // Show modal for cropping
            };
            reader.readAsDataURL(file); // Read file as Data URL
        }
    };

    // Handle crop completion
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels); // Save the cropped area in pixels
    }, []);

    
   // Upload the cropped image to the server
const uploadImage = async () => {
    try {
        setIsUploading(true);
        const croppedImageData = await getCroppedImg(imageSrc, croppedAreaPixels);

        // Ensure croppedImageData is a Blob
        if (!(croppedImageData instanceof Blob)) {
            throw new Error('Cropped image data is not a Blob.');
        }

        // Prepare the form data for the upload
        const formData = new FormData();
        formData.append('profile_img', croppedImageData, 'profile-image.jpg'); // Append the cropped image

        const customerId = localStorage.getItem('customer_id');
        const token = localStorage.getItem('token'); // Get the token from local storage

        // Upload the image using Axios
        await axios.post(`http://localhost:5001/upload-profile-image?customer_id=${customerId}`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data', // Form data content type
            },
        })

        setTimeout(() => {
            setToastMessage('');
            window.location.href = '/user'; 
        }, 50);
        

        setToastMessage('Image uploaded successfully!');

 
    } catch (error) {
        console.error('Error uploading image:', error.response ? error.response.data : error.message);
        setToastMessage(`Error uploading image: ${error.response?.data?.message || error.message}`);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    } finally {
        setIsUploading(false); // Stop showing spinner
        setShowModal(false); // Close the modal
    }
};


    // Cleanup Object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [imageSrc]);

    return (
        <div className="profile-image-upload">
            <ToastNotification toastMessage={toastMessage} />
            {isUploading && (
                <div className="upload-spinner">
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Uploading...</span>
                    </Spinner>
                </div>
            )}
            {!isUploading && (
                <>
                    <div className="profile-image-preview">
                        {formData.profile_img ? (
                            <img src={formData.profile_img} alt="Profile" className="user-profile-image" />
                        ) : (
                            <img
                                src="https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
                                alt="Default Profile"
                            />
                        )}
                    </div>

                    <div className="image-upload">
                        <input type="file" accept="image/jpeg, image/jpg, image/png" onChange={handleFileChange} />
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
                                        aspect={1} // Aspect ratio 1:1 for square crop
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
                            <Button variant="primary" onClick={uploadImage} disabled={isUploading}>
                                {isUploading ? <Spinner animation="border" size="sm" /> : 'Crop and Upload'}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default ProfileImageUpload;
