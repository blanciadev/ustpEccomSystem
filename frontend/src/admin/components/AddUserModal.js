import React from 'react'

const AddUserModal = () => {
  return (
        <div className={`modal fade ${show ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: show ? 'block' : 'none' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create New User</h5>
                    </div>
                    <div className="modal-body">
                        
                    </div>
                    <div className="modal-footer justify-content-evenly">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                    
                    </div>
                </div>
            </div>
        </div>
  )
}

export default AddUserModal