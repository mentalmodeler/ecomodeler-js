import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';

import SaveLoadModal from './SaveLoadModal';
import Concepts from '../Concepts/Concepts';
import Relationships from '../Relationships/Relationships';
import util from '../../utils/util';

import {
    conceptFocus,
    conceptAdd,
    modelLoad
} from '../../actions/index';

import './Map.css';

const showSaveLoad = true;

class Map extends Component {
    state = {
        isModalOpen: false,
        modalMode: ''
    }
    loadDialogWasLaunched = false;

    onClickMap = (e) => {
        if (e.target === this.mapContent) {
            this.props.conceptFocus(null);
        }
    }

    onClickAddConcept = (e) => {
        this.props.conceptAdd();
    }

    setMapContentRef = (ref) => {
        this.mapContent = ref;
    }

    onTakeScreenshot = () => {
        if (typeof window.html2canvas === 'undefined') {
            console.error('ERROR: html2canvas is not defined (onTakeScreenshot)');
            return
        }
        
        // https://github.com/niklasvh/html2canvas/issues/95
        const overlay = document.createElement('div');
        overlay.innerHTML = `<div class="screenshot__message">Preparing Screenshot</div>`;
        overlay.classList.add('MentalMapper__screenshot-overlay');
        document.body.append(overlay);

        const {name, author} = this.props;
        const width = this.mapContent.scrollWidth;
        const height = this.mapContent.scrollHeight; 
        const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date());
                
        const svgs = this.mapContent.querySelectorAll('svg');
        svgs.forEach((svg) => {
            svg.setAttributeNS(null, 'width', width);
            svg.setAttributeNS(null, 'height', height);
        });

        this.mapContent.style.overflow = 'visible';

        const options = {width, height, allowTaint: true, logging: false};
        window.html2canvas(this.mapContent, options).then((canvas) => {
            // reset styles
            svgs.forEach((svg) => {
                svg.removeAttributeNS(null, 'width');
                svg.removeAttributeNS(null, 'height');
            });
            this.mapContent.style.overflow = 'auto';
            
            if (false) {
                const canvasContainer = document.createElement('div');
                canvasContainer.style.overflow = 'auto';
                canvasContainer.style.width = '100vw';
                canvasContainer.style.height = '100vh';
                canvasContainer.style.position = 'fixed';
                canvasContainer.style.zIndex = 4;
                canvasContainer.appendChild(canvas);
                const clickHandler = (e) => {
                    e.currentTarget.removeEventListener('click', clickHandler);
                    document.body.removeChild(canvasContainer);
                }
                canvasContainer.addEventListener('click', clickHandler);
                document.body.prepend(canvasContainer);
            } else {
                util.writeLocalFile({
                    content: canvas, // canvas.toDataURL(),
                    name: `EcoModeler - ${name || '[name]'} - ${author || '[author]'} - ${date}.png`,
                    type: 'canvas'
                });
                document.body.removeChild(overlay);
            }
        });
    }

    onFileReaderLoadEnd = (e) => {
        const result = e.target.result;
        if (window.MentalModelerConceptMap) {
            window.MentalModelerConceptMap.load(result);
        } else {
            console.error('ERROR - window.MentalModelerConceptMap is undefined');
        }
    }

    handleInputChange = (e) => {
        console.log('handleInputChange, e:', e);
        const file = e.target.files[0];
        this.setState({
            isModalOpen: false,
            modalMode: 'load',
        });
        if (file) {
            const fileReader = new FileReader();
            fileReader.onloadend = this.onFileReaderLoadEnd;
            fileReader.readAsText(file);
        }
    }

    setInputRef = (ref) => {
        this.inputRef = ref;
    }

    setLoadRef = (ref) => {
        this.loadRef = ref;
    }

    onFocus = (e) => {
        // console.log('onFocus\n\tthis.file:', this.file, ', this.loadRef:', this.loadRef, '\n\te:', e, ', document.activeElement:', document.activeElement);
        if (this.loadDialogWasLaunched && document.activeElement === this.loadRef) {
            // console.log('\n-----------\nclose dialog\n-------------\n\n')
            this.loadDialogWasLaunched = false;
            window.removeEventListener('focusin', this.onFocus);
            this.setState({
                isModalOpen: false,
                modalMode: 'load',
            });
        }
    }
    onBlur = (e) => {
        console.log('onBlur\n\tthis.file:', this.file, ', this.loadRef:', this.loadRef, '\n\te:', e, ', document.activeElement:', document.activeElement);
    }

    onClickLoad = (e) => {
        if (this.inputRef) {
            this.inputRef.click();
            this.loadDialogWasLaunched = true;
            window.addEventListener('focusin', this.onFocus);
            this.setState({
                isModalOpen: true,
                modalMode: 'load',
            })

        }
    }

    onClickSave = (e) => {
        this.setState({
            isModalOpen: true,
            modalMode: 'save',
        });
    }

    render() {
        const {isModalOpen, modalMode} = this.state;
        return (
            <div className="map">
                <div className="map__controls">
                    <button
                        className="map-controls__add-component"  
                        onClick={this.onClickAddConcept}
                    >
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="map-controls__add-component-icon">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
                            </svg>
                            {'ADD COMPONENT'}
                        </span>
                    </button>
                    <button
                            className="map-controls__screenshot"  
                            onClick={this.onTakeScreenshot}
                        >
                            <span>
                            <svg  viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" className="map-controls__screenshot-icon" ><path d="M896 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z"/></svg>
                            </span>
                        </button>
                    {showSaveLoad &&
                    <Fragment>
                        <div>
                            <input
                                type="file"
                                id="fileElem"
                                ref={this.setInputRef}
                                accept=".js,.json,.xml,.emp"
                                style={{display: 'none'}}
                                tabIndex="-1"
                                onChange={this.handleInputChange}
                            />
                            <button className="map-controls__load" ref={this.setLoadRef} onClick={this.onClickLoad}>
                                <span>{'LOAD'}</span>
                            </button>
                        </div>
                        <button
                            className="map-controls__save"  
                            onClick={this.onClickSave}
                        >
                            <span>{'SAVE'}</span>
                        </button>
                    </Fragment>
                    }
                </div>
                <div
                    className="map__content"
                    ref={this.setMapContentRef}
                    onClick={this.onClickMap}
                >
                    <Relationships />
                    <Concepts />
                </div>
                <SaveLoadModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    onClose={() => this.setState({isModalOpen: false})}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const info = state.info || {};
    const {author, name} = info;
    return {author, name};
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptFocus: (id) => {
            dispatch(conceptFocus(id))
        },

        conceptAdd: () => {
            dispatch(conceptAdd());
        },

        modelLoad: (state) => {
            dispatch(modelLoad(state))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);