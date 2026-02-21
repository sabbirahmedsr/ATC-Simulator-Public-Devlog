/**
 * Module: Aircraft 3D Viewer
 * Description: Handles the initialization and management of the 3D model popup window.
 * It dynamically injects the necessary HTML and CSS to avoid cluttering the main files.
 */

(function() {
    let closeTimer = null;
    const Aircraft3DViewer = {
        modalId: 'aircraft-3d-modal',
        viewerId: 'aircraft-3d-viewer',

        /**
         * Initializes the 3D viewer by injecting the modal HTML and CSS into the DOM.
         * Should be called once when the application loads.
         */
        init: function() {
            // Prevent duplicate initialization
            if (document.getElementById(this.modalId)) return;

            // 1. Inject CSS Styles
            const style = document.createElement('style');
            style.textContent = `
                .modal-3d-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9); /* Darker overlay for focus */
                    z-index: 10000; /* Very high z-index to sit on top of everything */
                    display: none;
                    justify-content: center;
                    align-items: center;
                    backdrop-filter: blur(5px);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .modal-3d-overlay.visible {
                    opacity: 1;
                }
                .modal-3d-content {
                    background: #1a1a1d; /* Dark theme background */
                    width: 90%;
                    height: 90%;
                    max-width: 1400px;
                    border-radius: 8px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 40px rgba(0,0,0,0.8);
                    border: 1px solid #333;
                    overflow: hidden;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 25px;
                    background-color: #252529;
                    border-bottom: 1px solid #333;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #00C851; /* Match the green button theme */
                    font-family: 'Inter', sans-serif;
                    font-size: 1.2rem;
                }
                .close-3d-modal-btn {
                    background: transparent;
                    border: none;
                    color: #b3b3b3;
                    font-size: 1.8rem;
                    cursor: pointer;
                    transition: color 0.2s;
                    line-height: 1;
                }
                .close-3d-modal-btn:hover {
                    color: #ff4444;
                }
                .model-viewer-wrapper {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                    background: #000; /* Pure black for the 3D scene */
                    position: relative;
                }
                model-viewer {
                    width: 100%;
                    height: 100%;
                    --poster-color: transparent;
                }
                .loading-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #00C851;
                    font-family: sans-serif;
                    font-size: 1.1rem;
                    z-index: 10;
                    pointer-events: none;
                    transition: opacity 0.3s;
                }
                .loading-overlay.hidden {
                    opacity: 0;
                }
                .controls-bar {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 20px;
                    background: rgba(30, 30, 30, 0.9);
                    padding: 10px 20px;
                    border-radius: 30px;
                    border: 1px solid #444;
                    z-index: 20;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                .control-btn {
                    background: transparent;
                    border: none;
                    color: #e8e8e8;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .control-btn:hover { 
                    background-color: rgba(255,255,255,0.1);
                    color: #00C851; 
                }
                .control-btn.active { 
                    color: #00C851; 
                    background-color: rgba(0, 200, 81, 0.1);
                }
            `;
            document.head.appendChild(style);

            // 2. Inject Modal HTML
            const modalHtml = `
                <div id="${this.modalId}" class="modal-3d-overlay">
                    <div class="modal-3d-content">
                        <div class="modal-header">
                            <h3 id="modal-3d-title">Aircraft Model</h3>
                            <button class="close-3d-modal-btn" title="Close">&times;</button>
                        </div>
                        <div class="model-viewer-wrapper">
                            <div id="model-loader" class="loading-overlay">
                                <i class="fa-solid fa-spinner fa-spin" style="margin-right: 10px;"></i> Loading Model...
                            </div>
                            <model-viewer 
                                id="${this.viewerId}" 
                                src="" 
                                alt="3D Model of Aircraft" 
                                auto-rotate 
                                camera-controls 
                                ar
                                shadow-intensity="1"
                                camera-orbit="45deg 55deg 105%" 
                                field-of-view="30deg"
                                min-camera-orbit="auto auto 5%"
                                max-camera-orbit="auto auto 100%"
                                interaction-prompt="none">
                            </model-viewer>
                            <div class="controls-bar">
                                <button class="control-btn active" id="btn-auto-rotate" title="Toggle Auto-Rotate">
                                    <i class="fa-solid fa-rotate"></i>
                                </button>
                                <button class="control-btn" id="btn-reset-view" title="Reset View">
                                    <i class="fa-solid fa-compress"></i>
                                </button>
                                <button class="control-btn" id="btn-fullscreen" title="Toggle Fullscreen">
                                    <i class="fa-solid fa-expand"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 3. Attach Event Listeners
            const modal = document.getElementById(this.modalId);
            const closeBtn = modal.querySelector('.close-3d-modal-btn');
            const viewer = document.getElementById(this.viewerId);
            const loader = document.getElementById('model-loader');

            closeBtn.addEventListener('click', () => this.close());
            
            // Close when clicking outside the content box
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close();
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    this.close();
                }
            });

            // --- Viewer Events for Loading State ---
            viewer.addEventListener('load', () => {
                loader.classList.add('hidden');
            });

            viewer.addEventListener('error', (e) => {
                console.error("Model Viewer Error:", e.detail);
                loader.innerHTML = '<span style="color: #ff4444"><i class="fa-solid fa-triangle-exclamation"></i> Error loading model</span>';
            });

            viewer.addEventListener('progress', (e) => {
                const progress = (e.detail.totalProgress * 100).toFixed(0);
                // Only show loader if not fully loaded
                if (progress < 100) {
                    loader.classList.remove('hidden');
                    loader.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 10px;"></i> Loading ${progress}%...`;
                }
            });

            // --- Control Buttons ---
            const btnRotate = document.getElementById('btn-auto-rotate');
            btnRotate.addEventListener('click', () => {
                if (viewer.autoRotate) {
                    viewer.autoRotate = false;
                    btnRotate.classList.remove('active');
                } else {
                    viewer.autoRotate = true;
                    btnRotate.classList.add('active');
                }
            });

            document.getElementById('btn-reset-view').addEventListener('click', () => {
                viewer.cameraOrbit = '45deg 55deg 105%';
                viewer.fieldOfView = '30deg';
                viewer.jumpCameraToGoal();
            });

            document.getElementById('btn-fullscreen').addEventListener('click', () => {
                const wrapper = modal.querySelector('.model-viewer-wrapper');
                if (!document.fullscreenElement) {
                    wrapper.requestFullscreen().catch(err => console.log(err));
                } else {
                    document.exitFullscreen();
                }
            });
        },

        /**
         * Opens the 3D viewer modal with the specified model.
         * @param {string} modelUrl - The path to the .glb/.gltf file.
         * @param {string} title - The title/name of the aircraft to display.
         */
        open: function(modelUrl, title) {
            const modal = document.getElementById(this.modalId);
            const viewer = document.getElementById(this.viewerId);
            const titleEl = document.getElementById('modal-3d-title');
            const loader = document.getElementById('model-loader');
            const btnRotate = document.getElementById('btn-auto-rotate');

            // Cancel any pending close operation to prevent the modal from disappearing
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }

            if (modal && viewer) {
                // Reset UI states
                loader.classList.remove('hidden');
                loader.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 10px;"></i> Loading Model...';
                
                // Reset Viewer State for a consistent experience on every open.
                viewer.autoRotate = true;
                viewer.cameraOrbit = '45deg 55deg 105%';
                viewer.fieldOfView = '30deg'; // Also reset zoom
                
                // Reset buttons
                if (btnRotate) btnRotate.classList.add('active');
                
                // Set content
                titleEl.textContent = title || '3D View';

                // Show modal FIRST to ensure the viewer is in the DOM render tree.
                // This fixes the issue where the model wouldn't load on the second open.
                modal.style.display = 'flex';

                // Set the new source using setAttribute for a more reliable reset.
                viewer.setAttribute('src', modelUrl);
                
                // Small delay to allow display:flex to apply before opacity transition
                setTimeout(() => {
                    modal.classList.add('visible');
                }, 10);
            } else {
                console.error("3D Viewer Modal not initialized.");
            }
        },

        /**
         * Closes the modal and resets the viewer to save resources.
         */
        close: function() {
            const modal = document.getElementById(this.modalId);
            const viewer = document.getElementById(this.viewerId);
            
            if (modal) {
                modal.classList.remove('visible');
                
                // Clear any existing timer
                if (closeTimer) clearTimeout(closeTimer);

                // Immediately clear the model source to prevent race conditions
                // if the user reopens the viewer quickly. This stops the rendering
                // and download process.
                if (viewer) {
                    viewer.removeAttribute('src');
                }
                
                // Wait for the fade-out transition to finish before hiding the element.
                closeTimer = setTimeout(() => {
                    modal.style.display = 'none';
                    closeTimer = null;
                }, 300);
            }
        }
    };

    // Expose to global window object so other scripts can access it
    window.Aircraft3DViewer = Aircraft3DViewer;

    // Initialize the viewer when the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        Aircraft3DViewer.init();
    });
})();
