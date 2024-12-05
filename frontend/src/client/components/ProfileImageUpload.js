import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Button, Modal, Spinner } from 'react-bootstrap';
// import { getCroppedImg } from './cropImageHelper';
import axios from 'axios';
import ToastNotification from '../../public/components/ToastNotification';

function ProfileImageUpload({ formData }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [croppedImage, setCroppedImage] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size < 1024) {
                alert('File is too small. Please upload a larger image.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);


    const uploadImage = async () => {
        // try {
        //     setIsUploading(true);
        //     const croppedImageData = await getCroppedImg(imageSrc, croppedAreaPixels);

        //     if (!(croppedImageData instanceof Blob)) {
        //         throw new Error('Cropped image data is not a Blob.');
        //     }

        //     const formData = new FormData();
        //     formData.append('profile_img', croppedImageData, 'profile-image.jpg');

        //     const customerId = localStorage.getItem('customer_id');
        //     const token = localStorage.getItem('token');

        //     await axios.post(`https://ustp-eccom-server.vercel.app/api/upload-profile-image?customer_id=${customerId}`, formData, {
        //         headers: {
        //             'Authorization': `Bearer ${token}`,
        //             'Content-Type': 'multipart/form-data',
        //         },
        //     });

        //     setToastMessage('Image Upload Successfull!');

        //     setTimeout(() => {
        //         setToastMessage('');
        //     }, 3000);

        // } catch (error) {
        //     console.error('Error uploading image:', error.response ? error.response.data : error.message);
        //     console.log(`Error uploading image: ${error.response?.data?.message || error.message}`);
        //     setToastMessage(`Error uploading image: ${error.response?.data?.message || error.message}`);

        //     setTimeout(() => {
        //         setToastMessage('');
        //     }, 3000);

        // } finally {
        //     setIsUploading(false);
        //     setShowModal(false);
        // }
    };

    useEffect(() => {
        return () => {
            if (croppedImage) {
                URL.revokeObjectURL(croppedImage);
            }
        };
    }, [croppedImage]);

    return (
        <div className="profile-image-upload">
            <ToastNotification toastMessage={toastMessage} />
            {isUploading && (
                <div className="upload-spinner">
                    <Spinner animation="border" role="status" />
                    <span className="sr-only">Uploading...</span>
                </div>
            )}
            {!isUploading && (
                <>
                    <div className='profile-image-preview'>
                        <div className='image-container' onClick={() => document.getElementById('file-input').click()}>
                            {formData.profile_img ? (
                                <img src={formData.profile_img} alt="Profile" className="user-profile-image" />
                            ) : (
                                <img src="https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg" alt="Default Profile" className="user-profile-image" />
                            )}
                            <div className='overlay'>Change Profile</div>
                        </div>
                        <input
                            type="file"
                            id="file-input"
                            accept="image/jpeg, image/jpg, image/png"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div>
                        <h5>Click image to update profile</h5>
                        <p>At least 800x800 px recommended.</p>
                        <p>JPG or PNG is allowed.</p>
                    </div>



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
                            <Button variant="primary" onClick={uploadImage} disabled={isUploading}>
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
