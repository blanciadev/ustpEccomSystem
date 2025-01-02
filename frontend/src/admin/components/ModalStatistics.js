import React, { useState } from 'react';
import BundlingModal from './BundlingModal';

const ModalStatistics = ({ show, title, children, handleClose }) => {
    const [isBundlingModalOpen, setBundlingModalOpen] = useState(false);

    const handleBundlingClick = () => {
        setBundlingModalOpen(true);
    };

    const handleBundlingClose = () => {
        setBundlingModalOpen(false);
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="d-flex justify-content-end align-items-center">
                        <button onClick={handleClose} className="modal-close-button">Close</button>
                    </div>

                    <div className="d-flex justify-content-start align-items-center">
                        <h2 className="fw-bold text-start" style={{ color: "#ff3d5f", fontSize: "24px" }}>
                            {title}
                        </h2>

                        {/* Conditionally render "Go to Bundling" Button */}
                        {(title === "Best Selling Products" || title === "Unpopular Products") && (
                            <div className="d-flex justify-content-start align-items-start">
                                <button 
                                    onClick={handleBundlingClick} 
                                    className="btn-sm btn-primary ms-4"
                                    style={{fontSize: "14px" }}
                                >
                                    Go to Bundling
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div>{children}</div>
                </div>
            </div>

            {/* Bundling Modal */}
            {isBundlingModalOpen && (
                <BundlingModal 
                    show={isBundlingModalOpen} 
                    handleClose={handleBundlingClose} 
                />
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 1400px;
                    height: auto;
                    overflow-y: auto;
                    z-index: 1001;
                }
                .modal-close-button {
                    font-size: 16px;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .modal-close-button:hover {
                    background: #ff4c4c;
                }
                .go-to-bundling-button {
                    font-size: 16px;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .go-to-bundling-button:hover {
                    background: #0056b3;
                }
            `}</style>
        </>
    );
};

export default ModalStatistics;
