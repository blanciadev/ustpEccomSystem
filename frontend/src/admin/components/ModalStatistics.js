import React from 'react';

const ModalStatistics = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className='d-flex justify-content-between align-items-center'>
                    <h2>{title}</h2>
                    <button onClick={onClose} className="modal-close-button">Close</button>
                </div>
                
                <div>{children}</div>


            </div>

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
                    max-width: 800px;
                    height: 800px;
                    overflow-y: auto;
                    z-index: 1001;
                }
                .modal-content h2 {
                    margin: 0 0 10px;
                    font-size: 20px;
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
            `}</style>
        </div>
    );
};

export default ModalStatistics;
